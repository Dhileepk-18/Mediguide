import { Router } from 'express';
import {
  getSystemStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  addDoctorByAdmin,
  approveDoctor,
  suspendDoctor,
  toggleDoctorAvailability,
  getAllAdminAppointments,
  getSystemSettings,
  updateSystemSettings,
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole(['admin']));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.post('/doctors', addDoctorByAdmin);
router.patch('/doctors/:id/approve', approveDoctor);
router.patch('/doctors/:id/suspend', suspendDoctor);
router.patch('/doctors/:id/availability', toggleDoctorAvailability);

router.get('/appointments', getAllAdminAppointments);
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

export default router;
