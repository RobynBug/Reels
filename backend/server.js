import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from './routes/auth.js';
import watchlistRouter from './routes/watchlist.js';
import historyRouter from './routes/history.js';
import contentRouter from './routes/content.js';
import authenticateToken from './middleware/authMiddleware.js';

import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/api/ping', (req, res) => res.send('pong'));

app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/watchlist', authenticateToken, watchlistRouter);
app.use('/api/history', authenticateToken, historyRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
