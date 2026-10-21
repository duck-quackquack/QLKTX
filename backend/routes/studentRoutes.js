import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getActiveStaying,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize(1, 2), getStudents);
router.get('/active-staying', authorize(1, 2), getActiveStaying);
router.get('/:id', getStudentById);
router.post('/', authorize(1, 2), createStudent);
router.put('/:id', authorize(1, 2), updateStudent);
router.delete('/:id', authorize(1), deleteStudent);

export default router;

