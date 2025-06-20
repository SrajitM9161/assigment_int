const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const schedulePollEnd = require('../utils/schedulePollEnd');
const checkAndEndPoll = require('../utils/checkAndEndPoll');

module.exports = (io) => {
  // ✅ Create a new poll via REST
  router.post('/', async (req, res) => {
    try {
      const { question, options, timeLimit } = req.body;

      if (!question || !options || options.length < 2) {
        return res.status(400).json({ message: 'Invalid poll data' });
      }

      // End previous polls
      await prisma.poll.updateMany({
        where: { isActive: true },
        data: { isActive: false, endedAt: new Date(), status: 'manual_end' },
      });

      const poll = await prisma.poll.create({
        data: {
          question,
          timeLimit: timeLimit || 60,
          isActive: true,
          status: 'active',
          options: {
            create: options.map((opt) =>
              typeof opt === 'string'
                ? { text: opt, isCorrect: false }
                : {
                    text: opt?.text || '',
                    isCorrect: opt?.isCorrect || false,
                  }
            ),
          },
        },
        include: { options: true },
      });

      // ✅ Emit poll with consistent event name
      io.emit('new-poll', {
        pollId: poll.id,
        question: poll.question,
        options: poll.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
        timeLimit: poll.timeLimit,
      });

      schedulePollEnd(io, poll);
      res.status(201).json({ success: true, poll });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ✅ Poll history
  router.get('/history', async (req, res) => {
    try {
      const polls = await prisma.poll.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          options: true,
          responses: true,
        },
      });

      const result = polls.map(poll => ({
        id: poll.id,
        question: poll.question,
        isActive: poll.isActive,
        createdAt: poll.createdAt,
        endedAt: poll.endedAt,
        options: poll.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
        totalResponses: poll.responses.length,
      }));

      res.json(result);
    } catch (err) {
      console.error('Failed to fetch poll history:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // ✅ Active poll fallback
  router.get('/active', async (req, res) => {
    try {
      const poll = await prisma.poll.findFirst({
        where: { isActive: true },
        include: { options: true },
      });

      if (poll) {
        await checkAndEndPoll(io, poll);
      }

      res.json(poll || null);
    } catch (err) {
      console.error('Failed to fetch active poll:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  return router;
};
