const express = require("express");
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: "https://your-vercel-app.vercel.app",  // ✅ Replace with actual domain
  credentials: true,
}));

const io = socketio(server, {
  cors: {
    origin: "https://your-vercel-app.vercel.app",  // ✅ Replace with actual domain
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 👇 Log when connected (for debug)
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);
});

// 🔁 your handlers here
require('./sockets/chatSocketHandler')(io);
require('./sockets/pollSocketHandler')(io);
require('./sockets/teacherSocketHandler')(io);
require('./sockets/userSocketHandler')(io);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
