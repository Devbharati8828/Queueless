const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '8828064828',
  database: process.env.DB_NAME || 'queueless',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper to run ALTER TABLE safely (ignore if column already exists)
const safeAlter = async (db, sql) => {
  try {
    await db.query(sql);
  } catch (err) {
    // 1060 = Duplicate column, 1061 = Duplicate key — safe to ignore
    if (err.errno !== 1060 && err.errno !== 1061) {
      console.warn('Migration warning:', err.message);
    }
  }
};

const initDb = async () => {
  try {
    const db = await pool.getConnection();

    // ── Core tables ──────────────────────────────────────────────────────────

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS queues (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider_id INT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        queue_code VARCHAR(20) UNIQUE NOT NULL,
        average_wait_minutes INT DEFAULT 15,
        is_active TINYINT(1) DEFAULT 1,
        is_paused TINYINT(1) DEFAULT 0,
        category VARCHAR(50) DEFAULT 'General',
        max_capacity INT DEFAULT 50,
        address VARCHAR(255) DEFAULT '',
        operating_hours VARCHAR(100) DEFAULT '9:00 AM - 5:00 PM',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        queue_id INT NOT NULL,
        slot_time DATETIME NOT NULL,
        capacity INT DEFAULT 5,
        booked INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (queue_id) REFERENCES queues(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        queue_id INT,
        user_id INT,
        token_number INT NOT NULL,
        status VARCHAR(20) DEFAULT 'waiting',
        position INT,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        called_at DATETIME NULL,
        mood_rating TINYINT NULL DEFAULT NULL,
        scheduled_slot_id INT NULL DEFAULT NULL,
        FOREIGN KEY (queue_id) REFERENCES queues(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (scheduled_slot_id) REFERENCES time_slots(id) ON DELETE SET NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS service_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        queue_id INT,
        ticket_id INT,
        duration_seconds INT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (queue_id) REFERENCES queues(id) ON DELETE CASCADE,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
      )
    `);

    // ── Additive migrations (safe — ignore if already exists) ────────────────

    // Feature 5: new queue columns
    await safeAlter(db, "ALTER TABLE queues ADD COLUMN is_paused TINYINT(1) DEFAULT 0");
    await safeAlter(db, "ALTER TABLE queues ADD COLUMN category VARCHAR(50) DEFAULT 'General'");
    await safeAlter(db, "ALTER TABLE queues ADD COLUMN max_capacity INT DEFAULT 50");
    await safeAlter(db, "ALTER TABLE queues ADD COLUMN address VARCHAR(255) DEFAULT ''");
    await safeAlter(db, "ALTER TABLE queues ADD COLUMN operating_hours VARCHAR(100) DEFAULT '9:00 AM - 5:00 PM'");

    // Feature 4: mood rating
    await safeAlter(db, "ALTER TABLE tickets ADD COLUMN mood_rating TINYINT NULL DEFAULT NULL");
    await safeAlter(db, "ALTER TABLE tickets ADD COLUMN called_at DATETIME NULL");

    // Feature 6: scheduled slot FK
    await safeAlter(db, "ALTER TABLE tickets ADD COLUMN scheduled_slot_id INT NULL DEFAULT NULL");

    console.log('MySQL Database initialized successfully (Features 4/5/6 migrations applied)');
    db.release();
  } catch (err) {
    console.error('Error initializing MySQL database:', err);
  }
};

initDb();

module.exports = pool;
