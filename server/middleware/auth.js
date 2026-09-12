import jwt from 'jsonwebtoken';
import { dbService } from '../services/dbService.js';

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production.');
}

export const JWT_SECRET =
  process.env.JWT_SECRET ||
  'dev-only-life-rpg-secret-change-in-production';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await dbService.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired user session.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err.message);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};