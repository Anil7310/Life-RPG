import jwt from 'jsonwebtoken';
import { dbService } from '../services/dbService.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'life-rpg-ultra-secure-jwt-secret-key-2026';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await dbService.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired user session.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token: ' + err.message });
  }
};
