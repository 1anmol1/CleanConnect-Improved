import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, addressLine, location } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) { res.status(400); throw new Error('User already exists'); }

  const locationParts = location.split(',').map(part => part.trim());
  const area = locationParts[0] || '';
  const city = locationParts[1] || '';

  const user = await User.create({ name, email, password, addressLine, city, area, location, role: 'Citizen' });

  if (user) {
    res.status(201).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, city: user.city },
      token: generateToken(user._id),
    });
  } else {
    res.status(400); throw new Error('Invalid user data');
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { role, email, workerId, city, password } = req.body;
  let user;

  if (role === 'Worker') {
    if (!workerId || !password) { res.status(400); throw new Error('Please provide Worker ID and password'); }
    user = await User.findOne({ workerId });
  } else if (role === 'Officer') {
    if (!city || !password) { res.status(400); throw new Error('Please provide City and password'); }
    const officerEmail = `officer.${city.toLowerCase()}@test.com`;
    user = await User.findOne({ email: officerEmail, role: 'Officer' });
  } else {
    if (!email || !password) { res.status(400); throw new Error('Please provide email and password'); }
    user = await User.findOne({ email });
  }

  if (user && (await user.matchPassword(password))) {
    if (user.role !== role) {
      res.status(401); throw new Error(`Invalid credentials for ${role} portal.`);
    }
    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, city: user.city },
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});