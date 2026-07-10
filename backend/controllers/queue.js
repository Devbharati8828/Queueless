const db = require('../db');

const holdTimers = {};

exports.cancelHoldTimer = (ticketId) => {
  if (holdTimers[ticketId]) {
    clearTimeout(holdTimers[ticketId]);
    delete holdTimers[ticketId];
  }
};

// ============================================================
// @desc    Get all active queues (public browse)
// @route   GET /api/queue
// ============================================================
exports.getQueues = async (req, res) => {
  try {
    const [queues] = await db.query(`
      SELECT 
        q.*,
        u.name as provider_name,
        COALESCE(
          (SELECT AVG(duration_seconds) FROM (SELECT duration_seconds FROM service_log WHERE queue_id = q.id ORDER BY completed_at DESC LIMIT 10) as sl),
          q.average_wait_minutes * 60
        ) as averageServiceSeconds,
        (SELECT COUNT(*) FROM tickets WHERE queue_id = q.id AND status IN ('waiting','next')) as waitingCount,
        (SELECT token_number FROM tickets WHERE queue_id = q.id AND status = 'next' LIMIT 1) as currentlyServingToken
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

// ============================================================
// @desc    Get all queues for the logged-in provider with live stats
// @route   GET /api/queue/provider
// @access  Private (Provider only)
// ============================================================
exports.getProviderQueues = async (req, res) => {
  try {
    const providerId = req.user.id;
    const [queues] = await db.query(`
      SELECT 
        q.*,
        (SELECT COUNT(*) FROM tickets WHERE queue_id = q.id AND status IN ('waiting','next')) as waitingCount,
        (SELECT COUNT(*) FROM service_log WHERE queue_id = q.id AND DATE(completed_at) = CURDATE()) as servedToday,
        (SELECT token_number FROM tickets WHERE queue_id = q.id AND status = 'next' LIMIT 1) as currentlyServing,
        COALESCE(
          (SELECT AVG(duration_seconds) FROM (SELECT duration_seconds FROM service_log WHERE queue_id = q.id ORDER BY completed_at DESC LIMIT 10) as sl),
          q.average_wait_minutes * 60
        ) as averageServiceSeconds,
        COALESCE(
          (SELECT ROUND(AVG(mood_rating), 1) FROM tickets WHERE queue_id = q.id AND mood_rating IS NOT NULL AND DATE(joined_at) = CURDATE()),
          NULL
        ) as avgRating
      FROM queues q
      WHERE q.provider_id = ?
      ORDER BY q.created_at ASC
    `, [providerId]);
    res.json(queues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// @desc    Create a new queue
// @route   POST /api/queue
// @access  Private (Provider only)
// ============================================================
exports.createQueue = async (req, res) => {
  try {
    const { name, description, queue_code, average_wait_minutes, category, max_capacity, address, operating_hours } = req.body;
    const provider_id = req.user.id;

    const [existing] = await db.query('SELECT * FROM queues WHERE queue_code = ?', [queue_code]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Queue code already exists' });
    }

    const [result] = await db.query(
      `INSERT INTO queues 
        (provider_id, name, description, queue_code, average_wait_minutes, category, max_capacity, address, operating_hours) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [provider_id, name, description, queue_code, average_wait_minutes || 15,
       category || 'General', max_capacity || 50, address || '', operating_hours || '9:00 AM - 5:00 PM']
    );

    const [newQueue] = await db.query('SELECT * FROM queues WHERE id = ?', [result.insertId]);
    res.status(201).json(newQueue[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// @desc    Toggle queue active/inactive
// @route   PATCH /api/queue/:id/toggle-active
// @access  Private (Provider only)
// ============================================================
exports.toggleActive = async (req, res) => {
  try {
    const queueId = req.params.id;
    const [queues] = await db.query('SELECT * FROM queues WHERE id = ? AND provider_id = ?', [queueId, req.user.id]);
    if (queues.length === 0) return res.status(403).json({ message: 'Not authorized for this queue' });

    const newActive = queues[0].is_active ? 0 : 1;
    await db.query('UPDATE queues SET is_active = ? WHERE id = ?', [newActive, queueId]);

    req.io.to(`queue_${queueId}`).emit('queue:status_changed', { queueId, is_active: newActive });
    res.json({ message: `Queue ${newActive ? 'activated' : 'deactivated'}`, is_active: newActive });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// @desc    Toggle queue pause/resume
// @route   PATCH /api/queue/:id/toggle-pause
// @access  Private (Provider only)
// ============================================================
exports.togglePause = async (req, res) => {
  try {
    const queueId = req.params.id;
    const [queues] = await db.query('SELECT * FROM queues WHERE id = ? AND provider_id = ?', [queueId, req.user.id]);
    if (queues.length === 0) return res.status(403).json({ message: 'Not authorized for this queue' });

    const newPaused = queues[0].is_paused ? 0 : 1;
    await db.query('UPDATE queues SET is_paused = ? WHERE id = ?', [newPaused, queueId]);

    const eventName = newPaused ? 'queue:paused' : 'queue:resumed';
    req.io.to(`queue_${queueId}`).emit(eventName, { queueId, is_paused: newPaused });
    res.json({ message: `Queue ${newPaused ? 'paused' : 'resumed'}`, is_paused: newPaused });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// @desc    Get analytics for a queue (provider only)
// @route   GET /api/queue/:id/analytics
// @access  Private (Provider only)
// ============================================================
exports.getQueueAnalytics = async (req, res) => {
  try {
    const queueId = req.params.id;

    // Validate ownership
    const [queues] = await db.query('SELECT * FROM queues WHERE id = ? AND provider_id = ?', [queueId, req.user.id]);
    if (queues.length === 0) return res.status(403).json({ message: 'Not authorized for this queue' });

    // Served today
    const [servedRow] = await db.query(
      "SELECT COUNT(*) as count FROM service_log WHERE queue_id = ? AND DATE(completed_at) = CURDATE()",
      [queueId]
    );
    const servedToday = servedRow[0].count;

    // Avg wait time (last 10 from service_log)
    const [avgRow] = await db.query(
      "SELECT AVG(duration_seconds) as avg FROM (SELECT duration_seconds FROM service_log WHERE queue_id = ? ORDER BY completed_at DESC LIMIT 10) as sl",
      [queueId]
    );
    const avgWaitSeconds = avgRow[0].avg ? Math.round(avgRow[0].avg) : null;

    // No-shows today (expired tickets)
    const [noShowRow] = await db.query(
      "SELECT COUNT(*) as count FROM tickets WHERE queue_id = ? AND status = 'expired' AND DATE(joined_at) = CURDATE()",
      [queueId]
    );
    const noShowsToday = noShowRow[0].count;

    // Currently waiting
    const [waitingRow] = await db.query(
      "SELECT COUNT(*) as count FROM tickets WHERE queue_id = ? AND status IN ('waiting','next')",
      [queueId]
    );
    const currentlyWaiting = waitingRow[0].count;

    // Avg mood rating today
    const [ratingRow] = await db.query(
      "SELECT ROUND(AVG(mood_rating), 1) as avg FROM tickets WHERE queue_id = ? AND mood_rating IS NOT NULL AND DATE(joined_at) = CURDATE()",
      [queueId]
    );
    const avgMoodRating = ratingRow[0].avg;

    // Peak hour today
    const [peakRow] = await db.query(`
      SELECT HOUR(completed_at) as hr, COUNT(*) as cnt
      FROM service_log
      WHERE queue_id = ? AND DATE(completed_at) = CURDATE()
      GROUP BY HOUR(completed_at)
      ORDER BY cnt DESC
      LIMIT 1
    `, [queueId]);
    let peakHour = null;
    if (peakRow.length > 0) {
      const h = peakRow[0].hr;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      peakHour = `${h12}:00 ${ampm}`;
    }

    // Hourly breakdown today (hours 9–18)
    const [hourlyRows] = await db.query(`
      SELECT HOUR(completed_at) as hr, COUNT(*) as count
      FROM service_log
      WHERE queue_id = ? AND DATE(completed_at) = CURDATE()
      GROUP BY HOUR(completed_at)
    `, [queueId]);

    const hourlyBreakdown = [];
    for (let h = 9; h <= 18; h++) {
      const found = hourlyRows.find(r => r.hr === h);
      const label = h > 12 ? `${h - 12}PM` : (h === 12 ? '12PM' : `${h}AM`);
      hourlyBreakdown.push({ hour: h, label, count: found ? found.count : 0 });
    }

    res.json({
      servedToday,
      avgWaitSeconds,
      peakHour,
      noShowsToday,
      currentlyWaiting,
      avgMoodRating,
      hourlyBreakdown
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Internal helper to build analytics and emit to provider room
const emitAnalyticsUpdate = async (io, queueId, providerId) => {
  try {
    const [servedRow] = await db.query(
      "SELECT COUNT(*) as count FROM service_log WHERE queue_id = ? AND DATE(completed_at) = CURDATE()",
      [queueId]
    );
    const [avgRow] = await db.query(
      "SELECT AVG(duration_seconds) as avg FROM (SELECT duration_seconds FROM service_log WHERE queue_id = ? ORDER BY completed_at DESC LIMIT 10) as sl",
      [queueId]
    );
    const [noShowRow] = await db.query(
      "SELECT COUNT(*) as count FROM tickets WHERE queue_id = ? AND status = 'expired' AND DATE(joined_at) = CURDATE()",
      [queueId]
    );
    const [waitingRow] = await db.query(
      "SELECT COUNT(*) as count FROM tickets WHERE queue_id = ? AND status IN ('waiting','next')",
      [queueId]
    );
    const [ratingRow] = await db.query(
      "SELECT ROUND(AVG(mood_rating), 1) as avg FROM tickets WHERE queue_id = ? AND mood_rating IS NOT NULL AND DATE(joined_at) = CURDATE()",
      [queueId]
    );
    const [peakRow] = await db.query(`
      SELECT HOUR(completed_at) as hr, COUNT(*) as cnt
      FROM service_log WHERE queue_id = ? AND DATE(completed_at) = CURDATE()
      GROUP BY hr ORDER BY cnt DESC LIMIT 1
    `, [queueId]);
    const [hourlyRows] = await db.query(`
      SELECT HOUR(completed_at) as hr, COUNT(*) as count
      FROM service_log WHERE queue_id = ? AND DATE(completed_at) = CURDATE()
      GROUP BY hr
    `, [queueId]);

    let peakHour = null;
    if (peakRow.length > 0) {
      const h = peakRow[0].hr;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      peakHour = `${h12}:00 ${ampm}`;
    }

    const hourlyBreakdown = [];
    for (let h = 9; h <= 18; h++) {
      const found = hourlyRows.find(r => r.hr === h);
      const label = h > 12 ? `${h - 12}PM` : (h === 12 ? '12PM' : `${h}AM`);
      hourlyBreakdown.push({ hour: h, label, count: found ? found.count : 0 });
    }

    io.to(`user:${providerId}`).emit('analytics:updated', {
      queueId,
      servedToday: servedRow[0].count,
      avgWaitSeconds: avgRow[0].avg ? Math.round(avgRow[0].avg) : null,
      peakHour,
      noShowsToday: noShowRow[0].count,
      currentlyWaiting: waitingRow[0].count,
      avgMoodRating: ratingRow[0].avg,
      hourlyBreakdown
    });
  } catch (err) {
    console.error('Error emitting analytics update:', err);
  }
};

// ============================================================
// @desc    Join a queue
// @route   POST /api/queue/:id/join
// @access  Private
// ============================================================
exports.joinQueue = async (req, res) => {
  try {
    const queueId = req.params.id;
    const userId = req.user.id;

    const [queues] = await db.query('SELECT * FROM queues WHERE id = ? AND is_active = 1', [queueId]);
    if (queues.length === 0) return res.status(404).json({ message: 'Queue not found' });

    // Check if paused
    if (queues[0].is_paused) return res.status(400).json({ message: 'Queue is currently paused' });

    // Check capacity
    const [waitingRows] = await db.query(
      "SELECT COUNT(*) as count FROM tickets WHERE queue_id = ? AND status IN ('waiting', 'next')",
      [queueId]
    );
    if (queues[0].max_capacity && waitingRows[0].count >= queues[0].max_capacity) {
      return res.status(400).json({ message: 'Queue is at full capacity' });
    }

    const [existingTicket] = await db.query(
      "SELECT * FROM tickets WHERE queue_id = ? AND user_id = ? AND status IN ('waiting', 'next')",
      [queueId, userId]
    );
    if (existingTicket.length > 0) return res.status(400).json({ message: 'You are already in this queue' });

    const [maxTokenRows] = await db.query('SELECT MAX(token_number) as maxToken FROM tickets WHERE queue_id = ?', [queueId]);
    const nextToken = (maxTokenRows[0].maxToken || 0) + 1;
    const position = parseInt(waitingRows[0].count) + 1;

    const [result] = await db.query(
      'INSERT INTO tickets (queue_id, user_id, token_number, position, status, called_at) VALUES (?, ?, ?, ?, ?, ?)',
      [queueId, userId, nextToken, position, position === 1 ? 'next' : 'waiting', position === 1 ? new Date() : null]
    );

    const [newTicket] = await db.query('SELECT * FROM tickets WHERE id = ?', [result.insertId]);
    req.io.to(`queue_${queueId}`).emit('queue:updated', { queueId });
    res.status(201).json(newTicket[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// @desc    Call next ticket
// @route   POST /api/queue/:id/next
// @access  Private (Provider only)
// ============================================================
exports.callNext = async (req, res) => {
  try {
    const queueId = req.params.id;

    const [queues] = await db.query('SELECT * FROM queues WHERE id = ? AND provider_id = ?', [queueId, req.user.id]);
    if (queues.length === 0) return res.status(403).json({ message: 'Not authorized for this queue' });

    // Log service time for current 'next' ticket
    const [currentNextTickets] = await db.query(
      "SELECT id, called_at FROM tickets WHERE queue_id = ? AND status = 'next'",
      [queueId]
    );
    if (currentNextTickets.length > 0 && currentNextTickets[0].called_at) {
      const ticketId = currentNextTickets[0].id;
      await db.query(`
        INSERT INTO service_log (queue_id, ticket_id, duration_seconds, completed_at)
        SELECT ?, ?, TIMESTAMPDIFF(SECOND, called_at, NOW()), NOW()
        FROM tickets WHERE id = ?
      `, [queueId, ticketId, ticketId]);
    }

    // Mark currently 'next' as 'served'
    await db.query(
      "UPDATE tickets SET status = 'served' WHERE queue_id = ? AND status = 'next'",
      [queueId]
    );

    // Promote next waiting ticket
    const [nextTickets] = await db.query(
      "SELECT * FROM tickets WHERE queue_id = ? AND status = 'waiting' ORDER BY joined_at ASC LIMIT 1",
      [queueId]
    );

    if (nextTickets.length > 0) {
      const nextTicket = nextTickets[0];
      await db.query("UPDATE tickets SET status = 'next', called_at = NOW() WHERE id = ?", [nextTicket.id]);
      await db.query(
        "UPDATE tickets SET position = position - 1 WHERE queue_id = ? AND status IN ('waiting', 'next')",
        [queueId]
      );
      req.io.to(`queue_${queueId}`).emit('ticket:called', { ticketId: nextTicket.id, tokenNumber: nextTicket.token_number });
    }

    const [stats] = await db.query(`
      SELECT AVG(duration_seconds) as avgSecs FROM (SELECT duration_seconds FROM service_log WHERE queue_id = ? ORDER BY completed_at DESC LIMIT 10) as sl
    `, [queueId]);
    const averageServiceSeconds = stats[0].avgSecs ? Math.round(stats[0].avgSecs) : 0;

    // Upcoming hold timers
    const [upcomingTickets] = await db.query(
      "SELECT id, user_id, position FROM tickets WHERE queue_id = ? AND status IN ('waiting', 'next') AND position <= 3",
      [queueId]
    );
    upcomingTickets.forEach(ticket => {
      if (!holdTimers[ticket.id]) {
        req.io.to(`user:${ticket.user_id}`).emit('your_turn_soon', {
          ticketId: ticket.id, position: ticket.position, minutesRemaining: 5
        });
        holdTimers[ticket.id] = setTimeout(async () => {
          try {
            await db.query("UPDATE tickets SET status = 'expired' WHERE id = ?", [ticket.id]);
            await db.query(
              "UPDATE tickets SET position = position - 1 WHERE queue_id = ? AND status IN ('waiting', 'next') AND position > ?",
              [queueId, ticket.position]
            );
            req.io.to(`user:${ticket.user_id}`).emit('spot_released', { ticketId: ticket.id });
            req.io.to(`queue_${queueId}`).emit('queue:updated', { queueId, averageServiceSeconds });
          } catch (err) {
            console.error('Error in hold timer expiration:', err);
          } finally {
            delete holdTimers[ticket.id];
          }
        }, 5 * 60 * 1000);
      }
    });

    req.io.to(`queue_${queueId}`).emit('queue:updated', { queueId, averageServiceSeconds });

    // Emit analytics update to provider's personal room
    await emitAnalyticsUpdate(req.io, queueId, req.user.id);

    res.json({ message: 'Queue advanced' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// @desc    Get all tickets for a queue
// @route   GET /api/queue/:id/tickets
// @access  Public
// ============================================================
exports.getQueueTickets = async (req, res) => {
  try {
    const queueId = req.params.id;
    const ticketId = req.query.ticketId;

    if (isNaN(queueId) && String(queueId).startsWith('q-')) return res.json([]);

    const [tickets] = await db.query(
      "SELECT id, position, status FROM tickets WHERE queue_id = ? ORDER BY position ASC",
      [queueId]
    );
    const mappedTickets = tickets.map(t => ({
      position: t.position,
      status: t.status,
      isCurrentUser: ticketId ? (String(t.id) === String(ticketId)) : false
    }));
    res.json(mappedTickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// @desc    Get queue wait time stats
// @route   GET /api/queue/:id/stats
// @access  Public
// ============================================================
exports.getQueueStats = async (req, res) => {
  try {
    const queueId = req.params.id;

    if (isNaN(queueId) && String(queueId).startsWith('q-')) {
      return res.json({ averageServiceSeconds: 900, totalServedToday: 0, confidence: 'none' });
    }

    const [logs] = await db.query(
      "SELECT duration_seconds FROM service_log WHERE queue_id = ? ORDER BY completed_at DESC LIMIT 10",
      [queueId]
    );
    const [todayCount] = await db.query(
      "SELECT COUNT(*) as total FROM service_log WHERE queue_id = ? AND DATE(completed_at) = CURRENT_DATE()",
      [queueId]
    );
    const totalServedToday = todayCount[0].total;

    let averageServiceSeconds = 0;
    let confidence = 'none';

    if (logs.length > 0) {
      const sum = logs.reduce((acc, log) => acc + log.duration_seconds, 0);
      averageServiceSeconds = Math.round(sum / logs.length);
      confidence = logs.length >= 8 ? 'high' : logs.length >= 3 ? 'low' : 'none';
    } else {
      const [queueData] = await db.query("SELECT average_wait_minutes FROM queues WHERE id = ?", [queueId]);
      if (queueData.length > 0) averageServiceSeconds = queueData[0].average_wait_minutes * 60;
    }

    res.json({ averageServiceSeconds, totalServedToday, confidence });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// @desc    Get available time slots for a queue
// @route   GET /api/queue/:id/slots
// @access  Public
// ============================================================
exports.getSlots = async (req, res) => {
  try {
    const queueId = req.params.id;

    const [slots] = await db.query(`
      SELECT id, slot_time, capacity, booked,
        (capacity - booked) as slotsLeft,
        CASE WHEN (capacity - booked) <= 2 AND booked < capacity THEN 1 ELSE 0 END as almostFull,
        CASE WHEN DATE(slot_time) = CURDATE() THEN 'today' ELSE 'tomorrow' END as day_group
      FROM time_slots
      WHERE queue_id = ?
        AND DATE(slot_time) IN (CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY))
        AND booked < capacity
        AND slot_time > NOW()
      ORDER BY slot_time ASC
    `, [queueId]);

    const grouped = { today: [], tomorrow: [] };
    slots.forEach(s => {
      grouped[s.day_group].push({
        id: s.id,
        slotTime: s.slot_time,
        capacity: s.capacity,
        booked: s.booked,
        slotsLeft: s.slotsLeft,
        almostFull: !!s.almostFull
      });
    });

    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// @desc    Book a time slot
// @route   POST /api/queue/:id/book
// @access  Private
// ============================================================
exports.bookSlot = async (req, res) => {
  try {
    const queueId = req.params.id;
    const userId = req.user.id;
    const { slotId } = req.body;

    if (!slotId) return res.status(400).json({ message: 'slotId is required' });

    // Check slot exists and belongs to this queue
    const [slots] = await db.query(
      'SELECT * FROM time_slots WHERE id = ? AND queue_id = ?',
      [slotId, queueId]
    );
    if (slots.length === 0) return res.status(404).json({ message: 'Slot not found' });

    const slot = slots[0];

    // Check capacity
    if (slot.booked >= slot.capacity) return res.status(400).json({ message: 'This slot is fully booked' });

    // Check user not already booked same slot
    const [existing] = await db.query(
      "SELECT * FROM tickets WHERE queue_id = ? AND user_id = ? AND scheduled_slot_id = ? AND status = 'scheduled'",
      [queueId, userId, slotId]
    );
    if (existing.length > 0) return res.status(409).json({ message: 'You have already booked this slot' });

    // Get next token number
    const [maxTokenRows] = await db.query('SELECT MAX(token_number) as maxToken FROM tickets WHERE queue_id = ?', [queueId]);
    const nextToken = (maxTokenRows[0].maxToken || 0) + 1;

    // Create scheduled ticket
    const [result] = await db.query(
      "INSERT INTO tickets (queue_id, user_id, token_number, position, status, scheduled_slot_id) VALUES (?, ?, ?, 0, 'scheduled', ?)",
      [queueId, userId, nextToken, slotId]
    );

    // Increment booked count
    await db.query('UPDATE time_slots SET booked = booked + 1 WHERE id = ?', [slotId]);

    const [newTicket] = await db.query(`
      SELECT t.*, q.name as queue_name, q.queue_code, ts.slot_time 
      FROM tickets t 
      JOIN queues q ON t.queue_id = q.id
      JOIN time_slots ts ON t.scheduled_slot_id = ts.id
      WHERE t.id = ?
    `, [result.insertId]);

    res.status(201).json(newTicket[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// @desc    Cancel a booking
// @route   DELETE /api/queue/:id/book/:ticketId
// @access  Private
// ============================================================
exports.cancelBooking = async (req, res) => {
  try {
    const { id: queueId, ticketId } = req.params;
    const userId = req.user.id;

    const [tickets] = await db.query(
      "SELECT * FROM tickets WHERE id = ? AND queue_id = ? AND user_id = ? AND status = 'scheduled'",
      [ticketId, queueId, userId]
    );
    if (tickets.length === 0) return res.status(404).json({ message: 'Booking not found or not cancellable' });

    const ticket = tickets[0];

    // Cancel ticket
    await db.query("UPDATE tickets SET status = 'cancelled' WHERE id = ?", [ticketId]);

    // Decrement booked count
    if (ticket.scheduled_slot_id) {
      await db.query('UPDATE time_slots SET booked = GREATEST(booked - 1, 0) WHERE id = ?', [ticket.scheduled_slot_id]);
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// @desc    Get all upcoming bookings for the logged-in user
// @route   GET /api/tickets/my-bookings
// @access  Private
// ============================================================
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const [bookings] = await db.query(`
      SELECT 
        t.id, t.token_number, t.status, t.joined_at,
        q.id as queue_id, q.name as queue_name, q.queue_code, q.address, q.category,
        ts.slot_time, ts.capacity, ts.booked,
        (ts.capacity - ts.booked) as slotsLeft
      FROM tickets t
      JOIN queues q ON t.queue_id = q.id
      LEFT JOIN time_slots ts ON t.scheduled_slot_id = ts.id
      WHERE t.user_id = ? AND t.status = 'scheduled'
      ORDER BY ts.slot_time ASC
    `, [userId]);

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// @desc    Activate a scheduled ticket (convert to waiting)
// @route   PATCH /api/tickets/:id/activate
// @access  Private
// ============================================================
exports.activateTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;

    const [tickets] = await db.query(
      "SELECT * FROM tickets WHERE id = ? AND user_id = ? AND status = 'scheduled'",
      [ticketId, userId]
    );
    if (tickets.length === 0) return res.status(404).json({ message: 'Scheduled ticket not found' });

    const ticket = tickets[0];
    const queueId = ticket.queue_id;

    // Get current position count
    const [waitingRows] = await db.query(
      "SELECT COUNT(*) as count FROM tickets WHERE queue_id = ? AND status IN ('waiting', 'next')",
      [queueId]
    );
    const position = parseInt(waitingRows[0].count) + 1;

    await db.query(
      "UPDATE tickets SET status = ?, position = ?, called_at = NULL WHERE id = ?",
      [position === 1 ? 'next' : 'waiting', position, ticketId]
    );

    if (position === 1) {
      await db.query("UPDATE tickets SET called_at = NOW() WHERE id = ?", [ticketId]);
    }

    req.io.to(`queue_${queueId}`).emit('queue:updated', { queueId });

    const [updated] = await db.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
