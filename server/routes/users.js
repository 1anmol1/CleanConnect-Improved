import express from 'express';
const router = express.Router();
import { protect, authorize } from '../middleware/authMiddleware.js';

// 1. Import all the functions from the controller
import { 
  addWorker, 
  getWorkers, 
  getUserStats, 
  getLeaderboard 
} from '../controllers/userController.js';

// 2. Define the routes and link them to the controller functions
router.route('/workers')
  .get(protect, authorize('Officer'), getWorkers) // GET fetches the list
  .post(protect, authorize('Officer'), addWorker); // POST adds a new worker

router.route('/stats').get(protect, getUserStats);
router.route('/leaderboard').get(protect, getLeaderboard);

export default router;
