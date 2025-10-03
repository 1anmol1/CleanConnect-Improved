import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  issueType: {
    type: String,
    enum: ['Overflowing Bin', 'Damaged Bin', 'Waste Spilled Nearby', 'Other', 'Roadblock', 'Public Waste Spill'],
    required: [true, 'Please select an issue type'],
  },
  binId: { type: String, trim: true },
  description: { type: String, maxlength: 500 },
  imageUrl: { type: String },
  city: { type: String, required: true },
  area: { type: String, required: true },
  reports: [{
    reporter: { type: mongoose.Schema.ObjectId, ref: 'User' },
    reportedAt: { type: Date, default: Date.now }
  }],
  reportCount: { type: Number, default: 1 },
  assignedTo: { type: mongoose.Schema.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'Resolved', 'Verified', 'FeedbackProvided', 'Closed', 'Reopened'],
    default: 'Pending',
  },
  resolvedAt: { type: Date },
  resolutionImageUrl: { type: String },
  officerVerificationStatus: {
    type: String,
    enum: ['Approved', 'Rejected'],
  },
  // --- EDITED: Changed to an array to log all feedbacks ---
  feedbacks: [{
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    satisfaction: { type: String, enum: ['Positive', 'Negative'], required: true },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  positiveFeedbackCount: { type: Number, default: 0 },
  negativeFeedbackCount: { type: Number, default: 0 },
  notifiedAt: { type: Date },
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;