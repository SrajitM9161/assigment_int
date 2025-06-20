import { io } from 'socket.io-client';

const socket = io('https://assigment-int-1.onrender.com', {
  transports: ['websocket'],
  autoConnect: true,
});

export default socket;
