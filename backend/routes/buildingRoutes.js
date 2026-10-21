import express from 'express';
import {
  getBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from '../controllers/buildingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getBuildings);
router.get('/:id', getBuildingById);
router.post('/', authorize(1, 2), createBuilding);
router.put('/:id', authorize(1, 2), updateBuilding);
router.delete('/:id', authorize(1), deleteBuilding);

export default router;

