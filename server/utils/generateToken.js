import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  // This creates a secure token that includes the user's unique ID from MongoDB.
  // It signs it with a secret key from your environment variables.
  // The token is set to expire in 30 days.
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;