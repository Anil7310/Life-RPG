import express from 'express';
import {
  register,
  login,
  demoGuestLogin,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/guest', demoGuestLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getMe);
router.patch('/profile', authMiddleware, updateProfile);

export default router;

