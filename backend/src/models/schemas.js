import mongoose from 'mongoose';

const { Schema } = mongoose;

// 1. USER Schema
export const UserSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient', required: true },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    preferredLanguage: { type: String, default: 'English' },
    emergencyContact: { type: String, default: '' },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
  },
  { timestamps: true }
);

// 2. DOCTOR Schema
export const DoctorSchema = new Schema(
  {
    doctorId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, ref: 'User' },
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    department: { type: String, required: true, index: true },
    experience: { type: String, default: '5+ years' },
    registrationNumber: { type: String, required: true },
    facility: { type: String, default: '' },
    city: { type: String, default: '', index: true },
    languages: [{ type: String }],
    consultationMode: { type: String, enum: ['In-Person', 'Audio/Telehealth', 'Both'], default: 'Both' },
    rating: { type: Number, default: 4.8 },
    verified: { type: Boolean, default: false },
    availableSlots: [{ type: String }],
  },
  { timestamps: true }
);

// 3. APPOINTMENT Schema with Concurrency / Conflict Index (PRD Section 11 & 18)
export const AppointmentSchema = new Schema(
  {
    appointmentId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    time: { type: String, required: true }, // Format: HH:MM AM/PM
    mode: { type: String, enum: ['In-Person', 'Audio/Telehealth'], default: 'In-Person' },
    reason: { type: String, default: 'General Consultation' },
    status: {
      type: String,
      enum: ['requested', 'pending', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'no-show'],
      default: 'confirmed',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);
// Compound index to prevent double-booking for the same doctor, date, and time
AppointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: false });

// 4. CHAT_HISTORY Schema
export const ChatHistorySchema = new Schema(
  {
    chatId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, default: 'General Healthcare Inquiry' },
    messages: [
      {
        id: { type: String },
        sender: { type: String, enum: ['user', 'assistant', 'system'] },
        text: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// 5. SYMPTOM_CHECK Schema
export const SymptomCheckSchema = new Schema(
  {
    checkId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    symptoms: [{ type: String }],
    duration: { type: String },
    severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'] },
    recommendedDepartment: { type: String },
    confidence: { type: Number },
    alternativeDepartments: [
      {
        department: { type: String },
        confidence: { type: Number },
      },
    ],
    redFlagDetected: { type: Boolean, default: false },
    guidance: { type: String },
  },
  { timestamps: true }
);

// 6. MEDICINE Schema
export const MedicineSchema = new Schema(
  {
    medicineId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    strength: { type: String, default: '' },
    dosage: { type: String, required: true },
    slotTiming: { type: String, enum: ['Morning', 'Afternoon', 'Evening', 'Night'], default: 'Morning' },
    mealTiming: { type: String, default: 'After Food' },
    instructions: { type: String, default: '' },
    startDate: { type: String },
    endDate: { type: String },
    active: { type: Boolean, default: true },
    adherenceLogs: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// 7. HEALTH_RECORD Schema
export const HealthRecordSchema = new Schema(
  {
    recordId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    fileReference: { type: String },
    fileUrl: { type: String },
    mimeType: { type: String, default: 'application/pdf' },
    fileSize: { type: String },
    recordDate: { type: String },
    doctorName: { type: String, default: '' },
    facility: { type: String, default: '' },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

// 8. PRESCRIPTION Schema
export const PrescriptionSchema = new Schema(
  {
    prescriptionId: { type: String, required: true, unique: true, index: true },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    doctorRegistration: { type: String, default: '' },
    userId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    appointmentId: { type: String },
    date: { type: String, required: true },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, default: 'Once daily' },
        duration: { type: String, default: '5 days' },
        instructions: { type: String, default: '' },
      },
    ],
    instructions: { type: String, default: '' },
    doctorNotes: { type: String, default: '' },
    followUpDate: { type: String, default: '' },
    pdfReference: { type: String },
  },
  { timestamps: true }
);

// 9. AUDIT_LOG Schema
export const AuditLogSchema = new Schema(
  {
    logId: { type: String, required: true, unique: true, index: true },
    actorId: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String },
    timestamp: { type: Date, default: Date.now },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Models
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
export const ChatHistory = mongoose.models.ChatHistory || mongoose.model('ChatHistory', ChatHistorySchema);
export const SymptomCheck = mongoose.models.SymptomCheck || mongoose.model('SymptomCheck', SymptomCheckSchema);
export const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);
export const HealthRecord = mongoose.models.HealthRecord || mongoose.model('HealthRecord', HealthRecordSchema);
export const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
