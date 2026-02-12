/* ============================================
   HOOD ANIME - BACKEND SERVER
   Express + SQLite + Nodemailer
   ============================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { initDatabase, addEmail, emailExists, getEmailCount } = require('./database');
const { sendWelcomeEmail, sendAdminNotification } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, 'https://hoodanime.com', 'https://www.hoodanime.com']
        : ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting - 5 signups per IP per hour
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour
    message: {
        success: false,
        message: 'Too many signup attempts. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use X-Forwarded-For header for proxied requests (Vercel, Railway, etc.)
        return req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    }
});

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Email validation regex
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
}

// Sanitize email input
function sanitizeEmail(email) {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase().slice(0, 254);
}

// Calculate launch date (3 days from server start or from env)
function getLaunchDate() {
    if (process.env.LAUNCH_DATE) {
        return new Date(process.env.LAUNCH_DATE);
    }
    const date = new Date();
    date.setDate(date.getDate() + 3);
    date.setHours(12, 0, 0, 0); // 12pm
    return date;
}

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Hood Anime API is running!',
        timestamp: new Date().toISOString()
    });
});

// Get waitlist count
app.get('/api/waitlist/count', apiLimiter, async (req, res) => {
    try {
        const count = await getEmailCount();
        res.json({
            success: true,
            count: count
        });
    } catch (error) {
        console.error('Error getting count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get waitlist count'
        });
    }
});

// Get launch info
app.get('/api/launch-info', apiLimiter, (req, res) => {
    const launchDate = getLaunchDate();
    res.json({
        success: true,
        launchDate: launchDate.toISOString(),
        launchDateFormatted: launchDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    });
});

// Add email to waitlist
app.post('/api/waitlist', signupLimiter, async (req, res) => {
    try {
        // Get and sanitize email
        const email = sanitizeEmail(req.body.email);
        const referralSource = req.body.referral_source || 'direct';

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Check if email already exists
        const exists = await emailExists(email);
        if (exists) {
            return res.status(409).json({
                success: false,
                message: "You're already on the list!"
            });
        }

        // Add email to database
        const result = await addEmail(email, referralSource);

        // Get launch date for emails
        const launchDate = getLaunchDate();
        const launchDateFormatted = launchDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Send emails (don't wait, fire and forget)
        Promise.all([
            sendWelcomeEmail(email, launchDateFormatted),
            sendAdminNotification(email)
        ]).catch(emailError => {
            console.error('Email sending error:', emailError);
            // Don't fail the request if email fails
        });

        // Get updated count
        const count = await getEmailCount();

        res.status(201).json({
            success: true,
            message: "You're on the list! Check your email.",
            data: {
                id: result.id,
                email: email,
                timestamp: result.timestamp,
                totalSignups: count
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again.'
        });
    }
});

// ==========================================
// STATIC FILE SERVING (SPA)
// ==========================================

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ==========================================
// SERVER STARTUP
// ==========================================

async function startServer() {
    try {
        // Initialize database
        await initDatabase();
        console.log('Database initialized successfully');

        // Start server
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🎌 HOOD ANIME SERVER RUNNING                ║
║                                               ║
║   Local:   http://localhost:${PORT}             ║
║   API:     http://localhost:${PORT}/api         ║
║                                               ║
║   Where Shonen Meets The Block 🔥              ║
║                                               ║
╚═══════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
