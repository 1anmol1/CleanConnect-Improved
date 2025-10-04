import asyncHandler from 'express-async-handler';
import Area from '../models/Area.js'; // Ensure this is the correct path to your Area model

// @desc    Get a list of all unique cities
// @route   GET /api/areas/cities
// @access  Public
export const getAllCities = asyncHandler(async (req, res) => {
  // Find all distinct city values in the Area collection
  const cities = await Area.distinct('city');
  res.json({ success: true, data: cities });
});

// @desc    Search for areas by a search term
// @route   GET /api/areas/search
// @access  Public
export const searchAreas = asyncHandler(async (req, res) => {
  const { term } = req.query;
  const areas = await Area.find({ name: { $regex: term, $options: 'i' } }).limit(5);
  // Format for datalist
  const suggestions = areas.map(area => `${area.name}, ${area.city}`);
  res.json({ success: true, data: suggestions });
});


// --- THE NEW FUNCTION ---
// @desc    Get all areas for a specific city
// @route   GET /api/areas/:city
// @access  Private
export const getAreasByCity = asyncHandler(async (req, res) => {
    // The city name is taken from the URL parameter (e.g., 'Pune')
    const city = req.params.city;

    // Find all documents in the 'areas' collection that match the city
    const areas = await Area.find({ city: city });

    if (areas) {
        res.json({ success: true, data: areas });
    } else {
        res.status(404);
        throw new Error('No areas found for this city');
    }
});