import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Reward from '../models/Reward.js';

export const createComplaint = async (req, res) => {
  const { issueType, binId, description } = req.body;
  const reporterId = req.user.id;
  const { city, area } = req.user;
  if (!issueType || !description || !req.file) {
    return res.status(400).json({ success: false, error: 'Issue Type, Description, and a Photo are required.' });
  }
  try {
    const existingComplaint = await Complaint.findOne({
      binId,
      issueType,
      status: { $nin: ['Verified', 'Closed', 'Reopened'] }
    });
    if (existingComplaint) {
      existingComplaint.reports.push({ reporter: reporterId });
      existingComplaint.reportCount = existingComplaint.reports.length;
      await existingComplaint.save();
      res.status(200).json({ success: true, data: existingComplaint, message: 'Your report has been added to an existing issue.' });
    } else {
      const newComplaint = await Complaint.create({
        issueType, binId, description, city, area,
        reports: [{ reporter: reporterId }],
        imageUrl: `/uploads/${req.file.filename}`,
      });
      res.status(201).json({ success: true, data: newComplaint, message: 'New complaint reported successfully!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ city: req.user.city })
      .populate('reports.reporter', 'name email').populate('assignedTo', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: complaints });
  } catch (error) { res.status(500).json({ success: false, error: 'Server Error' }); }
};

export const getMyResolutions = async (req, res) => {
  try {
    const resolutions = await Complaint.find({ assignedTo: req.user.id })
      .populate('reports.reporter', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: resolutions });
  } catch (error) { res.status(500).json({ success: false, error: 'Server Error' }); }
};

export const assignComplaint = async (req, res) => {
    const { workerId } = req.body;
    const complaintId = req.params.id;
    try {
        const complaint = await Complaint.findById(complaintId);
        if (!complaint || complaint.city !== req.user.city) {
        return res.status(403).json({ success: false, error: 'Complaint not found or not authorized.' });
        }
        const updatedComplaint = await Complaint.findByIdAndUpdate(complaintId, { assignedTo: workerId, status: 'Assigned' }, { new: true });
        res.status(200).json({ success: true, data: updatedComplaint });
    } catch (error) { res.status(500).json({ success: false, error: 'Server Error' }); }
};

export const resolveComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint || complaint.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized.' });
        }
        complaint.status = 'Resolved';
        complaint.resolvedAt = new Date();
        if (req.file) { 
            complaint.resolutionImageUrl = `/uploads/${req.file.filename}`;
        }
        await complaint.save();
        res.status(200).json({ success: true, data: complaint });
    } catch (error) { res.status(500).json({ error: 'Server Error' }); }
};

export const verifyResolution = async (req, res) => {
  const complaintId = req.params.id;
  const { status } = req.body;
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint || complaint.city !== req.user.city) {
      return res.status(403).json({ success: false, error: 'Not authorized.' });
    }
    complaint.officerVerificationStatus = status;
    complaint.status = status === 'Approved' ? 'Verified' : 'Assigned';
    await complaint.save();
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const submitFeedback = async (req, res) => {
  const complaintId = req.params.id;
  const { satisfaction, comment } = req.body;
  const userId = req.user.id;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint || !complaint.reports.some(r => r.reporter.toString() === userId)) {
        return res.status(403).json({ error: 'Not authorized.' });
    }
    if (complaint.feedbacks.some(f => f.user.toString() === userId)) {
        return res.status(400).json({ error: 'You have already submitted feedback for this issue.' });
    }

    complaint.feedbacks.push({ user: userId, satisfaction, comment });
    
    if (satisfaction === 'Positive') {
        complaint.positiveFeedbackCount += 1;
    } else {
        complaint.negativeFeedbackCount += 1;
    }

    if (satisfaction === 'Negative') {
        complaint.status = 'Reopened';
    } else {
        complaint.status = 'FeedbackProvided';
    }
    
    await complaint.save();
    res.status(200).json({ success: true, data: complaint });
  } catch (error) { res.status(500).json({ error: 'Server Error' }); }
};

export const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ "reports.reporter": req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: complaints });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

export const closeComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(req.params.id, 
            { status: 'Closed' }, 
            { new: true }
        );

        if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

        const reporterIds = complaint.reports.map(r => r.reporter);
        await User.updateMany({ _id: { $in: reporterIds } }, { $inc: { cleanCoins: 5 } });
        
        const rewardDocs = reporterIds.map(userId => ({
            user: userId,
            cleanCoins: 5,
            reason: 'Issue Resolved & Closed',
            relatedComplaint: complaint._id
        }));
        await Reward.insertMany(rewardDocs);
        
        res.status(200).json({ success: true, data: complaint });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

export const deleteComplaints = async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Complaint IDs must be provided in an array.' });
    }

    try {
        const complaintsToDelete = await Complaint.find({
            _id: { $in: ids },
            city: req.user.city
        });

        const deletableIds = complaintsToDelete.map(c => c._id);

        if (deletableIds.length === 0) {
            return res.status(404).json({ error: 'No matching complaints found to delete.' });
        }

        await Complaint.deleteMany({ _id: { $in: deletableIds } });

        res.status(200).json({ success: true, message: `${deletableIds.length} complaints deleted successfully.` });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

export const reassignComplaint = async (req, res) => {
    const { workerId } = req.body;
    const complaintId = req.params.id;
    try {
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId, 
            { 
                assignedTo: workerId, 
                status: 'Assigned',
                feedbacks: [],
                positiveFeedbackCount: 0,
                negativeFeedbackCount: 0,
                notifiedAt: null 
            }, 
            { new: true }
        );
        res.status(200).json({ success: true, data: updatedComplaint });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};