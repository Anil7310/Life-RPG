import express from 'express';
import {
  getShopCatalogue,
  buyReward,
  createCustomReward,
  claimCustomReward,
  deleteCustomReward
} from '../controllers/shopController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getShopCatalogue);
router.post('/buy', buyReward);
router.post('/custom', createCustomReward);
router.post('/custom/:rewardId/claim', claimCustomReward);
router.delete('/custom/:rewardId', deleteCustomReward);

export default router;
