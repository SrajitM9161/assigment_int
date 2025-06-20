import { io } from 'socket.io-client';

const socket = io("https://dependable-caring-production.up.railway.app", {
  transports: ["websocket"],       // ✅ Force WebSocket only
  withCredentials: true,           // ✅ Allow cookies if needed
});

export default socket;
