const express = require('express');
const router = express.Router();
const { getMyBookings, activateTicket } = require('../controllers/queue');
const { protect } = require('../middleware/auth');

// GET /api/tickets/my-bookings — all upcoming scheduled bookings for logged-in user
router.get('/my-bookings', protect, getMyBookings);

// PATCH /api/tickets/:id/activate — convert scheduled → waiting when slot time arrives
router.patch('/:id/activate', protect, activateTicket);

module.exports = router;
