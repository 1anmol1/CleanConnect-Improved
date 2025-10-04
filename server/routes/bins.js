import express from 'express';
const router = express.Router();

// --- Middleware ---
import { protect, authorize } from '../middleware/authMiddleware.js';
import { protectDevice } from '../middleware/deviceAuthMiddleware.js'; // 1. Import device auth

// --- Controller Functions ---
import {
  getAllBins,
  createBin,
  searchBins,
  updateBinFillLevel // 2. Import the new controller function
} from '../controllers/binController.js';

// --- Routes for Frontend Web App (Users) ---

// GET all bins (for maps) & POST a new bin (for officers)
router.route('/')
  .get(protect, getAllBins)
  .post(protect, authorize('Officer'), createBin);

// GET to search for bins (for autocomplete)
router.route('/search').get(protect, searchBins);


// --- Route for IoT Device (ESP32) ---

// 3. THE NEW ROUTE FOR YOUR ESP32
// This handles PUT requests to update a bin's fill level.
// It is protected by the 'protectDevice' middleware, which requires the secret API key.
router.route('/:binId/update').put(protectDevice, updateBinFillLevel);

export default router;