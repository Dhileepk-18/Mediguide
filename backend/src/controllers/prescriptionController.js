import { z } from 'zod';
import { dbStore } from '../store/inMemoryStore.js';
import { isDbConnected } from '../config/db.js';
import {
  Prescription,
  User,
  Doctor,
  Appointment,
  Medicine,
  AuditLog,
  Notification,
} from '../models/schemas.js';
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

    let patient;
    let doctorProfile;

    if (isDbConnected()) {
      patient = await User.findOne({ id: data.patientId }).lean();
      doctorProfile = await Doctor.findOne({
        $or: [{ id: req.user.id }, { userId: req.user.id }, { email: req.user.email }],
      }).lean();
    } else {
      patient = dbStore.findUserById(data.patientId);
      doctorProfile =
        dbStore.findDoctorById(req.user.id) ||
        dbStore.getAllDoctors().find(d => d.userId === req.user?.id || d.email === req.user?.email);
    }

    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found' });
      return;
    }

    const docId = doctorProfile ? doctorProfile.id : req.user.id;
    let hasConsultation = false;
    if (data.appointmentId) {
      if (isDbConnected()) {
        const apt = await Appointment.findOne({
          id: data.appointmentId,
          doctorId: docId,
          patientId: patient.id,
        }).lean();
        if (apt) hasConsultation = true;
      } else {
        const apt = dbStore.findAppointmentById(data.appointmentId);
        if (apt && apt.doctorId === docId && apt.patientId === patient.id) hasConsultation = true;
      }
    } else {
      if (isDbConnected()) {
        const apt = await Appointment.findOne({ doctorId: docId, patientId: patient.id }).lean();
        if (apt) hasConsultation = true;
      } else {
        const apt = dbStore
          .getAppointments()
          .find(a => a.doctorId === docId && a.patientId === patient.id);
        if (apt) hasConsultation = true;
      }
    }

    if (!hasConsultation) {
      return res.status(403).json({
        success: false,
        message:
          'Forbidden: Doctors can only issue prescriptions to patients with whom they have a scheduled or past appointment',
      });
    }

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
      appointmentId: data.appointmentId || '',
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age || 28,
      patientGender: patient.gender || 'Other',
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
    };

    if (isDbConnected()) {
      const savedDoc = await Prescription.create(newPrescription);
      const saved = savedDoc.toObject();

      if (data.appointmentId) {
        await Appointment.findOneAndUpdate(
          { id: data.appointmentId },
          { $set: { status: 'completed', prescriptionId: saved.id } }
        );
      }

      // Auto-add prescribed medicines to patient's active medicine list
      for (const med of data.medicines) {
        await Medicine.create({
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
          adherenceHistory: {},
        });
      }

      await AuditLog.create({
        id: `aud-${Date.now()}`,
        eventType: 'PRESCRIPTION_CREATE',
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: 'doctor',
        details: `Doctor ${doctorName} generated prescription #${saved.id} for patient ${patient.name} (${data.diagnosis}).`,
      });

      await Notification.create({
        id: `notif-${Date.now()}`,
        userId: patient.id,
        role: 'patient',
        type: 'prescription',
        title: 'New Prescription Issued',
        message: `${doctorName} issued digital prescription for "${data.diagnosis}". Prescribed medicines have been synchronized to your Medicine Tracker.`,
        link: '/prescriptions',
      });

      return res.status(201).json({
        success: true,
        message: 'Prescription created and medicines synced to patient tracker',
        prescription: saved,
      });
    }

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

  if (isDbConnected()) {
    try {
      let prescriptions = [];
      if (req.user.role === 'patient') {
        prescriptions = await Prescription.find({ patientId: req.user.id }).sort({ date: -1 }).lean();
      } else if (req.user.role === 'doctor') {
        const doc = await Doctor.findOne({
          $or: [{ id: req.user.id }, { userId: req.user?.id }, { email: req.user?.email }],
        }).lean();
        if (doc) {
          prescriptions = await Prescription.find({ doctorId: doc.id }).sort({ date: -1 }).lean();
        }
      } else if (req.user.role === 'admin') {
        prescriptions = await Prescription.find().sort({ date: -1 }).lean();
      }
      return res.json({ success: true, prescriptions });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve prescriptions' });
    }
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

  let prescription;
  let doctorProfile;

  if (isDbConnected()) {
    prescription = await Prescription.findOne({ id }).lean();
    doctorProfile = await Doctor.findOne({
      $or: [{ id: req.user.id }, { userId: req.user?.id }, { email: req.user?.email }],
    }).lean();
  } else {
    prescription = dbStore.findPrescriptionById(id);
    doctorProfile =
      dbStore.findDoctorById(req.user.id) ||
      dbStore.getAllDoctors().find(d => d.userId === req.user?.id || d.email === req.user?.email);
  }

  if (!prescription) {
    res.status(404).json({ success: false, message: 'Prescription not found' });
    return;
  }

  const isOwnerPatient = prescription.patientId === req.user.id;
  const isAssignedDoctor = doctorProfile && prescription.doctorId === doctorProfile.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwnerPatient && !isAssignedDoctor && !isAdmin) {
    res.status(403).json({
      success: false,
      message: 'Forbidden: You do not have permission to view this prescription',
    });
    return;
  }

  const auditDetails = `${req.user.role.toUpperCase()} ${req.user.name} accessed digital prescription #${prescription.id}.`;
  if (isDbConnected()) {
    await AuditLog.create({
      id: `aud-${Date.now()}`,
      eventType: 'PRESCRIPTION_ACCESS',
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      details: auditDetails,
    }).catch(() => {});
  } else {
    dbStore.addAuditLog({
      eventType: 'PRESCRIPTION_ACCESS',
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      details: auditDetails,
    });
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

    let prescription;
    let doctorProfile;

    if (isDbConnected()) {
      prescription = await Prescription.findOne({ id }).lean();
      doctorProfile = await Doctor.findOne({
        $or: [{ id: req.user.id }, { userId: req.user?.id }, { email: req.user?.email }],
      }).lean();
    } else {
      prescription = dbStore.findPrescriptionById(id);
      doctorProfile =
        dbStore.findDoctorById(req.user.id) ||
        dbStore.getAllDoctors().find(d => d.userId === req.user?.id || d.email === req.user?.email);
    }

    if (!prescription) {
      res.status(404).json({ success: false, message: 'Prescription not found' });
      return;
    }

    const isOwnerPatient = prescription.patientId === req.user.id;
    const isAssignedDoctor = doctorProfile && prescription.doctorId === doctorProfile.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwnerPatient && !isAssignedDoctor && !isAdmin) {
      res.status(403).json({ success: false, message: 'Unauthorized: cannot access this prescription' });
      return;
    }

    const auditDetails = `${req.user.role.toUpperCase()} ${req.user.name} downloaded prescription PDF for #${prescription.id}.`;
    if (isDbConnected()) {
      await AuditLog.create({
        id: `aud-${Date.now()}`,
        eventType: 'PRESCRIPTION_PDF_DOWNLOAD',
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        details: auditDetails,
      }).catch(() => {});
    } else {
      dbStore.addAuditLog({
        eventType: 'PRESCRIPTION_PDF_DOWNLOAD',
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        details: auditDetails,
      });
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
