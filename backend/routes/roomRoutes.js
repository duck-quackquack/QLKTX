import express from 'express';
import {
  getRooms,
  getRoomsByBuilding,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  addBed,
  updateBedStatus,
  deleteBed,
  getAvailableBeds,
} from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/available-beds', getAvailableBeds);
router.get('/building/:buildingId', getRoomsByBuilding);
router.get('/:id', getRoomById);
router.get('/', getRooms);

router.post('/', authorize(1, 2), createRoom);
router.put('/:id', authorize(1, 2), updateRoom);
router.delete('/:id', authorize(1), deleteRoom);

router.post('/:roomId/beds', authorize(1, 2), addBed);
router.put('/beds/:bedId/status', authorize(1, 2), updateBedStatus);
router.delete('/beds/:bedId', authorize(1), deleteBed);

export default router;

