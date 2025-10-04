import asyncHandler from 'express-async-handler';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * @desc    Get all complaints for an officer's city
 * @route   GET /api/complaints
 * @access  Private (Officer)
 */
export const getComplaints = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.city) {
    res.status(400);
    throw new Error('User city not found. Cannot fetch complaints.');
  }

  const complaints = await Complaint.find({ city: req.user.city })
    .populate('assignedTo', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: complaints });
});

/**
 * @desc    Create a new complaint (by a Citizen)
 * @route   POST /api/complaints
 * @access  Private (Citizen)
 */
export const createComplaint = asyncHandler(async (req, res) => {
  const { issueType, binId, description } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error('An image of the issue is required.');
  }

  const complaint = await Complaint.create({
    issueType,
    binId,
    description,
    reportedBy: req.user._id,
    city: req.user.city,
    area: req.user.area,
    imageUrl: `/uploads/${req.file.filename}`, // Save the path to the image
  });

  res.status(201).json({ 
    success: true, 
    message: 'Report submitted successfully!',
    data: complaint 
  });
});

/**
 * @desc    Assign a complaint to a worker (by an Officer)
 * @route   PUT /api/complaints/:id/assign
 * @access  Private (Officer)
 */
export const assignComplaint = asyncHandler(async (req, res) => {
  const { workerId } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) { res.status(404); throw new Error('Complaint not found'); }

  complaint.assignedTo = workerId;
  complaint.status = 'Assigned';
  await complaint.save();
  res.json({ success: true, message: 'Complaint assigned successfully.' });
});

/**
 * @desc    Mark a complaint as resolved (by a Worker)
 * @route   PUT /api/complaints/:id/resolve
 * @access  Private (Worker)
 */
export const resolveComplaint = asyncHandler(async (req, res) => {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) { res.status(404); throw new Error('Complaint not found'); }
    if (complaint.assignedTo.toString() !== req.user.id) {
        res.status(403); throw new Error('Not authorized to resolve this complaint');
    }
    complaint.status = 'Resolved';
    complaint.resolvedAt = Date.now();
    complaint.resolutionImageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    await complaint.save();
    res.json({ success: true, message: 'Complaint marked as resolved.' });
});

/**
 * @desc    Verify a resolution and notify the citizen (by an Officer)
 * @route   PUT /api/complaints/:id/verify
 * @access  Private (Officer)
 */
export const verifyAndNotifyComplaint = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const complaint = await Complaint.findById(req.params.id).populate('reportedBy');
  if (!complaint) { res.status(404); throw new Error('Complaint not found'); }

  if (status === 'Rejected') {
    complaint.status = 'Reopened';
    await complaint.save();
    return res.json({ success: true, message: 'Resolution rejected and complaint reopened.' });
  }

  if (status === 'Approved') {
    complaint.status = 'Verified';
    complaint.verifiedBy = req.user._id;

    if (complaint.reportedBy) {
      const citizen = complaint.reportedBy;
      const linkToken = '__LINK_TO_COMPLAINT_HISTORY__';
      const message = `Your report for Bin ID ${complaint.binId || 'N/A'} has been 'Verified'. Please check your ${linkToken} to provide feedback. Proof Image: ${complaint.resolutionImageUrl || ''}`;
      
      await Notification.create({
        user: citizen._id,
        title: `Update on: ${complaint.issueType}`,
        message,
        type: 'Resolution',
      });
      
      complaint.notifiedAt = Date.now();
    }

    await complaint.save();
    res.json({ success: true, message: 'Resolution approved and citizen has been notified.' });
  } else {
    res.status(400); throw new Error('Invalid status provided.');
  }
});

/**
 * @desc    Close a complaint after feedback (by an Officer)
 * @route   PUT /api/complaints/:id/close
 * @access  Private (Officer)
 */
export const closeComplaint = asyncHandler(async (req, res) => {
    const complaint = await Complaint.findById(req.params.id).populate('reportedBy');
    if (!complaint) { res.status(404); throw new Error('Complaint not found'); }
    
    if(complaint.reportedBy) {
        await User.findByIdAndUpdate(complaint.reportedBy._id, { $inc: { cleanCoins: 10 } });
    }

    complaint.status = 'Closed';
    await complaint.save();
    res.json({ success: true, message: 'Complaint closed and rewards issued.' });
});

/**
 * @desc    Get a citizen's own complaint history
 * @route   GET /api/complaints/my-history
 * @access  Private (Citizen)
 */
export const getMyComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
});

/**
 * @desc    Bulk delete complaints (by an Officer)
 * @route   POST /api/complaints/bulk-delete
 * @access  Private (Officer)
 */
export const bulkDeleteComplaints = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
        res.status(400); throw new Error('No complaint IDs provided');
    }
    await Complaint.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: 'Complaints deleted successfully.' });
});

/**
 * @desc    Get all complaints assigned to the logged-in worker
 * @route   GET /api/complaints/my-resolutions
 * @access  Private (Worker)
 */
export const getWorkerResolutions = asyncHandler(async (req, res) => {
  const assignedTasks = await Complaint.find({
    assignedTo: req.user._id,
    status: { $in: ['Assigned', 'Reopened', 'Resolved'] }
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: assignedTasks });
});

/**
 * @desc    Add feedback to a complaint (by a Citizen)
 * @route   PUT /api/complaints/:id/feedback
 * @access  Private (Citizen)
 */
export const addFeedbackToComplaint = asyncHandler(async (req, res) => {
  const { satisfaction, comment } = req.body;
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  // Security Check: Only the original reporter can add feedback.
  if (complaint.reportedBy.toString() !== req.user.id) {
    res.status(403);
    throw new Error('You are not authorized to provide feedback for this complaint.');
  }

  // Add the new feedback to the beginning of the feedbacks array
  complaint.feedbacks.unshift({
    user: req.user._id,
    satisfaction,
    comment,
  });

  // Update the feedback counts
  if (satisfaction === 'Positive') {
    complaint.positiveFeedbackCount += 1;
  } else {
    complaint.negativeFeedbackCount += 1;
  }
  
  // Update the complaint status
  complaint.status = 'FeedbackProvided';

  await complaint.save();

  res.status(200).json({ success: true, message: 'Thank you for your feedback!' });
});

