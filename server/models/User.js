import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Citizen', 'Worker', 'Officer'], default: 'Citizen' },
  addressLine: { type: String },
  location: { type: String },
  area: { type: String },
  city: { type: String, required: true },
  cleanCoins: { type: Number, required: true, default: 0 },
  workerId: { type: String, unique: true, sparse: true },
}, { timestamps: true });

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