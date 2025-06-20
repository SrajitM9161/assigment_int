const prisma = require('../prismaClient');

function pollSocketHandler(io) {
  io.on('connection', (socket) => {
    socket.on('create-poll', async (pollData) => {
      console.log('🟢 New poll created via socket:', pollData);

      try {
        const createdPoll = await prisma.poll.create({
          data: {
            question: pollData.question,
            isActive: true,
            timeLimit: pollData.timeLimit || 60,
            options: {
              create: pollData.options.map(opt => ({ text: opt })),
            },
          },
          include: { options: true },
        });

        io.emit('new-poll', {
          ...createdPoll,
          pollId: createdPoll.id,
          timeLimit: createdPoll.timeLimit,
        });
      } catch (err) {
        console.error('❌ Failed to create poll via socket:', err);
      }
    });

    socket.on('submit_answer', async ({ pollId, optionId, sessionId, name }, callback) => {
      try {
        let userId = socket.data.userId;

        if (!userId && sessionId) {
          const user = await prisma.user.findFirst({ where: { sessionId } });
          if (user) {
            userId = user.id;
            socket.data.userId = user.id;
            socket.data.name = user.name;
            socket.data.sessionId = sessionId;
          } else if (name) {
            const newUser = await prisma.user.create({
              data: { sessionId, name },
            });
            userId = newUser.id;
            socket.data.userId = newUser.id;
            socket.data.name = name;
            socket.data.sessionId = sessionId;
          }
        }

        if (!userId || !pollId || !optionId) {
          return callback({ success: false, message: 'Missing data' });
        }

        const poll = await prisma.poll.findUnique({
          where: { id: pollId },
          include: { options: true },
        });

        if (!poll || !poll.isActive) {
          return callback({ success: false, message: 'Poll inactive' });
        }

        const validOption = poll.options.find(opt => opt.id === optionId);
        if (!validOption) {
          return callback({ success: false, message: 'Invalid option' });
        }

        const existing = await prisma.response.findFirst({
          where: { pollId, userId },
        });

        if (existing) {
          return callback({ success: false, message: 'Already answered' });
        }

        await prisma.response.create({
          data: { userId, pollId, optionId },
        });

        callback({ success: true });

        const grouped = await prisma.response.groupBy({
          by: ['optionId'],
          where: { pollId },
          _count: { optionId: true },
        });

        const responses = await prisma.response.findMany({
          where: { pollId },
          select: { userId: true },
          distinct: ['userId'],
        });

        const totalParticipants = await prisma.user.count();

        const results = grouped.map(r => ({
          optionId: r.optionId,
          count: r._count.optionId,
          percent: totalParticipants > 0
            ? Math.round((r._count.optionId / totalParticipants) * 100)
            : 0,
        }));

        io.emit('poll_result_update', {
          pollId,
          results,
          totalParticipants,
        });

        io.emit('student_answered_count_update', {
          pollId,
          answered: responses.length,
          total: totalParticipants,
        });
      } catch (err) {
        console.error('❌ Submit error:', err);
        callback({ success: false });
      }
    });
  });
}

module.exports = pollSocketHandler;
