import asyncHandler from 'express-async-handler';
// Corrected import paths to match your project structure
import Notification from '../models/Notification.js'; 
import Complaint from '../models/Complaint.js'; 
import User from '../models/User.js'; 

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications/my-notifications
// @access  Private (Citizen, Worker)
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: notifications.length, data: notifications });
});

// @desc    Create a general broadcast notification (for Officers)
// @route   POST /api/notifications
// @access  Private (Officer)
export const createNotification = asyncHandler(async (req, res) => {
  const { title, message, targetRole, targetCity } = req.body;

  if (!title || !message || !targetRole || !targetCity) {
    res.status(400); 
    throw new Error('Please provide title, message, targetRole, and targetCity');
  }

  const targetUsers = await User.find({ role: targetRole, city: targetCity });

  if (targetUsers.length === 0) {
    res.status(404); 
    throw new Error('No users found for the specified criteria.');
  }

  const notificationsToCreate = targetUsers.map(user => ({ 
    user: user._id, 
    title, 
    message, 
    type: 'Broadcast' 
  }));
  
  await Notification.insertMany(notificationsToCreate);
  
  res.status(201).json({ 
    success: true, 
    message: `Notification sent to ${targetUsers.length} user(s).` 
  });
});

// @desc    Send a specific notification when a complaint is verified
// @route   POST /api/notifications/resolution
// @access  Private (Officer)
export const sendResolutionNotification = asyncHandler(async (req, res) => {
  const { complaintId } = req.body;

  // 1. Check if a complaintId was provided from the frontend.
  if (!complaintId) {
    res.status(400); // Bad Request
    throw new Error('Complaint ID is required to send a notification.');
  }

  // 2. Find the complaint in the database and populate its 'reportedBy' field
  //    to get the full user document of the citizen who reported it.
  const complaint = await Complaint.findById(complaintId).populate('reportedBy');

  // 3. Add more robust checks to ensure data integrity.
  if (!complaint) {
    res.status(404); // Not Found
    throw new Error(`Complaint not found with ID: ${complaintId}`);
  }
  
  if (!complaint.reportedBy) {
    res.status(404); // Not Found
    throw new Error('This complaint is missing the original reporter and a notification cannot be sent.');
  }

  const citizen = complaint.reportedBy;
  const linkToken = '__LINK_TO_COMPLAINT_HISTORY__'; // Special token for the frontend to find and replace
  
  const message = `Your report for Bin ID ${complaint.binId || 'N/A'} has been marked as 'Verified'. Please check your ${linkToken} to provide feedback. Proof Image: ${complaint.resolutionImageUrl || ''}`;

  // 4. Create the new notification document in the database.
  await Notification.create({ 
    user: citizen._id, 
    title: `Update on Complaint: ${complaint.issueType}`, 
    message, 
    type: 'Resolution' 
  });

  // 5. Update the complaint to mark it as notified. This prevents sending duplicate notifications.
  complaint.notifiedAt = Date.now();
  await complaint.save();
  
  res.status(201).json({ 
    success: true, 
    message: 'Resolution notification sent successfully.' 
  });
});

// @desc    Delete a notification for the logged-in user
// @route   DELETE /api/notifications/:id
// @access  Private (Owner of the notification)
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404); 
    throw new Error('Notification not found');
  }

  // Security Check: Ensure the user deleting the notification is its owner.
  if (notification.user.toString() !== req.user.id) {
    res.status(403); // Forbidden
    throw new Error('User not authorized to delete this notification');
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.status(200).json({ 
    success: true, 
    message: 'Notification deleted successfully.' 
  });
});