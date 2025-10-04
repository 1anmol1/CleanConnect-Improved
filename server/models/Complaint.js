import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    issueType: {
      type: String,
      required: [true, 'Please select an issue type'],
      enum: ['Overflowing Bin', 'Damaged Bin', 'Waste Spilled Nearby', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    binId: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Assigned', 'Resolved', 'Verified', 'Reopened', 'FeedbackProvided', 'Closed'],
      default: 'Pending',
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
    // For tracking multiple reports on the same issue
    reportCount: {
        type: Number,
        default: 1,
    },
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