const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '8828064828',
  database: process.env.DB_NAME || 'queueless',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to create the database if it doesn't exist
const initDb = async () => {
  try {
    // Connect without database selected first to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '8828064828',
    });
    
    const dbName = process.env.DB_NAME || 'queueless';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    // Now connect to the pool and create tables
    const db = await pool.getConnection();

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE SET NULL
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
        FOREIGN KEY (queue_id) REFERENCES queues(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('MySQL Database initialized successfully');
    db.release();
  } catch (err) {
    console.error('Error initializing MySQL database:', err);
  }
};

initDb();

module.exports = pool;
