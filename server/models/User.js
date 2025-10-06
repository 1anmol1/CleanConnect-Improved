import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      required: true, 
      enum: ['Citizen', 'Worker', 'Officer'], 
      default: 'Citizen',
      index: true 
    },
    city: { 
      type: String, 
      required: true,
      index: true 
    },
    addressLine: { type: String },
    location: { type: String },
    area: { type: String },
    cleanCoins: { type: Number, required: true, default: 0 },
    workerId: { type: String, unique: true, sparse: true },
    
    // --- THE UPDATE IS HERE ---
    // The old 'lastCheckIn' field has been replaced with the new 'attendanceStatus'.
    attendanceStatus: {
      type: String,
      enum: ['Absent', 'Online', 'On Route', 'Route Completed', 'Offline'],
      default: 'Absent', // The initial state for all workers.
      index: true // Index this field for faster lookups of worker statuses.
    },
    liveLocation: {
      type: {
        type: String,
        enum: ['Point'], // GeoJSON type
      },
      coordinates: {
        type: [Number], // [Longitude, Latitude]
      }
    },
    // ----------------------------------------------------
  },
  { timestamps: true }
);

// This is a compound index for faster queries combining city and role.
userSchema.index({ city: 1, role: 1 });

// This is a geospatial index for finding users (workers) by location.
userSchema.index({ liveLocation: '2dsphere' });

// Password hashing and matching logic (no changes needed here)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) { return next(); }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;