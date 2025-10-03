import Bin from '../models/Bin.js';
import Route from '../models/Route.js';
import { getOptimalRoute } from '../services/aiService.js';

export const getMyTodaysRoute = async (req, res) => {
  const workerId = req.user.id;
  const city = req.user.city;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    let routeDoc = await Route.findOne({ workerId, date: today, city });

    if (!routeDoc) {
      const binsToCollect = await Bin.find({ city, status: { $in: ['Full', 'Overflow'] } });
      if (binsToCollect.length === 0) {
        return res.status(200).json({ success: true, message: "No bins to collect today.", data: [] });
      }
      
      const simplifiedBins = binsToCollect.map(b => ({
          binId: b.binId,
          location: { lat: b.location.coordinates[1], lng: b.location.coordinates[0] }
      }));

      const startPoint = { lat: simplifiedBins[0].location.lat, lon: simplifiedBins[0].location.lng };
      const optimalOrder = await getOptimalRoute(simplifiedBins, startPoint);
      const orderedBins = optimalOrder.map(binId => binsToCollect.find(b => b.binId === binId)).filter(Boolean);

      routeDoc = await Route.create({ workerId, date: today, city, route: orderedBins });
    }

    res.status(200).json({ success: true, data: routeDoc.route });
  } catch (error) {
    res.status(500).json({ error: 'Server Error generating route: ' + error.message });
  }
};