import { io } from 'socket.io-client';

const socket = io("https://dependable-caring-production.up.railway.app/", {
    transports: ['polling', 'websocket'],
  withCredentials: true,
});

export default socket;