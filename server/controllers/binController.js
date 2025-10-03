import Bin from '../models/Bin.js';

// @desc    Create a new bin
// @route   POST /api/bins
// @access  Protected (Officer)
export const createBin = async (req, res) => {
  const { binId, coordinates, area } = req.body;
  const city = req.user.city; // Officer's city

  try {
    const newBin = await Bin.create({
      binId,
      location: { type: 'Point', coordinates },
      city,
      area,
    });
    res.status(201).json({ success: true, data: newBin });
  } catch (error) {
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

// @desc    Get all bins, filtered by city for officers/workers
// @route   GET /api/bins
// @access  Protected
export const getAllBins = async (req, res) => {
  try {
    let query = {};
    // If the user is an officer or worker, only show bins in their city
    if (req.user.role === 'Officer' || req.user.role === 'Worker') {
      query.city = req.user.city;
    }
    const bins = await Bin.find(query);
    res.status(200).json({ success: true, count: bins.length, data: bins });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Search for bins by binId (for autocomplete)
// @route   GET /api/bins/search
// @access  Protected
export const searchBins = async (req, res) => {
    const { term } = req.query;
    try {
        const bins = await Bin.find({ 
            binId: { $regex: term, $options: 'i' },
            city: req.user.city // Search within user's city
        }).limit(10);
        res.json({ success: true, data: bins });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};