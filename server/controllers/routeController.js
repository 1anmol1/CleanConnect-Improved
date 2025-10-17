import asyncHandler from 'express-async-handler';
import Complaint from '../models/Complaint.js';
import Bin from '../models/Bin.js';

// Helper to calculate distance between two geo-coordinates
const getDistance = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Dijkstra-like approach: Find the nearest neighbor, but always handle higher priorities first.
const optimizeRouteByPriorityAndDistance = (startLocation, tasks) => {
  if (!tasks || tasks.length === 0) return [];
  
  const priorityMap = { 'Emergency': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
  
  let remainingTasks = [...tasks];
  let orderedRoute = [];
  let currentLocation = startLocation;

  // Group tasks by priority
  const groupedTasks = {
      4: remainingTasks.filter(t => priorityMap[t.priority] === 4),
      3: remainingTasks.filter(t => priorityMap[t.priority] === 3),
      2: remainingTasks.filter(t => priorityMap[t.priority] === 2),
      1: remainingTasks.filter(t => priorityMap[t.priority] === 1),
  };
  
  // Process each priority group from highest to lowest
  for (let i = 4; i >= 1; i--) {
      let tasksInPriority = groupedTasks[i];
      while (tasksInPriority.length > 0) {
          // Find the task in the current priority group closest to the current location
          tasksInPriority.sort((a, b) => {
              const distanceA = getDistance(currentLocation, a.location.coordinates);
              const distanceB = getDistance(currentLocation, b.location.coordinates);
              return distanceA - distanceB;
          });

          const nextTask = tasksInPriority.shift(); // Get the closest one
          orderedRoute.push(nextTask);
          currentLocation = nextTask.location.coordinates; // Update current location
      }
  }
  
  return orderedRoute;
};

export const getMyTodaysRoute = asyncHandler(async (req, res) => {
    const worker = req.user;

    // Get all unresolved complaints assigned to this worker
    const assignedComplaints = await Complaint.find({
        assignedTo: worker._id,
        status: { $in: ['Assigned', 'Reopened'] }
    });

    const workerLocation = worker.liveLocation ? worker.liveLocation.coordinates : [73.8567, 18.5204]; // Default to Pune center

    // Prepare tasks for optimization by fetching their bin locations
    const tasksWithLocation = await Promise.all(assignedComplaints.map(async (c) => {
        // We now only route based on complaints, which should have a binId
        const bin = await Bin.findOne({ binId: c.binId });
        if (bin && bin.location) {
            return {
                _id: c._id,
                issueType: c.issueType,
                description: c.description,
                priority: c.priority,
                location: bin.location,
                binId: c.binId,
                fillLevel: bin.fillLevel,
                status: bin.status,
                area: bin.area
            };
        }
        return null;
    }));

    const validTasks = tasksWithLocation.filter(task => task !== null);
    
    const optimizedRoute = optimizeRouteByPriorityAndDistance(workerLocation, validTasks);

    res.json({ success: true, data: optimizedRoute });
});