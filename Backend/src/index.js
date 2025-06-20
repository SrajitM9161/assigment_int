const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const broadcastParticipants = require('./utils/broadcast');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // In production, replace with your frontend domain
    methods: ['GET', 'POST'],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// Socket Handlers
const userSocketHandler = require('./sockets/user');
const pollSocketHandler = require('./sockets/pollSocket');
const adminSocketHandler = require('./sockets/admin');
const chatSocketHandler = require('./sockets/chat');
const teacherSocketHandler = require('./sockets/teacher');

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  userSocketHandler(io, socket, broadcastParticipants);
  teacherSocketHandler(io, socket, broadcastParticipants);
  pollSocketHandler(io, socket);
  adminSocketHandler(io, socket);
  chatSocketHandler(io, socket);

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    broadcastParticipants(io);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
