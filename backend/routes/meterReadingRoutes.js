import express from 'express';
import {
  getMeterReadings,
  getMeterReadingById,
  getPreviousReading,
  recordMeterReading,
} from '../controllers/meterReadingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/previous', getPreviousReading);
router.get('/:id', getMeterReadingById);
router.get('/', getMeterReadings);

router.post('/', authorize(1, 2), recordMeterReading);

export default router;

