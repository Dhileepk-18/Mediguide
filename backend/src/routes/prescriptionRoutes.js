import { Router } from 'express';
import { createPrescription, getMyPrescriptions, getPrescriptionById, } from '../controllers/prescriptionController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
router.use(authenticateToken);
router.post('/', createPrescription);
router.get('/my', getMyPrescriptions);
router.get('/:id', getPrescriptionById);
export default router;
