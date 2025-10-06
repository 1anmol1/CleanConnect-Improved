import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// A simple helper function to calculate the distance between two GPS coordinates (in km)
// This is used for our geofence check.
const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    0.5 - Math.cos(dLat) / 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    (1 - Math.cos(dLon)) / 2;
  return R * 2 * Math.asin(Math.sqrt(a));
};

// Hardcoded center coordinates for supported cities for the geofence check
const cityCenters = {
  Pune: { lat: 18.5204, lng: 73.8567 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Kolhapur: { lat: 16.7048, lng: 74.2433 },
  // Add other cities as needed
};

/**
 * @desc    Mark a worker's attendance for the day with a geofence check
 * @route   POST /api/attendance/check-in
 * @access  Private (Worker)
 */
export const markAttendance = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body; // Get the worker's current location from the request
  const workerId = req.user._id;

  if (!lat || !lng) {
    res.status(400);
    throw new Error('Geolocation data is required for check-in.');
  }

  const worker = await User.findById(workerId);

  // --- Geofence Check ---
  const cityCenter = cityCenters[worker.city];
  if (!cityCenter) {
    res.status(400);
    throw new Error(`Geofence not configured for city: ${worker.city}`);
  }

  const distance = getDistanceInKm(lat, lng, cityCenter.lat, cityCenter.lng);
  const GEOFENCE_RADIUS_KM = 10; // Allow check-in within a 10km radius of the city center

  if (distance > GEOFENCE_RADIUS_KM) {
    res.status(403); // Forbidden
    throw new Error(`Check-in failed. You must be within your assigned city (${worker.city}) to mark attendance.`);
  }

  // --- Duplicate Check-in Prevention ---
  const today = new Date().setHours(0, 0, 0, 0);
  if (worker.lastCheckIn && new Date(worker.lastCheckIn).setHours(0, 0, 0, 0) === today) {
    return res.status(200).json({ success: true, message: 'Attendance already marked for today.' });
  }

  // --- Mark Attendance ---
  worker.lastCheckIn = new Date();
  await worker.save();

  res.status(200).json({ success: true, message: 'Attendance marked successfully for today!' });
});
