import asyncHandler from 'express-async-handler';

// This middleware checks for a secret API key in the request headers.
export const protectDevice = asyncHandler(async (req, res, next) => {
  const apiKey = req.get('x-api-key'); // The ESP32 will send its key in this header

  if (apiKey && apiKey === process.env.DEVICE_API_KEY) {
    next(); // If the key matches, proceed to the controller
  } else {
    res.status(401); // Unauthorized
    throw new Error('Not authorized, invalid device API key');
  }
});