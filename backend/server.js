const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO for real-time updates
const io = new Server(server, {
  cors: {
    origin: '*', // For dev; restrict in prod
    methods: ['GET', 'POST', 'PUT']
  }
});

app.use(cors());
app.use(express.json());

// Socket middleware / connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinQueueRoom', (queueId) => {
    socket.join(`queue_${queueId}`);
    console.log(`Socket ${socket.id} joined room queue_${queueId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Pass IO instance to request to use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Import Routes
const authRoutes = require('./routes/auth');
const queueRoutes = require('./routes/queue');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/queue', queueRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'QueueLess API is running' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
