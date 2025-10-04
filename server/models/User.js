import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // THE FIX: Add indexes to the fields you search by
    role: { 
      type: String, 
      required: true, 
      enum: ['Citizen', 'Worker', 'Officer'], 
      default: 'Citizen',
      index: true // This creates the "card catalog" for role
    },
    city: { 
      type: String, 
      required: true,
      index: true // This creates the "card catalog" for city
    },
    // ... other fields
    addressLine: { type: String },
    location: { type: String },
    area: { type: String },
    cleanCoins: { type: Number, required: true, default: 0 },
    workerId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// This is a compound index, which is even faster for combined queries
userSchema.index({ city: 1, role: 1 });

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
