import bcrypt from 'bcryptjs';
// Pre-hashed default password 'password123'
const defaultHashedPassword = bcrypt.hashSync('password123', 10);
const defaultAdminHashedPassword = bcrypt.hashSync('admin123', 10);
export class DataStore {
    users = [];
    doctors = [];
    appointments = [];
    medicines = [];
    healthRecords = [];
    prescriptions = [];
    chatHistories = [];
    symptomChecks = [];
    constructor() {
        this.seedInitialData();
    }
    seedInitialData() {
        // 1. Users
        this.users = [
            {
                id: 'usr-patient-1',
                name: 'Sarah Johnson',
                email: 'patient@mediguide.com',
                password: defaultHashedPassword,
                role: 'patient',
                phone: '+1 (555) 234-5678',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                age: 28,
                gender: 'Female',
                bloodGroup: 'O+',
                allergies: [],
                chronicConditions: [],
                emergencyContact: '',
                createdAt: '2026-01-15T09:00:00Z',
            },
            {
                id: 'usr-patient-2',
                name: 'Michael Davis',
                email: 'michael.davis@example.com',
                password: defaultHashedPassword,
                role: 'patient',
                phone: '+1 (555) 345-6789',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                age: 45,
                gender: 'Male',
                bloodGroup: 'A+',
                allergies: ['Latex'],
                chronicConditions: ['Hypertension'],
                emergencyContact: 'Emma Davis (Spouse) - +1 (555) 987-6543',
                createdAt: '2026-02-10T10:30:00Z',
            },
            {
                id: 'usr-doc-1',
                name: 'Dr. John Smith',
                email: 'doctor.smith@mediguide.com',
                password: defaultHashedPassword,
                role: 'doctor',
                phone: '+1 (555) 432-1098',
                avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                doctorId: 'doc-1',
                createdAt: '2025-11-01T08:00:00Z',
            },
            {
                id: 'usr-doc-2',
                name: 'Dr. Emily Chen',
                email: 'doctor.chen@mediguide.com',
                password: defaultHashedPassword,
                role: 'doctor',
                phone: '+1 (555) 543-2109',
                avatar: 'https://images.unsplash.com/photo-1594824813598-a28a38ff13a2?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                doctorId: 'doc-2',
                createdAt: '2025-11-15T08:00:00Z',
            },
            {
                id: 'usr-doc-3',
                name: 'Dr. Aarav Patel',
                email: 'doctor.patel@mediguide.com',
                password: defaultHashedPassword,
                role: 'doctor',
                phone: '+1 (555) 654-3210',
                avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                doctorId: 'doc-3',
                createdAt: '2025-12-01T08:00:00Z',
            },
            {
                id: 'usr-doc-4',
                name: 'Dr. Sofia Rodriguez',
                email: 'doctor.rodriguez@mediguide.com',
                password: defaultHashedPassword,
                role: 'doctor',
                phone: '+1 (555) 765-4321',
                avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                doctorId: 'doc-4',
                createdAt: '2025-12-10T08:00:00Z',
            },
            {
                id: 'usr-doc-5',
                name: 'Dr. Marcus Taylor',
                email: 'doctor.taylor@mediguide.com',
                password: defaultHashedPassword,
                role: 'doctor',
                phone: '+1 (555) 876-5432',
                avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                doctorId: 'doc-5',
                createdAt: '2026-01-05T08:00:00Z',
            },
            {
                id: 'usr-doc-6',
                name: 'Dr. Chloe Kim',
                email: 'doctor.kim@mediguide.com',
                password: defaultHashedPassword,
                role: 'doctor',
                phone: '+1 (555) 987-6543',
                avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                doctorId: 'doc-6',
                createdAt: '2026-01-12T08:00:00Z',
            },
            {
                id: 'usr-admin-1',
                name: 'Alex Rivera (Admin)',
                email: 'admin@mediguide.com',
                password: defaultAdminHashedPassword,
                role: 'admin',
                phone: '+1 (555) 999-0000',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                createdAt: '2025-10-01T08:00:00Z',
            },
        ];
        // 2. Doctors
        this.doctors = [
            {
                id: 'doc-1',
                userId: 'usr-doc-1',
                name: 'Dr. John Smith',
                email: 'doctor.smith@mediguide.com',
                specialization: 'Internal Medicine Specialist',
                department: 'General Medicine',
                qualification: 'MBBS, MD (Internal Medicine), FACP',
                experienceYears: 12,
                rating: 4.9,
                reviewCount: 148,
                hospital: 'St. Jude Metropolitan Health Center',
                consultationFee: 75,
                avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
                bio: 'Compassionate senior physician specializing in comprehensive primary care, chronic illness management, and diagnostic investigations.',
                availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                availableTimeSlots: ['09:00 AM', '10:30 AM', '11:45 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
                isAvailable: true,
            },
            {
                id: 'doc-2',
                userId: 'usr-doc-2',
                name: 'Dr. Emily Chen',
                email: 'doctor.chen@mediguide.com',
                specialization: 'Cardiologist & Heart Specialist',
                department: 'Cardiology',
                qualification: 'MD, DM (Cardiology), FACC',
                experienceYears: 9,
                rating: 4.95,
                reviewCount: 182,
                hospital: 'Metro Heart & Vascular Institute',
                consultationFee: 120,
                avatar: 'https://images.unsplash.com/photo-1594824813598-a28a38ff13a2?w=200&auto=format&fit=crop&q=80',
                bio: 'Board-certified cardiologist focused on preventative cardiology, hypertension management, echocardiography, and arrhythmia care.',
                availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                availableTimeSlots: ['09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM'],
                isAvailable: true,
            },
            {
                id: 'doc-3',
                userId: 'usr-doc-3',
                name: 'Dr. Aarav Patel',
                email: 'doctor.patel@mediguide.com',
                specialization: 'Consultant Dermatologist',
                department: 'Dermatology',
                qualification: 'MBBS, MD (Dermatology & Venereology)',
                experienceYears: 7,
                rating: 4.85,
                reviewCount: 96,
                hospital: 'Skin & Wellness Clinic',
                consultationFee: 85,
                avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&auto=format&fit=crop&q=80',
                bio: 'Specialist in clinical and cosmetic dermatology, allergy management, eczema, acne solutions, and skin lesion analysis.',
                availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                availableTimeSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM', '05:30 PM'],
                isAvailable: true,
            },
            {
                id: 'doc-4',
                userId: 'usr-doc-4',
                name: 'Dr. Sofia Rodriguez',
                email: 'doctor.rodriguez@mediguide.com',
                specialization: 'Neurologist & Neurotherapist',
                department: 'Neurology',
                qualification: 'MD, PhD (Clinical Neurology)',
                experienceYears: 11,
                rating: 4.92,
                reviewCount: 114,
                hospital: 'Brain & Neuro Care Center',
                consultationFee: 130,
                avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
                bio: 'Expert in migraines, neuro-pathic headaches, sleep disorders, epilepsy, and neurological rehabilitation.',
                availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                availableTimeSlots: ['09:00 AM', '10:45 AM', '01:15 PM', '03:00 PM'],
                isAvailable: true,
            },
            {
                id: 'doc-5',
                userId: 'usr-doc-5',
                name: 'Dr. Marcus Taylor',
                email: 'doctor.taylor@mediguide.com',
                specialization: 'Orthopedic Surgeon',
                department: 'Orthopedics',
                qualification: 'MS (Orthopedics), MCh, FAAOS',
                experienceYears: 15,
                rating: 4.88,
                reviewCount: 160,
                hospital: 'Apex Joint & Spine Hospital',
                consultationFee: 110,
                avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80',
                bio: 'Orthopedic surgeon dedicated to sports injuries, joint preservation, arthritis care, and spinal health.',
                availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
                availableTimeSlots: ['08:30 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'],
                isAvailable: true,
            },
            {
                id: 'doc-6',
                userId: 'usr-doc-6',
                name: 'Dr. Chloe Kim',
                email: 'doctor.kim@mediguide.com',
                specialization: 'Consultant Pediatrician',
                department: 'Pediatrics',
                qualification: 'MD (Pediatrics), DCH, FAAP',
                experienceYears: 8,
                rating: 4.97,
                reviewCount: 135,
                hospital: "Blossom Children's Hospital",
                consultationFee: 80,
                avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=200&auto=format&fit=crop&q=80',
                bio: 'Gentle, experienced pediatric specialist handling newborn care, childhood immunizations, developmental milestones, and pediatric nutrition.',
                availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                availableTimeSlots: ['09:00 AM', '10:30 AM', '12:00 PM', '03:00 PM', '04:30 PM'],
                isAvailable: true,
            },
        ];
        // 3. Appointments - Clean Slate
        this.appointments = [];

        // 4. Medicines - Clean Slate
        this.medicines = [];

        // 5. Health Records - Clean Slate
        this.healthRecords = [];

        // 6. Prescriptions - Clean Slate
        this.prescriptions = [];

        // 7. Chat Histories - Clean Slate
        this.chatHistories = [];

        // 8. Symptom Check Results - Clean Slate
        this.symptomChecks = [];
    }
    // --- User methods ---
    findUserByEmail(email) {
        return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
    findUserById(id) {
        return this.users.find(u => u.id === id);
    }
    addUser(user) {
        this.users.push(user);
        return user;
    }
    updateUser(id, updates) {
        const user = this.findUserById(id);
        if (!user)
            return undefined;
        Object.assign(user, updates);
        return user;
    }
    deleteUser(id) {
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1)
            return false;
        this.users.splice(index, 1);
        return true;
    }
    // --- Doctor methods ---
    getAllDoctors() {
        return this.doctors;
    }
    findDoctorById(id) {
        return this.doctors.find(d => d.id === id || d.userId === id);
    }
    addDoctor(doctor) {
        this.doctors.push(doctor);
        return doctor;
    }
    updateDoctor(id, updates) {
        const doc = this.findDoctorById(id);
        if (!doc)
            return undefined;
        Object.assign(doc, updates);
        return doc;
    }
    // --- Appointment methods ---
    getAppointments() {
        return this.appointments;
    }
    getAppointmentsByPatientId(patientId) {
        return this.appointments.filter(a => a.patientId === patientId);
    }
    getAppointmentsByDoctorId(doctorId) {
        return this.appointments.filter(a => a.doctorId === doctorId);
    }
    findAppointmentById(id) {
        return this.appointments.find(a => a.id === id);
    }
    addAppointment(apt) {
        this.appointments.unshift(apt);
        return apt;
    }
    updateAppointment(id, updates) {
        const apt = this.findAppointmentById(id);
        if (!apt)
            return undefined;
        Object.assign(apt, updates);
        return apt;
    }
    // --- Medicine methods ---
    getMedicinesByPatientId(patientId) {
        return this.medicines.filter(m => m.patientId === patientId);
    }
    findMedicineById(id) {
        return this.medicines.find(m => m.id === id);
    }
    addMedicine(med) {
        this.medicines.unshift(med);
        return med;
    }
    updateMedicine(id, updates) {
        const med = this.findMedicineById(id);
        if (!med)
            return undefined;
        Object.assign(med, updates);
        return med;
    }
    deleteMedicine(id) {
        const index = this.medicines.findIndex(m => m.id === id);
        if (index === -1)
            return false;
        this.medicines.splice(index, 1);
        return true;
    }
    // --- Health Record methods ---
    getHealthRecordsByPatientId(patientId) {
        return this.healthRecords.filter(r => r.patientId === patientId);
    }
    findHealthRecordById(id) {
        return this.healthRecords.find(r => r.id === id);
    }
    addHealthRecord(record) {
        this.healthRecords.unshift(record);
        return record;
    }
    deleteHealthRecord(id) {
        const index = this.healthRecords.findIndex(r => r.id === id);
        if (index === -1)
            return false;
        this.healthRecords.splice(index, 1);
        return true;
    }
    // --- Prescription methods ---
    getPrescriptionsByPatientId(patientId) {
        return this.prescriptions.filter(p => p.patientId === patientId);
    }
    getPrescriptionsByDoctorId(doctorId) {
        return this.prescriptions.filter(p => p.doctorId === doctorId);
    }
    findPrescriptionById(id) {
        return this.prescriptions.find(p => p.id === id);
    }
    addPrescription(prescription) {
        this.prescriptions.unshift(prescription);
        return prescription;
    }
    // --- AI Chat History & Symptom Check methods ---
    getChatHistoriesByUserId(userId) {
        return this.chatHistories.filter(c => c.userId === userId);
    }
    findChatHistoryById(id) {
        return this.chatHistories.find(c => c.id === id);
    }
    saveChatHistory(history) {
        const existingIndex = this.chatHistories.findIndex(c => c.id === history.id);
        if (existingIndex >= 0) {
            this.chatHistories[existingIndex] = history;
        }
        else {
            this.chatHistories.unshift(history);
        }
        return history;
    }
    getSymptomChecksByUserId(userId) {
        return this.symptomChecks.filter(s => s.userId === userId);
    }
    addSymptomCheck(result) {
        this.symptomChecks.unshift(result);
        return result;
    }
}
export const dbStore = new DataStore();
