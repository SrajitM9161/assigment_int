const prisma = require('../prismaClient');
const schedulePollEnd = require('../utils/schedulePollEnd');

function pollSocketHandler(io, socket) {
  socket.on('teacher:create_poll', async ({ question, options, timeLimit }) => {
    try {
      if (!question || !options || options.length < 2) {
        return socket.emit('error', { message: 'Invalid poll data' });
      }

      await prisma.poll.updateMany({
        where: { isActive: true },
        data: { isActive: false, endedAt: new Date(), status: 'manual_end' },
      });

      const poll = await prisma.poll.create({
        data: {
          question,
          timeLimit,
          isActive: true,
          status: 'active',
          options: {
            create: options.map(opt => ({
              text: opt.text,
              isCorrect: opt.isCorrect || false,
            })),
          },
        },
        include: { options: true },
      });

      io.emit('new_poll', {
        pollId: poll.id,
        question: poll.question,
        options: poll.options.map(o => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect,
        })),
        timeLimit: poll.timeLimit,
      });

      schedulePollEnd(io, poll);
    } catch (err) {
      console.error('Poll creation error:', err);
    }
  });

  socket.on('student:join', async ({ name, sessionId }, callback) => {
    try {
      let user = await prisma.user.findFirst({ where: { sessionId } });
      if (!user) {
        user = await prisma.user.create({
          data: { name, sessionId },
        });
      }

      socket.data.userId = user.id;
      socket.data.sessionId = sessionId;
      socket.data.name = name;

      if (callback) callback({ success: true });
    } catch (error) {
      console.error('student:join error:', error);
      if (callback) callback({ success: false });
    }
  });

  socket.on('submit_answer', async ({ pollId, optionId }, callback) => {
    try {
      const userId = socket.data?.userId;
      const name = socket.data?.name;
      const sessionId = socket.data?.sessionId;

      if (!userId || !pollId || !optionId) {
        console.log('❌ Missing data:', { userId, pollId, optionId, name, sessionId });
        return callback?.({ success: false, message: 'Missing data' });
      }

      const poll = await prisma.poll.findUnique({
        where: { id: pollId },
        include: { options: true },
      });

      if (!poll || !poll.isActive) {
        return callback?.({ success: false, message: 'Poll inactive' });
      }

      const validOption = poll.options.find(opt => opt.id === optionId);
      if (!validOption) {
        return callback?.({ success: false, message: 'Invalid option' });
      }

      const alreadyAnswered = await prisma.response.findFirst({
        where: { pollId, userId },
      });

      if (alreadyAnswered) {
        return callback?.({ success: false, message: 'Already answered' });
      }

      await prisma.response.create({
        data: { userId, pollId, optionId },
      });

      callback?.({ success: true });

      const connectedStudentSessions = [...io.sockets.sockets.values()]
        .filter(s => s.data?.userId && !s.data?.isTeacher)
        .map(s => s.data.sessionId);

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

      const totalParticipants = connectedStudentSessions.length;

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
      callback?.({ success: false });
    }
  });
}

module.exports = pollSocketHandler;