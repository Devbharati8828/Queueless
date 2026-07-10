const express = require('express');
const router = express.Router();
const {
  getQueues,
  getProviderQueues,
  createQueue,
  joinQueue,
  callNext,
  getQueueTickets,
  getQueueStats,
  getQueueAnalytics,
  toggleActive,
  togglePause,
  getSlots,
  bookSlot,
  cancelBooking,
} = require('../controllers/queue');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getQueues);
router.get('/:id/tickets', getQueueTickets);
router.get('/:id/stats', getQueueStats);
router.get('/:id/slots', getSlots);

// Auth required
router.post('/:id/join', protect, joinQueue);
router.post('/:id/book', protect, bookSlot);
router.delete('/:id/book/:ticketId', protect, cancelBooking);

// Provider only
router.get('/provider', protect, authorize('provider', 'admin'), getProviderQueues);
router.post('/', protect, authorize('provider', 'admin'), createQueue);
router.post('/:id/next', protect, authorize('provider', 'admin'), callNext);
router.get('/:id/analytics', protect, authorize('provider', 'admin'), getQueueAnalytics);
router.patch('/:id/toggle-active', protect, authorize('provider', 'admin'), toggleActive);
router.patch('/:id/toggle-pause', protect, authorize('provider', 'admin'), togglePause);

module.exports = router;
