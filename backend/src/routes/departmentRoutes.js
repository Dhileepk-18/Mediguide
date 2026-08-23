import { Router } from 'express';
import { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);
router.post('/', requireAuth, createDepartment);
router.put('/:id', requireAuth, updateDepartment);
router.delete('/:id', requireAuth, deleteDepartment);

export default router;
