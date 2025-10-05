import express from 'express';
const router = express.Router();

// --- Middleware ---
import { protect, authorize } from '../middleware/authMiddleware.js';
import { protectDevice } from '../middleware/deviceAuthMiddleware.js';

// --- Controller Functions ---
import {
  getAllBins,
  createBin,
  searchBins,
  updateBinFillLevel,
  getBinById, // 1. Import new functions
  getChildBins,
  updateManualStatus,
  findNearestEmptyBin
} from '../controllers/binController.js';

// --- Routes for Frontend Web App (Users) ---
router.route('/')
  .get(protect, getAllBins)
  .post(protect, authorize('Officer'), createBin);

router.route('/search').get(protect, searchBins);

// 2. NEW ROUTES
// Route for the QR code feature to get a single bin's live data
router.route('/by-id/:binId').get(protect, getBinById);

// Route to get all child bins for a specific parent (smart) bin
router.route('/:id/children').get(protect, getChildBins);

// Route for authorized volunteers to manually update a child bin's status
router.route('/:id/manual-update').put(protect, authorize('Volunteer', 'Officer'), updateManualStatus);


// --- Route for IoT Device (ESP32) ---
router.route('/:binId/update').put(protectDevice, updateBinFillLevel);

// NEW ROUTE for finding the nearest empty bin
router.route('/nearest-empty').get(protect, findNearestEmptyBin);

export default router;
