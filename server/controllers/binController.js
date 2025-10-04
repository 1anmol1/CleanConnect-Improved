import asyncHandler from 'express-async-handler';
import Bin from '../models/Bin.js';

// @desc    Create a new bin
// @route   POST /api/bins
// @access  Protected (Officer)
export const createBin = asyncHandler(async (req, res) => {
  const { binId, coordinates, area } = req.body;
  const city = req.user.city; // Get city from the logged-in officer

  const newBin = await Bin.create({
    binId,
    location: { type: 'Point', coordinates },
    city,
    area,
  });
  res.status(201).json({ success: true, data: newBin });
});

// @desc    Get all bins, filtered by city for relevant users
// @route   GET /api/bins
// @access  Protected
export const getAllBins = asyncHandler(async (req, res) => {
  let query = {};
  // Users only see bins in their own city
  if (req.user.role === 'Officer' || req.user.role === 'Worker' || req.user.role === 'Citizen') {
    query.city = req.user.city;
  }
  const bins = await Bin.find(query);
  res.status(200).json({ success: true, count: bins.length, data: bins });
});

// @desc    Search for bins by binId (for autocomplete)
// @route   GET /api/bins/search
// @access  Protected
export const searchBins = asyncHandler(async (req, res) => {
    const { term } = req.query;
    const bins = await Bin.find({ 
        binId: { $regex: term, $options: 'i' },
        city: req.user.city // Search only within the user's city
    }).limit(10);
    res.json({ success: true, data: bins });
});


// --- THE NEW FUNCTION FOR YOUR ESP32 ---

// @desc    Update a bin's fill level from an IoT device
// @route   PUT /api/bins/:binId/update
// @access  Private (Device Only, via API Key)
export const updateBinFillLevel = asyncHandler(async (req, res) => {
  // Get the fill level from the JSON body sent by the ESP32
  const { fillLevel } = req.body;
  
  // Get the bin's ID from the URL (e.g., 'PUNE-KTD-01')
  const { binId } = req.params;

  // Find the bin in the database using its human-readable ID
  const bin = await Bin.findOne({ binId: binId });

  if (bin) {
    // Update the bin's properties in the database
    bin.fillLevel = fillLevel;
    
    // Automatically update the status based on the new fill level
    if (fillLevel >= 90) {
      bin.status = 'Full';
    } else if (fillLevel >= 70) {
      bin.status = 'Half-Full';
    } else {
      bin.status = 'Empty';
    }
    
    const updatedBin = await bin.save();
    
    // Send a success response back to the ESP32
    res.status(200).json({
      success: true,
      message: `Bin ${updatedBin.binId} updated successfully to ${updatedBin.fillLevel}%`,
    });
  } else {
    // If no bin is found with that ID, send a 404 error
    res.status(404);
    throw new Error('Bin not found');
  }
});