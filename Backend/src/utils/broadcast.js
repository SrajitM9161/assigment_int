// --- src/utils/broadcast.js ---
const prisma = require('../prismaClient');

async function broadcastParticipants(io) {
  const sockets = [...io.sockets.sockets.values()];
  const sessionIds = sockets.map(s => s.data.sessionId).filter(Boolean);

  const users = await prisma.user.findMany({
    where: {
      sessionId: { in: sessionIds },
    },
    select: { name: true, sessionId: true },
  });

  io.emit('participants:update', users);
}

module.exports = broadcastParticipants;
