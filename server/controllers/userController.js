import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';

/**
 * @desc    Add a new worker (by an Officer)
 * @route   POST /api/users/workers
 * @access  Private (Officer)
 */
export const addWorker = asyncHandler(async (req, res) => {
  const { name, email, workerId, area } = req.body;
  const city = req.user.city; // Get city from the logged-in officer's token

  const userExists = await User.findOne({ $or: [{ email }, { workerId }] });
  if (userExists) {
    res.status(400);
    throw new Error('A user with this email or Worker ID already exists.');
  }

  // Create the worker with a default password.
  // In a real app, you would send them an email to set their own password.
  const defaultPassword = 'password123';

  const worker = await User.create({
    name,
    email,
    workerId,
    password: defaultPassword, // The userModel will automatically hash this
    role: 'Worker',
    city,
    area,
  });

  if (worker) {
    res.status(201).json({ success: true, message: 'Worker added successfully!' });
  } else {
    res.status(400);
    throw new Error('Invalid worker data provided.');
  }
});


/**
 * @desc    Get all workers in the officer's city
 * @route   GET /api/users/workers
 * @access  Private (Officer)
 */
export const getWorkers = asyncHandler(async (req, res) => {
  const workers = await User.find({ role: 'Worker', city: req.user.city }).select('-password');
  res.status(200).json({ success: true, data: workers });
});


/**
 * @desc    Get stats for any logged-in user's profile
 * @route   GET /api/users/stats
 * @access  Private
 */
export const getUserStats = asyncHandler(async (req, res) => {
  let stats = {};
  const userId = req.user._id;

  if (req.user.role === 'Citizen') {
    const reportsMade = await Complaint.countDocuments({ reportedBy: userId });
    const badges = reportsMade > 5 ? ['Active Reporter'] : []; 
    stats = { points: req.user.cleanCoins || 0, reportsMade, badges };
  } else if (req.user.role === 'Worker') {
    const resolvedTasks = await Complaint.countDocuments({ assignedTo: userId, status: 'Resolved' });
    const assignedTasks = await Complaint.countDocuments({ assignedTo: userId });
    const efficiency = assignedTasks > 0 ? `${Math.round((resolvedTasks / assignedTasks) * 100)}%` : '0%';
    stats = { resolvedTasks, assignedTasks, efficiency };
  } else if (req.user.role === 'Officer') {
    const workersManaged = await User.countDocuments({ role: 'Worker', city: req.user.city });
    const complaintsVerified = await Complaint.countDocuments({ verifiedBy: userId });
    const pendingComplaints = await Complaint.countDocuments({ city: req.user.city, status: 'Resolved' });
    stats = { workersManaged, complaintsVerified, pendingComplaints };
  }
  
  res.json({ success: true, data: stats });
});


/**
 * @desc    Get the leaderboard for the user's city
 * @route   GET /api/users/leaderboard
 * @access  Private
 */
export const getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await User.find({ role: 'Citizen', city: req.user.city })
    .sort({ cleanCoins: -1 })
    .limit(10)
    .select('name cleanCoins');
  res.json({ success: true, data: leaderboard });
});
