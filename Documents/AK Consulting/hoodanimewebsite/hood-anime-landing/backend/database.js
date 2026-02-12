/* ============================================
   HOOD ANIME - DATABASE MODULE
   SQLite3 Database Operations
   ============================================ */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'waitlist.db');

// Database instance
let db;

/**
 * Initialize the database and create tables
 */
function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }

            console.log(`Connected to SQLite database at ${DB_PATH}`);

            // Create waitlist table
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS waitlist (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    referral_source TEXT DEFAULT 'direct',
                    ip_address TEXT,
                    user_agent TEXT,
                    is_subscribed INTEGER DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            db.run(createTableSQL, (err) => {
                if (err) {
                    console.error('Error creating table:', err);
                    reject(err);
                    return;
                }

                console.log('Waitlist table ready');

                // Create index on email for faster lookups
                const createIndexSQL = `
                    CREATE INDEX IF NOT EXISTS idx_email ON waitlist(email)
                `;

                db.run(createIndexSQL, (err) => {
                    if (err) {
                        console.error('Error creating index:', err);
                        // Don't reject, index is optional
                    }
                    resolve();
                });
            });
        });
    });
}

/**
 * Add a new email to the waitlist
 * @param {string} email - Email address
 * @param {string} referralSource - Source of the signup
 * @param {string} ipAddress - IP address (optional)
 * @param {string} userAgent - User agent (optional)
 * @returns {Promise<{id: number, timestamp: string}>}
 */
function addEmail(email, referralSource = 'direct', ipAddress = null, userAgent = null) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO waitlist (email, referral_source, ip_address, user_agent)
            VALUES (?, ?, ?, ?)
        `;

        db.run(sql, [email, referralSource, ipAddress, userAgent], function(err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    reject(new Error('Email already exists'));
                } else {
                    reject(err);
                }
                return;
            }

            resolve({
                id: this.lastID,
                timestamp: new Date().toISOString()
            });
        });
    });
}

/**
 * Check if an email already exists in the waitlist
 * @param {string} email - Email address to check
 * @returns {Promise<boolean>}
 */
function emailExists(email) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT 1 FROM waitlist WHERE email = ? LIMIT 1';

        db.get(sql, [email], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(!!row);
        });
    });
}

/**
 * Get the total count of emails in the waitlist
 * @returns {Promise<number>}
 */
function getEmailCount() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT COUNT(*) as count FROM waitlist';

        db.get(sql, (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row ? row.count : 0);
        });
    });
}

/**
 * Get all emails from the waitlist
 * @param {number} limit - Maximum number of results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>}
 */
function getAllEmails(limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, email, timestamp, referral_source, is_subscribed
            FROM waitlist
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
        `;

        db.all(sql, [limit, offset], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows || []);
        });
    });
}

/**
 * Get a single email by address
 * @param {string} email - Email address
 * @returns {Promise<Object|null>}
 */
function getEmailByAddress(email) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM waitlist WHERE email = ?';

        db.get(sql, [email], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row || null);
        });
    });
}

/**
 * Update subscription status
 * @param {string} email - Email address
 * @param {boolean} isSubscribed - Subscription status
 * @returns {Promise<boolean>}
 */
function updateSubscriptionStatus(email, isSubscribed) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE waitlist
            SET is_subscribed = ?, updated_at = CURRENT_TIMESTAMP
            WHERE email = ?
        `;

        db.run(sql, [isSubscribed ? 1 : 0, email], function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes > 0);
        });
    });
}

/**
 * Delete an email from the waitlist
 * @param {string} email - Email address to delete
 * @returns {Promise<boolean>}
 */
function deleteEmail(email) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM waitlist WHERE email = ?';

        db.run(sql, [email], function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes > 0);
        });
    });
}

/**
 * Get statistics about the waitlist
 * @returns {Promise<Object>}
 */
function getStats() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                COUNT(*) as total,
                COUNT(CASE WHEN is_subscribed = 1 THEN 1 END) as subscribed,
                COUNT(CASE WHEN date(timestamp) = date('now') THEN 1 END) as today,
                COUNT(CASE WHEN date(timestamp) >= date('now', '-7 days') THEN 1 END) as last_week
            FROM waitlist
        `;

        db.get(sql, (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row || { total: 0, subscribed: 0, today: 0, last_week: 0 });
        });
    });
}

/**
 * Close the database connection
 * @returns {Promise<void>}
 */
function closeDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('Database connection closed');
                resolve();
            });
        } else {
            resolve();
        }
    });
}

// Export functions
module.exports = {
    initDatabase,
    addEmail,
    emailExists,
    getEmailCount,
    getAllEmails,
    getEmailByAddress,
    updateSubscriptionStatus,
    deleteEmail,
    getStats,
    closeDatabase
};
