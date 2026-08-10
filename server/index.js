import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; // Used for ES Module compatibility
import 'dotenv/config';
import connectDB from './config/db.js';

// Import all your route files
import binRoutes from './routes/bins.js';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import complaintRoutes from './routes/complaints.js';
import userRoutes from './routes/users.js';
import areaRoutes from './routes/areas.js';
import notificationRoutes from './routes/notifications.js';
import attendanceRoutes from './routes/attendance.js';
import routeRoutes from './routes/routes.js';

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Basic Route for Health Check
app.get('/', (req, res) => {
  res.send('CleanConnect API is running...');
});

app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// --- THE FIX IS HERE ---
// This is a more robust way to define paths in an ES Module environment.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This line now correctly tells Express that the 'public' folder is in the
// SAME directory as this index.js file. The server will now correctly find
// the path: .../server/public/uploads/...
app.use(express.static(path.join(__dirname, 'public')));


// Mount all your API routers
app.use('/api/bins', binRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/routes', routeRoutes);

// Server Startup
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});