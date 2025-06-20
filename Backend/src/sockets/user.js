const prisma = require('../prismaClient');
const { v4: uuidv4 } = require('uuid');

function userSocketHandler(io) {
  io.on('connection', (socket) => {
    socket.on('student:join', async ({ name }, callback) => {
      try {
        const sessionId = uuidv4();

        const user = await prisma.user.create({
          data: {
            name,
            sessionId,
          },
        });

        socket.data.userId = user.id;
        socket.data.sessionId = sessionId;
        socket.data.name = name;

        console.log(`✅ Student joined: ${name} (${sessionId})`);
        callback({ success: true, sessionId });

        const sockets = [...io.sockets.sockets.values()];
        const participants = sockets
          .filter(s => s.data?.userId && s.data?.sessionId && s.data?.name)
          .map(s => ({
            name: s.data.name,
            sessionId: s.data.sessionId,
          }));

        io.emit('participants:update', participants);
      } catch (error) {
        console.error('❌ Error joining student:', error);
        callback({ success: false, message: 'Error joining' });
      }
    });
  });
}

module.exports = userSocketHandler;
