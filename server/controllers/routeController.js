import asyncHandler from 'express-async-handler';
import Complaint from '../models/Complaint.js';
import Bin from '../models/Bin.js'; // We might still need Bin for location data

// A simple distance calculator
const getDistance = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Simplified Dijkstra-like approach: Nearest Neighbor from a priority queue
const optimizeRouteByPriorityAndDistance = (startLocation, tasks) => {
  if (!tasks || tasks.length === 0) return [];
  
  let remainingTasks = [...tasks];
  let orderedRoute = [];
  let currentLocation = startLocation;

  // Priority mapping
  const priorityMap = { 'Emergency': 4, 'High': 3, 'Medium': 2, 'Low': 1 };

  // Sort tasks first by priority, then by distance from the worker's start location
  remainingTasks.sort((a, b) => {
    const priorityA = priorityMap[a.priority] || 0;
    const priorityB = priorityMap[b.priority] || 0;
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }
    const distanceA = getDistance(currentLocation, a.location.coordinates);
    const distanceB = getDistance(currentLocation, b.location.coordinates);
    return distanceA - distanceB; // Closer distance first
  });
  
  return remainingTasks;
};

export const getMyTodaysRoute = asyncHandler(async (req, res) => {
    const worker = req.user;

    // Get all complaints assigned to this worker that are not yet resolved
    const assignedComplaints = await Complaint.find({
        assignedTo: worker._id,
        status: { $in: ['Assigned', 'Reopened'] }
    }).populate('binId'); // Populate bin details if available

    // Get the worker's current location (or a default starting point)
    const workerLocation = worker.liveLocation ? worker.liveLocation.coordinates : [73.8567, 18.5204]; // Default to Pune center

    // Prepare tasks for optimization, ensuring they have location data
    const tasksWithLocation = await Promise.all(assignedComplaints.map(async (c) => {
        let location = null;
        if (c.binId) {
            const bin = await Bin.findOne({ binId: c.binId });
            if (bin) location = bin.location;
        }
        // Fallback or if it's a general spill, you might need a location field on the complaint itself
        // For now, we only route to complaints linked to a bin
        if (location) {
            return {
                _id: c._id,
                issueType: c.issueType,
                description: c.description,
                priority: c.priority,
                location: location,
                binId: c.binId
            };
        }
        return null;
    }));

    const validTasks = tasksWithLocation.filter(task => task !== null);
    
    // Run the optimization
    const optimizedRoute = optimizeRouteByPriorityAndDistance(workerLocation, validTasks);

    res.json({ success: true, data: optimizedRoute });
});