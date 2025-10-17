import asyncHandler from 'express-async-handler';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Helper function to determine priority based on issue type
const getPriority = (issueType) => {
  switch (issueType) {
    case 'Waste Spilled Nearby':
      return 'Emergency';
    case 'Overflowing Bin':
      return 'High';
    case 'Damaged Bin':
      return 'Medium';
    default:
      return 'Low';
  }
};

/**
 * @desc    Get all complaints for an officer's city, ranked by priority and votes
 * @route   GET /api/complaints
 * @access  Private (Officer)
 */
export const getComplaints = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.city) {
    res.status(400);
    throw new Error('User city not found. Cannot fetch complaints.');
  }

  // UPDATED: Now only shows complaints that are approved, and sorts them by priority
  const complaints = await Complaint.find({ city: req.user.city, status: { $ne: 'AwaitingApproval' } })
    .populate('assignedTo', 'name')
    .sort({ priority: -1, likes: -1, createdAt: 1 });

  res.json({ success: true, data: complaints });
});

/**
 * @desc    Create a new complaint, assign priority, and notify citizens for voting
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
    imageUrl: `/uploads/${req.file.filename}`,
    priority: getPriority(issueType),
    status: 'AwaitingApproval', // NEW: Complaint now waits for community verification
  });

  // NEW: Broadcast a notification to all other citizens in the same city to vote
  const citizensInCity = await User.find({ role: 'Citizen', city: req.user.city, _id: { $ne: req.user._id } });
  const notificationPromises = citizensInCity.map(citizen => {
    return Notification.create({
      user: citizen._id,
      title: `New Issue Reported in ${complaint.area}`,
      message: `A citizen reported an issue: "${complaint.issueType}". You can view and vote on its authenticity.`,
      type: 'Broadcast',
      relatedComplaint: complaint._id, // This links the notification to the complaint for voting
    });
  });
  await Promise.all(notificationPromises);

  res.status(201).json({ 
    success: true, 
    message: 'Report submitted for community verification!',
    data: complaint 
  });
});

/**
 * @desc    Allow a citizen to vote on a complaint, which can change its status
 * @route   PUT /api/complaints/:id/vote
 * @access  Private (Citizen)
 */
export const voteOnComplaint = asyncHandler(async (req, res) => {
    const { voteType } = req.body; // 'like' or 'dislike'
    const complaint = await Complaint.findById(req.params.id);
    const userId = req.user._id;
  
    if (!complaint) {
      res.status(404); throw new Error('Complaint not found');
    }
  
    if (complaint.votedBy.includes(userId)) {
      res.status(400); throw new Error('You have already voted on this issue.');
    }
  
    if (voteType === 'like') {
      complaint.likes += 1;
      // On the first like, the complaint becomes visible to the officer
      if (complaint.likes === 1) {
        complaint.status = 'Pending';
      }
    } else if (voteType === 'dislike') {
      complaint.dislikes += 1;
      // On the first dislike, the complaint is rejected and hidden
      complaint.status = 'Rejected';
      complaint.assignedTo = undefined; // Ensure it cannot be assigned
    } else {
      res.status(400); throw new Error('Invalid vote type.');
    }
  
    complaint.votedBy.push(userId);
    
    // NEW: Automatic Assignment Logic
    if (complaint.likes >= 2 && complaint.status === 'Pending') {
      const suresh = await User.findOne({ name: 'Suresh' }); // Find the specific worker
      if (suresh) {
        complaint.assignedTo = suresh._id;
        complaint.status = 'Assigned';
        // Notify the worker about the auto-assignment
        await Notification.create({
            user: suresh._id,
            title: 'Auto-Assigned High-Priority Task',
            message: `A community-voted issue (${complaint.issueType}) has been automatically assigned to you.`,
            type: 'Alert'
        });
      }
    }
  
    await complaint.save();
    res.json({ success: true, data: complaint });
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

  if (complaint.reportedBy.toString() !== req.user.id) {
    res.status(403);
    throw new Error('You are not authorized to provide feedback for this complaint.');
  }

  complaint.feedbacks.unshift({
    user: req.user._id,
    satisfaction,
    comment,
  });

  if (satisfaction === 'Positive') {
    complaint.positiveFeedbackCount += 1;
  } else {
    complaint.negativeFeedbackCount += 1;
  }
  
  complaint.status = 'FeedbackProvided';

  await complaint.save();

  res.status(200).json({ success: true, message: 'Thank you for your feedback!' });
});

/**
 * @desc    Get worker progress report (by an Officer)
 * @route   GET /api/complaints/progress
 * @access  Private (Officer)
 */
export const getWorkerProgress = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.city) {
    res.status(400);
    throw new Error('User city not found. Cannot fetch progress.');
  }

  const resolvedComplaints = await Complaint.find({
    city: req.user.city,
    status: { $in: ['Resolved', 'Verified', 'FeedbackProvided', 'Closed'] },
    assignedTo: { $exists: true },
    resolvedAt: { $exists: true }
  })
    .populate('assignedTo', 'name')
    .sort({ resolvedAt: -1 });

  const progressReport = resolvedComplaints.map(complaint => {
    const timeAssigned = new Date(complaint.createdAt).getTime();
    const timeResolved = new Date(complaint.resolvedAt).getTime();
    const resolutionTimeMs = timeResolved - timeAssigned;

    const hours = Math.floor(resolutionTimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((resolutionTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const resolutionTime = `${hours}h ${minutes}m`;

    return {
      _id: complaint._id,
      binId: complaint.binId,
      issueType: complaint.issueType,
      workerName: complaint.assignedTo ? complaint.assignedTo.name : 'Unknown',
      assignedAt: complaint.createdAt,
      resolvedAt: complaint.resolvedAt,
      resolutionTime,
    };
  });

  res.json({ success: true, data: progressReport });
});

/**
 * @desc    Get officer progress report for all cities
 * @route   GET /api/complaints/officer-progress
 * @access  Public
 */
export const getOfficerProgress = asyncHandler(async (req, res) => {
  const relevantComplaints = await Complaint.find({
    status: { $in: ['Verified', 'FeedbackProvided', 'Closed'] },
    assignedTo: { $exists: true },
    notifiedAt: { $exists: true },
    verifiedBy: { $exists: true }
  })
    .populate('verifiedBy', 'name city')
    .sort({ notifiedAt: -1 });

  const officerProgressReport = relevantComplaints.map(complaint => {
    const timeCreated = new Date(complaint.createdAt).getTime();
    const timeAssigned = new Date(complaint.createdAt).getTime();
    const timeNotified = new Date(complaint.notifiedAt).getTime();

    const timeToAssignMs = timeAssigned - timeCreated;
    const assignHours = Math.floor(timeToAssignMs / (1000 * 60 * 60));
    const assignMinutes = Math.floor((timeToAssignMs % (1000 * 60 * 60)) / (1000 * 60));
    const assignmentTime = `${assignHours}h ${assignMinutes}m`;

    const totalResolutionTimeMs = timeNotified - timeCreated;
    const totalHours = Math.floor(totalResolutionTimeMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor((totalResolutionTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const totalTime = `${totalHours}h ${totalMinutes}m`;

    return {
      _id: complaint._id,
      issueType: complaint.issueType,
      officerName: complaint.verifiedBy ? complaint.verifiedBy.name : 'Unknown Officer',
      city: complaint.city,
      createdAt: complaint.createdAt,
      notifiedAt: complaint.notifiedAt,
      assignmentTime,
      totalTime,
    };
  });

  res.json({ success: true, data: officerProgressReport });
});