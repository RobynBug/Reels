import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../middleware/authMiddleware.js';


const router = express.Router();
const prisma = new PrismaClient();

// GET /api/history — fetch user's viewing history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const history = await prisma.viewingHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { watchedAt: 'desc' },
    });
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// POST /api/history — add a new history item
router.post('/', authenticateToken, async (req, res) => {
  const { tmdbId } = req.body;

  if (!tmdbId) {
    return res.status(400).json({ error: 'Missing tmdbId' });
  }

  try {
    const newItem = await prisma.viewingHistory.upsert({
      where: {
        userId_tmdbId: {
          userId: req.user.id,
          tmdbId,
        },
      },
      update: {
        watchedAt: new Date(),
      },
      create: {
        userId: req.user.id,
        tmdbId,
      },
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error saving history item:', err);
    res.status(500).json({ error: 'Failed to save history item' });
  }
});

export default router;
