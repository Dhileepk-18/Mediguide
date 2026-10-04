import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  User,
  Doctor,
  Department,
  Appointment,
  Prescription,
  HealthRecord,
  Medicine,
  AuditLog,
  Notification,
  SystemSettings,
} from '../models/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediguide';

export async function seedDatabase() {
  console.log('🌱 [Seed] Connecting to MongoDB at:', MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ [Seed] Connected to MongoDB.');
  } catch (err) {
    console.error('❌ [Seed] Could not connect to MongoDB:', err.message);
    console.error('Please make sure MongoDB is running or provide a valid MONGODB_URI in backend/.env.');
    process.exit(1);
  }

  try {
    console.log('🧹 [Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Department.deleteMany({}),
      Appointment.deleteMany({}),
      Prescription.deleteMany({}),
      HealthRecord.deleteMany({}),
      Medicine.deleteMany({}),
      AuditLog.deleteMany({}),
      Notification.deleteMany({}),
      SystemSettings.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash('password123', 10);
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    // 1. Departments
    console.log('🏥 [Seed] Creating medical departments...');
    const departments = await Department.create([
      {
        id: 'dept-1',
        name: 'Cardiology',
        code: 'CARDIO',
        icon: 'Heart',
        description: 'Comprehensive adult & pediatric heart care, ECG, echo, arrhythmia management',
        commonConditions: ['Chest Pain', 'Palpitations', 'High Blood Pressure', 'Arrhythmia'],
        headDoctor: 'Dr. Priya Sharma',
        doctorCount: 3,
        isAvailable: true,
      },
      {
        id: 'dept-2',
        name: 'Dermatology',
        code: 'DERMA',
        icon: 'Sparkles',
        description: 'Skin, hair, nail diagnostics, eczema, psoriasis, acne, and allergy care',
        commonConditions: ['Skin Rash', 'Acne', 'Eczema', 'Hair Loss', 'Itching'],
        headDoctor: 'Dr. Ananya Deshmukh',
        doctorCount: 2,
        isAvailable: true,
      },
      {
        id: 'dept-3',
        name: 'Neurology',
        code: 'NEURO',
        icon: 'Brain',
        description: 'Brain, spinal cord, nerve disorders, migraine, neuropathy, stroke care',
        commonConditions: ['Severe Headache', 'Dizziness', 'Migraine', 'Numbness', 'Tremors'],
        headDoctor: 'Dr. Rajesh Verma',
        doctorCount: 2,
        isAvailable: true,
      },
      {
        id: 'dept-4',
        name: 'Orthopedics',
        code: 'ORTHO',
        icon: 'Bone',
        description: 'Bone, joint, spine disorders, fractures, sports injuries, arthritis',
        commonConditions: ['Joint Pain', 'Backache', 'Sprain', 'Fractures', 'Arthritis'],
        headDoctor: 'Dr. Vikram Patel',
        doctorCount: 2,
        isAvailable: true,
      },
      {
        id: 'dept-5',
        name: 'Pediatrics',
        code: 'PEDIA',
        icon: 'Baby',
        description: 'Infant, child, and adolescent healthcare, immunizations, and growth monitoring',
        commonConditions: ['Childhood Fever', 'Cough', 'Colic', 'Growth Milestones', 'Vaccines'],
        headDoctor: 'Dr. Sunita Rao',
        doctorCount: 2,
        isAvailable: true,
      },
      {
        id: 'dept-6',
        name: 'General Medicine',
        code: 'GENMED',
        icon: 'Stethoscope',
        description: 'Primary care, acute viral illnesses, lifestyle disorders, preventative health',
        commonConditions: ['Fever', 'Fatigue', 'Diabetes', 'Hypertension', 'Seasonal Flu'],
        headDoctor: 'Dr. Arun Kumar',
        doctorCount: 4,
        isAvailable: true,
      },
      {
        id: 'dept-7',
        name: 'Gastroenterology',
        code: 'GASTRO',
        icon: 'Activity',
        description: 'Digestive system, liver, bowel disorders, acid reflux, endoscopy',
        commonConditions: ['Abdominal Pain', 'Acid Reflux', 'Bloating', 'Indigestion'],
        headDoctor: 'Dr. Meera Nambiar',
        doctorCount: 2,
        isAvailable: true,
      },
      {
        id: 'dept-8',
        name: 'ENT',
        code: 'ENT',
        icon: 'Ear',
        description: 'Ear, nose, throat, sinusitis, hearing, voice and balance disorders',
        commonConditions: ['Earache', 'Sore Throat', 'Sinusitis', 'Tinnitus', 'Nasal Block'],
        headDoctor: 'Dr. Rohan Mehra',
        doctorCount: 2,
        isAvailable: true,
      },
    ]);

    // 2. Users (Admin, Doctors, Patients)
    console.log('👥 [Seed] Creating users (Admin, Doctors, Patients)...');
    const users = await User.create([
      {
        id: 'usr-admin-1',
        name: 'MediGuide Administrator',
        email: 'admin@mediguide.com',
        password: adminPasswordHash,
        role: 'admin',
        phone: '+91 98110 00001',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        status: 'active',
        city: 'New Delhi',
        state: 'Delhi',
      },
      {
        id: 'usr-patient-1',
        name: 'Aarav Patel',
        email: 'patient@mediguide.com',
        password: passwordHash,
        role: 'patient',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        status: 'active',
        age: 32,
        gender: 'Male',
        bloodGroup: 'B+',
        abhaId: '91-4523-8912-3401',
        city: 'Bengaluru',
        state: 'Karnataka',
        preferredLanguage: 'English',
        allergies: ['Penicillin', 'Dust Mites'],
        chronicConditions: ['Mild Hypertension'],
        emergencyContact: 'Priya Patel (+91 98765 43211)',
      },
      {
        id: 'usr-patient-2',
        name: 'Sunita Mehra',
        email: 'sunita.mehra@example.com',
        password: passwordHash,
        role: 'patient',
        phone: '+91 98223 11223',
        status: 'active',
        age: 48,
        gender: 'Female',
        bloodGroup: 'O+',
        city: 'Mumbai',
        state: 'Maharashtra',
        preferredLanguage: 'Hindi',
        allergies: ['Sulfonamides'],
        chronicConditions: ['Type-2 Diabetes'],
      },
      // Doctor Users
      {
        id: 'usr-doc-1',
        name: 'Dr. Priya Sharma',
        email: 'dr.priya.sharma@mediguide.com',
        password: passwordHash,
        role: 'doctor',
        phone: '+91 98101 23456',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
        status: 'active',
        city: 'New Delhi',
        state: 'Delhi',
      },
      {
        id: 'usr-doc-2',
        name: 'Dr. Rajesh Verma',
        email: 'dr.rajesh.verma@mediguide.com',
        password: passwordHash,
        role: 'doctor',
        phone: '+91 98202 34567',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
        status: 'active',
        city: 'Mumbai',
        state: 'Maharashtra',
      },
      {
        id: 'usr-doc-3',
        name: 'Dr. Ananya Deshmukh',
        email: 'dr.ananya.deshmukh@mediguide.com',
        password: passwordHash,
        role: 'doctor',
        phone: '+91 98303 45678',
        avatar: 'https://images.unsplash.com/photo-1594824813583-4a1599a80fa9?w=150',
        status: 'active',
        city: 'Pune',
        state: 'Maharashtra',
      },
      {
        id: 'usr-doc-4',
        name: 'Dr. Vikram Patel',
        email: 'dr.vikram.patel@mediguide.com',
        password: passwordHash,
        role: 'doctor',
        phone: '+91 98404 56789',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150',
        status: 'active',
        city: 'Ahmedabad',
        state: 'Gujarat',
      },
      {
        id: 'usr-doc-5',
        name: 'Dr. Sunita Rao',
        email: 'dr.sunita.rao@mediguide.com',
        password: passwordHash,
        role: 'doctor',
        phone: '+91 98505 67890',
        avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=150',
        status: 'active',
        city: 'Hyderabad',
        state: 'Telangana',
      },
      {
        id: 'usr-doc-6',
        name: 'Dr. Arun Kumar',
        email: 'dr.arun.kumar@mediguide.com',
        password: passwordHash,
        role: 'doctor',
        phone: '+91 98606 78901',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
        status: 'active',
        city: 'Bengaluru',
        state: 'Karnataka',
      },
    ]);

    // 3. Doctors Catalog
    console.log('🩺 [Seed] Creating verified doctor profiles...');
    const doctors = await Doctor.create([
      {
        id: 'doc-1',
        userId: 'usr-doc-1',
        name: 'Dr. Priya Sharma',
        email: 'dr.priya.sharma@mediguide.com',
        specialization: 'Senior Interventional Cardiologist',
        department: 'Cardiology',
        qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
        registrationNumber: 'NMC-2012-104928',
        experienceYears: 14,
        rating: 4.9,
        reviewCount: 142,
        hospital: 'AIIMS & Apollo Heart Institute, New Delhi',
        consultationFee: 750,
        city: 'New Delhi',
        state: 'Delhi',
        languages: ['English', 'Hindi', 'Punjabi'],
        consultationModes: ['In-Person', 'Audio/Telehealth'],
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
        bio: 'Cardiologist with 14+ years experience in preventive cardiology, CAD, and rhythm management.',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTimeSlots: ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM'],
        workingHours: '09:00 AM - 05:00 PM',
        slotDurationMinutes: 30,
        verificationStatus: 'verified',
        isAvailable: true,
      },
      {
        id: 'doc-2',
        userId: 'usr-doc-2',
        name: 'Dr. Rajesh Verma',
        email: 'dr.rajesh.verma@mediguide.com',
        specialization: 'Consultant Neurologist',
        department: 'Neurology',
        qualification: 'MBBS, MD, DM (Neurology)',
        registrationNumber: 'MMC-2015-084721',
        experienceYears: 11,
        rating: 4.8,
        reviewCount: 98,
        hospital: 'Kokilaben Dhirubhai Ambani Hospital, Mumbai',
        consultationFee: 900,
        city: 'Mumbai',
        state: 'Maharashtra',
        languages: ['English', 'Hindi', 'Marathi'],
        consultationModes: ['In-Person', 'Audio/Telehealth'],
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
        bio: 'Specialist in migraine, neuropathic pain, epilepsy, and post-stroke rehabilitation.',
        availableDays: ['Monday', 'Wednesday', 'Thursday', 'Saturday'],
        availableTimeSlots: ['10:00 AM', '11:00 AM', '03:00 PM', '05:00 PM'],
        workingHours: '10:00 AM - 06:00 PM',
        slotDurationMinutes: 30,
        verificationStatus: 'verified',
        isAvailable: true,
      },
      {
        id: 'doc-3',
        userId: 'usr-doc-3',
        name: 'Dr. Ananya Deshmukh',
        email: 'dr.ananya.deshmukh@mediguide.com',
        specialization: 'Consultant Dermatologist & Cosmetologist',
        department: 'Dermatology',
        qualification: 'MBBS, DVD, MD (Dermatology)',
        registrationNumber: 'MMC-2018-041920',
        experienceYears: 8,
        rating: 4.7,
        reviewCount: 84,
        hospital: 'Manipal Hospital, Pune',
        consultationFee: 600,
        city: 'Pune',
        state: 'Maharashtra',
        languages: ['English', 'Hindi', 'Marathi'],
        consultationModes: ['In-Person', 'Audio/Telehealth'],
        avatar: 'https://images.unsplash.com/photo-1594824813583-4a1599a80fa9?w=150',
        bio: 'Expertise in chronic dermatitis, psoriasis, acne, hair disorders, and skin allergies.',
        availableDays: ['Tuesday', 'Wednesday', 'Friday', 'Saturday'],
        availableTimeSlots: ['09:30 AM', '11:30 AM', '02:30 PM', '04:30 PM'],
        workingHours: '09:30 AM - 05:00 PM',
        slotDurationMinutes: 30,
        verificationStatus: 'verified',
        isAvailable: true,
      },
      {
        id: 'doc-4',
        userId: 'usr-doc-4',
        name: 'Dr. Vikram Patel',
        email: 'dr.vikram.patel@mediguide.com',
        specialization: 'Orthopedic & Joint Replacement Surgeon',
        department: 'Orthopedics',
        qualification: 'MBBS, MS (Ortho), MCh (Ortho)',
        registrationNumber: 'GMC-2010-093120',
        experienceYears: 16,
        rating: 4.9,
        reviewCount: 160,
        hospital: 'Zydus Hospitals, Ahmedabad',
        consultationFee: 800,
        city: 'Ahmedabad',
        state: 'Gujarat',
        languages: ['English', 'Hindi', 'Gujarati'],
        consultationModes: ['In-Person'],
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150',
        bio: 'Specialized in arthroscopic surgery, sports injuries, and robotic knee replacement.',
        availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        availableTimeSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'],
        workingHours: '10:00 AM - 04:30 PM',
        slotDurationMinutes: 30,
        verificationStatus: 'verified',
        isAvailable: true,
      },
      {
        id: 'doc-5',
        userId: 'usr-doc-5',
        name: 'Dr. Sunita Rao',
        email: 'dr.sunita.rao@mediguide.com',
        specialization: 'Senior Pediatrician',
        department: 'Pediatrics',
        qualification: 'MBBS, DCH, DNB (Pediatrics)',
        registrationNumber: 'TSMC-2014-061298',
        experienceYears: 12,
        rating: 4.9,
        reviewCount: 130,
        hospital: 'Rainbow Children’s Hospital, Hyderabad',
        consultationFee: 550,
        city: 'Hyderabad',
        state: 'Telangana',
        languages: ['English', 'Telugu', 'Hindi'],
        consultationModes: ['In-Person', 'Audio/Telehealth'],
        avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=150',
        bio: 'Gentle, compassionate pediatrician focused on newborn care, vaccinations, and growth.',
        availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        availableTimeSlots: ['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM'],
        workingHours: '09:00 AM - 04:30 PM',
        slotDurationMinutes: 30,
        verificationStatus: 'verified',
        isAvailable: true,
      },
      {
        id: 'doc-6',
        userId: 'usr-doc-6',
        name: 'Dr. Arun Kumar',
        email: 'dr.arun.kumar@mediguide.com',
        specialization: 'Internal Medicine & Diabetology Specialist',
        department: 'General Medicine',
        qualification: 'MBBS, MD (General Medicine)',
        registrationNumber: 'KMC-2016-052341',
        experienceYears: 9,
        rating: 4.8,
        reviewCount: 110,
        hospital: 'Fortis Hospital, Bannerghatta Road, Bengaluru',
        consultationFee: 500,
        city: 'Bengaluru',
        state: 'Karnataka',
        languages: ['English', 'Kannada', 'Hindi', 'Tamil'],
        consultationModes: ['In-Person', 'Audio/Telehealth'],
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
        bio: 'Primary care physician specializing in diabetes, hypertension, and infectious diseases.',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTimeSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM', '05:30 PM'],
        workingHours: '09:30 AM - 06:00 PM',
        slotDurationMinutes: 30,
        verificationStatus: 'verified',
        isAvailable: true,
      },
    ]);

    // 4. Appointments
    console.log('📅 [Seed] Creating sample appointments...');
    const appointments = await Appointment.create([
      {
        id: 'apt-seed-1',
        patientId: 'usr-patient-1',
        patientName: 'Aarav Patel',
        patientEmail: 'patient@mediguide.com',
        patientPhone: '+91 98765 43210',
        doctorId: 'doc-1',
        doctorName: 'Dr. Priya Sharma',
        doctorSpecialization: 'Senior Interventional Cardiologist',
        department: 'Cardiology',
        consultationMode: 'In-Person',
        date: '2026-10-10',
        timeSlot: '10:00 AM',
        status: 'confirmed',
        reason: 'Routine quarterly cardiovascular review and blood pressure checkup',
        symptoms: ['Mild Chest Tightness', 'Fatigue after climbing stairs'],
        notes: 'Advised to bring previous lipid profile and ECG records.',
      },
      {
        id: 'apt-seed-2',
        patientId: 'usr-patient-1',
        patientName: 'Aarav Patel',
        patientEmail: 'patient@mediguide.com',
        patientPhone: '+91 98765 43210',
        doctorId: 'doc-6',
        doctorName: 'Dr. Arun Kumar',
        doctorSpecialization: 'Internal Medicine & Diabetology Specialist',
        department: 'General Medicine',
        consultationMode: 'Audio/Telehealth',
        date: '2026-09-20',
        timeSlot: '02:30 PM',
        status: 'completed',
        reason: 'Follow-up consultation for seasonal viral fever and mild cough',
        symptoms: ['Fever', 'Cough', 'Body Ache'],
        prescriptionId: 'rx-seed-1',
      },
    ]);

    // 5. Prescriptions
    console.log('✍️ [Seed] Creating sample prescriptions...');
    const prescriptions = await Prescription.create([
      {
        id: 'rx-seed-1',
        appointmentId: 'apt-seed-2',
        patientId: 'usr-patient-1',
        patientName: 'Aarav Patel',
        patientAge: 32,
        patientGender: 'Male',
        doctorId: 'doc-6',
        doctorName: 'Dr. Arun Kumar',
        doctorSpecialization: 'Internal Medicine & Diabetology Specialist',
        doctorHospital: 'Fortis Hospital, Bengaluru',
        registrationNumber: 'KMC-2016-052341',
        date: '2026-09-20',
        diagnosis: 'Upper Respiratory Viral Pharyngitis with Mild Bronchial Irritation',
        medicines: [
          {
            name: 'Paracetamol',
            dosage: '650mg',
            frequency: 'Thrice daily',
            duration: '3 days',
            instructions: 'Take after meals if temperature > 99.5°F',
          },
          {
            name: 'Cetirizine',
            dosage: '10mg',
            frequency: 'Once daily at night',
            duration: '5 days',
            instructions: 'Take before sleep. May cause mild drowsiness.',
          },
          {
            name: 'Telmisartan',
            dosage: '40mg',
            frequency: 'Once daily in morning',
            duration: '30 days',
            instructions: 'Take post breakfast with water for blood pressure management.',
          },
        ],
        diagnosticTests: ['Complete Blood Count (CBC)', 'Erythrocyte Sedimentation Rate (ESR)'],
        generalAdvice: 'Maintain hydration with 3L fluids daily, warm saline gargles twice daily.',
        followUpDate: '2026-10-15',
        digitalSignature: 'Dr. Arun Kumar, MBBS, MD (Reg: KMC-2016-052341)',
        qrVerificationCode: 'MEDIGUIDE-VERIFIED-RX-2026-KMC-052341-PATEL',
      },
    ]);

    // 6. Medicine Schedules & Adherence
    console.log('💊 [Seed] Creating medicine reminders and adherence logs...');
    const medicines = await Medicine.create([
      {
        id: 'med-seed-1',
        patientId: 'usr-patient-1',
        name: 'Telmisartan',
        strength: '40mg',
        dosage: '1 Tablet',
        frequency: 'Once daily',
        timings: ['08:30 AM'],
        mealTiming: 'After Food',
        slotTiming: 'Morning',
        instructions: 'Essential for blood pressure maintenance. Do not skip.',
        startDate: '2026-09-01',
        endDate: '2026-12-31',
        isActive: true,
        adherenceHistory: {
          '2026-10-01': { Morning: true },
          '2026-10-02': { Morning: true },
          '2026-10-03': { Morning: true },
        },
      },
      {
        id: 'med-seed-2',
        patientId: 'usr-patient-1',
        name: 'Vitamin D3 (Cholecalciferol)',
        strength: '60,000 IU',
        dosage: '1 Capsule',
        frequency: 'Once weekly',
        timings: ['09:00 AM'],
        mealTiming: 'After Food',
        slotTiming: 'Morning',
        instructions: 'Take on Sunday morning after a glass of milk.',
        startDate: '2026-09-15',
        endDate: '2026-11-15',
        isActive: true,
        adherenceHistory: {
          '2026-09-20': { Morning: true },
          '2026-09-27': { Morning: true },
        },
      },
    ]);

    // 7. Health Records (Vault)
    console.log('📂 [Seed] Creating digital health vault records...');
    const healthRecords = await HealthRecord.create([
      {
        id: 'rec-seed-1',
        patientId: 'usr-patient-1',
        title: 'Comprehensive Lipid & Metabolic Profile',
        category: 'Lab Reports',
        recordDate: '2026-09-18',
        doctorName: 'Dr. Arun Kumar',
        facility: 'Lal PathLabs, Indiranagar, Bengaluru',
        fileUrl: '/uploads/records/lipid_profile_aarav.pdf',
        fileName: 'lipid_profile_aarav.pdf',
        fileSize: '1.4 MB',
        fileType: 'application/pdf',
        summary: 'Total Cholesterol 188 mg/dL (Normal < 200). HDL 48 mg/dL. Fasting Blood Sugar 94 mg/dL.',
        tags: ['Lipid', 'Cholesterol', 'Glucose', 'Cardio'],
      },
      {
        id: 'rec-seed-2',
        patientId: 'usr-patient-1',
        title: '12-Lead Resting Electrocardiogram (ECG)',
        category: 'Radiology / Scans',
        recordDate: '2026-07-12',
        doctorName: 'Dr. Priya Sharma',
        facility: 'Fortis Hospital Heart Station',
        fileUrl: '/uploads/records/resting_ecg_aarav.pdf',
        fileName: 'resting_ecg_aarav.pdf',
        fileSize: '2.1 MB',
        fileType: 'application/pdf',
        summary: 'Normal sinus rhythm, heart rate 72 bpm, PR interval 158 ms, no acute ischemic ST-T changes.',
        tags: ['ECG', 'Heart', 'Cardiology'],
      },
      {
        id: 'rec-seed-3',
        patientId: 'usr-patient-1',
        title: 'Discharge Summary - Laparoscopic Appendectomy',
        category: 'Discharge Summaries',
        recordDate: '2024-03-14',
        doctorName: 'Dr. Rajesh Patel',
        facility: 'Manipal Hospital, Old Airport Road',
        fileUrl: '/uploads/records/discharge_summary_appendix.pdf',
        fileName: 'discharge_summary_appendix.pdf',
        fileSize: '3.6 MB',
        fileType: 'application/pdf',
        summary: 'Uncomplicated laparoscopic appendectomy. Healed primarily without surgical site infection.',
        tags: ['Surgery', 'Discharge', 'Appendix'],
      },
    ]);

    // 8. Notifications
    console.log('🔔 [Seed] Creating in-app notifications...');
    await Notification.create([
      {
        id: 'notif-seed-1',
        userId: 'usr-patient-1',
        role: 'patient',
        type: 'appointment',
        title: 'Appointment Confirmed',
        message: 'Your Cardiology consultation with Dr. Priya Sharma is confirmed for Oct 10 at 10:00 AM.',
        link: '/appointments',
        isRead: false,
      },
      {
        id: 'notif-seed-2',
        userId: 'usr-patient-1',
        role: 'patient',
        type: 'medicine',
        title: 'Morning Dose Reminder',
        message: 'Time for your morning medication: Telmisartan (40mg). Tap to mark taken.',
        link: '/medicines',
        isRead: false,
      },
      {
        id: 'notif-seed-3',
        userId: 'usr-doc-1',
        role: 'doctor',
        type: 'appointment',
        title: 'New Patient Booking',
        message: 'Patient Aarav Patel booked a consultation for Oct 10 at 10:00 AM.',
        link: '/doctor/appointments',
        isRead: false,
      },
    ]);

    // 9. Audit Logs
    console.log('🔒 [Seed] Creating compliance audit logs...');
    await AuditLog.create([
      {
        id: 'aud-seed-1',
        timestamp: new Date(),
        status: 'SUCCESS',
        eventType: 'USER_LOGIN',
        actorId: 'usr-patient-1',
        actorEmail: 'patient@mediguide.com',
        actorRole: 'patient',
        details: { method: 'JWT_PASSWORD', ip: '127.0.0.1', device: 'Web Chrome' },
      },
      {
        id: 'aud-seed-2',
        timestamp: new Date(Date.now() - 3600000),
        status: 'SUCCESS',
        eventType: 'PRESCRIPTION_CREATED',
        actorId: 'usr-doc-6',
        actorEmail: 'dr.arun.kumar@mediguide.com',
        actorRole: 'doctor',
        details: { prescriptionId: 'rx-seed-1', patientId: 'usr-patient-1' },
      },
      {
        id: 'aud-seed-3',
        timestamp: new Date(Date.now() - 7200000),
        status: 'SUCCESS',
        eventType: 'APPOINTMENT_BOOKED',
        actorId: 'usr-patient-1',
        actorEmail: 'patient@mediguide.com',
        actorRole: 'patient',
        details: { appointmentId: 'apt-seed-1', doctorId: 'doc-1' },
      },
    ]);

    // 10. System Settings
    console.log('⚙️ [Seed] Initializing platform settings & emergency helplines...');
    await SystemSettings.create({
      id: 'system_settings_singleton',
      platformName: 'MediGuide India',
      tagline: 'AI-Powered Digital Healthcare Companion for India',
      aiProvider: 'clinical_knowledge_base',
      aiModel: 'gemini-1.5-flash',
      emergencyHelplines: {
        nationalEmergency: '112',
        ambulance: '108',
        maternalChild: '102',
        teleManasMentalHealth: '14416',
      },
      dpdpNotice:
        'MediGuide is designed in alignment with the Digital Personal Data Protection (DPDP) Act, 2023. Your health records and consultation data remain private, encrypted, and under your consent.',
      dpdpConsentText:
        'By using MediGuide, you acknowledge and consent to clinical data processing under India Digital Personal Data Protection Act, 2023.',
      maintenanceMode: false,
      allowNewRegistrations: true,
      version: '1.0.0 (India Release)',
    });

    console.log('\n===============================================================');
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log('===============================================================');
    console.log(`- Medical Departments : ${departments.length}`);
    console.log(`- Users               : ${users.length} (1 Admin, 6 Doctors, 2 Patients)`);
    console.log(`- Doctor Profiles     : ${doctors.length}`);
    console.log(`- Appointments        : ${appointments.length}`);
    console.log(`- Prescriptions       : ${prescriptions.length}`);
    console.log(`- Scheduled Medicines : ${medicines.length}`);
    console.log(`- Vault Health Records: ${healthRecords.length}`);
    console.log('===============================================================');
    console.log('🔑 DEMO CREDENTIALS:');
    console.log('  Admin  : admin@mediguide.com / admin123');
    console.log('  Doctor : dr.priya.sharma@mediguide.com / password123');
    console.log('  Patient: patient@mediguide.com / password123');
    console.log('===============================================================');

    await mongoose.disconnect();
    console.log('🔌 [Seed] Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed] Error populating seed data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
