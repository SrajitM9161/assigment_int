import { io } from 'socket.io-client';

const socket = io("https://assigment-int-1.onrender.com", {
  transports: ['websocket'],
  withCredentials: true,
});

export default socket;