import express from 'express';
import authenticateToken from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;

router.get('/search', authenticateToken, async (req, res) => {
  const query = req.query.q?.toLowerCase();
  const page = req.query.page || 1;

  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Search query too short' });
  }

  try {
    const tmdbRes = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&page=${page}&api_key=${TMDB_API_KEY}`
    );
    const tmdbData = await tmdbRes.json();
    console.log(`TMDB API URL: https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&page=${page}&api_key=${TMDB_API_KEY}`);

    if (!tmdbRes.ok) {
      console.error('TMDB error:', tmdbData);
      return res.status(502).json({ error: 'Failed to fetch from TMDB' });
    }

    let results = tmdbData.results.map(item => ({
      id: item.id,
      title: item.title || item.name,
      imageUrl: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : null,
      mediaType: item.media_type,
    }));

    // Sort results: those WITH imageUrl come first, those without go last
    results.sort((a, b) => {
      if (a.imageUrl && !b.imageUrl) return -1;
      if (!a.imageUrl && b.imageUrl) return 1;
      return 0;
    });

    res.json({
      page: tmdbData.page,
      totalPages: tmdbData.total_pages,
      totalResults: tmdbData.total_results,
      results: results
    });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Server error during search' });
  }
});

export default router;
