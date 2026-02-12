/* ============================================
   HOOD ANIME - EMAIL SERVICE
   Nodemailer with Gmail SMTP
   ============================================ */

const nodemailer = require('nodemailer');

// Email configuration
const EMAIL_CONFIG = {
    from: {
        name: 'Hood Anime',
        email: process.env.EMAIL_FROM || 'hoodanimeofficial@gmail.com'
    },
    admin: process.env.ADMIN_EMAIL || 'hoodanimeofficial@gmail.com',
    socialLinks: {
        tiktok: 'https://tiktok.com/@hoodanime',
        instagram: 'https://instagram.com/hoodanime',
        youtube: 'https://youtube.com/@hoodanime'
    }
};

// Create transporter
let transporter;

function initTransporter() {
    if (transporter) return transporter;

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not configured. Emails will be logged to console.');
        return null;
    }

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // Use App Password for Gmail
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // Verify connection
    transporter.verify((error, success) => {
        if (error) {
            console.error('Email transporter verification failed:', error);
        } else {
            console.log('Email transporter ready to send emails');
        }
    });

    return transporter;
}

/**
 * Send welcome email to new subscriber
 * @param {string} email - Subscriber's email address
 * @param {string} launchDate - Formatted launch date
 * @returns {Promise<boolean>}
 */
