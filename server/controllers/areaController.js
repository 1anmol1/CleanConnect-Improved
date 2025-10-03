import Area from '../models/Area.js';

export const getCities = async (req, res) => {
    try {
        const cities = await Area.distinct('city');
        res.status(200).json({ success: true, data: cities });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

export const getAreasByCity = async (req, res) => {
    try {
        const areas = await Area.find({ city: req.params.city }).select('name');
        res.status(200).json({ success: true, data: areas.map(a => a.name) });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

export const searchAreas = async (req, res) => {
    const { term } = req.query;
    if (!term || term.length < 3) {
        return res.status(400).json({ error: 'Search term must be at least 3 characters long.' });
    }

    try {
        const areas = await Area.find({
            $or: [
                { name: { $regex: `^${term}`, $options: 'i' } },
                { city: { $regex: `^${term}`, $options: 'i' } }
            ]
        }).limit(10);

        const formattedResults = areas.map(a => `${a.name}, ${a.city}`);
        res.status(200).json({ success: true, data: formattedResults });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};