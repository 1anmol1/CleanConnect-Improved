import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler'; // For consistent error handling
import User from '../models/User.js';

// 1. The 'protect' Middleware
// This function verifies the user's token and attaches their data to the request.
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from the "Bearer <token>" header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using your secret key from the .env file
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the ID stored in the token's payload.
      // We exclude the password from being attached to the request object.
      req.user = await User.findById(decoded.id).select('-password');
      
      // If the user is not found (e.g., deleted after token was issued), reject.
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next(); // Success! Move on to the next middleware or controller.
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});


// 2. The 'authorize' Middleware
// This function runs AFTER 'protect' and checks if the user has the correct role.
export const authorize = (...roles) => {
  return (req, res, next) => {
    // THE FIX: First, we safely check if req.user exists.
    // Then, we check if the user's role is included in the list of allowed roles.
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403); // 403 Forbidden - you are logged in, but you don't have permission.
      throw new Error(
        `User role '${req.user?.role || 'unknown'}' is not authorized to access this route`
      );
    }
    next(); // Success! The user has the correct role.
  };
};