async function sendWelcomeEmail(email, launchDate) {
    const transport = initTransporter();

    const subject = "You're on the Hood Anime Waitlist! 🎌";

    const textContent = `Yo! You're officially on the list.

Hood Anime launches on ${launchDate} at 12pm EST.

You'll be the FIRST to know when we go live.

And since you're on the waitlist, you're guaranteed access to the Founding Member offer: 50% off for life ($4.99/month instead of $9.99/month - forever).

What you're getting:
- Full episodes (10-30 min) of your favorite anime with hood energy
- Exclusive content that never hits social media
- Behind-the-scenes, bloopers, extended cuts
- Private Discord community
- Vote on what anime we dub next
- Watch parties with the team

Stay locked in 🔥

- Hood Anime Team

P.S. Follow us for sneak peeks:
TikTok: ${EMAIL_CONFIG.socialLinks.tiktok}
Instagram: ${EMAIL_CONFIG.socialLinks.instagram}
YouTube: ${EMAIL_CONFIG.socialLinks.youtube}

---
IMPORTANT: Hood Anime creates parody and transformative content for entertainment purposes. We respect all copyright holders and encourage fans to support official anime releases. All original anime properties belong to their respective owners. By joining our community, you agree to our Terms of Service.

Terms: https://hoodanime.com/terms.html
Privacy: https://hoodanime.com/privacy.html

You received this email because you signed up for the Hood Anime waitlist.
© 2025 Hood Anime. All Rights Reserved.
`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Hood Anime</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0612; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0612; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(145deg, #2d1b69, #1a0b2e); border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, rgba(184,41,224,0.2), rgba(0,217,255,0.2));">
                            <h1 style="margin: 0; font-size: 36px; font-weight: 900; color: #ffffff;">
                                HOOD<span style="background: linear-gradient(135deg, #b829e0, #00d9ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ANIME</span>
                            </h1>
                            <p style="margin: 10px 0 0; color: #00d9ff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
                                Where Shonen Meets The Block
                            </p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 28px; color: #ffffff; text-align: center;">
                                Yo! You're In! 🔥
                            </h2>

                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #b8b8d0;">
                                You're officially on the Hood Anime waitlist. We see you. 👀
                            </p>

                            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid rgba(255,255,255,0.1);">
                                <p style="margin: 0 0 10px; font-size: 14px; color: #6b6b80; text-transform: uppercase; letter-spacing: 1px;">
                                    Launch Date
                                </p>
                                <p style="margin: 0; font-size: 24px; font-weight: 700; background: linear-gradient(135deg, #b829e0, #00d9ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                                    ${launchDate} @ 12pm EST
                                </p>
                            </div>

                            <p style="margin: 0 0 15px; font-size: 16px; line-height: 1.6; color: #b8b8d0;">
                                Since you're on the waitlist, you get the <strong style="color: #00ff88;">Founding Member offer</strong>:
                            </p>

                            <div style="background: linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,136,255,0.1)); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; border: 1px solid rgba(0,255,136,0.3);">
                                <p style="margin: 0; font-size: 14px; color: #6b6b80;">
                                    <s>$9.99/month</s> → <span style="font-size: 28px; font-weight: 900; color: #00ff88;">$4.99/month</span>
                                </p>
                                <p style="margin: 10px 0 0; font-size: 12px; color: #00ff88; text-transform: uppercase; letter-spacing: 1px;">
                                    Forever. Locked in. No cap.
                                </p>
                            </div>

                            <h3 style="margin: 30px 0 15px; font-size: 18px; color: #ffffff;">
                                What you're getting:
                            </h3>

                            <ul style="margin: 0; padding: 0 0 0 20px; color: #b8b8d0; line-height: 2;">
                                <li>📺 Full episodes (10-30 min) with hood energy</li>
                                <li>🎤 Exclusive content that never hits social</li>
                                <li>🎬 Behind-the-scenes & bloopers</li>
                                <li>💬 Private Discord community</li>
                                <li>🗳️ Vote on what we dub next</li>
                                <li>🍿 Watch parties with the team</li>
                            </ul>

                            <p style="margin: 30px 0 0; font-size: 16px; line-height: 1.6; color: #b8b8d0;">
                                Stay locked in. We'll hit you up when it's go time.
                            </p>

                            <p style="margin: 20px 0 0; font-size: 16px; color: #ffffff;">
                                - Hood Anime Team 🎌
                            </p>
                        </td>
                    </tr>

                    <!-- Social Links -->
                    <tr>
                        <td style="padding: 0 40px 40px; text-align: center;">
                            <p style="margin: 0 0 15px; font-size: 14px; color: #6b6b80;">
                                Follow us for sneak peeks:
                            </p>
                            <div>
                                <a href="${EMAIL_CONFIG.socialLinks.tiktok}" style="display: inline-block; margin: 0 10px; padding: 10px 20px; background: rgba(255,255,255,0.05); border-radius: 8px; color: #b8b8d0; text-decoration: none; font-size: 14px;">
                                    TikTok
                                </a>
                                <a href="${EMAIL_CONFIG.socialLinks.instagram}" style="display: inline-block; margin: 0 10px; padding: 10px 20px; background: rgba(255,255,255,0.05); border-radius: 8px; color: #b8b8d0; text-decoration: none; font-size: 14px;">
                                    Instagram
                                </a>
                                <a href="${EMAIL_CONFIG.socialLinks.youtube}" style="display: inline-block; margin: 0 10px; padding: 10px 20px; background: rgba(255,255,255,0.05); border-radius: 8px; color: #b8b8d0; text-decoration: none; font-size: 14px;">
                                    YouTube
                                </a>
                            </div>
                        </td>
                    </tr>

                    <!-- Legal Notice -->
                    <tr>
                        <td style="padding: 25px 40px; background: rgba(255,170,0,0.05); border-top: 1px solid rgba(255,255,255,0.05);">
                            <p style="margin: 0 0 10px; font-size: 11px; color: #ffaa00; font-weight: 600; text-transform: uppercase;">
                                Important Notice
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #6b6b80; line-height: 1.6;">
                                Hood Anime creates parody and transformative content for entertainment purposes. We respect all copyright holders and encourage fans to support official anime releases through legitimate streaming services and merchandise. All original anime properties belong to their respective owners. By joining our community, you agree to our <a href="https://hoodanime.com/terms.html" style="color: #00d9ff;">Terms of Service</a>.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; background: rgba(0,0,0,0.2); text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                            <p style="margin: 0; font-size: 12px; color: #6b6b80;">
                                You received this email because you signed up for the Hood Anime waitlist.
                            </p>
                            <p style="margin: 10px 0 0; font-size: 11px; color: #6b6b80;">
                                <a href="https://hoodanime.com/terms.html" style="color: #6b6b80;">Terms</a> ·
                                <a href="https://hoodanime.com/privacy.html" style="color: #6b6b80;">Privacy</a> ·
                                <a href="https://hoodanime.com/dmca.html" style="color: #6b6b80;">DMCA</a>
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; color: #6b6b80;">
                                © 2025 Hood Anime. Where Shonen Meets The Block.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    // If no transporter, log the email
    if (!transport) {
        console.log('--- WELCOME EMAIL (would be sent) ---');
        console.log('To:', email);
        console.log('Subject:', subject);
        console.log('Launch Date:', launchDate);
        console.log('-----------------------------------');
        return true;
    }

    try {
        await transport.sendMail({
            from: `"${EMAIL_CONFIG.from.name}" <${EMAIL_CONFIG.from.email}>`,
            to: email,
            subject: subject,
            text: textContent,
            html: htmlContent
        });

        console.log(`Welcome email sent to ${email}`);
        return true;
    } catch (error) {
        console.error(`Failed to send welcome email to ${email}:`, error);
        throw error;
    }
}

/**
 * Send notification email to admin
 * @param {string} newEmail - The email that just signed up
 * @returns {Promise<boolean>}
 */
async function sendAdminNotification(newEmail) {
    const transport = initTransporter();

    const timestamp = new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'long'
    });

    const subject = `🔥 New Waitlist Signup - Hood Anime`;

    const textContent = `New signup on the Hood Anime waitlist!

Email: ${newEmail}
Time: ${timestamp}

Keep building! 🚀
`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 20px; background-color: #0a0612; font-family: Arial, sans-serif;">
    <div style="max-width: 500px; margin: 0 auto; background: #1a0b2e; border-radius: 12px; padding: 30px; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="margin: 0 0 20px; color: #00ff88; font-size: 24px;">
            🔥 New Waitlist Signup!
        </h2>

        <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px; color: #6b6b80; font-size: 12px; text-transform: uppercase;">
                Email
            </p>
            <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">
                ${newEmail}
            </p>
        </div>

        <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px;">
            <p style="margin: 0 0 10px; color: #6b6b80; font-size: 12px; text-transform: uppercase;">
                Timestamp
            </p>
            <p style="margin: 0; color: #b8b8d0; font-size: 14px;">
                ${timestamp}
            </p>
        </div>

        <p style="margin: 20px 0 0; color: #6b6b80; font-size: 14px; text-align: center;">
            Keep building! The list is growing 🚀
        </p>
    </div>
