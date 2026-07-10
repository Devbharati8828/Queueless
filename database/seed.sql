USE `queueless`;

-- Clear existing data (reverse dependency order)
DELETE FROM time_slots;
DELETE FROM service_log;
DELETE FROM tickets;
DELETE FROM queues;
DELETE FROM users;

-- Reset Auto-Increments
ALTER TABLE time_slots AUTO_INCREMENT = 1;
ALTER TABLE service_log AUTO_INCREMENT = 1;
ALTER TABLE tickets AUTO_INCREMENT = 1;
ALTER TABLE queues AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- ============================================================
-- USERS
-- All passwords are bcrypt hash of 'password123'
-- ============================================================
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'System Administrator', 'admin@queueless.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'admin'),
(2, 'Dr. John Smith', 'doctor.smith@queueless.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),
(3, 'Joe the Barber', 'barber.joe@queueless.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),
(4, 'Sarah from Customer Support', 'support.sarah@queueless.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),
(5, 'John Doe', 'john.doe@gmail.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'user'),
(6, 'Jane Smith', 'jane.smith@gmail.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'user'),
(7, 'Alice Jones', 'alice.jones@gmail.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'user'),
(8, 'Bob Brown', 'bob.brown@gmail.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'user');

-- ============================================================
-- QUEUES — 3 for Dr. John Smith (id=2), Feature 5 columns included
-- ============================================================
INSERT INTO queues (id, provider_id, name, description, queue_code, average_wait_minutes, is_active, is_paused, category, max_capacity, address, operating_hours) VALUES
(1, 2, 'General Consultation', 'Walk-in general medical consultations and checkups.', 'GEN-101', 15, 1, 0, 'Healthcare', 50, 'Room 101, City Hospital, MG Road', '9:00 AM - 5:00 PM'),
(2, 2, 'Lab Tests', 'Blood tests, urine tests, and diagnostic lab work.', 'LAB-202', 10, 1, 0, 'Healthcare', 30, 'Lab Wing B, City Hospital, MG Road', '8:00 AM - 4:00 PM'),
(3, 2, 'Pharmacy Pickup', 'Prescription pickup and medicine dispensing.', 'PHRM-303', 5, 1, 1, 'Retail', 20, 'Pharmacy Counter, City Hospital', '8:00 AM - 8:00 PM'),
-- Additional queues for other providers
(4, 3, 'Joe\'s Premium Barbershop', 'Express haircuts, styling, beard trim, and premium shaving services.', 'HAIR-404', 15, 1, 0, 'Retail', 15, '45 Style Street, Central Market', '10:00 AM - 7:00 PM'),
(5, 4, 'Tier-1 Technical Support', 'On-the-spot technical diagnostics and troubleshooting.', 'TECH-505', 12, 1, 0, 'Government', 25, 'Support Center, Tech Park', '9:30 AM - 6:00 PM');

-- ============================================================
-- TICKETS — Queue 1 (active, has serving + waiting)
-- ============================================================
INSERT INTO tickets (id, queue_id, user_id, token_number, status, position, joined_at, called_at, mood_rating) VALUES
(1, 1, 5, 1, 'served', 0, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR 45 MINUTE), 5),
(2, 1, 6, 2, 'served', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR 30 MINUTE), DATE_SUB(NOW(), INTERVAL 2 HOUR 15 MINUTE), 4),
(3, 1, 7, 3, 'served', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR 45 MINUTE), 5),
(4, 1, 8, 4, 'served', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR 30 MINUTE), DATE_SUB(NOW(), INTERVAL 1 HOUR 15 MINUTE), 3),
(5, 1, 5, 5, 'next', 1, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 10 MINUTE), NULL),
(6, 1, 6, 6, 'waiting', 2, DATE_SUB(NOW(), INTERVAL 40 MINUTE), NULL, NULL),
(7, 1, 7, 7, 'waiting', 3, DATE_SUB(NOW(), INTERVAL 20 MINUTE), NULL, NULL);

-- Queue 2 (Lab Tests, active)
INSERT INTO tickets (id, queue_id, user_id, token_number, status, position, joined_at, called_at, mood_rating) VALUES
(8, 2, 8, 1, 'served', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR 50 MINUTE), 4),
(9, 2, 5, 2, 'served', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR 40 MINUTE), DATE_SUB(NOW(), INTERVAL 1 HOUR 30 MINUTE), 5),
(10, 2, 6, 3, 'next', 1, DATE_SUB(NOW(), INTERVAL 1 HOUR 20 MINUTE), DATE_SUB(NOW(), INTERVAL 5 MINUTE), NULL),
(11, 2, 7, 4, 'waiting', 2, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, NULL);

-- Queue 3 (Pharmacy, paused — no active tickets)

