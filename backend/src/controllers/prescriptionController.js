import { z } from 'zod';
import { dbStore } from '../store/inMemoryStore.js';
const prescribedMedicineSchema = z.object({
    name: z.string().min(1, 'Medicine name required'),
    dosage: z.string().min(1, 'Dosage required'),
    frequency: z.string().min(1, 'Frequency required'),
    duration: z.string().min(1, 'Duration required'),
    instructions: z.string().default('Take as instructed by physician'),
});
const createPrescriptionSchema = z.object({
    patientId: z.string().min(1, 'Patient is required'),
    appointmentId: z.string().optional(),
    diagnosis: z.string().min(3, 'Clinical diagnosis is required'),
    medicines: z.array(prescribedMedicineSchema).min(1, 'At least one medicine is required'),
    generalAdvice: z.string().optional(),
    followUpDate: z.string().optional(),
});
export const createPrescription = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'doctor') {
            res.status(403).json({ success: false, message: 'Only authorized doctors can create prescriptions' });
            return;
        }
        const data = createPrescriptionSchema.parse(req.body);
        const patient = dbStore.findUserById(data.patientId);
        if (!patient) {
            res.status(404).json({ success: false, message: 'Patient not found' });
            return;
        }
        const doctorProfile = dbStore.findDoctorById(req.user.id) || dbStore.getAllDoctors().find(d => d.userId === req.user?.id);
        const doctorName = doctorProfile ? doctorProfile.name : req.user.name;
        const doctorSpecialization = doctorProfile ? doctorProfile.specialization : 'Medical Practitioner';
        const doctorHospital = doctorProfile ? doctorProfile.hospital : 'MediGuide Health Center';
        const prescriptionId = `rx-${Date.now()}`;
        const newPrescription = {
            id: prescriptionId,
            appointmentId: data.appointmentId,
            patientId: patient.id,
            patientName: patient.name,
            patientAge: patient.age,
            patientGender: patient.gender,
            doctorId: doctorProfile ? doctorProfile.id : req.user.id,
            doctorName,
            doctorSpecialization,
            doctorHospital,
            date: new Date().toISOString().split('T')[0],
            diagnosis: data.diagnosis,
            medicines: data.medicines,
            generalAdvice: data.generalAdvice,
            followUpDate: data.followUpDate,
            digitalSignature: `Digitally Verified by ${doctorName} (Reg #MG-${Date.now().toString().slice(-5)})`,
            createdAt: new Date().toISOString(),
        };
        const saved = dbStore.addPrescription(newPrescription);
        // If linked to appointment, mark appointment completed and link prescription
        if (data.appointmentId) {
            dbStore.updateAppointment(data.appointmentId, {
                status: 'completed',
                prescriptionId: saved.id,
            });
        }
        // Auto-add medicines to patient's active medicine list
        for (const med of data.medicines) {
            dbStore.addMedicine({
                id: `med-auto-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                patientId: patient.id,
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                timings: med.frequency.toLowerCase().includes('twice') ? ['09:00 AM', '09:00 PM'] : ['09:00 AM'],
                instructions: med.instructions,
                startDate: new Date().toISOString().split('T')[0],
                isActive: true,
                adherenceHistory: [],
                createdAt: new Date().toISOString(),
            });
        }
        res.status(201).json({
            success: true,
            message: 'Prescription created and medicines synced to patient tracker',
            prescription: saved,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: error.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to create prescription' });
    }
};
export const getMyPrescriptions = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
    }
    let prescriptions = [];
    if (req.user.role === 'patient') {
        prescriptions = dbStore.getPrescriptionsByPatientId(req.user.id);
    }
    else if (req.user.role === 'doctor') {
        const doc = dbStore.findDoctorById(req.user.id) || dbStore.getAllDoctors().find(d => d.userId === req.user?.id);
        const docId = doc ? doc.id : 'doc-1';
        prescriptions = dbStore.getPrescriptionsByDoctorId(docId);
    }
    else {
        prescriptions = dbStore.prescriptions;
    }
    res.json({ success: true, prescriptions });
};
export const getPrescriptionById = async (req, res) => {
    const { id } = req.params;
    const prescription = dbStore.findPrescriptionById(id);
    if (!prescription) {
        res.status(404).json({ success: false, message: 'Prescription not found' });
        return;
    }
    res.json({ success: true, prescription });
};
