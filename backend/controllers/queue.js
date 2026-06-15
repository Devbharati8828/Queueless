const db = require('../db');

// @desc    Get all active queues
// @route   GET /api/queue
exports.getQueues = async (req, res) => {
  try {
    const [queues] = await db.query(`
      SELECT q.*, u.name as provider_name 
      FROM queues q 
      JOIN users u ON q.provider_id = u.id 
      WHERE q.is_active = 1
    `);
    res.json(queues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new queue
// @route   POST /api/queue
// @access  Private (Provider only)
exports.createQueue = async (req, res) => {
  try {
    const { name, description, queue_code, average_wait_minutes } = req.body;
    const provider_id = req.user.id;

    // Check if code exists
    const [existing] = await db.query('SELECT * FROM queues WHERE queue_code = ?', [queue_code]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Queue code already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO queues (provider_id, name, description, queue_code, average_wait_minutes) VALUES (?, ?, ?, ?, ?)',
      [provider_id, name, description, queue_code, average_wait_minutes || 15]
    );

    const [newQueue] = await db.query('SELECT * FROM queues WHERE id = ?', [result.insertId]);

    res.status(201).json(newQueue[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join a queue
// @route   POST /api/queue/:id/join
// @access  Private
exports.joinQueue = async (req, res) => {
  try {
    const queueId = req.params.id;
    const userId = req.user.id;

    // Check if queue exists
    const [queues] = await db.query('SELECT * FROM queues WHERE id = ? AND is_active = 1', [queueId]);
    if (queues.length === 0) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    // Check if user already in queue
    const [existingTicket] = await db.query(
      "SELECT * FROM tickets WHERE queue_id = ? AND user_id = ? AND status IN ('waiting', 'next')",
      [queueId, userId]
    );

    if (existingTicket.length > 0) {
      return res.status(400).json({ message: 'You are already in this queue' });
    }

    // Get current max token and position
    const [maxTokenRows] = await db.query('SELECT MAX(token_number) as maxToken FROM tickets WHERE queue_id = ?', [queueId]);
    const nextToken = (maxTokenRows[0].maxToken || 0) + 1;

    const [waitingRows] = await db.query(
      "SELECT COUNT(*) as count FROM tickets WHERE queue_id = ? AND status IN ('waiting', 'next')",
      [queueId]
    );
    const position = parseInt(waitingRows[0].count) + 1;

    // Create ticket
    const [result] = await db.query(
      'INSERT INTO tickets (queue_id, user_id, token_number, position, status) VALUES (?, ?, ?, ?, ?)',
      [queueId, userId, nextToken, position, position === 1 ? 'next' : 'waiting']
    );

    const [newTicket] = await db.query('SELECT * FROM tickets WHERE id = ?', [result.insertId]);

    // Emit event
    req.io.to(`queue_${queueId}`).emit('queue:updated', { queueId });

    res.status(201).json(newTicket[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Call next ticket
// @route   POST /api/queue/:id/next
// @access  Private (Provider only)
exports.callNext = async (req, res) => {
  try {
    const queueId = req.params.id;
    
    // Validate provider owns queue
    const [queues] = await db.query('SELECT * FROM queues WHERE id = ? AND provider_id = ?', [queueId, req.user.id]);
    if (queues.length === 0) {
      return res.status(403).json({ message: 'Not authorized for this queue' });
    }

    // Mark currently 'next' as 'served'
    await db.query(
      "UPDATE tickets SET status = 'served' WHERE queue_id = ? AND status = 'next'",
      [queueId]
    );

    // Get the next ticket in line (lowest position among waiting)
    const [nextTickets] = await db.query(
      "SELECT * FROM tickets WHERE queue_id = ? AND status = 'waiting' ORDER BY joined_at ASC LIMIT 1",
      [queueId]
    );

    if (nextTickets.length > 0) {
      const nextTicket = nextTickets[0];
      // Update its status to 'next'
      await db.query("UPDATE tickets SET status = 'next' WHERE id = ?", [nextTicket.id]);

      // Shift positions down
      await db.query(
        "UPDATE tickets SET position = position - 1 WHERE queue_id = ? AND status IN ('waiting', 'next')",
        [queueId]
      );
      
      // Emit specific ticket called event
      req.io.to(`queue_${queueId}`).emit('ticket:called', { ticketId: nextTicket.id, tokenNumber: nextTicket.token_number });
    }

    // Emit general queue update
    req.io.to(`queue_${queueId}`).emit('queue:updated', { queueId });

    res.json({ message: 'Queue advanced' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
