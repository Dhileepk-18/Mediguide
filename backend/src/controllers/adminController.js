import { z } from 'zod';
import { dbStore } from '../store/inMemoryStore.js';
import bcrypt from 'bcryptjs';
export const getSystemStats = async (_req, res) => {
    const users = dbStore.users;
    const doctors = dbStore.doctors;
    const appointments = dbStore.appointments;
    const prescriptions = dbStore.prescriptions;
    const symptomChecks = dbStore.symptomChecks;
    const chatHistories = dbStore.chatHistories;
    const totalPatients = users.filter(u => u.role === 'patient').length;
    const activeDoctors = doctors.filter(d => d.isAvailable).length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const pendingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
    res.json({
        success: true,
        stats: {
            totalUsers: users.length,
            totalPatients,
            totalDoctors: doctors.length,
            activeDoctors,
            totalAppointments: appointments.length,
            completedAppointments,
            pendingAppointments,
            totalPrescriptions: prescriptions.length,
            totalSymptomChecks: symptomChecks.length,
            totalAiChatSessions: chatHistories.length,
            systemStatus: 'Operational - 99.98% Uptime',
            lastDataSync: new Date().toISOString(),
        },
    });
};
export const getAllUsers = async (req, res) => {
    const { role, status, search } = req.query;
    let users = dbStore.users.map(u => {
        const { password: _, ...clean } = u;
        return clean;
    });
    if (role && typeof role === 'string' && role !== 'all') {
        users = users.filter(u => u.role === role);
    }
    if (status && typeof status === 'string' && status !== 'all') {
        users = users.filter(u => u.status === status);
    }
    if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    res.json({ success: true, users });
};
export const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status, role } = req.body;
    const updates = {};
    if (status && ['active', 'suspended'].includes(status))
        updates.status = status;
    if (role && ['patient', 'doctor', 'admin'].includes(role))
        updates.role = role;
    const updated = dbStore.updateUser(id, updates);
    if (!updated) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    const { password: _, ...clean } = updated;
    res.json({ success: true, message: 'User updated successfully', user: clean });
};
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    const deleted = dbStore.deleteUser(id);
    if (!deleted) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    res.json({ success: true, message: 'User deleted from system' });
};
const doctorSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    specialization: z.string().min(2, 'Specialization is required'),
    department: z.string().min(2, 'Department is required'),
    qualification: z.string().min(2, 'Qualification is required'),
    experienceYears: z.number().min(0),
    hospital: z.string().min(2, 'Hospital is required'),
    consultationFee: z.number().min(0),
    bio: z.string().min(10, 'Bio is required'),
});
export const addDoctorByAdmin = async (req, res) => {
    try {
        const data = doctorSchema.parse(req.body);
        const existing = dbStore.findUserByEmail(data.email);
        if (existing) {
            res.status(400).json({ success: false, message: 'A user with this email already exists' });
            return;
        }
        const docId = `doc-${Date.now()}`;
        const userId = `usr-doc-${Date.now()}`;
        const hashedPassword = await bcrypt.hash('password123', 10);
        dbStore.addUser({
            id: userId,
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: 'doctor',
            phone: '+1 (555) 000-1122',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
            status: 'active',
            doctorId: docId,
            createdAt: new Date().toISOString(),
        });
        const newDoctor = {
            id: docId,
            userId,
            name: data.name,
            email: data.email,
            specialization: data.specialization,
            department: data.department,
            qualification: data.qualification,
            experienceYears: data.experienceYears,
            rating: 5.0,
            reviewCount: 1,
            hospital: data.hospital,
            consultationFee: data.consultationFee,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
            bio: data.bio,
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            availableTimeSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
            isAvailable: true,
        };
        const savedDoc = dbStore.addDoctor(newDoctor);
        res.status(201).json({
            success: true,
            message: 'Doctor account created and credentialed',
            doctor: savedDoc,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: error.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to create doctor account' });
    }
};
export const toggleDoctorAvailability = async (req, res) => {
    const { id } = req.params;
    const doc = dbStore.findDoctorById(id);
    if (!doc) {
        res.status(404).json({ success: false, message: 'Doctor not found' });
        return;
    }
    doc.isAvailable = !doc.isAvailable;
    res.json({
        success: true,
        message: `Doctor status updated to ${doc.isAvailable ? 'Available' : 'Unavailable'}`,
        doctor: doc,
    });
};
