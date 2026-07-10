-- Create Database
CREATE DATABASE IF NOT EXISTS `queueless`;
USE `queueless`;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Queues Table
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
);

-- Time Slots Table (Feature 6)
CREATE TABLE IF NOT EXISTS time_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  queue_id INT NOT NULL,
  slot_time DATETIME NOT NULL,
  capacity INT DEFAULT 5,
  booked INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (queue_id) REFERENCES queues(id) ON DELETE CASCADE
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  queue_id INT,
  user_id INT,
  token_number INT NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting', -- waiting, next, served, cancelled, expired, scheduled
  position INT,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  called_at DATETIME NULL,
  mood_rating TINYINT NULL DEFAULT NULL,      -- 1-5 user rating (Feature 4)
  scheduled_slot_id INT NULL DEFAULT NULL,    -- FK to time_slots (Feature 6)
  FOREIGN KEY (queue_id) REFERENCES queues(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (scheduled_slot_id) REFERENCES time_slots(id) ON DELETE SET NULL
);

-- Service Log Table
CREATE TABLE IF NOT EXISTS service_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  queue_id INT,
  ticket_id INT,
  duration_seconds INT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (queue_id) REFERENCES queues(id) ON DELETE CASCADE,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);
