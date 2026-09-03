import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  getMyPatients,
  getDoctorSchedule,
  updateDoctorSchedule,
  updateDoctorProfile,
} from '../controllers/doctorController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getDoctors);
router.get('/my-patients', requireAuth, getMyPatients);
router.get('/schedule/me', requireAuth, getDoctorSchedule);
router.put('/schedule/me', requireAuth, updateDoctorSchedule);
router.put('/profile/me', requireAuth, updateDoctorProfile);
router.get('/:id', getDoctorById);

export default router;
