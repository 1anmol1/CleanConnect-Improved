import express from 'express';
const router = express.Router();
import asyncHandler from 'express-async-handler';

// --- Middleware and Models ---
// Corrected the filenames to match your project structure (e.g., User.js)
import { protect, authorize } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';

// =================================================================
// GET /api/users/debug-all (TEMPORARY DEBUG ROUTE)
// This route is for development only. It allows you to see all users
// in your database to verify that your seeder script is working correctly.
// You can remove this route in production for security.
// =================================================================
router.get(
  '/debug-all',
  asyncHandler(async (req, res) => {
    // Using .select('+password') to force Mongoose to show the hashed password
    // for debugging purposes.
    const allUsers = await User.find({}).select('+password');
    res.json(allUsers);
  })
);

// =================================================================
// GET /api/users/workers
// Fetches a list of all users with the 'Worker' role for an Officer.
// Access: Private (Only for 'Officer')
// =================================================================
router.get(
  '/workers',
  protect,
  authorize('Officer'),
  asyncHandler(async (req, res) => {
    // Officers should only see workers in their own city.
    const workers = await User.find({ role: 'Worker', city: req.user.city }).select(
      '-password' // Exclude the sensitive password field from the result
    );
    res.json({ success: true, data: workers });
  })
);

// =================================================================
// GET /api/users/stats
// Fetches key statistics for the logged-in user's profile/dashboard.
// Access: Private (Returns different data based on the user's role)
// =================================================================
router.get(
  '/stats',
  protect,
  asyncHandler(async (req, res) => {
    let stats = {};
    const userId = req.user._id;

    if (req.user.role === 'Citizen') {
      const reportsMade = await Complaint.countDocuments({ reportedBy: userId });
      // Example logic for badges
      const badges = reportsMade > 5 ? ['Active Reporter'] : []; 
      stats = {
        points: req.user.cleanCoins || 0,
        reportsMade,
        badges,
      };
    } else if (req.user.role === 'Worker') {
      const resolvedTasks = await Complaint.countDocuments({ assignedTo: userId, status: 'Resolved' });
      const assignedTasks = await Complaint.countDocuments({ assignedTo: userId });
      const efficiency = assignedTasks > 0 ? `${Math.round((resolvedTasks / assignedTasks) * 100)}%` : '0%';
      stats = {
        resolvedTasks,
        assignedTasks,
        efficiency,
      };
    } else if (req.user.role === 'Officer') {
      const workersManaged = await User.countDocuments({ role: 'Worker', city: req.user.city });
      const complaintsVerified = await Complaint.countDocuments({ verifiedBy: userId });
      const pendingComplaints = await Complaint.countDocuments({ city: req.user.city, status: 'Resolved' }); // 'Resolved' are pending verification
      stats = {
        workersManaged,
        complaintsVerified,
        pendingComplaints,
      };
    } else {
      res.status(400);
      throw new Error('Invalid user role for stats');
    }

    res.json({ success: true, data: stats });
  })
);

// =================================================================
// GET /api/users/leaderboard
// Fetches the top citizens in a city based on 'cleanCoins'.
// Access: Private (All roles can view the leaderboard for their city)
// =================================================================
router.get(
  '/leaderboard',
  protect,
  asyncHandler(async (req, res) => {
    const leaderboard = await User.find({ role: 'Citizen', city: req.user.city })
      .sort({ cleanCoins: -1 }) // Sort by points in descending order
      .limit(10) // Get the top 10 users
      .select('name cleanCoins'); // Only select the fields needed for the display

    res.json({ success: true, data: leaderboard });
  })
);

export default router;