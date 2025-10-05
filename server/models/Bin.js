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
  // --- NEW & UPDATED FIELDS ---
  isSmartBin: {
    type: Boolean,
    default: true, // Existing bins are smart bins
  },
  parentBin: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bin', // This links a child bin to its parent smart bin
  },
  fillLevel: { // For smart bins, updated by ESP32
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  manualStatus: { // For child bins, updated by authorized citizens
    type: String,
    enum: ['Empty', 'Half-Full', 'Full'],
    default: 'Empty',
  },
  lastManualUpdate: {
    type: Date,
  },
  // -------------------------
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
