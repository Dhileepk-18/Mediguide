import { Router } from 'express';
import { getAllDoctors, getDoctorById, getDepartments, getMyPatients } from '../controllers/doctorController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
const router = Router();
router.get('/', getAllDoctors);
router.get('/meta/departments', getDepartments);
router.get('/my-patients', authenticateToken, requireRoles(['doctor', 'admin']), getMyPatients);
router.get('/:id', getDoctorById);
export default router;
