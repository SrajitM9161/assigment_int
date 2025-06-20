import { io } from 'socket.io-client';

const socket = io("https://assigment-int-1.onrender.com", {
    transports: ['polling', 'websocket'],
  withCredentials: true,
});

export default socket;