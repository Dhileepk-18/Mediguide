import mongoose from 'mongoose';

const { Schema } = mongoose;

// Helper to strip _id and __v from toJSON / toObject if desired
const schemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

// 1. USER Schema
export const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // BCrypt hashed password
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient', required: true },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String, default: '' },
    abhaId: { type: String, default: '' }, // Ayushman Bharat Health Account ID
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    preferredLanguage: { type: String, default: 'English' },
    emergencyContact: { type: String, default: '' },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    refreshToken: { type: String, default: '' },
    tokenVersion: { type: Number, default: 0 },
  },
  schemaOptions
);

// 2. DOCTOR Schema / DoctorProfile
export const DoctorSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    specialization: { type: String, required: true },
    department: { type: String, required: true, index: true },
    qualification: { type: String, default: 'MBBS, MD' },
    registrationNumber: { type: String, required: true }, // NMC / State Medical Council ID
    experienceYears: { type: Number, default: 5 },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    hospital: { type: String, default: '' },
    consultationFee: { type: Number, default: 500 }, // Fee in INR (₹)
    city: { type: String, default: '', index: true },
    state: { type: String, default: '' },
    languages: [{ type: String }],
    consultationModes: [{ type: String }], // 'In-Person', 'Audio/Telehealth'
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    availableDays: [{ type: String }],
    availableTimeSlots: [{ type: String }],
    workingHours: { type: String, default: '09:00 AM - 05:00 PM' },
    slotDurationMinutes: { type: Number, default: 30 },
    verificationStatus: { type: String, enum: ['verified', 'pending', 'rejected'], default: 'verified' },
    isAvailable: { type: Boolean, default: true },
  },
  schemaOptions
);

// 3. DEPARTMENT Schema
export const DepartmentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, index: true },
    code: { type: String, default: '' },
    icon: { type: String, default: '' },
    description: { type: String, default: '' },
    commonConditions: [{ type: String }],
    headDoctor: { type: String, default: '' },
    doctorCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  schemaOptions
);

// 4. APPOINTMENT Schema
export const AppointmentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientEmail: { type: String, default: '' },
    patientPhone: { type: String, default: '' },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    doctorSpecialization: { type: String, default: '' },
    doctorAvatar: { type: String, default: '' },
    department: { type: String, required: true },
    consultationMode: { type: String, default: 'In-Person' },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    timeSlot: { type: String, required: true }, // Format: HH:MM AM/PM
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'no-show'],
      default: 'confirmed',
    },
    reason: { type: String, default: 'General Consultation' },
    symptoms: [{ type: String }],
    notes: { type: String, default: '' },
    prescriptionId: { type: String, default: '' },
  },
  schemaOptions
);
// Compound index to facilitate double-booking conflict detection
AppointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 }, { unique: false });

// 5. PRESCRIPTION Schema
export const PrescriptionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    appointmentId: { type: String, default: '' },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientAge: { type: Number },
    patientGender: { type: String },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    doctorSpecialization: { type: String, default: '' },
    doctorHospital: { type: String, default: '' },
    registrationNumber: { type: String, default: '' },
    date: { type: String, required: true },
    diagnosis: { type: String, default: '' },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, default: 'Once daily' },
        duration: { type: String, default: '5 days' },
        instructions: { type: String, default: '' },
      },
    ],
    diagnosticTests: [{ type: String }],
    generalAdvice: { type: String, default: '' },
    followUpDate: { type: String, default: '' },
    digitalSignature: { type: String, default: '' },
    qrVerificationCode: { type: String, default: '' },
  },
  schemaOptions
);

// 6. HEALTH_RECORD Schema
export const HealthRecordSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    recordDate: { type: String, default: '' },
    doctorName: { type: String, default: '' },
    facility: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileSize: { type: String, default: '' },
    fileType: { type: String, default: 'application/pdf' },
    summary: { type: String, default: '' },
    tags: [{ type: String }],
  },
  schemaOptions
);

