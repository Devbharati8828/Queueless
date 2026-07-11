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
-- Admin
(1,  'System Administrator',         'admin@queueless.com',            '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'admin'),

-- Healthcare Providers
(2,  'Dr. John Smith',               'doctor.smith@queueless.com',     '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),
(3,  'Dr. Priya Mehta',              'doctor.priya@queueless.com',     '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),

-- Retail Providers
(4,  'Joe the Barber',               'barber.joe@queueless.com',       '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),
(5,  'FreshMart Superstore',         'freshmart@queueless.com',        '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),

-- Banking Providers
(6,  'City Bank — Branch Manager',   'citybank@queueless.com',         '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),
(7,  'State Finance Corp',           'statefinance@queueless.com',     '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),

-- Government Providers
(8,  'Sarah from Customer Support',  'support.sarah@queueless.com',    '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),
(9,  'RTO Officer — District Office','rto.officer@queueless.com',      '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),
(10, 'Municipal Corporation Desk',   'municipality@queueless.com',     '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),

-- Education Providers
(11, 'Prof. Alan Ray',               'prof.alan@queueless.com',        '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),
(12, 'City University Admin Office', 'univ.admin@queueless.com',       '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),

-- Other Providers
(13, 'QuickFix Service Center',      'quickfix@queueless.com',         '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),
(14, 'FoodCourt Manager',            'foodcourt@queueless.com',        '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'provider'),

-- Regular Users
(15, 'John Doe',                     'john.doe@gmail.com',             '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'user'),
(16, 'Jane Smith',                   'jane.smith@gmail.com',           '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'user'),
(17, 'Alice Jones',                  'alice.jones@gmail.com',          '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'user'),
(18, 'Bob Brown',                    'bob.brown@gmail.com',            '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'user'),
(19, 'Ravi Kumar',                   'ravi.kumar@gmail.com',           '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'user'),
(20, 'Meera Nair',                   'meera.nair@gmail.com',           '$2a$10$mC3qE2dE.u9S48mYgX/uP.pYF12O4Fh74cuxlI7pC6Z.T7kQeG76G', 'user');

-- ============================================================
-- QUEUES — All 6 categories
-- ============================================================
INSERT INTO queues (id, provider_id, name, description, queue_code, average_wait_minutes, is_active, is_paused, category, max_capacity, address, operating_hours) VALUES

-- ── HEALTHCARE (provider: Dr. John Smith = 2, Dr. Priya Mehta = 3) ──
(1,  2, 'General Consultation',       'Walk-in general medical consultations and checkups.',          'GEN-101',  15, 1, 0, 'Healthcare', 50, 'Room 101, City Hospital, MG Road',               '9:00 AM - 5:00 PM'),
(2,  2, 'Lab Tests',                  'Blood tests, urine tests, and diagnostic lab work.',           'LAB-202',  10, 1, 0, 'Healthcare', 30, 'Lab Wing B, City Hospital, MG Road',             '8:00 AM - 4:00 PM'),
(3,  2, 'Pharmacy Pickup',            'Prescription pickup and medicine dispensing.',                 'PHRM-303',  5, 1, 1, 'Retail',     20, 'Pharmacy Counter, City Hospital',                '8:00 AM - 8:00 PM'),
(4,  3, 'Dental Checkup',             'Routine dental examinations, cleaning, and X-rays.',          'DENT-110', 20, 1, 0, 'Healthcare', 20, 'Smile Dental Clinic, Park Avenue',               '10:00 AM - 6:00 PM'),
(5,  3, 'Eye Specialist OPD',         'Ophthalmology consultations, vision tests, and prescriptions.','EYE-115',  18, 1, 0, 'Healthcare', 25, 'Eye Care Centre, 2nd Floor, Apollo Hospital',    '9:00 AM - 4:00 PM'),
(6,  3, 'X-Ray & Imaging',            'Digital X-ray, ultrasound, and CT scan appointments.',        'XRAY-120', 25, 1, 1, 'Healthcare', 15, 'Radiology Wing, Apollo Hospital',                '8:00 AM - 3:00 PM'),

-- ── BANKING (provider: City Bank = 6, State Finance = 7) ──
(7,  6, 'Cash Deposit / Withdrawal',  'Counter service for cash deposits, withdrawals, and DD.',     'CASH-601', 12, 1, 0, 'Banking',    40, 'Counter A, City Bank, Main Branch, Ring Road',   '10:00 AM - 4:00 PM'),
(8,  6, 'Account Opening Desk',       'New savings, current, and FD account opening assistance.',    'ACCT-602', 20, 1, 0, 'Banking',    20, 'Counter B, City Bank, Main Branch, Ring Road',   '10:00 AM - 3:00 PM'),
(9,  6, 'Loan Application Counter',   'Home loan, personal loan, and vehicle loan applications.',    'LOAN-603', 30, 1, 0, 'Banking',    15, 'Loan Dept, City Bank, First Floor',              '10:30 AM - 3:30 PM'),
(10, 7, 'KYC & Document Verification','Aadhaar linking, PAN update, and KYC document submission.',  'KYC-701',  10, 1, 0, 'Banking',    35, 'Ground Floor, State Finance Corp, Civil Lines',  '9:00 AM - 5:00 PM'),

-- ── GOVERNMENT (provider: Sarah = 8, RTO = 9, Municipality = 10) ──
(11, 8, 'Tier-1 Technical Support',   'On-the-spot technical diagnostics and troubleshooting.',      'TECH-505', 12, 1, 0, 'Government', 25, 'Support Center, Tech Park',                      '9:30 AM - 6:00 PM'),
(12, 9, 'Driving License Services',   'New DL, renewal, duplicate, and endorsement requests.',       'RTO-901',  25, 1, 0, 'Government', 60, 'RTO Office, District Headquarters, NH-8',        '9:00 AM - 4:00 PM'),
(13, 9, 'Vehicle Registration',       'New vehicle registration, transfer of ownership, and RC.',    'RTO-902',  30, 1, 0, 'Government', 50, 'RTO Office, District Headquarters, NH-8',        '9:00 AM - 3:00 PM'),
(14, 10,'Property Tax Payment',       'Property tax submission, receipts, and objection handling.',  'MUNI-101', 15, 1, 0, 'Government', 45, 'Window 3, Municipal Corp Office, City Centre',   '10:00 AM - 5:00 PM'),
(15, 10,'Birth / Death Certificate',  'Issuance and correction of birth and death certificates.',    'MUNI-102', 20, 1, 0, 'Government', 30, 'Window 5, Municipal Corp Office, City Centre',   '10:00 AM - 4:00 PM'),
(16, 10,'Passport Office Assistance', 'Appointment support, document verification for passports.',   'PASS-103', 35, 1, 0, 'Government', 40, 'PSK Passport Seva Kendra, Airport Road',         '9:00 AM - 5:00 PM'),

-- ── RETAIL (provider: Joe Barber = 4, FreshMart = 5) ──
(17, 4, 'Joe\'s Premium Barbershop',  'Express haircuts, styling, beard trim, and premium shaving.', 'HAIR-404', 15, 1, 0, 'Retail',     15, '45 Style Street, Central Market',                '10:00 AM - 7:00 PM'),
(18, 5, 'Supermarket Checkout',       'Fast-lane checkout counter for up to 10 items or less.',     'MART-501',  5, 1, 0, 'Retail',     80, 'Checkout Lane 3-6, FreshMart Superstore, GT Road','8:00 AM - 10:00 PM'),
(19, 5, 'Customer Service Desk',      'Returns, exchanges, refunds, and loyalty card assistance.',   'MART-502', 10, 1, 0, 'Retail',     20, 'Service Desk, FreshMart Superstore, GT Road',    '9:00 AM - 9:00 PM'),
(20, 5, 'Home Delivery Pickup',       'Click-and-collect order pickup for online orders.',           'MART-503',  8, 1, 0, 'Retail',     25, 'Pickup Bay, FreshMart Superstore, GT Road',      '8:00 AM - 10:00 PM'),

-- ── EDUCATION (provider: Prof. Alan = 11, University Admin = 12) ──
(21, 11,'Student Counselling',        'Academic guidance, course selection, and mental health support.','EDU-111', 20, 1, 0, 'Education', 20, 'Counselling Room 3, Arts Block, City University','9:00 AM - 4:00 PM'),
(22, 12,'Admissions Office',          'Undergraduate and postgraduate admissions enquiries.',         'ADM-120', 15, 1, 0, 'Education', 35, 'Ground Floor, Admin Block, City University',     '9:30 AM - 4:30 PM'),
(23, 12,'Exam Results & Transcripts', 'Result verification, transcript issuance, and mark sheets.',  'EXAM-125', 12, 1, 0, 'Education', 30, 'Exam Section, Admin Block, City University',     '10:00 AM - 3:00 PM'),
(24, 12,'Library Book Issue / Return','Book issue, return, renewal, and fine payment counter.',       'LIB-130',  5, 1, 0, 'Education', 50, 'Central Library, City University Campus',        '8:00 AM - 8:00 PM'),
(25, 11,'Fee Payment Counter',        'Tuition fee, hostel fee, and bus pass payments.',              'FEE-135',  8, 1, 0, 'Education', 40, 'Accounts Section, Admin Block, City University', '9:00 AM - 3:00 PM'),

-- ── OTHER (provider: QuickFix = 13, FoodCourt = 14) ──
(26, 13,'Electronics Repair Queue',   'On-spot repair for phones, laptops, tablets, and TVs.',       'FIX-131', 20, 1, 0, 'Other',      20, 'Shop 7, Tech Bazaar, Nehru Place',               '11:00 AM - 7:00 PM'),
(27, 13,'Appliance Service Booking',  'AC, fridge, washing machine servicing and installation.',      'FIX-132', 30, 1, 0, 'Other',      15, 'Shop 7, Tech Bazaar, Nehru Place',               '10:00 AM - 6:00 PM'),
(28, 14,'Food Court Token Queue',     'Token-based ordering system for food court stalls.',           'FOOD-141',  8, 1, 0, 'Other',     100, 'Food Court Level 2, Central Mall',              '11:00 AM - 10:00 PM'),
(29, 14,'VIP Dining Reservation',     'Priority table reservation and concierge seating service.',   'FOOD-142', 10, 1, 0, 'Other',      30, 'Fine Dining Section, Level 3, Central Mall',    '12:00 PM - 11:00 PM');

-- ============================================================
-- TICKETS — Queue 1 (General Consultation — active, has serving + waiting)
-- ============================================================
INSERT INTO tickets (id, queue_id, user_id, token_number, status, position, joined_at, called_at, mood_rating) VALUES
(1,  1, 15, 1, 'served',  0, DATE_SUB(NOW(), INTERVAL 3 HOUR),          DATE_SUB(NOW(), INTERVAL '2:45' HOUR_MINUTE), 5),
(2,  1, 16, 2, 'served',  0, DATE_SUB(NOW(), INTERVAL '2:30' HOUR_MINUTE),DATE_SUB(NOW(), INTERVAL '2:15' HOUR_MINUTE), 4),
(3,  1, 17, 3, 'served',  0, DATE_SUB(NOW(), INTERVAL 2 HOUR),          DATE_SUB(NOW(), INTERVAL '1:45' HOUR_MINUTE), 5),
(4,  1, 18, 4, 'served',  0, DATE_SUB(NOW(), INTERVAL '1:30' HOUR_MINUTE),DATE_SUB(NOW(), INTERVAL '1:15' HOUR_MINUTE), 3),
(5,  1, 15, 5, 'next',    1, DATE_SUB(NOW(), INTERVAL 1 HOUR),          DATE_SUB(NOW(), INTERVAL 10 MINUTE),         NULL),
(6,  1, 16, 6, 'waiting', 2, DATE_SUB(NOW(), INTERVAL 40 MINUTE),       NULL,                                        NULL),
(7,  1, 17, 7, 'waiting', 3, DATE_SUB(NOW(), INTERVAL 20 MINUTE),       NULL,                                        NULL);

-- Queue 2 (Lab Tests — active)
INSERT INTO tickets (id, queue_id, user_id, token_number, status, position, joined_at, called_at, mood_rating) VALUES
(8,  2, 18, 1, 'served',  0, DATE_SUB(NOW(), INTERVAL 2 HOUR),          DATE_SUB(NOW(), INTERVAL '1:50' HOUR_MINUTE), 4),
(9,  2, 15, 2, 'served',  0, DATE_SUB(NOW(), INTERVAL '1:40' HOUR_MINUTE),DATE_SUB(NOW(), INTERVAL '1:30' HOUR_MINUTE), 5),
(10, 2, 16, 3, 'next',    1, DATE_SUB(NOW(), INTERVAL '1:20' HOUR_MINUTE),DATE_SUB(NOW(), INTERVAL 5 MINUTE),          NULL),
(11, 2, 17, 4, 'waiting', 2, DATE_SUB(NOW(), INTERVAL 30 MINUTE),       NULL,                                        NULL);

-- Queue 7 (Cash Deposit/Withdrawal — active)
INSERT INTO tickets (id, queue_id, user_id, token_number, status, position, joined_at, called_at, mood_rating) VALUES
(12, 7, 19, 1, 'served',  0, DATE_SUB(NOW(), INTERVAL 2 HOUR),          DATE_SUB(NOW(), INTERVAL '1:48' HOUR_MINUTE), 4),
(13, 7, 20, 2, 'served',  0, DATE_SUB(NOW(), INTERVAL '1:30' HOUR_MINUTE),DATE_SUB(NOW(), INTERVAL '1:18' HOUR_MINUTE), 3),
(14, 7, 15, 3, 'next',    1, DATE_SUB(NOW(), INTERVAL 50 MINUTE),       DATE_SUB(NOW(), INTERVAL 8 MINUTE),          NULL),
(15, 7, 16, 4, 'waiting', 2, DATE_SUB(NOW(), INTERVAL 30 MINUTE),       NULL,                                        NULL),
(16, 7, 17, 5, 'waiting', 3, DATE_SUB(NOW(), INTERVAL 15 MINUTE),       NULL,                                        NULL);

-- Queue 12 (Driving License — active)
INSERT INTO tickets (id, queue_id, user_id, token_number, status, position, joined_at, called_at, mood_rating) VALUES
(17, 12, 18, 1, 'served',  0, DATE_SUB(NOW(), INTERVAL 3 HOUR),         DATE_SUB(NOW(), INTERVAL '2:35' HOUR_MINUTE), 2),
(18, 12, 19, 2, 'served',  0, DATE_SUB(NOW(), INTERVAL 2 HOUR),         DATE_SUB(NOW(), INTERVAL '1:30' HOUR_MINUTE), 3),
(19, 12, 20, 3, 'next',    1, DATE_SUB(NOW(), INTERVAL 1 HOUR),         DATE_SUB(NOW(), INTERVAL 12 MINUTE),         NULL),
(20, 12, 15, 4, 'waiting', 2, DATE_SUB(NOW(), INTERVAL 35 MINUTE),      NULL,                                        NULL);

-- Queue 17 (Barbershop — active)
INSERT INTO tickets (id, queue_id, user_id, token_number, status, position, joined_at, called_at, mood_rating) VALUES
(21, 17, 16, 1, 'served',  0, DATE_SUB(NOW(), INTERVAL 2 HOUR),         DATE_SUB(NOW(), INTERVAL '1:45' HOUR_MINUTE), 5),
(22, 17, 17, 2, 'next',    1, DATE_SUB(NOW(), INTERVAL 1 HOUR),         DATE_SUB(NOW(), INTERVAL 15 MINUTE),         NULL),
(23, 17, 18, 3, 'waiting', 2, DATE_SUB(NOW(), INTERVAL 25 MINUTE),      NULL,                                        NULL);

-- Queue 22 (Admissions Office — active)
INSERT INTO tickets (id, queue_id, user_id, token_number, status, position, joined_at, called_at, mood_rating) VALUES
(24, 22, 19, 1, 'served',  0, DATE_SUB(NOW(), INTERVAL 2 HOUR),          DATE_SUB(NOW(), INTERVAL '1:44' HOUR_MINUTE), 4),
(25, 22, 20, 2, 'served',  0, DATE_SUB(NOW(), INTERVAL '1:20' HOUR_MINUTE),DATE_SUB(NOW(), INTERVAL '1:5' HOUR_MINUTE),  5),
(26, 22, 15, 3, 'next',    1, DATE_SUB(NOW(), INTERVAL 40 MINUTE),       DATE_SUB(NOW(), INTERVAL 7 MINUTE),          NULL),
(27, 22, 16, 4, 'waiting', 2, DATE_SUB(NOW(), INTERVAL 18 MINUTE),       NULL,                                        NULL);

-- Queue 28 (Food Court — active)
INSERT INTO tickets (id, queue_id, user_id, token_number, status, position, joined_at, called_at, mood_rating) VALUES
(28, 28, 17, 1, 'served',  0, DATE_SUB(NOW(), INTERVAL 1 HOUR),         DATE_SUB(NOW(), INTERVAL 52 MINUTE),        5),
(29, 28, 18, 2, 'served',  0, DATE_SUB(NOW(), INTERVAL 45 MINUTE),      DATE_SUB(NOW(), INTERVAL 37 MINUTE),        4),
(30, 28, 19, 3, 'next',    1, DATE_SUB(NOW(), INTERVAL 20 MINUTE),      DATE_SUB(NOW(), INTERVAL 5 MINUTE),         NULL),
(31, 28, 20, 4, 'waiting', 2, DATE_SUB(NOW(), INTERVAL 10 MINUTE),      NULL,                                       NULL);

-- ============================================================
-- SERVICE LOG — analytics data spread across today's hours
-- ============================================================
INSERT INTO service_log (queue_id, ticket_id, duration_seconds, completed_at) VALUES
-- Queue 1: General Consultation
(1,  1,  900,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 09:15:00'))),
(1,  2,  1020, DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 10:05:00'))),
(1,  3,  780,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 10:50:00'))),
(1,  4,  1140, DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 11:30:00'))),
-- Queue 2: Lab Tests
(2,  8,  600,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 09:45:00'))),
(2,  9,  720,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 11:00:00'))),
-- Queue 7: Banking
(7,  12, 700,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 10:20:00'))),
(7,  13, 810,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 11:45:00'))),
-- Queue 12: RTO
(12, 17, 1500, DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 09:30:00'))),
(12, 18, 1800, DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 11:00:00'))),
-- Queue 17: Barbershop
(17, 21, 900,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 10:10:00'))),
-- Queue 22: Admissions
(22, 24, 960,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 09:55:00'))),
(22, 25, 840,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 11:15:00'))),
-- Queue 28: Food Court
(28, 28, 480,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 12:00:00'))),
(28, 29, 510,  DATE_FORMAT(NOW(), CONCAT('%Y-%m-%d 12:45:00')));

-- ============================================================
-- TIME SLOTS — for Queues 1, 2, 3 (Dr. John Smith)
-- Today + Tomorrow, 10AM–2PM, every 30 min
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
