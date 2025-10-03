import mongoose from 'mongoose';

const binSchema = new mongoose.Schema({
  binId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // [Longitude, Latitude]
      required: true,
    },
  },
  city: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  fillLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Empty', 'Half-Full', 'Full', 'Overflow', 'Maintenance'],
    default: 'Empty',
  },
  lastEmptied: {
    type: Date,
  },
}, {
  timestamps: true
});

binSchema.index({ location: '2dsphere' });
binSchema.index({ binId: 'text' }); // Index for text search on binId

const Bin = mongoose.model('Bin', binSchema);
export default Bin;