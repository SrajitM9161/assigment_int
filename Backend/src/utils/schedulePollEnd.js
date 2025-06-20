const prisma = require('../prismaClient');

function schedulePollEnd(io, poll) {
  setTimeout(async () => {
    try {
      const checkPoll = await prisma.poll.findUnique({ where: { id: poll.id } });
      if (!checkPoll || !checkPoll.isActive) return;

      await prisma.poll.update({
        where: { id: poll.id },
        data: {
          isActive: false,
          status: 'timeout',
          endedAt: new Date(),
        },
      });

      const results = await prisma.response.groupBy({
        by: ['optionId'],
        where: { pollId: poll.id },
        _count: { optionId: true },
      });

      io.emit('poll_ended', {
        pollId: poll.id,
        question: poll.question,
        timeLimit: poll.timeLimit,
        endedAt: new Date(),
        results: results.map(r => ({
          optionId: r.optionId,
          count: r._count.optionId,
        })),
      });

      console.log(`✅ Poll ${poll.id} auto-ended.`);
    } catch (err) {
      console.error('❌ Error auto-ending poll:', err);
    }
  }, poll.timeLimit * 1000);
}

module.exports = schedulePollEnd;