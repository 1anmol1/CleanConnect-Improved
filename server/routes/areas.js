import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';

// Import the controller functions
import { 
    getAllCities, 
    searchAreas, 
    getAreasByCity // 1. Import the new function
} from '../controllers/areaController.js';

// Existing route to get a list of all unique cities
router.route('/cities').get(getAllCities);

// Existing route for location autocomplete search
router.route('/search').get(searchAreas);

// 2. THE NEW ROUTE
// This creates a dynamic route. When the frontend requests '/api/areas/Pune',
// this route will run the 'getAreasByCity' controller.
router.route('/:city').get(protect, getAreasByCity);

export default router;