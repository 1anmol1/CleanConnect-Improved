import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    issueType: {
      type: String,
      required: [true, 'Please select an issue type'],
      enum: ['Overflowing Bin', 'Damaged Bin', 'Waste Spilled Nearby', 'Pothole', 'Streetlight Issue', 'Water Leakage', 'Fallen Tree', 'Electricity', 'Drainage', 'Air Quality', 'Traffic', 'Other'],
    },
    description: {
      type: String,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    status: {
      type: String,
      required: true,
      // NEW: Added 'AwaitingApproval' and 'Rejected' statuses for the voting system
      enum: ['AwaitingApproval', 'Pending', 'Assigned', 'Resolved', 'Verified', 'Reopened', 'FeedbackProvided', 'Closed', 'Rejected'],
      default: 'AwaitingApproval', // A new complaint now waits for community approval
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Emergency'],
      default: 'Low',
      index: true, // Indexing for faster sorting by priority
    },
    reportedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    verifiedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    city: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    resolutionImageUrl: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
    notifiedAt: {
        type: Date,
    },
    // NEW Fields for the Voting System
    likes: {
      type: Number,
      default: 0
    },
    dislikes: {
      type: Number,
      default: 0
    },
    votedBy: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }],
    // ---
    feedbacks: [
      {
        user: { type: mongoose.Schema.ObjectId, ref: 'User' },
        satisfaction: { type: String, enum: ['Positive', 'Negative'] },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    positiveFeedbackCount: { type: Number, default: 0 },
    negativeFeedbackCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;