// 7. MEDICINE_SCHEDULE Schema (Medicine)
export const MedicineSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    strength: { type: String, default: '' },
    dosage: { type: String, required: true },
    frequency: { type: String, default: 'Once daily' },
    timings: [{ type: String }],
    mealTiming: { type: String, default: 'After Food' },
    slotTiming: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
      default: 'Morning',
    },
    instructions: { type: String, default: '' },
    startDate: { type: String },
    endDate: { type: String },
    isActive: { type: Boolean, default: true },
    adherenceHistory: { type: Schema.Types.Mixed, default: {} },
  },
  schemaOptions
);

// 7b. DOSE_LOG Schema (Atomic Dose Logs)
export const DoseLogSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    medicineId: { type: String, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    taken: { type: Boolean, default: true },
    loggedAt: { type: Date, default: Date.now },
  },
  schemaOptions
);

// 8. AUDIT_LOG Schema
export const AuditLogSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: 'SUCCESS' },
    eventType: { type: String, required: true },
    actorId: { type: String, required: true },
    actorEmail: { type: String, default: '' },
    actorRole: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String, default: '' },
  },
  schemaOptions
);

// 9. CHAT_HISTORY Schema
export const ChatHistorySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, default: 'General Healthcare Inquiry' },
    messages: [
      {
        id: { type: String },
        sender: { type: String, enum: ['user', 'assistant', 'system'] },
        text: { type: String },
        timestamp: { type: String },
        suggestions: [{ type: String }],
      },
    ],
    lastUpdated: { type: String },
  },
  schemaOptions
);

// 10. SYMPTOM_CHECK Schema
export const SymptomCheckSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    symptoms: [{ type: String }],
    severity: { type: String },
    duration: { type: String },
    bodyArea: { type: String },
    additionalNotes: { type: String },
    modelUsed: { type: String },
    confidence: { type: Number },
    recommendedDepartment: { type: String },
    alternativeDepartments: [{ type: Schema.Types.Mixed }],
    preliminaryGuidance: { type: String },
    possibleConditions: [{ type: String }],
    urgencyLevel: { type: String },
    redFlagDetected: { type: Boolean, default: false },
    isEmergency: { type: Boolean, default: false },
    contributingFactors: [{ type: String }],
    explanation: { type: String, default: '' },
    emergencyContacts: { type: Schema.Types.Mixed },
    matchedDoctorIds: [{ type: String }],
    disclaimer: { type: String },
  },
  schemaOptions
);

// 11. NOTIFICATION Schema
export const NotificationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    role: { type: String, default: 'patient' },
    type: { type: String, default: 'general' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
  },
  schemaOptions
);

// 12. SYSTEM_SETTINGS Schema
export const SystemSettingsSchema = new Schema(
  {
    id: { type: String, default: 'system_settings_singleton', unique: true },
    platformName: { type: String, default: 'MediGuide India' },
    tagline: { type: String, default: 'AI-Powered Digital Healthcare Companion for India' },
    aiProvider: { type: String, default: 'clinical_knowledge_base' },
    aiModel: { type: String, default: 'gemini-1.5-flash' },
    emergencyHelplines: {
      nationalEmergency: { type: String, default: '112' },
      ambulance: { type: String, default: '108' },
      maternalChild: { type: String, default: '102' },
      teleManasMentalHealth: { type: String, default: '14416' },
    },
    dpdpNotice: { type: String },
    dpdpConsentText: { type: String },
    maintenanceMode: { type: Boolean, default: false },
    allowNewRegistrations: { type: Boolean, default: true },
    version: { type: String, default: '1.0.0 (India Release)' },
  },
  schemaOptions
);

// Mongoose Models
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
export const DoctorProfile = Doctor; // Alias for explicit task requirements
export const Department = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
export const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);
export const HealthRecord = mongoose.models.HealthRecord || mongoose.model('HealthRecord', HealthRecordSchema);
export const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);
export const MedicineSchedule = Medicine; // Alias for explicit task requirements
export const DoseLog = mongoose.models.DoseLog || mongoose.model('DoseLog', DoseLogSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
export const ChatHistory = mongoose.models.ChatHistory || mongoose.model('ChatHistory', ChatHistorySchema);
export const SymptomCheck = mongoose.models.SymptomCheck || mongoose.model('SymptomCheck', SymptomCheckSchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const SystemSettings = mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema);
