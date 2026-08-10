import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  // This creates a secure token that includes the user's unique ID from MongoDB.
  // It signs it with a secret key from your environment variables.
  // The token is set to never expire.
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

export default generateToken;