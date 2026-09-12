import express from 'express';
import {
  getQuests,
  createQuest,
  updateQuest,
  deleteQuest,
  completeQuest,
  resetRecurringQuests
} from '../controllers/questController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getQuests);
router.post('/', createQuest);
router.put('/:id', updateQuest);
router.delete('/:id', deleteQuest);
router.patch('/:id/complete', completeQuest);
router.post('/reset-recurring', resetRecurringQuests);

export default router;
