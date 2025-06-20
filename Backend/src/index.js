const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const broadcastParticipants = require('./utils/broadcast');

const app = express();
const server = http.createServer(app);

// ✅ Correct CORS: allow frontend domain
const io = new Server(server, {
  cors: {
    origin: 'https://assigment-int.vercel.app', // ✅ Allow frontend
    methods: ['GET', 'POST'],
    credentials: true, // Optional, if needed for cookies or auth
  },
});

// Middlewares
app.use(cors({
  origin: 'https://assigment-int.vercel.app', // ✅ Same as above
  credentials: true,
}));
app.use(express.json());

// Socket Handlers
const userSocketHandler = require('./sockets/user');
const pollSocketHandler = require('./sockets/pollSocket');
const adminSocketHandler = require('./sockets/admin');
const chatSocketHandler = require('./sockets/chat');
const teacherSocketHandler = require('./sockets/teacher');

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Handle all sockets
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
