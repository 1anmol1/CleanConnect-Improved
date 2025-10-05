import asyncHandler from 'express-async-handler';
import axios from 'axios';

// This middleware runs on your report submission route.
export const verifyRecaptcha = asyncHandler(async (req, res, next) => {
  // The token is sent from the frontend form.
  const { recaptchaToken } = req.body;

  // 1. Check if the frontend sent a token at all.
  if (!recaptchaToken) {
    res.status(400);
    throw new Error('Please complete the reCAPTCHA challenge.');
  }

  // 2. Build the verification URL to send to Google.
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

  try {
    // 3. Send the request to Google's server.
    const { data } = await axios.post(verificationUrl);

    // 4. Check Google's response.
    if (data.success) {
      // If Google says the user is human, allow the request to proceed to the next step (the controller).
      next();
    } else {
      // If Google says verification failed, reject the request.
      res.status(400);
      throw new Error('reCAPTCHA verification failed. Please try again.');
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    res.status(500);
    throw new Error('Server error during reCAPTCHA verification.');
  }
});

