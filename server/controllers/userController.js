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
  const city = req.user.city;

  const userExists = await User.findOne({ $or: [{ email }, { workerId }] });
  if (userExists) {
    res.status(400);
    throw new Error('A user with this email or Worker ID already exists.');
  }

  const defaultPassword = 'password123';

  const worker = await User.create({
    name,
    email,
    workerId,
    password: defaultPassword,
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
 * @desc    Get all workers in the officer's city, including attendance status
 * @route   GET /api/users/workers
 * @access  Private (Officer)
 */
export const getWorkers = asyncHandler(async (req, res) => {
  const workers = await User.find({ role: 'Worker', city: req.user.city })
    .select('name area workerId lastCheckIn');
    
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


// --- THIS IS THE NEW FUNCTION FOR LIVE TRACKING ---
/**
 * @desc    Update the logged-in worker's live location
 * @route   PUT /api/users/live-location
 * @access  Private (Worker)
 */
export const updateWorkerLocation = asyncHandler(async (req, res) => {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
        res.status(400);
        throw new Error('Latitude and Longitude are required.');
    }

    // Find the worker by their ID (from the verified token)
    const worker = await User.findById(req.user._id);

    if (worker) {
        // Update the liveLocation field using the GeoJSON Point format
        worker.liveLocation = {
            type: 'Point',
            coordinates: [lng, lat] // IMPORTANT: GeoJSON is [Longitude, Latitude]
        };
        await worker.save();
        res.status(200).json({ success: true, message: 'Location updated successfully.' });
    } else {
        res.status(404);
        throw new Error('Worker not found.');
    }
});