const express = require('express');
const router = express.Router();
const { getQueues, createQueue, joinQueue, callNext } = require('../controllers/queue');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getQueues);
router.post('/', protect, authorize('provider', 'admin'), createQueue);
router.post('/:id/join', protect, joinQueue);
router.post('/:id/next', protect, authorize('provider', 'admin'), callNext);

module.exports = router;
