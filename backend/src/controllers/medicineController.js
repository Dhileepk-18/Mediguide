import { z } from 'zod';
import { dbStore } from '../store/inMemoryStore.js';
const medicineSchema = z.object({
    name: z.string().min(2, 'Medicine name is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    timings: z.array(z.string()).min(1, 'At least one reminder time is required'),
    instructions: z.string().default('Take with water after meals'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});
export const getMedicines = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
    }
    const patientId = req.query.patientId && typeof req.query.patientId === 'string' ? req.query.patientId : req.user.id;
    const medicines = dbStore.getMedicinesByPatientId(patientId);
    res.json({ success: true, medicines });
};
export const addMedicine = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const data = medicineSchema.parse(req.body);
        const newMedicine = {
            id: `med-${Date.now()}`,
            patientId: req.user.id,
            name: data.name,
            dosage: data.dosage,
            frequency: data.frequency,
            timings: data.timings,
            instructions: data.instructions,
            startDate: data.startDate || new Date().toISOString().split('T')[0],
            endDate: data.endDate,
            isActive: true,
            adherenceHistory: [],
            createdAt: new Date().toISOString(),
        };
        const saved = dbStore.addMedicine(newMedicine);
        res.status(201).json({ success: true, message: 'Medicine reminder added', medicine: saved });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: error.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to add medicine' });
    }
};
export const updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = dbStore.updateMedicine(id, req.body);
        if (!updated) {
            res.status(404).json({ success: false, message: 'Medicine not found' });
            return;
        }
        res.json({ success: true, message: 'Medicine updated', medicine: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update medicine' });
    }
};
export const deleteMedicine = async (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deleteMedicine(id);
    if (!deleted) {
        res.status(404).json({ success: false, message: 'Medicine not found' });
        return;
    }
    res.json({ success: true, message: 'Medicine reminder deleted' });
};
export const logAdherence = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, timeSlot, taken } = req.body;
        const medicine = dbStore.findMedicineById(id);
        if (!medicine) {
            res.status(404).json({ success: false, message: 'Medicine not found' });
            return;
        }
        // Check if entry for this date and timeSlot exists
        const existingIndex = medicine.adherenceHistory.findIndex(a => a.date === date && a.timeSlot === timeSlot);
        if (existingIndex >= 0) {
            medicine.adherenceHistory[existingIndex].taken = taken;
            medicine.adherenceHistory[existingIndex].loggedAt = new Date().toISOString();
        }
        else {
            medicine.adherenceHistory.push({
                date: date || new Date().toISOString().split('T')[0],
                timeSlot: timeSlot || '08:00 AM',
                taken: Boolean(taken),
                loggedAt: new Date().toISOString(),
            });
        }
        res.json({ success: true, message: 'Adherence logged', medicine });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to log adherence' });
    }
};
