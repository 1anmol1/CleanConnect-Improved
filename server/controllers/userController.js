import User from '../models/User.js';
import Complaint from '../models/Complaint.js';

/**
 * @desc    Add a new worker
 * @route   POST /api/users/workers
 * @access  Protected (Officer)
 */
export const addWorker = async (req, res) => {
  const { name, email, workerId, area } = req.body;
  const city = req.user.city; // Get the city from the logged-in officer's token

  try {
    // Check if a worker with the same email or workerId already exists
    const userExists = await User.findOne({ $or: [{ email }, { workerId }] });
    if (userExists) {
      return res.status(400).json({ error: 'Worker with this email or ID already exists.' });
    }

    // Create the new worker in the database
    // The password is intentionally left blank; it should be set by the worker via a secure link.
    const worker = await User.create({
      name,
      email,
      workerId,
      role: 'Worker',
      city,
      area,
    });

    // TODO: In a real application, implement an email service here to send a password setup link.

    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Get all users with the role 'Worker' in the officer's city
 * @route   GET /api/users/workers
 * @access  Protected (Officer)
 */
export const getWorkers = async (req, res) => {
  try {
    // Find all users who are workers and are in the same city as the officer
    const workers = await User.find({ role: 'Worker', city: req.user.city }).select('name area');
    res.status(200).json({ success: true, data: workers });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

/**
 * @desc    Get stats for the logged-in user's profile page
 * @route   GET /api/users/stats
 * @access  Protected
 */
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const reportsMade = await Complaint.countDocuments({ reportedBy: req.user.id });

    // Simple badge logic based on points
    const badges = [];
    if (user.points > 50) badges.push('Cleanliness Champion');
    if (user.points > 20) badges.push('Active Citizen');


    res.status(200).json({
      success: true,
      data: {
        points: user.points,
        reportsMade,
        badges,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

/**
 * @desc    Get top 5 citizens by points for the leaderboard
 * @route   GET /api/users/leaderboard
 * @access  Protected
 */
export const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find({ role: 'Citizen' })
      .sort({ points: -1 })
      .limit(5)
      .select('name points');
      
    res.status(200).json({ success: true, data: topUsers });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};