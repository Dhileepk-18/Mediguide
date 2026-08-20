import { Router } from 'express';
import { getHealthRecords, addHealthRecord, deleteHealthRecord, } from '../controllers/healthRecordController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
router.use(authenticateToken);
router.get('/', getHealthRecords);
router.post('/', addHealthRecord);
router.delete('/:id', deleteHealthRecord);
export default router;
