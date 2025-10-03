import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  // --- EDITED: Renamed points to cleanCoins ---
  cleanCoins: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  relatedComplaint: {
    type: mongoose.Schema.ObjectId,
    ref: 'Complaint',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Reward = mongoose.model('Reward', rewardSchema);
export default Reward;