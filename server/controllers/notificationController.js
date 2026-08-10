import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js'; 
import Complaint from '../models/Complaint.js'; 
import User from '../models/User.js'; 

/**
 * @desc    Get all notifications for the logged-in user, now with complaint details
 * @route   GET /api/notifications/my-notifications
 * @access  Private
 */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    // NEW & CRITICAL: This joins the notification with its related complaint data,
    // including the image URL, description, and voting status needed by the frontend.
    .populate({
        path: 'relatedComplaint',
        select: 'issueType description imageUrl votedBy' 
    });

  res.status(200).json({ success: true, data: notifications });
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) { res.status(404); throw new Error('Notification not found'); }
  if (notification.user.toString() !== req.user.id) { res.status(403); throw new Error('User not authorized'); }
  await Notification.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Notification deleted.' });
});

/**
 * @desc    Create a general broadcast notification (for Officers)
 * @route   POST /api/notifications
 * @access  Private (Officer)
 */
export const createNotification = asyncHandler(async (req, res) => {
  const { title, message, targetRole, targetCity, targetArea } = req.body;
  if (!title || !message || !targetRole || !targetCity) {
    res.status(400); throw new Error('Missing required fields for notification');
  }

  let userQuery = { city: targetCity };
  if (targetRole === 'All') {
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
  const notificationsToCreate = targetUsers.map(user => ({ user: user._id, title, message, type: 'Broadcast' }));
  await Notification.insertMany(notificationsToCreate);
  res.status(201).json({ success: true, message: `Notification sent to ${targetUsers.length} user(s).` });
});

/**
 * @desc    Send a specific notification for a resolved complaint
 * @route   POST /api/notifications/send-resolution
 * @access  Private (Officer)
 */
export const sendResolutionNotification = asyncHandler(async (req, res) => {
  const { complaintId } = req.body;
  if (!complaintId) { res.status(400); throw new Error('Complaint ID is required.'); }

  const complaint = await Complaint.findById(complaintId).populate('reportedBy');
  if (!complaint || !complaint.reportedBy) { res.status(404); throw new Error('Complaint or reporter not found.'); }

  const citizen = complaint.reportedBy;
  const linkToken = '__LINK_TO_COMPLAINT_HISTORY__';
  const message = `Your report for '${complaint.issueType}' has been 'Verified'. Please check your ${linkToken} to provide feedback. Proof Image: ${complaint.resolutionImageUrl || ''}`;

  await Notification.create({ user: citizen._id, title: `Update on: ${complaint.issueType}`, message, type: 'Resolution' });

  complaint.notifiedAt = Date.now();
  await complaint.save();

  res.status(201).json({ success: true, message: 'Resolution notification sent.' });
});