import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultHashedPassword = bcrypt.hashSync('password123', 10);
const defaultAdminHashedPassword = bcrypt.hashSync('admin123', 10);
const DATA_FILE_PATH = path.resolve(__dirname, '../../data_store.json');

export class DataStore {
    users = [];
    doctors = [];
    departments = [];
    appointments = [];
    medicines = [];
    healthRecords = [];
    prescriptions = [];
    chatHistories = [];
    symptomChecks = [];
    notifications = [];
    auditLogs = [];
    systemSettings = {
        platformName: 'MediGuide India',
        tagline: 'AI-Powered Digital Healthcare Companion for India',
        aiProvider: 'clinical_knowledge_base',
        aiModel: 'gemini-1.5-flash',
        emergencyHelplines: {
            national: '112',
            nationalEmergency: '112',
            ambulance: '108',
            maternalChild: '102',
            maternalAndChild: '102',
            mentalHealth: '14416',
            teleManas: '14416',
            teleManasMentalHealth: '14416',
        },
        dpdpNotice: 'MediGuide is designed in alignment with the Digital Personal Data Protection (DPDP) Act, 2023. Your health records and consultation data remain private, encrypted, and under your consent.',
        dpdpConsentText: 'By using MediGuide, you acknowledge and consent to clinical data processing under India Digital Personal Data Protection Act, 2023.',
        maintenanceMode: false,
        allowNewRegistrations: true,
        version: '1.0.0 (India Release)',
    };

    constructor() {
        this.loadData();
    }

    loadData() {
        try {
            if (fs.existsSync(DATA_FILE_PATH)) {
                const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
                const data = JSON.parse(raw);
                this.users = Array.isArray(data.users) ? data.users : [];
                this.doctors = Array.isArray(data.doctors) ? data.doctors : [];
                this.departments = Array.isArray(data.departments) ? data.departments : [];
                this.appointments = Array.isArray(data.appointments) ? data.appointments : [];
                this.medicines = Array.isArray(data.medicines) ? data.medicines : [];
                this.healthRecords = Array.isArray(data.healthRecords) ? data.healthRecords : [];
                this.prescriptions = Array.isArray(data.prescriptions) ? data.prescriptions : [];
                this.chatHistories = Array.isArray(data.chatHistories) ? data.chatHistories : [];
                this.symptomChecks = Array.isArray(data.symptomChecks) ? data.symptomChecks : [];
                this.notifications = Array.isArray(data.notifications) ? data.notifications : [];
                this.auditLogs = Array.isArray(data.auditLogs) ? data.auditLogs : [];
                if (data.systemSettings) {
                    this.systemSettings = { ...this.systemSettings, ...data.systemSettings };
                }
            }
        } catch (err) {
            console.warn('Could not load data_store.json:', err);
        }

        // Seed if empty or missing initial India baseline data
        if (this.doctors.length === 0 || this.departments.length === 0 || !this.findUserByEmail('patient@mediguide.com')) {
            this.seedInitialData();
        }
    }

    persist() {
        try {
            const data = {
                users: this.users,
                doctors: this.doctors,
                departments: this.departments,
                appointments: this.appointments,
                medicines: this.medicines,
                healthRecords: this.healthRecords,
                prescriptions: this.prescriptions,
                chatHistories: this.chatHistories,
                symptomChecks: this.symptomChecks,
                notifications: this.notifications,
                auditLogs: this.auditLogs,
                systemSettings: this.systemSettings,
            };
            fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
        } catch (err) {
            console.warn('Could not persist data_store.json:', err);
        }
    }

