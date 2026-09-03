import { z } from 'zod';
import { dbStore } from '../store/inMemoryStore.js';
import { generatePrescriptionPDF } from '../services/pdfService.js';

const prescribedMedicineSchema = z.object({
  name: z.string().min(1, 'Medicine name required'),
  strength: z.string().optional(),
  dosage: z.string().min(1, 'Dosage required'),
  route: z.string().default('Oral'),
  frequency: z.string().min(1, 'Frequency required'),
  timing: z.string().optional(),
  duration: z.string().min(1, 'Duration required'),
  instructions: z.string().default('Take as instructed by physician'),
});

const createPrescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  appointmentId: z.string().optional(),
  diagnosis: z.string().min(3, 'Clinical diagnosis is required'),
  medicines: z.array(prescribedMedicineSchema).min(1, 'At least one medicine is required'),
  diagnosticTests: z.array(z.string()).optional(),
  generalAdvice: z.string().optional(),
  followUpDate: z.string().optional(),
});

export const createPrescription = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      res
        .status(403)
        .json({ success: false, message: 'Only authorized doctors can create prescriptions' });
      return;
    }

    const data = createPrescriptionSchema.parse(req.body);
    const patient = dbStore.findUserById(data.patientId);
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found' });
      return;
    }

    const doctorProfile =
      dbStore.findDoctorById(req.user.id) ||
      dbStore.getAllDoctors().find(d => d.userId === req.user?.id || d.email === req.user?.email);

    const doctorName = doctorProfile ? doctorProfile.name : req.user.name;
    const doctorSpecialization = doctorProfile
      ? doctorProfile.specialization
      : 'Medical Practitioner';
    const doctorHospital = doctorProfile
      ? doctorProfile.hospital
      : 'MediGuide Health Center, India';
    const registrationNumber =
      doctorProfile?.registrationNumber || `NMC-${Date.now().toString().slice(-6)}`;
    const prescriptionId = `rx-${Date.now()}`;
    const qrVerificationCode = `MG-RX-IN-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const newPrescription = {
      id: prescriptionId,
      appointmentId: data.appointmentId,
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age || 28,
      patientGender: patient.gender || 'Other',
      patientPhone: patient.phone || '',
      patientCity: patient.city || 'Bengaluru',
      doctorId: doctorProfile ? doctorProfile.id : req.user.id,
      doctorName,
      doctorSpecialization,
      doctorHospital,
      registrationNumber,
      date: new Date().toISOString().split('T')[0],
      diagnosis: data.diagnosis,
      medicines: data.medicines,
      diagnosticTests: data.diagnosticTests || [],
      generalAdvice: data.generalAdvice || 'Follow dosage instructions and take prescribed rest.',
      followUpDate: data.followUpDate || '',
      digitalSignature: `Digitally Verified by ${doctorName} (Reg #${registrationNumber})`,
      qrVerificationCode,
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

    // Auto-add prescribed medicines to patient's active medicine list
    for (const med of data.medicines) {
      dbStore.addMedicine({
        id: `med-rx-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        patientId: patient.id,
        name: med.strength ? `${med.name} (${med.strength})` : med.name,
        strength: med.strength || '',
        dosage: med.dosage,
        frequency: med.frequency,
        timings: med.frequency.toLowerCase().includes('twice')
          ? ['09:00 AM', '09:00 PM']
          : med.frequency.toLowerCase().includes('thrice')
            ? ['08:00 AM', '02:00 PM', '09:00 PM']
            : ['09:00 AM'],
        mealTiming: med.instructions.toLowerCase().includes('before')
          ? 'Before Food'
          : 'After Food',
        slotTiming: 'Daily',
        instructions: med.instructions,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        isActive: true,
        adherenceHistory: [],
        createdAt: new Date().toISOString(),
      });
    }

    // Audit Log
    dbStore.addAuditLog({
      eventType: 'PRESCRIPTION_CREATE',
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: 'doctor',
      details: `Doctor ${doctorName} generated prescription #${saved.id} for patient ${patient.name} (${data.diagnosis}).`,
    });

    // Patient Notification
    dbStore.addNotification({
      userId: patient.id,
      role: 'patient',
      type: 'prescription',
      title: 'New Prescription Issued',
      message: `${doctorName} issued digital prescription for "${data.diagnosis}". Prescribed medicines have been synchronized to your Medicine Tracker.`,
      link: '/prescriptions',
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created and medicines synced to patient tracker',
      prescription: saved,
    });
  } catch (error) {
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
  } else if (req.user.role === 'doctor') {
    const doc =
      dbStore.findDoctorById(req.user.id) ||
      dbStore.getAllDoctors().find(d => d.userId === req.user?.id || d.email === req.user?.email);
    if (doc) {
      prescriptions = dbStore.getPrescriptionsByDoctorId(doc.id);
    } else {
      prescriptions = [];
    }
  } else if (req.user.role === 'admin') {
    prescriptions = [...dbStore.prescriptions];
  }
  res.json({ success: true, prescriptions });
};

export const getPrescriptionById = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const { id } = req.params;
  const prescription = dbStore.findPrescriptionById(id);
  if (!prescription) {
    res.status(404).json({ success: false, message: 'Prescription not found' });
    return;
  }

  const isOwnerPatient = prescription.patientId === req.user.id;
  const doctorProfile =
    dbStore.findDoctorById(req.user.id) ||
    dbStore.getAllDoctors().find(d => d.userId === req.user?.id || d.email === req.user?.email);
  const isAssignedDoctor = doctorProfile && prescription.doctorId === doctorProfile.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwnerPatient && !isAssignedDoctor && !isAdmin) {
    res
      .status(403)
      .json({
        success: false,
        message: 'Forbidden: You do not have permission to view this prescription',
      });
    return;
  }
  res.json({ success: true, prescription });
};

export const downloadPrescriptionPDF = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const prescription = dbStore.findPrescriptionById(id);
    if (!prescription) {
      res.status(404).json({ success: false, message: 'Prescription not found' });
      return;
    }

    const isOwnerPatient = prescription.patientId === req.user.id;
    const doctorProfile =
      dbStore.findDoctorById(req.user.id) ||
      dbStore.getAllDoctors().find(d => d.userId === req.user?.id || d.email === req.user?.email);
    const isAssignedDoctor = doctorProfile && prescription.doctorId === doctorProfile.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwnerPatient && !isAssignedDoctor && !isAdmin) {
      res.status(403).json({ success: false, message: 'Unauthorized: cannot access this prescription' });
      return;
    }

    const pdfBuffer = await generatePrescriptionPDF(prescription);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Prescription_${prescription.id || id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Prescription PDF generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate PDF document' });
  }
};

