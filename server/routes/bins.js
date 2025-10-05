import express from 'express';
const router = express.Router();
import { protect, authorize } from '../middleware/authMiddleware.js';
import { protectDevice } from '../middleware/deviceAuthMiddleware.js';

// Import all the controller functions
import {
  getAllBins,
  createBin,
  searchBins,
  updateBinFillLevel,
  getBinById,
  getChildBins,
  updateManualStatus,
  findNearestEmptyBin
} from '../controllers/binController.js';

// --- Routes for Frontend Web App (Users) ---
router.route('/')
  .get(protect, getAllBins)
  .post(protect, authorize('Officer'), createBin);

router.route('/search').get(protect, searchBins);
router.route('/by-id/:binId').get(protect, getBinById);
router.route('/nearest-empty').get(protect, findNearestEmptyBin);

// This is the route that your InfoWindow calls to get the child bin data
router.route('/:id/children').get(protect, getChildBins);

router.route('/:id/manual-update').put(protect, authorize('Volunteer', 'Officer'), updateManualStatus);

// --- Route for IoT Device (ESP32) ---
router.route('/:binId/update').put(protectDevice, updateBinFillLevel);

export default router;

