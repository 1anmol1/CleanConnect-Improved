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
app.use(express.static(path.join(__dirname, 'server/public')));

// Mount all API routers on their respective paths
app.use('/api/bins', binRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/routes', routeRoutes);

// Server Startup configuration
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all available network interfaces

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`👉 Local access: http://localhost:${PORT}`);
  console.log(`👉 Network access: http://10.101.82.115:${PORT}`); // Example network IP
});