-- ============================================================
-- SERVICE LOG — varied hours for analytics (today only)
-- Covers hours 9, 10, 11, 12, 13, 14 for realistic chart data
-- ============================================================
INSERT INTO service_log (queue_id, ticket_id, duration_seconds, completed_at) VALUES
-- Queue 1: General Consultation
(1, 1, 900,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 09:15:00'))),
(1, 2, 1020, DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 10:05:00'))),
(1, 3, 780,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 10:50:00'))),
(1, 4, 1140, DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 11:30:00'))),
-- Queue 2: Lab Tests
(2, 8, 600,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 09:45:00'))),
(2, 9, 720,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 11:00:00')));

-- ============================================================
-- TIME SLOTS — 8 slots per queue today + tomorrow (10AM-2PM, every 30min)
-- Queues 1, 2, 3 (Dr. John Smith's queues)
-- ============================================================

-- Queue 1 — Today
INSERT INTO time_slots (queue_id, slot_time, capacity, booked) VALUES
(1, DATE_FORMAT(CURDATE(), '%Y-%m-%d 10:00:00'), 5, 2),
(1, DATE_FORMAT(CURDATE(), '%Y-%m-%d 10:30:00'), 5, 5),
(1, DATE_FORMAT(CURDATE(), '%Y-%m-%d 11:00:00'), 5, 1),
(1, DATE_FORMAT(CURDATE(), '%Y-%m-%d 11:30:00'), 5, 3),
(1, DATE_FORMAT(CURDATE(), '%Y-%m-%d 12:00:00'), 5, 0),
(1, DATE_FORMAT(CURDATE(), '%Y-%m-%d 12:30:00'), 5, 4),
(1, DATE_FORMAT(CURDATE(), '%Y-%m-%d 13:00:00'), 5, 0),
(1, DATE_FORMAT(CURDATE(), '%Y-%m-%d 13:30:00'), 5, 1);

-- Queue 1 — Tomorrow
INSERT INTO time_slots (queue_id, slot_time, capacity, booked) VALUES
(1, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 10:00:00'), 5, 0),
(1, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 10:30:00'), 5, 0),
(1, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 11:00:00'), 5, 0),
(1, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 11:30:00'), 5, 0),
(1, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 12:00:00'), 5, 0),
(1, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 12:30:00'), 5, 0),
(1, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 13:00:00'), 5, 0),
(1, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 13:30:00'), 5, 0);

-- Queue 2 — Today
INSERT INTO time_slots (queue_id, slot_time, capacity, booked) VALUES
(2, DATE_FORMAT(CURDATE(), '%Y-%m-%d 10:00:00'), 5, 0),
(2, DATE_FORMAT(CURDATE(), '%Y-%m-%d 10:30:00'), 5, 2),
(2, DATE_FORMAT(CURDATE(), '%Y-%m-%d 11:00:00'), 5, 4),
(2, DATE_FORMAT(CURDATE(), '%Y-%m-%d 11:30:00'), 5, 0),
(2, DATE_FORMAT(CURDATE(), '%Y-%m-%d 12:00:00'), 5, 1),
(2, DATE_FORMAT(CURDATE(), '%Y-%m-%d 12:30:00'), 5, 0),
(2, DATE_FORMAT(CURDATE(), '%Y-%m-%d 13:00:00'), 5, 3),
(2, DATE_FORMAT(CURDATE(), '%Y-%m-%d 13:30:00'), 5, 0);

-- Queue 2 — Tomorrow
INSERT INTO time_slots (queue_id, slot_time, capacity, booked) VALUES
(2, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 10:00:00'), 5, 0),
(2, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 10:30:00'), 5, 0),
(2, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 11:00:00'), 5, 0),
(2, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 11:30:00'), 5, 0),
(2, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 12:00:00'), 5, 0),
(2, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 12:30:00'), 5, 0),
(2, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 13:00:00'), 5, 0),
(2, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 13:30:00'), 5, 0);

-- Queue 3 — Today
INSERT INTO time_slots (queue_id, slot_time, capacity, booked) VALUES
(3, DATE_FORMAT(CURDATE(), '%Y-%m-%d 10:00:00'), 5, 0),
(3, DATE_FORMAT(CURDATE(), '%Y-%m-%d 10:30:00'), 5, 1),
(3, DATE_FORMAT(CURDATE(), '%Y-%m-%d 11:00:00'), 5, 0),
(3, DATE_FORMAT(CURDATE(), '%Y-%m-%d 11:30:00'), 5, 2),
(3, DATE_FORMAT(CURDATE(), '%Y-%m-%d 12:00:00'), 5, 0),
(3, DATE_FORMAT(CURDATE(), '%Y-%m-%d 12:30:00'), 5, 0),
(3, DATE_FORMAT(CURDATE(), '%Y-%m-%d 13:00:00'), 5, 1),
(3, DATE_FORMAT(CURDATE(), '%Y-%m-%d 13:30:00'), 5, 0);

-- Queue 3 — Tomorrow
INSERT INTO time_slots (queue_id, slot_time, capacity, booked) VALUES
(3, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 10:00:00'), 5, 0),
(3, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 10:30:00'), 5, 0),
(3, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 11:00:00'), 5, 0),
(3, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 11:30:00'), 5, 0),
(3, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 12:00:00'), 5, 0),
(3, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 12:30:00'), 5, 0),
(3, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 13:00:00'), 5, 0),
(3, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d 13:30:00'), 5, 0);
