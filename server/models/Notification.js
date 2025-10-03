import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
  },
  type: {
    type: String,
    enum: ['Resolution', 'Reward', 'Alert', 'Broadcast'],
    default: 'Alert',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;