import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  city: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD format
  route: [{
    binId: String,
    status: String,
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number],
    },
  }],
});

// A worker can only have one route per day per city
routeSchema.index({ workerId: 1, date: 1, city: 1 }, { unique: true });

const Route = mongoose.model('Route', routeSchema);
export default Route;