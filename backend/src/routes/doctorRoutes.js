import { Router } from 'express';
import { getAllDoctors, getDoctorById, getDepartments, } from '../controllers/doctorController.js';
const router = Router();
router.get('/', getAllDoctors);
router.get('/meta/departments', getDepartments);
router.get('/:id', getDoctorById);
export default router;
