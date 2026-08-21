import { z } from 'zod';
import { dbStore } from '../store/inMemoryStore.js';
const createAppointmentSchema = z.object({
    doctorId: z.string().min(1, 'Doctor is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    timeSlot: z.string().min(1, 'Time slot is required'),
    reason: z.string().min(3, 'Please provide a reason for the consultation'),
    symptoms: z.array(z.string()).optional(),
    notes: z.string().optional(),
});
export const createAppointment = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const data = createAppointmentSchema.parse(req.body);
        const doctor = dbStore.findDoctorById(data.doctorId);
        if (!doctor) {
            res.status(404).json({ success: false, message: 'Selected doctor not found' });
            return;
        }
        // Double booking prevention: Check if doctor already has an active appointment at that time
        const existingBooking = dbStore.getAppointments().find(a => 
            a.doctorId === doctor.id && 
            a.date === data.date && 
            a.timeSlot === data.timeSlot && 
            ['confirmed', 'pending'].includes(a.status)
        );
        if (existingBooking) {
            res.status(400).json({ 
                success: false, 
                message: `This time slot (${data.timeSlot} on ${data.date}) is already booked with ${doctor.name}. Please select a different time slot.` 
            });
            return;
        }
        const newAppointment = {
            id: `apt-${Date.now()}`,
            patientId: req.user.id,
            patientName: req.user.name,
            patientEmail: req.user.email,
            patientPhone: req.user.phone,
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorSpecialization: doctor.specialization,
            doctorAvatar: doctor.avatar,
            department: doctor.department,
            date: data.date,
            timeSlot: data.timeSlot,
            status: 'confirmed', // Instant confirmation
            reason: data.reason,
            symptoms: data.symptoms || [],
            notes: data.notes,
            createdAt: new Date().toISOString(),
        };
        const saved = dbStore.addAppointment(newAppointment);
        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            appointment: saved,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: error.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to book appointment' });
    }
};
export const getMyAppointments = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
    }
    let appointments = [];
    if (req.user.role === 'patient') {
        appointments = dbStore.getAppointmentsByPatientId(req.user.id);
    }
    else if (req.user.role === 'doctor') {
        const doc = dbStore.findDoctorById(req.user.id) || 
                    dbStore.getAllDoctors().find(d => d.userId === req.user?.id || d.email === req.user?.email);
        if (doc) {
            appointments = dbStore.getAppointmentsByDoctorId(doc.id);
        } else {
            appointments = [];
        }
    }
    else if (req.user.role === 'admin') {
        appointments = dbStore.getAppointments();
    }
    res.json({ success: true, appointments });
};
export const getAppointmentById = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
    }
    const { id } = req.params;
    const appointment = dbStore.findAppointmentById(id);
    if (!appointment) {
        res.status(404).json({ success: false, message: 'Appointment not found' });
        return;
    }
    // Strict IDOR prevention
    const isOwnerPatient = appointment.patientId === req.user.id;
    const doctorProfile = dbStore.findDoctorById(req.user.id) || 
                          dbStore.getAllDoctors().find(d => d.userId === req.user?.id || d.email === req.user?.email);
    const isAssignedDoctor = doctorProfile && appointment.doctorId === doctorProfile.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwnerPatient && !isAssignedDoctor && !isAdmin) {
        res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to view this appointment' });
        return;
    }
    res.json({ success: true, appointment });
};
export const updateAppointmentStatus = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const { id } = req.params;
        const { status, notes, prescriptionId } = req.body;
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (status && !validStatuses.includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid status' });
            return;
        }
        const appointment = dbStore.findAppointmentById(id);
        if (!appointment) {
            res.status(404).json({ success: false, message: 'Appointment not found' });
            return;
        }

        const isOwnerPatient = appointment.patientId === req.user.id;
        const doctorProfile = dbStore.findDoctorById(req.user.id) || 
                              dbStore.getAllDoctors().find(d => d.userId === req.user?.id || d.email === req.user?.email);
        const isAssignedDoctor = doctorProfile && appointment.doctorId === doctorProfile.id;
        const isAdmin = req.user.role === 'admin';

        // Authorization check: Patients can only cancel their own appointment
        if (isOwnerPatient && !isAssignedDoctor && !isAdmin) {
            if (status && status !== 'cancelled') {
                res.status(403).json({ success: false, message: 'Patients can only cancel their own appointments' });
                return;
            }
        } else if (!isAssignedDoctor && !isAdmin) {
            res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to modify this appointment' });
            return;
        }

        const updates = {};
        if (status)
            updates.status = status;
        if (notes !== undefined)
            updates.notes = notes;
        if (prescriptionId !== undefined)
            updates.prescriptionId = prescriptionId;
        const updated = dbStore.updateAppointment(id, updates);
        if (!updated) {
            res.status(404).json({ success: false, message: 'Appointment not found' });
            return;
        }
        res.json({
            success: true,
            message: `Appointment updated to ${updated.status}`,
            appointment: updated,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update appointment' });
    }
};
