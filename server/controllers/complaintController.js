import asyncHandler from 'express-async-handler';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js'; // Import Notification model
import User from '../models/User.js';

// @desc    Get all complaints for an officer's city
// @route   GET /api/complaints
// @access  Private (Officer)
export const getComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ city: req.user.city })
    .populate('assignedTo', 'name') // Get worker's name
    .sort({ createdAt: -1 });
  res.json({ success: true, data: complaints });
});

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
export const createComplaint = asyncHandler(async (req, res) => {
  const { issueType, binId, description } = req.body;
  const complaint = await Complaint.create({
    issueType,
    binId,
    description,
    reportedBy: req.user._id,
    city: req.user.city,
    area: req.user.area,
    // Assuming image upload is handled by a separate middleware that adds req.file
    imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
  });
  res.status(201).json({ success: true, data: complaint });
});

// @desc    Assign a complaint to a worker
// @route   PUT /api/complaints/:id/assign
// @access  Private (Officer)
export const assignComplaint = asyncHandler(async (req, res) => {
  const { workerId } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) { res.status(404); throw new Error('Complaint not found'); }

  complaint.assignedTo = workerId;
  complaint.status = 'Assigned';
  const updatedComplaint = await complaint.save();
  res.json({ success: true, data: updatedComplaint });
});

// @desc    Mark a complaint as resolved (by a worker)
// @route   PUT /api/complaints/:id/resolve
// @access  Private (Worker)
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

// @desc    Verify a resolution and notify the citizen
// @route   PUT /api/complaints/:id/verify
// @access  Private (Officer)
export const verifyAndNotifyComplaint = asyncHandler(async (req, res) => {
  const { status } = req.body; // Expects "Approved" or "Rejected"
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
    res.status(400);
    throw new Error('Invalid status provided.');
  }
});

// @desc    Close a complaint after feedback
// @route   PUT /api/complaints/:id/close
// @access  Private (Officer)
export const closeComplaint = asyncHandler(async (req, res) => {
    const complaint = await Complaint.findById(req.params.id).populate('reportedBy');
    if (!complaint) { res.status(404); throw new Error('Complaint not found'); }
    
    // Award points
    if(complaint.reportedBy) {
        await User.findByIdAndUpdate(complaint.reportedBy._id, { $inc: { cleanCoins: 10 } });
    }

    complaint.status = 'Closed';
    await complaint.save();
    res.json({ success: true, message: 'Complaint closed and rewards issued.' });
});

// @desc    Get a citizen's own complaint history
// @route   GET /api/complaints/my-history
// @access  Private
export const getMyComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
});

// @desc    Bulk delete complaints
// @route   POST /api/complaints/bulk-delete
// @access  Private (Officer)
export const bulkDeleteComplaints = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
        res.status(400); throw new Error('No complaint IDs provided');
    }
    await Complaint.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: 'Complaints deleted successfully.' });
});
