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
 * @desc    Mark a worker's status as 'On Route' with a geofence check
 * @route   POST /api/attendance/check-in
 * @access  Private (Worker)
 */
export const markOnRoute = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body; // Get the worker's current location from the request
  const worker = await User.findById(req.user._id);

  if (!lat || !lng) {
    res.status(400);
    throw new Error('Geolocation data is required for check-in.');
  }

  // --- Geofence Check ---
  const cityCenter = cityCenters[worker.city];
  if (!cityCenter) {
    res.status(400);
    throw new Error(`Geofence not configured for city: ${worker.city}`);
  }

  const distance = getDistanceInKm(lat, lng, cityCenter.lat, cityCenter.lng);
  const GEOFENCE_RADIUS_KM = 15; // Allow check-in within a 15km radius of the city center

  if (distance > GEOFENCE_RADIUS_KM) {
    res.status(403); // Forbidden
    throw new Error(`Check-in failed. You must be within your assigned city (${worker.city}) to start your route.`);
  }

  // --- Mark Status as 'On Route' ---
  // We only update if they are not already on route or have completed the route
  if (worker.attendanceStatus !== 'On Route' && worker.attendanceStatus !== 'Route Completed') {
    worker.attendanceStatus = 'On Route';
    await worker.save();
    res.status(200).json({ success: true, message: 'Attendance confirmed! Your status is now: On Route.' });
  } else {
    // If already checked in, just send a confirmation
    res.status(200).json({ success: true, message: `Your status is already '${worker.attendanceStatus}'.` });
  }
});

/**
 * @desc    Mark a worker's status as 'Offline' on logout and set a timer to mark as 'Absent'
 * @route   POST /api/attendance/check-out
 * @access  Private (Worker)
 */
export const checkOut = asyncHandler(async (req, res) => {
    const worker = await User.findById(req.user._id);
    if (worker) {
        worker.attendanceStatus = 'Offline';
        await worker.save();

        // Server-side timer: After 30 seconds, check if the user is still offline.
        // This is more reliable than a frontend timer.
        setTimeout(async () => {
            try {
                const latestWorkerState = await User.findById(req.user._id);
                // If they are still 'Offline' after 30 seconds, mark them as 'Absent'.
                if (latestWorkerState && latestWorkerState.attendanceStatus === 'Offline') {
                    latestWorkerState.attendanceStatus = 'Absent';
                    await latestWorkerState.save();
                    console.log(`Worker ${latestWorkerState.name} automatically marked as Absent after 30s offline.`);
                }
            } catch (error) {
                console.error("Error in check-out timer:", error);
            }
        }, 30000); // 30 seconds

        res.status(200).json({ success: true, message: 'Checked out successfully. Status is now Offline.' });
    } else {
        res.status(404);
        throw new Error('Worker not found.');
    }
});

/**
 * @desc    Mark a worker's route as completed
 * @route   PUT /api/attendance/complete-route
 * @access  Private (Worker)
 */
export const completeRoute = asyncHandler(async (req, res) => {
    const worker = await User.findById(req.user._id);
    if (worker) {
        worker.attendanceStatus = 'Route Completed';
        await worker.save();
        res.status(200).json({ success: true, message: 'Route marked as completed!' });
    } else {
        res.status(404);
        throw new Error('Worker not found.');
    }
});