</body>
</html>
    `;

    // If no transporter, log the notification
    if (!transport) {
        console.log('--- ADMIN NOTIFICATION (would be sent) ---');
        console.log('To:', EMAIL_CONFIG.admin);
        console.log('New signup:', newEmail);
        console.log('Time:', timestamp);
        console.log('------------------------------------------');
        return true;
    }

    try {
        await transport.sendMail({
            from: `"${EMAIL_CONFIG.from.name}" <${EMAIL_CONFIG.from.email}>`,
            to: EMAIL_CONFIG.admin,
            subject: subject,
            text: textContent,
            html: htmlContent
        });

        console.log('Admin notification sent');
        return true;
    } catch (error) {
        console.error('Failed to send admin notification:', error);
        throw error;
    }
}

/**
 * Send a test email to verify configuration
 * @param {string} testEmail - Email address to send test to
 * @returns {Promise<boolean>}
 */
async function sendTestEmail(testEmail) {
    const transport = initTransporter();

    if (!transport) {
        console.log('Email not configured - test skipped');
        return false;
    }

    try {
        await transport.sendMail({
            from: `"${EMAIL_CONFIG.from.name}" <${EMAIL_CONFIG.from.email}>`,
            to: testEmail,
            subject: 'Hood Anime - Email Test',
            text: 'If you received this, email is working correctly!',
            html: '<p>If you received this, email is working correctly! 🔥</p>'
        });

        console.log(`Test email sent to ${testEmail}`);
        return true;
    } catch (error) {
        console.error('Failed to send test email:', error);
        throw error;
    }
}

module.exports = {
    sendWelcomeEmail,
    sendAdminNotification,
    sendTestEmail
};
