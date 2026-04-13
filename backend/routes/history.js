import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../middleware/authMiddleware.js';


const router = express.Router();
const prisma = new PrismaClient();

// GET /api/history — fetch user's viewing history (limit 10)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const history = await prisma.viewingHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { watchedAt: 'desc' },
      take: 10,
    });
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// POST /api/history — add a new history item
router.post('/', authenticateToken, async (req, res) => {
  const { tmdbId, mediaType } = req.body;

  if (!tmdbId) {
    return res.status(400).json({ error: 'Missing tmdbId' });
  }

  try {
    // 1. Add/Update the current item
    const newItem = await prisma.viewingHistory.upsert({
      where: {
        userId_tmdbId: {
          userId: req.user.id,
          tmdbId,
        },
      },
      update: {
        watchedAt: new Date(),
        mediaType: mediaType || null,
      },
      create: {
        userId: req.user.id,
        tmdbId,
        mediaType: mediaType || null,
      },
    });

    // 2. Keep only the 10 most recent items for this user
    const userHistory = await prisma.viewingHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { watchedAt: 'desc' },
      select: { id: true },
    });

    if (userHistory.length > 10) {
      const idsToDelete = userHistory.slice(10).map((h) => h.id);
      await prisma.viewingHistory.deleteMany({
        where: {
          id: { in: idsToDelete },
        },
      });
    }

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error saving history item:', err);
    res.status(500).json({ error: 'Failed to save history item' });
  }
});

export default router;
