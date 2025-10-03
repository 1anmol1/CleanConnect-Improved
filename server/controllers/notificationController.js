import asyncHandler from 'express-async-handler';
// --- THE FIX: Corrected all filenames to match your folder ---
import Notification from '../models/Notification.js'; 
import Complaint from '../models/Complaint.js'; 
import User from '../models/User.js'; 

// Controller to get a user's notifications
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: notifications.length, data: notifications });
});

// Controller for officers to create a notification
export const createNotification = asyncHandler(async (req, res) => {
  const { title, message, targetRole, targetCity } = req.body;
  if (!title || !message || !targetRole || !targetCity) {
    res.status(400); throw new Error('Please provide all required fields');
  }
  const targetUsers = await User.find({ role: targetRole, city: targetCity });
  if (targetUsers.length === 0) {
    res.status(404); throw new Error('No users found for the specified criteria.');
  }
  const notificationsToCreate = targetUsers.map(user => ({ user: user._id, title, message, type: 'Broadcast' }));
  await Notification.insertMany(notificationsToCreate);
  res.status(201).json({ success: true, message: `Notification sent to ${targetUsers.length} user(s).` });
});

// Controller to send a notification about a resolved complaint
export const sendResolutionNotification = asyncHandler(async (req, res) => {
  const { complaintId } = req.body;
  const complaint = await Complaint.findById(complaintId).populate('reportedBy');
  if (!complaint || !complaint.reportedBy) {
    res.status(404); throw new Error('Complaint or reporting user not found.');
  }
  const citizen = complaint.reportedBy;
  const linkToken = '__LINK_TO_COMPLAINT_HISTORY__';
  const message = `Your report for Bin ID ${complaint.binId || 'N/A'} has been marked as 'Verified'. Please check your ${linkToken} to provide feedback. Proof Image: ${complaint.resolutionImageUrl || ''}`;
  await Notification.create({ user: citizen._id, title: `Update on Complaint: ${complaint.issueType}`, message, type: 'Resolution' });
  complaint.notifiedAt = Date.now();
  await complaint.save();
  res.status(201).json({ success: true, message: 'Resolution notification sent.' });
});

// Controller to delete a notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404); throw new Error('Notification not found');
  }
  if (notification.user.toString() !== req.user.id) {
    res.status(403); throw new Error('User not authorized to delete this notification');
  }
  await Notification.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Notification deleted.' });
});