import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
});

// Create a compound index for efficient searching
areaSchema.index({ city: 1, name: 1 });

const Area = mongoose.model('Area', areaSchema);
export default Area;