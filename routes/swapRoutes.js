
import express from 'express';
import SwapController from '../controllers/swapController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All swap routes require authentication
router.use(authenticate);

router.get('/', SwapController.getAllSwaps);
router.get('/:id', SwapController.getSwapById);
router.post('/', SwapController.createSwap);
router.patch('/:id/status', SwapController.updateSwapStatus);
router.delete('/:id', SwapController.deleteSwap);

export default router;
