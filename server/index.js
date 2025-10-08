import express from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import connectDB from './config/db.js';

// Import all API routes
import binRoutes from './routes/bins.js';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import complaintRoutes from './routes/complaints.js';
import userRoutes from './routes/users.js';
import areaRoutes from './routes/areas.js';
import notificationRoutes from './routes/notifications.js';
import routeRoutes from './routes/routes.js';
// 1. --- THE FIX: Import the new attendance routes ---
import attendanceRoutes from './routes/attendance.js';

// Connect to the database when the server starts
connectDB();

const app = express();

// Configure CORS (Cross-Origin Resource Sharing)
app.use(cors({
  origin: ['http://localhost:5173', 'http://10.101.82.115:5173'], // Your allowed client URLs
  credentials: true
}));

// Middleware to parse JSON bodies in incoming requests
app.use(express.json());

// Serve static files (like uploaded images) from the 'public' folder
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'server/public/uploads')));

// Mount all API routers on their respective paths
app.use('/api/bins', binRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/routes', routeRoutes);
// 2. --- THE FIX: Tell Express to use the new attendance routes ---
app.use('/api/attendance', attendanceRoutes);

// Server Startup configuration
const PORT = process.env.PORT || 5000; // Changed default to 5000 as it's more common
const HOST = '0.0.0.0'; // Listen on all available network interfaces

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  // These console logs need to be updated manually if your IP or port changes
  console.log(`👉 Local access: http://localhost:${PORT}`); 
  // The network IP might change, so it's good practice to check it with 'ifconfig' or 'ipconfig'
  console.log(`👉 Network access: http://10.101.82.115:${PORT}`); 
});