USE `queueless`;

-- Clear existing data (in reverse order of dependencies)
DELETE FROM tickets;
DELETE FROM queues;
DELETE FROM users;

-- Reset Auto-Increments
ALTER TABLE tickets AUTO_INCREMENT = 1;
ALTER TABLE queues AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- Insert Users
-- All passwords are encrypted with bcrypt hash of 'password123'
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'System Administrator', 'admin@queueless.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'admin'),
(2, 'Dr. John Smith', 'doctor.smith@queueless.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),
(3, 'Joe the Barber', 'barber.joe@queueless.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),
(4, 'Sarah from Customer Support', 'support.sarah@queueless.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),
(5, 'John Doe', 'john.doe@gmail.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'user'),
(6, 'Jane Smith', 'jane.smith@gmail.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'user'),
(7, 'Alice Jones', 'alice.jones@gmail.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'user'),
(8, 'Bob Brown', 'bob.brown@gmail.com', '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'user');

-- Insert Queues
INSERT INTO queues (id, provider_id, name, description, queue_code, average_wait_minutes, is_active) VALUES
(1, 2, 'General Dental Clinic', 'Walk-in and scheduled general dental checkups and teeth cleaning.', 'DENT-101', 20, 1),
(2, 3, 'Joe\'s Premium Barbershop', 'Express haircuts, styling, beard trim, and premium shaving services.', 'HAIR-202', 15, 1),
(3, 4, 'Tier-1 Technical Support', 'On-the-spot technical diagnostics, software updates, and basic hardware troubleshooting.', 'TECH-303', 12, 1);

-- Insert Tickets
-- Queue 1 (Dental Clinic): Token 1 served, Token 2 is next (position 1), Token 3 is waiting (position 2)
INSERT INTO tickets (id, queue_id, user_id, token_number, status, position, joined_at) VALUES
(1, 1, 5, 1, 'served', 0, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 45 MINUTE)),
(2, 1, 6, 2, 'next', 1, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 20 MINUTE)),
(3, 1, 7, 3, 'waiting', 2, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 MINUTE));

-- Queue 2 (Joe's Barbershop): Token 1 is next (position 1), Token 2 is waiting (position 2)
INSERT INTO tickets (id, queue_id, user_id, token_number, status, position, joined_at) VALUES
(4, 2, 8, 1, 'next', 1, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 MINUTE)),
(5, 2, 5, 2, 'waiting', 2, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 MINUTE));

-- Queue 3 (Tech Support): Empty/No active tickets right now
