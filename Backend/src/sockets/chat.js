// --- src/sockets/chatSocketHandler.js ---
const prisma = require('../prismaClient');

function chatSocketHandler(io, socket) {
  socket.on('chat:message', async ({ message }) => {
    const trimmed = message?.trim();
    if (!trimmed) return;

    const userId = socket.data.userId;
    const senderName = socket.data.name || 'Unknown';

    // Save in DB if user exists
    if (userId) {
      try {
        await prisma.message.create({
          data: {
            senderId: userId,
            content: trimmed,
          },
        });
      } catch (err) {
        console.error('❌ Failed to save message:', err);
      }
    }

    // Broadcast message to all clients
    const payload = {
      sender: senderName,
      message: trimmed,
      time: new Date().toISOString(),
    };

    io.emit('chat:receive', payload);
    console.log(`💬 [${senderName}]: ${trimmed}`);
  });

  socket.on('participants:get', () => {
    const sockets = [...io.sockets.sockets.values()];
    const participants = sockets
      .filter(s => s.data?.name && s.data?.sessionId)
      .map(s => ({
        name: s.data.name,
        sessionId: s.data.sessionId,
      }));

    socket.emit('participants:update', participants);
  });

  socket.on('kick_student', ({ sessionId }, callback) => {
    const sockets = [...io.sockets.sockets.values()];
    const target = sockets.find(s => s.data?.sessionId === sessionId);

    if (target) {
      target.emit('kicked', { reason: 'You have been removed from the poll system.' });
      target.disconnect();
      callback({ success: true });
    } else {
      callback({ success: false, message: 'Student not found' });
    }
  });
}

module.exports = chatSocketHandler;
