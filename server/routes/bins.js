import express from 'express';
import { getAllBins, createBin, searchBins } from '../controllers/binController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllBins)
  .post(protect, authorize('Officer'), createBin);

router.route('/search').get(protect, searchBins);

export default router;