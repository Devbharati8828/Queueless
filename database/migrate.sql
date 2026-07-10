USE `queueless`;

-- ============================================================
-- Migration: Features 4, 5, 6
-- Run once against the queueless database
-- ============================================================

-- Feature 5: Add new columns to queues table
ALTER TABLE queues
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS max_capacity INT DEFAULT 50,
  ADD COLUMN IF NOT EXISTS address VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS operating_hours VARCHAR(100) DEFAULT '9:00 AM - 5:00 PM',
  ADD COLUMN IF NOT EXISTS is_paused TINYINT(1) DEFAULT 0;

-- Feature 4: Add mood_rating to tickets
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS mood_rating TINYINT NULL DEFAULT NULL;

-- Feature 6: Add scheduled_slot_id FK to tickets
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS scheduled_slot_id INT NULL DEFAULT NULL;

-- Feature 6: Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  queue_id INT NOT NULL,
  slot_time DATETIME NOT NULL,
  capacity INT DEFAULT 5,
  booked INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (queue_id) REFERENCES queues(id) ON DELETE CASCADE
);

-- Add FK constraint for scheduled_slot_id (safe: only if time_slots exists)
-- Note: Run this after time_slots is created
ALTER TABLE tickets
  ADD CONSTRAINT fk_tickets_slot
  FOREIGN KEY IF NOT EXISTS (scheduled_slot_id) REFERENCES time_slots(id) ON DELETE SET NULL;