    seedInitialData() {
        // 1. Initial Users (India First)
        this.users = [
            {
                id: 'usr-patient-1',
                name: 'Rahul Sharma',
                email: 'patient@mediguide.com',
                password: defaultHashedPassword,
                role: 'patient',
                phone: '+91 98765 43210',
                avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                age: 29,
                gender: 'Male',
                bloodGroup: 'B+',
                abhaId: '91-4820-1948-2849',
                city: 'Bengaluru',
                state: 'Karnataka',
                preferredLanguage: 'English',
                allergies: ['Penicillin', 'Dust Mites'],
                chronicConditions: ['Mild Allergic Rhinitis'],
                emergencyContact: 'Priya Sharma (Spouse) - +91 98765 12345',
                createdAt: new Date().toISOString(),
            },
            {
                id: 'usr-patient-2',
                name: 'Priya Nair',
                email: 'priya.nair@mediguide.com',
                password: defaultHashedPassword,
                role: 'patient',
                phone: '+91 98450 11223',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                age: 32,
                gender: 'Female',
                bloodGroup: 'O+',
                abhaId: '91-3321-4455-6677',
                city: 'Chennai',
                state: 'Tamil Nadu',
                preferredLanguage: 'Tamil',
                allergies: ['Sulfa Drugs'],
                chronicConditions: ['Hypothyroidism'],
                emergencyContact: 'K. Nair (Father) - +91 98450 99887',
                createdAt: new Date().toISOString(),
            },
            {
                id: 'usr-doctor-1',
                name: 'Dr. Priya Sharma',
                email: 'doctor.smith@mediguide.com', // Aliased for seamless login
                password: defaultHashedPassword,
                role: 'doctor',
                phone: '+91 98110 55443',
                avatar: 'https://images.unsplash.com/photo-1594824813590-7987e9140889?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                doctorId: 'doc-1',
                createdAt: new Date().toISOString(),
            },
            {
                id: 'usr-doctor-2',
                name: 'Dr. Rajesh Venkat',
                email: 'rajesh.venkat@mediguide.com',
                password: defaultHashedPassword,
                role: 'doctor',
                phone: '+91 98220 33221',
                avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                doctorId: 'doc-2',
                createdAt: new Date().toISOString(),
            },
            {
                id: 'usr-doctor-3',
                name: 'Dr. Ananya Mukherjee',
                email: 'ananya.mukherjee@mediguide.com',
                password: defaultHashedPassword,
                role: 'doctor',
                phone: '+91 98330 77665',
                avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                doctorId: 'doc-3',
                createdAt: new Date().toISOString(),
            },
            {
                id: 'usr-admin-1',
                name: 'Vikramaditya Roy',
                email: 'admin@mediguide.com',
                password: defaultAdminHashedPassword,
                role: 'admin',
                phone: '+91 99000 88776',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                createdAt: new Date().toISOString(),
            },
        ];

        // 2. Departments
        this.departments = [
            {
                id: 'dept-gen-med',
                name: 'General Medicine',
                code: 'GEN_MED',
                icon: 'Stethoscope',
                description: 'Comprehensive primary care, fever, diabetes, hypertension, infectious diseases, and systemic health checkups.',
                commonConditions: ['Fever & Flu', 'High BP / Hypertension', 'Type 2 Diabetes', 'Fatigue', 'Thyroid Disorders', 'Infections'],
                headDoctor: 'Dr. Priya Sharma',
                doctorCount: 4,
                isAvailable: true,
            },
            {
                id: 'dept-cardio',
                name: 'Cardiology',
                code: 'CARDIO',
                icon: 'HeartPulse',
                description: 'Advanced cardiovascular care, ECG interpretation, arrhythmia, hypertension, and heart failure management.',
                commonConditions: ['Chest Discomfort', 'Palpitations', 'High Cholesterol', 'Coronary Artery Disease', 'Heart Failure'],
                headDoctor: 'Dr. Rajesh Venkat',
                doctorCount: 3,
                isAvailable: true,
            },
            {
                id: 'dept-derma',
                name: 'Dermatology',
                code: 'DERMA',
                icon: 'Sparkles',
                description: 'Skin, hair, nail disorders, fungal infections, acne, eczema, psoriasis, and allergy assessments.',
                commonConditions: ['Skin Rash / Itching', 'Eczema & Psoriasis', 'Acne Vulgaris', 'Fungal Tinea Infections', 'Hair Loss'],
                headDoctor: 'Dr. Ananya Mukherjee',
                doctorCount: 2,
                isAvailable: true,
            },
            {
                id: 'dept-ortho',
                name: 'Orthopedics',
                code: 'ORTHO',
                icon: 'Bone',
                description: 'Bone, joint, ligament injuries, osteoarthritis, chronic back pain, spine alignment, and sports medicine.',
                commonConditions: ['Knee Joint Pain', 'Lower Back Ache', 'Cervical Spondylosis', 'Ligament Sprain', 'Fracture Care'],
                headDoctor: 'Dr. Suresh Menon',
                doctorCount: 3,
                isAvailable: true,
            },
            {
                id: 'dept-neuro',
                name: 'Neurology',
                code: 'NEURO',
                icon: 'Brain',
                description: 'Brain and nervous system disorders, migraines, neuropathies, vertigo, epilepsy, and cognitive health.',
                commonConditions: ['Migraine & Headaches', 'Vertigo / Dizziness', 'Peripheral Neuropathy', 'Numbness / Tingling', 'Sleep Disorders'],
                headDoctor: 'Dr. Kavita Nair',
                doctorCount: 2,
                isAvailable: true,
            },
            {
                id: 'dept-pedia',
                name: 'Pediatrics',
                code: 'PEDIA',
                icon: 'Baby',
                description: 'Child health, infant nutrition, developmental milestones, vaccination schedules, and childhood acute infections.',
                commonConditions: ['Childhood Fever', 'Vaccination Schedule', 'Growth & Nutrition', 'Pediatric Asthma', 'Gastroenteritis'],
                headDoctor: 'Dr. Rohan Gupta',
                doctorCount: 2,
                isAvailable: true,
            },
            {
                id: 'dept-ent',
                name: 'ENT (Otolaryngology)',
                code: 'ENT',
                icon: 'Ear',
                description: 'Ear infections, hearing loss, chronic sinusitis, tonsillitis, allergic rhinitis, and vocal cord disorders.',
                commonConditions: ['Earache & Hearing Loss', 'Chronic Sinusitis', 'Sore Throat / Tonsillitis', 'Allergic Sneezing', 'Tinnitus'],
                headDoctor: 'Dr. David Miller',
                doctorCount: 2,
                isAvailable: true,
            },
            {
                id: 'dept-gynae',
                name: 'Gynecology & Obstetrics',
                code: 'GYNAE',
                icon: 'Users',
                description: 'Women’s reproductive wellness, antenatal care, PCOS, menstrual irregularities, and fertility guidance.',
                commonConditions: ['PCOS / PCOD', 'Pregnancy Checkups', 'Irregular Periods', 'Pelvic Pain', 'Menopause Support'],
                headDoctor: 'Dr. Sunita Rao',
                doctorCount: 2,
                isAvailable: true,
            },
        ];

        // 3. Indian Doctors
        this.doctors = [
            {
                id: 'doc-1',
                userId: 'usr-doctor-1',
                name: 'Dr. Priya Sharma',
                email: 'doctor.smith@mediguide.com',
                specialization: 'Consultant Internal Medicine & Diabetology',
                department: 'General Medicine',
                qualification: 'MBBS, MD (AIIMS New Delhi), FICP',
                registrationNumber: 'MCI-19482 / DMC-2012-DL',
                experienceYears: 14,
                rating: 4.9,
                reviewCount: 342,
                hospital: 'AIIMS & MediGuide Specialty Clinic, New Delhi',
                consultationFee: 750,
                city: 'New Delhi',
                state: 'Delhi',
                languages: ['English', 'Hindi', 'Punjabi'],
                consultationModes: ['In-Person', 'Online Video'],
                avatar: 'https://images.unsplash.com/photo-1594824813590-7987e9140889?w=150&auto=format&fit=crop&q=80',
                bio: 'Gold-medalist physician from AIIMS Delhi with 14+ years expertise in managing diabetes mellitus, tropical fevers, hypertension, and preventive adult wellness.',
                availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                availableTimeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'],
                workingHours: '09:00 AM - 07:00 PM',
                slotDurationMinutes: 30,
                verificationStatus: 'verified',
                isAvailable: true,
            },
            {
                id: 'doc-2',
                userId: 'usr-doctor-2',
                name: 'Dr. Rajesh Venkat',
                email: 'rajesh.venkat@mediguide.com',
                specialization: 'Senior Interventional Cardiologist',
                department: 'Cardiology',
                qualification: 'MBBS, MD (General Med), DM (Cardiology - PGIMER), FACC',
                registrationNumber: 'TNMC-48201 / NMC-2010',
                experienceYears: 18,
                rating: 5.0,
                reviewCount: 420,
                hospital: 'Apollo Specialty Hospitals, Greams Road, Chennai',
                consultationFee: 1200,
                city: 'Chennai',
                state: 'Tamil Nadu',
                languages: ['English', 'Tamil', 'Telugu'],
                consultationModes: ['In-Person', 'Online Video'],
                avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
                bio: 'Leading cardiologist specializing in coronary artery interventions, cardiac arrhythmias, preventative lipidology, and resistant hypertension.',
                availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
                availableTimeSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '05:30 PM'],
                workingHours: '10:00 AM - 06:30 PM',
                slotDurationMinutes: 30,
                verificationStatus: 'verified',
                isAvailable: true,
            },
            {
                id: 'doc-3',
                userId: 'usr-doctor-3',
                name: 'Dr. Ananya Mukherjee',
                email: 'ananya.mukherjee@mediguide.com',
                specialization: 'Consultant Dermatologist & Trichologist',
                department: 'Dermatology',
                qualification: 'MBBS, MD (DVL - CMC Vellore), DNB',
                registrationNumber: 'MMC-89104 / MH-2015',
                experienceYears: 10,
                rating: 4.8,
                reviewCount: 215,
                hospital: 'Fortis Hospital & ClearSkin Clinic, Mumbai',
                consultationFee: 850,
                city: 'Mumbai',
                state: 'Maharashtra',
                languages: ['English', 'Hindi', 'Bengali', 'Marathi'],
                consultationModes: ['In-Person', 'Online Video'],
                avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
                bio: 'Expert in clinical dermatology, adult and pediatric eczema, severe acne, fungal skin infections, psoriasis biologics, and hair loss therapies.',
                availableDays: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
                availableTimeSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:30 PM'],
                workingHours: '09:30 AM - 05:30 PM',
                slotDurationMinutes: 20,
                verificationStatus: 'verified',
                isAvailable: true,
            },
            {
                id: 'doc-4',
                userId: 'usr-doctor-4',
                name: 'Dr. Suresh Menon',
                email: 'suresh.menon@mediguide.com',
                specialization: 'Orthopedic & Joint Replacement Surgeon',
                department: 'Orthopedics',
                qualification: 'MBBS, MS (Ortho - JIPMER), M.Ch (Orth)',
                registrationNumber: 'KMC-54312 / KA-2008',
                experienceYears: 16,
                rating: 4.9,
                reviewCount: 290,
                hospital: 'Manipal Hospital, Old Airport Road, Bengaluru',
                consultationFee: 900,
                city: 'Bengaluru',
                state: 'Karnataka',
                languages: ['English', 'Kannada', 'Malayalam', 'Hindi'],
                consultationModes: ['In-Person', 'Online Video'],
                avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
                bio: 'Specialist in arthroscopic knee and shoulder repairs, degenerative osteoarthritis, lumbar disc herniation, and sports injury rehabilitation.',
                availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                availableTimeSlots: ['08:30 AM', '10:00 AM', '02:00 PM', '04:00 PM'],
                workingHours: '08:30 AM - 05:00 PM',
                slotDurationMinutes: 30,
                verificationStatus: 'verified',
                isAvailable: true,
            },
            {
                id: 'doc-5',
                userId: 'usr-doctor-5',
                name: 'Dr. Kavita Nair',
                email: 'kavita.nair@mediguide.com',
                specialization: 'Senior Consultant Neurologist',
                department: 'Neurology',
                qualification: 'MBBS, MD, DM (Neurology - NIMHANS)',
                registrationNumber: 'DMC-67890 / DL-2011',
                experienceYears: 15,
                rating: 4.9,
                reviewCount: 198,
                hospital: 'Max Super Speciality Hospital, Saket, New Delhi',
                consultationFee: 1100,
                city: 'New Delhi',
                state: 'Delhi',
                languages: ['English', 'Hindi', 'Malayalam'],
                consultationModes: ['In-Person', 'Online Video'],
                avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&auto=format&fit=crop&q=80',
                bio: 'Trained at India’s premier neuroscience institute (NIMHANS), specializing in refractory migraines, vestibular vertigo, peripheral neuropathy, and epilepsy care.',
                availableDays: ['Monday', 'Wednesday', 'Thursday', 'Saturday'],
                availableTimeSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '05:00 PM'],
                workingHours: '10:00 AM - 06:00 PM',
                slotDurationMinutes: 30,
                verificationStatus: 'verified',
                isAvailable: true,
            },
            {
                id: 'doc-6',
                userId: 'usr-doctor-6',
                name: 'Dr. Rohan Gupta',
                email: 'rohan.gupta@mediguide.com',
                specialization: 'Pediatrician & Neonatal Specialist',
                department: 'Pediatrics',
                qualification: 'MBBS, MD (Pediatrics - CMC Vellore), DNB',
                registrationNumber: 'MMC-76543 / MH-2016',
                experienceYears: 11,
                rating: 5.0,
                reviewCount: 360,
                hospital: 'Surya Children’s Hospital, Mumbai',
                consultationFee: 700,
                city: 'Mumbai',
                state: 'Maharashtra',
                languages: ['English', 'Hindi', 'Gujarati', 'Marathi'],
                consultationModes: ['In-Person', 'Online Video'],
                avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
                bio: 'Compassionate pediatric care focusing on Indian vaccination schedules, infant growth charts, respiratory allergies, and childhood infectious illnesses.',
                availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                availableTimeSlots: ['09:00 AM', '10:30 AM', '03:00 PM', '04:30 PM'],
                workingHours: '09:00 AM - 06:00 PM',
                slotDurationMinutes: 20,
                verificationStatus: 'verified',
                isAvailable: true,
            },
        ];

        // 4. Initial Appointments
        this.appointments = [
            {
                id: 'apt-seed-1',
                patientId: 'usr-patient-1',
                patientName: 'Rahul Sharma',
                patientEmail: 'patient@mediguide.com',
                patientPhone: '+91 98765 43210',
                doctorId: 'doc-1',
                doctorName: 'Dr. Priya Sharma',
                doctorSpecialization: 'Consultant Internal Medicine & Diabetology',
                doctorAvatar: 'https://images.unsplash.com/photo-1594824813590-7987e9140889?w=150&auto=format&fit=crop&q=80',
                department: 'General Medicine',
                consultationMode: 'In-Person',
                date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                timeSlot: '10:30 AM',
                status: 'confirmed',
                reason: 'Follow-up for seasonal allergic rhinitis and HbA1c review',
                symptoms: ['Nasal congestion', 'Occasional sneezing'],
                notes: 'Please bring recent fasting blood glucose and lipid panel reports.',
                createdAt: new Date().toISOString(),
            },
            {
                id: 'apt-seed-2',
                patientId: 'usr-patient-1',
                patientName: 'Rahul Sharma',
                patientEmail: 'patient@mediguide.com',
                patientPhone: '+91 98765 43210',
                doctorId: 'doc-3',
                doctorName: 'Dr. Ananya Mukherjee',
                doctorSpecialization: 'Consultant Dermatologist & Trichologist',
                doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
                department: 'Dermatology',
                consultationMode: 'Online Video',
                date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
                timeSlot: '02:30 PM',
                status: 'completed',
                reason: 'Dry itchy patches on forearm during monsoon',
                symptoms: ['Mild pruritus', 'Erythema on flexor surface'],
                notes: 'Diagnosed with mild atopic dermatitis. Prescribed topical emollient and antihistamine.',
                prescriptionId: 'rx-seed-1',
                createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
            },
        ];

        // 5. Initial Prescriptions (India Standard)
        this.prescriptions = [
            {
                id: 'rx-seed-1',
                appointmentId: 'apt-seed-2',
                patientId: 'usr-patient-1',
                patientName: 'Rahul Sharma',
                patientAge: 29,
                patientGender: 'Male',
                doctorId: 'doc-3',
                doctorName: 'Dr. Ananya Mukherjee',
                doctorSpecialization: 'Consultant Dermatologist',
                doctorHospital: 'Fortis Hospital & ClearSkin Clinic, Mumbai',
                registrationNumber: 'MMC-89104 / MH-2015',
                date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
                diagnosis: 'Atopic Eczematous Dermatitis (Mild) & Allergic Rhinitis',
                medicines: [
                    {
                        name: 'Montek-LC (Montelukast + Levocetirizine)',
                        strength: '10mg + 5mg',
                        dosage: '1 Tablet',
                        route: 'Oral',
                        frequency: 'Once daily at bedtime',
                        timing: 'Night (After Food)',
                        duration: '10 days',
                        instructions: 'Take 1 tablet every night after dinner. Avoid driving if drowsiness occurs.',
                    },
                    {
                        name: 'Cetaphil Restoraderm Skin Emollient',
                        strength: '100g Cream',
                        dosage: 'Pea sized amount',
                        route: 'Topical',
                        frequency: 'Twice daily',
                        timing: 'Morning & Night (After Bath)',
                        duration: '14 days',
                        instructions: 'Apply gently over affected forearm areas immediately after bathing on damp skin.',
                    },
                    {
                        name: 'Pan-D (Pantoprazole + Domperidone)',
                        strength: '40mg + 30mg',
                        dosage: '1 Capsule',
                        route: 'Oral',
                        frequency: 'Once daily (SOS/If required)',
                        timing: 'Morning (Empty Stomach)',
                        duration: '5 days',
                        instructions: 'Take 30 minutes before breakfast if experiencing gastric irritation.',
                    },
                ],
                diagnosticTests: ['Serum IgE Level', 'Complete Blood Count (CBC) with Absolute Eosinophil Count'],
                generalAdvice: 'Avoid harsh chemical soaps and hot water baths. Wear breathable cotton clothing. Maintain adequate indoor hydration.',
                followUpDate: new Date(Date.now() + 86400000 * 9).toISOString().split('T')[0],
                digitalSignature: 'Digitally Signed by Dr. Ananya Mukherjee, MD (DVL)',
                qrVerificationCode: 'MG-RX-2026-MUM-89104-9482',
                createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            },
        ];

        // 6. Initial Active Medicines Tracker
        this.medicines = [
            {
                id: 'med-seed-1',
                patientId: 'usr-patient-1',
                name: 'Montek-LC (Montelukast 10mg + Levocetirizine 5mg)',
                strength: '10mg + 5mg',
                dosage: '1 Tablet',
                frequency: 'Once daily',
                timings: ['09:00 PM'],
                mealTiming: 'After Food',
                slotTiming: 'Night',
                instructions: 'Take at night after food for allergy relief',
                startDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
                endDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
                isActive: true,
                adherenceHistory: [
                    { date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], timeSlot: '09:00 PM', taken: true },
                    { date: new Date().toISOString().split('T')[0], timeSlot: '09:00 PM', taken: false },
                ],
                createdAt: new Date().toISOString(),
            },
            {
                id: 'med-seed-2',
                patientId: 'usr-patient-1',
                name: 'Dolo 650 (Paracetamol)',
                strength: '650 mg',
                dosage: '1 Tablet',
                frequency: 'As needed (SOS)',
                timings: ['02:00 PM'],
                mealTiming: 'After Food',
                slotTiming: 'Afternoon',
                instructions: 'Take only if fever or body pain exceeds mild discomfort (Max 3 tabs/day)',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
                isActive: true,
                adherenceHistory: [],
                createdAt: new Date().toISOString(),
            },
        ];

        // 7. Initial Health Records Vault
        this.healthRecords = [
            {
                id: 'rec-seed-1',
                patientId: 'usr-patient-1',
                title: 'Complete Blood Count (CBC) & Lipid Profile Report',
                category: 'Lab Report',
                recordDate: '2026-08-18',
                doctorName: 'Dr. Priya Sharma',
                facility: 'Dr. Lal PathLabs & Metropolis Diagnostics, Bengaluru',
                fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                fileName: 'CBC_LipidProfile_Aug2026.pdf',
                fileSize: '1.2 MB',
                fileType: 'application/pdf',
                summary: 'Hemoglobin: 14.8 g/dL (Normal: 13-17), Total WBC: 7,200 /uL, Platelets: 2.4 Lakhs. Total Cholesterol: 172 mg/dL, Fasting Blood Sugar: 88 mg/dL (Optimal).',
                tags: ['Lab Report', 'Blood Test', 'CBC', 'Lipid Panel'],
                createdAt: new Date().toISOString(),
            },
            {
                id: 'rec-seed-2',
                patientId: 'usr-patient-1',
                title: 'COVID-19 & Adult Hepatitis-B Vaccination Certificate',
                category: 'Vaccination',
                recordDate: '2026-03-12',
                doctorName: 'Government Primary Health Centre (PHC)',
                facility: 'CoWIN / National Health Portal Vault',
                fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                fileName: 'Vaccination_Certificate_CoWIN.pdf',
                fileSize: '650 KB',
                fileType: 'application/pdf',
                summary: 'Completed primary 2-dose Covishield and Precaution Booster dose. Verified with CoWIN 14-digit Reference ID.',
                tags: ['Vaccination', 'CoWIN', 'Immunization', 'ABDM Verified'],
                createdAt: new Date().toISOString(),
            },
        ];

        // 8. Initial In-App Notifications
        this.notifications = [
            {
                id: 'notif-seed-1',
                userId: 'usr-patient-1',
                role: 'patient',
                type: 'appointment',
                title: 'Appointment Confirmed',
                message: 'Your consultation with Dr. Priya Sharma is confirmed for 10:30 AM IST.',
                link: '/appointments',
                isRead: false,
                createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
            {
                id: 'notif-seed-2',
                userId: 'usr-patient-1',
                role: 'patient',
                type: 'prescription',
                title: 'Digital Prescription Available',
                message: 'Dr. Ananya Mukherjee issued a digital prescription for Atopic Dermatitis.',
                link: '/prescriptions',
                isRead: false,
                createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            },
            {
                id: 'notif-seed-3',
                userId: 'usr-patient-1',
                role: 'patient',
                type: 'medicine',
                title: 'Medicine Reminder (09:00 PM IST)',
                message: 'Time to take Montek-LC (1 Tablet) after dinner.',
                link: '/medicines',
                isRead: true,
                createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
            },
            {
                id: 'notif-seed-4',
                userId: 'usr-doctor-1',
                role: 'doctor',
                type: 'appointment',
                title: 'New Patient Booking',
                message: 'Rahul Sharma booked a General Medicine consultation for 10:30 AM.',
                link: '/doctor/appointments',
                isRead: false,
                createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
            {
                id: 'notif-seed-5',
                userId: 'usr-admin-1',
                role: 'admin',
                type: 'security',
                title: 'System Health Optimal',
                message: 'All 8 medical departments and AI engines are operating with 100% uptime.',
                link: '/admin/dashboard',
                isRead: false,
                createdAt: new Date().toISOString(),
            },
        ];

        // 9. Initial Audit Logs (FR-16)
        this.auditLogs = [
            {
                id: 'log-1',
                timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
                eventType: 'USER_LOGIN',
                actorId: 'usr-patient-1',
                actorEmail: 'patient@mediguide.com',
                actorRole: 'patient',
                ipAddress: '103.24.120.45 (Bengaluru, IN)',
                details: 'Patient successfully logged into MediGuide portal with 2FA/Password session.',
                status: 'SUCCESS',
            },
            {
                id: 'log-2',
                timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
                eventType: 'PRESCRIPTION_CREATE',
                actorId: 'usr-doctor-3',
                actorEmail: 'ananya.mukherjee@mediguide.com',
                actorRole: 'doctor',
                ipAddress: '49.36.180.12 (Mumbai, IN)',
                details: 'Prescription #rx-seed-1 generated for patient Rahul Sharma with 3 medicines and digital seal.',
                status: 'SUCCESS',
            },
            {
                id: 'log-3',
                timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
                eventType: 'DOCTOR_VERIFIED',
                actorId: 'usr-admin-1',
                actorEmail: 'admin@mediguide.com',
                actorRole: 'admin',
                ipAddress: '122.161.50.88 (New Delhi, IN)',
                details: 'Administrator approved and credentialed Dr. Rajesh Venkat (Apollo Hospitals - Cardiology).',
                status: 'SUCCESS',
            },
            {
                id: 'log-4',
                timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
                eventType: 'RECORD_UPLOAD',
                actorId: 'usr-patient-1',
                actorEmail: 'patient@mediguide.com',
                actorRole: 'patient',
                ipAddress: '103.24.120.45 (Bengaluru, IN)',
                details: 'Health record CBC_LipidProfile_Aug2026.pdf securely encrypted and stored in digital vault.',
                status: 'SUCCESS',
            },
        ];

        // 10. Initial System & AI Safety Settings
        this.systemSettings = {
            aiProvider: 'clinical_knowledge_base',
            geminiApiKey: process.env.GEMINI_API_KEY || '',
            emergencyHelplines: {
                nationalEmergency: '112',
                ambulance: '108',
                maternalAndChild: '102',
                teleManasMentalHealth: '14416',
            },
            dpdpConsentText: 'By using MediGuide, you acknowledge and consent to clinical data processing under India Digital Personal Data Protection Act, 2023.',
            version: '1.0.0 (India Release)',
        };

        this.persist();
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
        this.persist();
        return user;
    }
    updateUser(id, updates) {
        const user = this.findUserById(id);
        if (!user) return undefined;
        Object.assign(user, updates);
        this.persist();
        return user;
    }
    deleteUser(id) {
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1) return false;
        this.users.splice(index, 1);
        this.persist();
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
        this.persist();
        return doctor;
    }
    updateDoctor(id, updates) {
        const doc = this.findDoctorById(id);
        if (!doc) return undefined;
        Object.assign(doc, updates);
        this.persist();
        return doc;
    }

    // --- Department methods ---
    getDepartments() {
        return this.departments;
    }
    findDepartmentById(id) {
        return this.departments.find(d => d.id === id || d.code === id);
    }
    addDepartment(dept) {
        this.departments.push(dept);
        this.persist();
        return dept;
    }
    updateDepartment(id, updates) {
        const dept = this.findDepartmentById(id);
        if (!dept) return undefined;
        Object.assign(dept, updates);
        this.persist();
        return dept;
    }
    deleteDepartment(id) {
        const index = this.departments.findIndex(d => d.id === id);
        if (index === -1) return false;
        this.departments.splice(index, 1);
        this.persist();
        return true;
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
        this.persist();
        return apt;
    }
    updateAppointment(id, updates) {
        const apt = this.findAppointmentById(id);
        if (!apt) return undefined;
        Object.assign(apt, updates);
        this.persist();
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
        this.persist();
        return med;
    }
    updateMedicine(id, updates) {
        const med = this.findMedicineById(id);
        if (!med) return undefined;
        Object.assign(med, updates);
        this.persist();
        return med;
    }
    deleteMedicine(id) {
        const index = this.medicines.findIndex(m => m.id === id);
        if (index === -1) return false;
        this.medicines.splice(index, 1);
        this.persist();
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
        this.persist();
        return record;
    }
    deleteHealthRecord(id) {
        const index = this.healthRecords.findIndex(r => r.id === id);
        if (index === -1) return false;
        this.healthRecords.splice(index, 1);
        this.persist();
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
        this.persist();
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
        } else {
            this.chatHistories.unshift(history);
        }
        this.persist();
        return history;
    }
    getSymptomChecksByUserId(userId) {
        return this.symptomChecks.filter(s => s.userId === userId);
    }
    addSymptomCheck(result) {
        this.symptomChecks.unshift(result);
        this.persist();
        return result;
    }

    // --- Notification methods (FR-15) ---
    getNotificationsByUserId(userId) {
        return this.notifications.filter(n => n.userId === userId);
    }
    addNotification(notif) {
        const item = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            isRead: false,
            createdAt: new Date().toISOString(),
            ...notif,
        };
        this.notifications.unshift(item);
        this.persist();
        return item;
    }
    markNotificationRead(id, userId) {
        const notif = this.notifications.find(n => n.id === id && n.userId === userId);
        if (notif) {
            notif.isRead = true;
            this.persist();
            return true;
        }
        return false;
    }
    markAllNotificationsRead(userId) {
        let count = 0;
        for (const n of this.notifications) {
            if (n.userId === userId && !n.isRead) {
                n.isRead = true;
                count++;
            }
        }
        if (count > 0) this.persist();
        return count;
    }
    deleteNotification(id, userId) {
        const index = this.notifications.findIndex(n => n.id === id && n.userId === userId);
        if (index !== -1) {
            this.notifications.splice(index, 1);
            this.persist();
            return true;
        }
        return false;
    }

    // --- Audit Log methods (FR-16) ---
    getAuditLogs(filters = {}) {
        let logs = [...this.auditLogs];
        if (filters.eventType && filters.eventType !== 'ALL') {
            logs = logs.filter(l => l.eventType === filters.eventType);
        }
        if (filters.role && filters.role !== 'ALL') {
            logs = logs.filter(l => l.actorRole === filters.role);
        }
        if (filters.search) {
            const q = filters.search.toLowerCase();
            logs = logs.filter(l =>
                (l.actorEmail && l.actorEmail.toLowerCase().includes(q)) ||
                (l.details && l.details.toLowerCase().includes(q)) ||
                (l.eventType && l.eventType.toLowerCase().includes(q))
            );
        }
        return logs;
    }
    addAuditLog(entry) {
        const log = {
            id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            timestamp: new Date().toISOString(),
            status: 'SUCCESS',
            ...entry,
        };
        this.auditLogs.unshift(log);
        // Cap audit logs at 500 in memory
        if (this.auditLogs.length > 500) {
            this.auditLogs.pop();
        }
        this.persist();
        return log;
    }

    // --- System Settings methods ---
    getSystemSettings() {
        return this.systemSettings;
    }
    updateSystemSettings(updates) {
        this.systemSettings = {
            ...this.systemSettings,
            ...updates,
        };
        this.persist();
        return this.systemSettings;
    }

    // --- DPDP Data Export & Account Deletion (FR-01, FR-03, DPDP) ---
    exportUserData(userId) {
        const user = this.findUserById(userId);
        if (!user) return null;
        const { password: _, ...profile } = user;
        return {
            exportDate: new Date().toISOString(),
            governingLaw: 'Digital Personal Data Protection (DPDP) Act, 2023 (India)',
            profile,
            appointments: this.getAppointmentsByPatientId(userId),
            prescriptions: this.getPrescriptionsByPatientId(userId),
            healthRecords: this.getHealthRecordsByPatientId(userId),
            medicines: this.getMedicinesByPatientId(userId),
            chatHistories: this.getChatHistoriesByUserId(userId),
            symptomChecks: this.getSymptomChecksByUserId(userId),
        };
    }
    purgeUserData(userId) {
        this.deleteUser(userId);
        this.appointments = this.appointments.filter(a => a.patientId !== userId);
        this.prescriptions = this.prescriptions.filter(p => p.patientId !== userId);
        this.healthRecords = this.healthRecords.filter(r => r.patientId !== userId);
        this.medicines = this.medicines.filter(m => m.patientId !== userId);
        this.chatHistories = this.chatHistories.filter(c => c.userId !== userId);
        this.symptomChecks = this.symptomChecks.filter(s => s.userId !== userId);
        this.notifications = this.notifications.filter(n => n.userId !== userId);
        this.persist();
        return true;
    }

    getSystemSettings() {
        const helplines = this.systemSettings?.emergencyHelplines || {};
        return {
            platformName: 'MediGuide India',
            tagline: 'AI-Powered Digital Healthcare Companion for India',
            aiProvider: 'clinical_knowledge_base',
            aiModel: 'gemini-1.5-flash',
            dpdpNotice: 'MediGuide is designed in alignment with the Digital Personal Data Protection (DPDP) Act, 2023.',
            dpdpConsentText: 'By using MediGuide, you acknowledge and consent to clinical data processing under India Digital Personal Data Protection Act, 2023.',
            version: '1.0.0 (India Release)',
            ...this.systemSettings,
            emergencyHelplines: {
                national: '112',
                nationalEmergency: '112',
                ambulance: '108',
                maternalChild: '102',
                maternalAndChild: '102',
                mentalHealth: '14416',
                teleManas: '14416',
                teleManasMentalHealth: '14416',
                ...helplines,
                nationalEmergency: helplines.nationalEmergency || helplines.national || '112',
                maternalAndChild: helplines.maternalAndChild || helplines.maternalChild || '102',
                teleManasMentalHealth: helplines.teleManasMentalHealth || helplines.teleManas || '14416',
            },
        };
    }

    updateSystemSettings(updates) {
        if (!this.systemSettings) {
            this.systemSettings = this.getSystemSettings();
        }
        if (updates.emergencyHelplines) {
            this.systemSettings.emergencyHelplines = {
                ...(this.systemSettings.emergencyHelplines || {}),
                ...updates.emergencyHelplines,
            };
            delete updates.emergencyHelplines;
        }
        Object.assign(this.systemSettings, updates);
        this.persist();
        return this.systemSettings;
    }
}

export const dbStore = new DataStore();
