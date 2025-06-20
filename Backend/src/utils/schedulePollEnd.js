const prisma = require('../prismaClient');

async function checkAndEndPoll(io, poll) {
  const now = new Date();
  const endAt = new Date(poll.createdAt.getTime() + poll.timeLimit * 1000);

  if (poll.isActive && now > endAt) {
    await prisma.poll.update({
      where: { id: poll.id },
      data: {
        isActive: false,
        endedAt: now,
        status: 'timeout',
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
      endedAt: now,
      results: results.map(r => ({
        optionId: r.optionId,
        count: r._count.optionId,
      })),
    });

    console.log(`✅ Poll ${poll.id} auto-ended`);
  }
}

module.exports = checkAndEndPoll;
