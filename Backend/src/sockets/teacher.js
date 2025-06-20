const prisma = require('../prismaClient');
const { v4: uuid } = require('uuid');

function teacherSocketHandler(io) {
  io.on('connection', (socket) => {
    socket.on('teacher:join', async ({ name }, callback) => {
      try {
        const sessionId = uuid();

        const user = await prisma.user.create({
          data: {
            name,
            sessionId,
          },
        });

        socket.data.userId = user.id;
        socket.data.sessionId = sessionId;
        socket.data.name = name;

        callback({ success: true, sessionId });
        console.log(`👨‍🏫 Teacher joined: ${name} (${sessionId})`);

        const sockets = [...io.sockets.sockets.values()];
        const participants = sockets
          .filter(s => s.data?.userId && s.data?.sessionId && s.data?.name)
          .map(s => ({
            name: s.data.name,
            sessionId: s.data.sessionId,
          }));

        io.emit('participants:update', participants);
      } catch (err) {
        console.error('❌ Teacher join error:', err);
        callback({ success: false, message: 'Error joining' });
      }
    });
  });
}

module.exports = teacherSocketHandler;
