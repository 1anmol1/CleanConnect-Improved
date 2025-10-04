import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js'; 
import Complaint from '../models/Complaint.js'; 
import User from '../models/User.js'; 

// Get all notifications for the logged-in user (paginated, fast)
export const getMyNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const skip = (page - 1) * limit;
  // Only fetch the most recent notifications
  const [notifications, total] = await Promise.all([
    Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ user: req.user.id })
  ]);
  res.status(200).json({ success: true, count: notifications.length, total, data: notifications });
});

// Delete a notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) { res.status(404); throw new Error('Notification not found'); }
  if (notification.user.toString() !== req.user.id) { res.status(403); throw new Error('User not authorized'); }
  await Notification.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Notification deleted.' });
});

// Create a general broadcast notification (for Officers)
export const createNotification = asyncHandler(async (req, res) => {
  const { title, message, targetRole, targetCity, targetArea } = req.body;
  if (!title || !message || !targetRole || !targetCity) {
    res.status(400); throw new Error('Missing required fields for notification');
  }

  let userQuery = { city: targetCity };
  if (targetRole === 'All') {
    // All users in city (both roles)
    userQuery.role = { $in: ['Citizen', 'Worker'] };
  } else {
    userQuery.role = targetRole;
  }
  if (targetArea) {
    userQuery.area = targetArea;
  }

  const targetUsers = await User.find(userQuery).select('_id');
  if (targetUsers.length === 0) {
    res.status(404); throw new Error('No target users found.');
  }
  // Batch insert notifications in chunks to avoid event loop blocking
  const notificationsToCreate = targetUsers.map(user => ({ user: user._id, title, message, type: 'Broadcast' }));
  const batchSize = 100;
  for (let i = 0; i < notificationsToCreate.length; i += batchSize) {
    await Notification.insertMany(notificationsToCreate.slice(i, i + batchSize));
  }
  res.status(201).json({ success: true, message: `Notification sent to ${targetUsers.length} user(s).` });
});

// Send a specific notification for a resolved complaint
export const sendResolutionNotification = asyncHandler(async (req, res) => {
  // Accept only complaintId for this route
  const { complaintId } = req.body;
  if (!complaintId) { res.status(400); throw new Error('Complaint ID is required.'); }

  const complaint = await Complaint.findById(complaintId).populate('reportedBy');
  if (!complaint) { res.status(404); throw new Error('Complaint not found.'); }
  if (!complaint.reportedBy) { res.status(404); throw new Error('Complaint is missing a reporter.'); }

  const citizen = complaint.reportedBy;
  const linkToken = '__LINK_TO_COMPLAINT_HISTORY__';
  const message = `Your report for Bin ID ${complaint.binId || 'N/A'} has been 'Verified'. Please check your ${linkToken} to provide feedback. Proof Image: ${complaint.resolutionImageUrl || ''}`;

  await Notification.create({ user: citizen._id, title: `Update on: ${complaint.issueType}`, message, type: 'Resolution' });

  complaint.notifiedAt = Date.now();
  await complaint.save();

  res.status(201).json({ success: true, message: 'Resolution notification sent.' });
});
