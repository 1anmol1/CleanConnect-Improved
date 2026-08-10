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
  category: {
    type: String,
    enum: ['Waste', 'Electricity', 'Drainage', 'Water Leakage', 'Air Quality', 'Traffic', 'Other'],
    default: 'Waste',
  },
  isSmartBin: {
    type: Boolean,
    default: true,
  },
  parentBin: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bin',
  },
  fillLevel: { // For smart bins, updated by ESP32
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  // THE FIX: Replaced 'manualStatus' with a numeric field
  manualFillLevel: { // For child bins, updated by authorized citizens
    type: Number,
    default: 0,
  },
  lastManualUpdate: {
    type: Date,
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

const Bin = mongoose.model('Bin', binSchema);
export default Bin;

