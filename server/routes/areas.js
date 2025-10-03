import express from 'express';
import { getCities, getAreasByCity, searchAreas } from '../controllers/areaController.js';

const router = express.Router();

router.get('/search', searchAreas);
router.get('/cities', getCities);
router.get('/:city', getAreasByCity);

export default router;