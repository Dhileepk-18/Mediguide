import { z } from 'zod';
import { dbStore } from '../store/inMemoryStore.js';

const departmentSchema = z.object({
    name: z.string().min(2, 'Department name is required'),
    code: z.string().min(2, 'Department code is required'),
    icon: z.string().default('Stethoscope'),
    description: z.string().min(10, 'Description is required'),
    commonConditions: z.array(z.string()).default([]),
    headDoctor: z.string().optional(),
    isAvailable: z.boolean().default(true),
});

export const getAllDepartments = async (_req, res) => {
    try {
        const departments = dbStore.getDepartments();
        // Enrich with real-time doctor count for each department
        const doctors = dbStore.getAllDoctors();
        const enriched = departments.map(dept => {
            const count = doctors.filter(d => 
                d.department.toLowerCase() === dept.name.toLowerCase() ||
                d.department.toLowerCase().includes(dept.name.toLowerCase())
            ).length;
            return {
                ...dept,
                doctorCount: count > 0 ? count : dept.doctorCount || 1,
            };
        });
        res.json({ success: true, departments: enriched });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch medical departments' });
    }
};

export const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const dept = dbStore.findDepartmentById(id);
        if (!dept) {
            res.status(404).json({ success: false, message: 'Department not found' });
            return;
        }
        const doctors = dbStore.getAllDoctors().filter(d =>
            d.department.toLowerCase() === dept.name.toLowerCase() ||
            d.department.toLowerCase().includes(dept.name.toLowerCase())
        );
        res.json({ success: true, department: dept, doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch department details' });
    }
};

export const createDepartment = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Only administrators can add medical departments' });
            return;
        }
        const data = departmentSchema.parse(req.body);
        const newDept = {
            id: `dept-${Date.now()}`,
            ...data,
            doctorCount: 0,
        };
        const saved = dbStore.addDepartment(newDept);
        dbStore.addAuditLog({
            eventType: 'DEPARTMENT_CREATED',
            actorId: req.user.id,
            actorEmail: req.user.email,
            actorRole: 'admin',
            details: `Created new medical department: ${saved.name} (${saved.code})`,
        });
        res.status(201).json({ success: true, message: 'Medical department created', department: saved });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: error.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to create department' });
    }
};

export const updateDepartment = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Only administrators can modify medical departments' });
            return;
        }
        const { id } = req.params;
        const updated = dbStore.updateDepartment(id, req.body);
        if (!updated) {
            res.status(404).json({ success: false, message: 'Department not found' });
            return;
        }
        dbStore.addAuditLog({
            eventType: 'DEPARTMENT_UPDATED',
            actorId: req.user.id,
            actorEmail: req.user.email,
            actorRole: 'admin',
            details: `Updated medical department: ${updated.name}`,
        });
        res.json({ success: true, message: 'Department updated', department: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update department' });
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Only administrators can delete medical departments' });
            return;
        }
        const { id } = req.params;
        const dept = dbStore.findDepartmentById(id);
        const deleted = dbStore.deleteDepartment(id);
        if (!deleted) {
            res.status(404).json({ success: false, message: 'Department not found' });
            return;
        }
        dbStore.addAuditLog({
            eventType: 'DEPARTMENT_DELETED',
            actorId: req.user.id,
            actorEmail: req.user.email,
            actorRole: 'admin',
            details: `Deleted medical department: ${dept?.name || id}`,
        });
        res.json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete department' });
    }
};
