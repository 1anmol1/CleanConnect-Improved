import asyncHandler from 'express-async-handler';
import Bin from '../models/Bin.js';

/**
 * @desc    Create a new bin
 * @route   POST /api/bins
 * @access  Private (Officer)
 */
export const createBin = asyncHandler(async (req, res) => {
  const { binId, coordinates, area, isSmartBin, parentBin } = req.body;
  const city = req.user.city; // Get city from the logged-in officer

  const newBin = await Bin.create({
    binId,
    location: { type: 'Point', coordinates },
    city,
    area,
    isSmartBin,
    parentBin: parentBin || null, // Ensure parentBin is null if not provided
  });
  res.status(201).json({ success: true, data: newBin });
});

/**
 * @desc    Get all bins, filtered by city for relevant users
 * @route   GET /api/bins
 * @access  Private
 */
export const getAllBins = asyncHandler(async (req, res) => {
  let query = {};
  // Users only see bins in their own city
  if (req.user && req.user.city) {
    query.city = req.user.city;
  }
  const bins = await Bin.find(query);
  res.status(200).json({ success: true, count: bins.length, data: bins });
});

/**
 * @desc    Search for bins by binId (for autocomplete)
 * @route   GET /api/bins/search
 * @access  Private
 */
export const searchBins = asyncHandler(async (req, res) => {
    const { term } = req.query;
    const bins = await Bin.find({ 
        binId: { $regex: term, $options: 'i' },
        city: req.user.city // Search only within the user's city
    }).limit(10);
    res.json({ success: true, data: bins });
});

/**
 * @desc    Update a bin's fill level from an IoT device
 * @route   PUT /api/bins/:binId/update
 * @access  Private (Device Only, via API Key)
 */
export const updateBinFillLevel = asyncHandler(async (req, res) => {
  const { fillLevel } = req.body;
  const { binId } = req.params;

  const bin = await Bin.findOne({ binId: binId });

  if (bin) {
    bin.fillLevel = fillLevel;
    
    // Automatically update the status based on the new fill level
    if (fillLevel >= 95) bin.status = 'Overflow';
    else if (fillLevel >= 90) bin.status = 'Full';
    else if (fillLevel >= 70) bin.status = 'Half-Full';
    else bin.status = 'Empty';
    
    const updatedBin = await bin.save();
    
    res.status(200).json({
      success: true,
      message: `Bin ${updatedBin.binId} updated successfully to ${updatedBin.fillLevel}%`,
    });
  } else {
    res.status(404);
    throw new Error('Bin not found');
  }
});

/**
 * @desc    Get a single bin by its human-readable binId
 * @route   GET /api/bins/by-id/:binId
 * @access  Private
 */
export const getBinById = asyncHandler(async (req, res) => {
  const bin = await Bin.findOne({ binId: req.params.binId });
  if (bin) {
    res.json({ success: true, data: bin });
  } else {
    res.status(404);
    throw new Error('Bin not found with that ID');
  }
});

/**
 * @desc    Get all child bins for a given parent bin
 * @route   GET /api/bins/:id/children
 * @access  Private
 */
export const getChildBins = asyncHandler(async (req, res) => {
  // 1. Get the parent bin's MongoDB ID from the URL parameter.
  const parentId = req.params.id;

  if (!parentId) {
    res.status(400);
    throw new Error("Parent bin ID is required.");
  }

  // 2. Find all documents in the 'Bin' collection where the 'parentBin' field
  //    exactly matches the ID of the parent.
  const children = await Bin.find({ parentBin: parentId });

  // 3. This check is crucial.
  if (children) {
    res.json({ success: true, data: children });
  } else {
    // This case is unlikely but is good for robustness.
    res.json({ success: true, data: [] }); // Send an empty array if none are found.
  }
});



/**
 * @desc    Manually update the status of a child bin
 * @route   PUT /api/bins/:id/manual-update
 * @access  Private (Volunteer, Officer)
 */
export const updateManualStatus = asyncHandler(async (req, res) => {
  const { manualStatus } = req.body;
  const bin = await Bin.findById(req.params.id);

  if (bin && !bin.isSmartBin) {
    bin.manualStatus = manualStatus;
    bin.lastManualUpdate = Date.now();
    await bin.save();
    res.json({ success: true, message: 'Bin status updated manually.' });
  } else {
    res.status(404);
    throw new Error('Child bin not found or you cannot manually update a smart bin.');
  }
});

/**
 * @desc    Find the nearest available (not full) smart bin
 * @route   GET /api/bins/nearest-empty
 * @access  Private
 */
export const findNearestEmptyBin = asyncHandler(async (req, res) => {
  const { lng, lat } = req.query; // Get coordinates from the query string

  if (!lng || !lat) {
    res.status(400);
    throw new Error('Longitude and latitude are required.');
  }

  // Use MongoDB's geospatial query to find the nearest bin
  const nearestBin = await Bin.findOne({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: 5000, // Search within a 5km radius
      },
    },
    isSmartBin: true, // Only find other smart bins
    fillLevel: { $lt: 70 }, // Find a bin that is less than 70% full
  });

  if (nearestBin) {
    res.json({ success: true, data: nearestBin });
  } else {
    res.status(404).json({ success: false, message: 'No nearby empty bins found.' });
  }
});




