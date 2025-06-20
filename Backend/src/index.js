const express = require("express");
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.use(cors({
  origin: "https://assigment-int.vercel.app",  // ✅ Replace with actual domain
  credentials: true,
}));

const io = socketio(server, {
  cors: {
    origin: "https://assigment-int.vercel.app",  // ✅ Replace with actual domain
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 👇 Log when connected (for debug)
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);
});

// 🔁 your handlers here
require('./sockets/chat')(io);
require('./sockets/pollSocket')(io);
require('./sockets/teacher')(io);
require('./sockets/user')(io);

const pollRoutes = require('./router/poll')(io); // 👈 fix was here
app.use('/poll', pollRoutes); // 👈 mounted correctly

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
