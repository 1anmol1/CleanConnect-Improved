import express from 'express';
// 1. THE FIX: Changed 'register' to 'registerUser' and 'login' to 'loginUser'
// This now matches the names exported from your controller file.
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// 2. THE FIX: Use the correct function names in the route definitions.
router.post('/register', registerUser); // Use 'registerUser' here
router.post('/login', loginUser);       // Use 'loginUser' here

export default router;