import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../middleware/authMiddleware.js';
import axios from 'axios';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/watchlist — fetch user's watchlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      orderBy: { addedAt: 'desc' },
      select: {
        tmdbId: true,
        mediaType: true,
        addedAt: true,
      },
    });

    const tmdbResponses = await Promise.all(
      items.map((item) =>
        axios.get(`https://api.themoviedb.org/3/${item.mediaType}/${item.tmdbId}`, {
          params: { api_key: process.env.TMDB_API_KEY },
        })
      )
    );

    const enrichedItems = tmdbResponses.map((response, index) => ({
      ...response.data,
      mediaType: items[index].mediaType,
      addedAt: items[index].addedAt,
    }));

    res.json(enrichedItems);
  } catch (err) {
    console.error('Error fetching watchlist:', err);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// POST /api/watchlist — add item to watchlist
router.post('/', authenticateToken, async (req, res) => {
  const { tmdbId, mediaType } = req.body;

  if (!tmdbId || !mediaType) {
    return res.status(400).json({ error: 'Missing tmdbId or mediaType' });
  }

  try {
    const item = await prisma.watchlist.upsert({
      where: {
        userId_tmdbId: {
          userId: req.user.id,
          tmdbId,
        },
      },
      update: {},
      create: {
        userId: req.user.id,
        tmdbId,
        mediaType,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error('Error adding to watchlist:', err);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// DELETE /api/watchlist/:tmdbId — remove item
router.delete('/:tmdbId', authenticateToken, async (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);

  if (isNaN(tmdbId)) {
    return res.status(400).json({ error: 'Invalid tmdbId' });
  }

  try {
    await prisma.watchlist.delete({
      where: {
        userId_tmdbId: {
          userId: req.user.id,
          tmdbId,
        },
      },
    });
    res.status(204).end();
  } catch (err) {
    console.error('Error removing from watchlist:', err);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

export default router;
