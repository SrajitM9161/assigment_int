const prisma = require('../prismaClient');

function schedulePollEnd(io, poll) {
  const timeout = poll.timeLimit * 1000;

  setTimeout(async () => {
    const existing = await prisma.poll.findUnique({
      where: { id: poll.id },
    });

    if (!existing || !existing.isActive) return;

    const endedAt = new Date();

    const updated = await prisma.poll.update({
      where: { id: poll.id },
      data: {
        isActive: false,
        endedAt,
        status: 'timeout',
      },
    });

    const results = await prisma.response.groupBy({
      by: ['optionId'],
      where: { pollId: poll.id },
      _count: { optionId: true },
    });

    io.emit('poll_ended', {
      pollId: updated.id,
      question: updated.question,
      endedAt,
      timeLimit: updated.timeLimit,
      results: results.map(r => ({
        optionId: r.optionId,
        count: r._count.optionId,
      })),
    });

    console.log(`✅ Poll ${poll.id} auto-ended after ${poll.timeLimit}s`);
  }, timeout);
}

module.exports = schedulePollEnd;
