import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'; 

const JWT_SECRET = process.env.JWT_SECRET;

export default function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  console.log('Token from cookie:', token);

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    console.error('JWT error:', err.message);
    res.status(403).json({ error: 'Invalid token' });
  }
}
