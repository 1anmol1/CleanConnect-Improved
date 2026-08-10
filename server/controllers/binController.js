import asyncHandler from 'express-async-handler';
import Bin from '../models/Bin.js';
import User from '../models/User.js'; // 1. Import the User model

/**
 * @desc    Create a new bin
 * @route   POST /api/bins
 * @access  Private (Officer)
 */
export const createBin = asyncHandler(async (req, res) => {
  const { binId, coordinates, area, isSmartBin, parentBin, category } = req.body;
  const city = req.user.city;

  const newBin = await Bin.create({
    binId,
    location: { type: 'Point', coordinates },
    city,
    area,
    isSmartBin,
    parentBin: parentBin || null,
    category: category || 'Waste',
  });
  res.status(201).json({ success: true, data: newBin });
});

/**
 * @desc    Get all bins AND live vehicle locations for the user's city
 * @route   GET /api/bins
 * @access  Private
 */
export const getAllBins = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.city) {
    res.status(400);
    throw new Error('User city not found. Cannot fetch data.');
  }

  const cityQuery = { city: req.user.city };

  // 2. Perform two database queries in parallel for maximum efficiency
  const [bins, vehicles] = await Promise.all([
    // First query: Get all bins in the user's city
    Bin.find(cityQuery),

    // Second query: Get all active workers (vehicles) in the user's city
    User.find({
      role: 'Worker',
      city: req.user.city,
      liveLocation: { $exists: true }, // Only find workers who have a location
      updatedAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // Active in the last 15 minutes
    }).select('name liveLocation') // Only select the data we need
  ]);

  // 3. Send back a combined payload with both bins and vehicles
  res.status(200).json({
    success: true,
    data: {
      bins: bins,
      vehicles: vehicles
    }
  });
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
    city: req.user.city
  }).limit(10);
  res.json({ success: true, data: bins });
});

/**
 * @desc    Update a bin's fill level from an IoT device
 * @route   PUT /api/bins/:binId/update
 * @access  Private (Device Only)
 */
export const updateBinFillLevel = asyncHandler(async (req, res) => {
  const { fillLevel } = req.body;
  const { binId } = req.params;

  const bin = await Bin.findOne({ binId: binId });

  if (bin) {
    bin.fillLevel = fillLevel;

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
  const parentId = req.params.id;
  if (!parentId) {
    res.status(400);
    throw new Error("Parent bin ID is required.");
  }
  const children = await Bin.find({ parentBin: parentId });
  res.json({ success: true, data: children });
});

/**
 * @desc    Manually update the status of a child bin
 * @route   PUT /api/bins/:id/manual-update
 * @access  Private (Volunteer, Officer)
 */
export const updateManualStatus = asyncHandler(async (req, res) => {
  const { manualFillLevel } = req.body;
  const bin = await Bin.findById(req.params.id);

  if (bin && !bin.isSmartBin) {
    bin.manualFillLevel = manualFillLevel;
    // Update status based on fill level
    if (manualFillLevel >= 95) bin.status = 'Overflow';
    else if (manualFillLevel >= 90) bin.status = 'Full';
    else if (manualFillLevel >= 70) bin.status = 'Half-Full';
    else bin.status = 'Empty';
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
  const { lng, lat } = req.query;

  if (!lng || !lat) {
    res.status(400);
    throw new Error('Longitude and latitude are required.');
  }

  const nearestBin = await Bin.findOne({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: 5000,
      },
    },
    isSmartBin: true,
    fillLevel: { $lt: 70 },
  });

  if (nearestBin) {
    res.json({ success: true, data: nearestBin });
  } else {
    res.status(404).json({ success: false, message: 'No nearby empty bins found.' });
  }
});