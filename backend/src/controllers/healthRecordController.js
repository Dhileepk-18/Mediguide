import { z } from 'zod';
import { dbStore } from '../store/inMemoryStore.js';
const recordSchema = z.object({
    title: z.string().min(2, 'Record title is required'),
    category: z.enum(['Lab Report', 'Prescription', 'Imaging / X-Ray', 'Vaccination', 'Discharge Summary', 'General']),
    recordDate: z.string(),
    doctorName: z.string().optional(),
    facility: z.string().optional(),
    fileUrl: z.string().default(''),
    fileName: z.string().default('document.pdf'),
    fileSize: z.string().default('1.0 MB'),
    fileType: z.string().default('application/pdf'),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
});
export const getHealthRecords = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
    }
    const patientId = req.query.patientId && typeof req.query.patientId === 'string' ? req.query.patientId : req.user.id;
    const records = dbStore.getHealthRecordsByPatientId(patientId);
    res.json({ success: true, records });
};
export const addHealthRecord = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const data = recordSchema.parse(req.body);
        const newRecord = {
            id: `rec-${Date.now()}`,
            patientId: req.user.id,
            title: data.title,
            category: data.category,
            recordDate: data.recordDate || new Date().toISOString().split('T')[0],
            doctorName: data.doctorName || 'Dr. Self Upload',
            facility: data.facility || 'MediGuide Digital Vault',
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileSize: data.fileSize,
            fileType: data.fileType,
            summary: data.summary || 'Uploaded medical record document.',
            tags: data.tags || [data.category],
            createdAt: new Date().toISOString(),
        };
        const saved = dbStore.addHealthRecord(newRecord);
        res.status(201).json({ success: true, message: 'Health record uploaded successfully', record: saved });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: error.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to save health record' });
    }
};
export const deleteHealthRecord = async (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deleteHealthRecord(id);
    if (!deleted) {
        res.status(404).json({ success: false, message: 'Health record not found' });
        return;
    }
    res.json({ success: true, message: 'Health record deleted' });
};
