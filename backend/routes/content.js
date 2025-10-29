import express from 'express';
import authenticateToken from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;

router.get('/search', authenticateToken, async (req, res) => {
  const query = req.query.q?.toLowerCase();

  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Search query too short' });
  }

  try {
    const tmdbRes = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}`
    );
    const tmdbData = await tmdbRes.json();
    console.log(`TMDB API URL: https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}`);
    console.log('TMDB API Response:', tmdbData.results[2]);


    if (!tmdbRes.ok) {
      console.error('TMDB error:', tmdbData);
      return res.status(502).json({ error: 'Failed to fetch from TMDB' });
    }

    const results = tmdbData.results.map(item => ({
      id: item.id,
      title: item.title || item.name,
      imageUrl: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : null,
      mediaType: item.media_type,
    }));

    res.json(results);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Server error during search' });
  }
});

export default router;
