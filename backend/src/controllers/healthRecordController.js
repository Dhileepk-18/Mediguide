import { z } from 'zod';
import { dbStore } from '../store/inMemoryStore.js';
import { isDbConnected } from '../config/db.js';
import { HealthRecord, AuditLog, Notification, Doctor, Appointment } from '../models/schemas.js';

const recordSchema = z.object({
  title: z.string().min(2, 'Record title is required'),
  category: z.enum([
    'Lab Report',
    'Lab Reports',
    'Prescription',
    'Prescriptions',
    'Imaging / X-Ray',
    'Radiology / Scans',
    'Vaccination',
    'Vaccination Records',
    'Discharge Summary',
    'Discharge Summaries',
    'Insurance / Invoices',
    'Referral',
    'General',
  ]),
  recordDate: z.string(),
  doctorName: z.string().optional(),
  facility: z.string().optional(),
  fileUrl: z.string().default(''),
  fileName: z.string().default('medical_document.pdf'),
  fileSize: z.string().default('1.0 MB'),
  fileType: z.string().default('application/pdf'),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const getHealthRecords = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  let patientId = req.user.id;

  // 1. Strict Patient Isolation: Patients can NEVER access another patient's records
  if (req.user.role === 'patient') {
    if (req.query.patientId && req.query.patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Patients can only access their own health records',
      });
    }
  }

  // 2. Doctor RBAC: A doctor can ONLY access records of patients they have an appointment with
  if (req.user.role === 'doctor') {
    if (req.query.patientId && req.query.patientId !== req.user.id) {
      const targetPatientId = req.query.patientId;
      if (isDbConnected()) {
        const doc = await Doctor.findOne({
          $or: [{ id: req.user.id }, { userId: req.user.id }, { email: req.user.email }],
        }).lean();
        const docId = doc ? doc.id : req.user.id;
        const hasAppointment = await Appointment.findOne({
          doctorId: docId,
          patientId: targetPatientId,
        }).lean();
        if (!hasAppointment) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: Doctors can only access records of patients with whom they have an appointment',
          });
        }
      } else {
        const doc =
          dbStore.findDoctorById(req.user.id) ||
          dbStore.getAllDoctors().find(d => d.userId === req.user.id || d.email === req.user.email);
        const docId = doc ? doc.id : req.user.id;
        const hasAppointment = dbStore
          .getAppointments()
          .some(a => a.doctorId === docId && a.patientId === targetPatientId);
        if (!hasAppointment) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: Doctors can only access records of patients with whom they have an appointment',
          });
        }
      }
      patientId = targetPatientId;
    }
  }

  // 3. Admin RBAC: Admins can inspect requested patient's records
  if (req.user.role === 'admin' && req.query.patientId && typeof req.query.patientId === 'string') {
    patientId = req.query.patientId;
  }

  // Audit Record Access Event
  const auditDetails = `${req.user.role.toUpperCase()} ${req.user.name} accessed health records vault of patient ${patientId}.`;
  if (isDbConnected()) {
    await AuditLog.create({
      id: `aud-${Date.now()}`,
      eventType: 'RECORD_ACCESS',
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      details: auditDetails,
    }).catch(() => {});
  } else {
    dbStore.addAuditLog({
      eventType: 'RECORD_ACCESS',
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      details: auditDetails,
    });
  }

  if (isDbConnected()) {
    try {
      const records = await HealthRecord.find({ patientId }).sort({ createdAt: -1 }).lean();
      return res.json({ success: true, records });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve records' });
    }
  }

  const records = dbStore.getHealthRecordsByPatientId(patientId);
  res.json({ success: true, records });
};

export const addHealthRecord = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const data = recordSchema.parse(req.body);
    const newRecord = {
      id: `rec-${Date.now()}`,
      patientId: req.user.id,
      title: data.title,
      category: data.category,
      recordDate: data.recordDate || new Date().toISOString().split('T')[0],
      doctorName: data.doctorName || 'Dr. Self Upload',
      facility: data.facility || 'MediGuide Digital Vault, India',
      fileUrl:
        data.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      summary: data.summary || 'Uploaded medical record document.',
      tags: data.tags || [data.category],
    };

    if (isDbConnected()) {
      const savedDoc = await HealthRecord.create(newRecord);
      const saved = savedDoc.toObject();

      await AuditLog.create({
        id: `aud-${Date.now()}`,
        eventType: 'RECORD_UPLOAD',
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        details: `Patient uploaded health record "${data.title}" (${data.category}, ${data.fileName}).`,
      });

      await Notification.create({
        id: `notif-${Date.now()}`,
        userId: req.user.id,
        role: req.user.role,
        type: 'record',
        title: 'Health Document Vaulted',
        message: `"${data.title}" (${data.category}) has been securely encrypted and stored in your vault.`,
        link: '/health-records',
      });

      return res
        .status(201)
        .json({ success: true, message: 'Health record uploaded successfully', record: saved });
    }

    const saved = dbStore.addHealthRecord(newRecord);

    // Audit Log
    dbStore.addAuditLog({
      eventType: 'RECORD_UPLOAD',
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      details: `Patient uploaded health record "${data.title}" (${data.category}, ${data.fileName}).`,
    });

    // Notification
    dbStore.addNotification({
      userId: req.user.id,
      role: req.user.role,
      type: 'record',
      title: 'Health Document Vaulted',
      message: `"${data.title}" (${data.category}) has been securely encrypted and stored in your vault.`,
      link: '/health-records',
    });

    res
      .status(201)
      .json({ success: true, message: 'Health record uploaded successfully', record: saved });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to save health record' });
  }
};

export const deleteHealthRecord = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const { id } = req.params;

  if (isDbConnected()) {
    try {
      const record = await HealthRecord.findOne({ id }).lean();
      if (!record) {
        return res.status(404).json({ success: false, message: 'Health record not found' });
      }
      if (record.patientId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to delete this record',
        });
      }

      await HealthRecord.findOneAndDelete({ id });

      await AuditLog.create({
        id: `aud-${Date.now()}`,
        eventType: 'RECORD_DELETE',
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        details: `Deleted health record "${record.title}" (${record.fileName}) from digital vault.`,
      });

      return res.json({ success: true, message: 'Health record deleted' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to delete health record' });
    }
  }

  const record = dbStore.findHealthRecordById(id);
  if (!record) {
    res.status(404).json({ success: false, message: 'Health record not found' });
    return;
  }
  // Strict IDOR prevention: Only the owning patient or an admin can delete
  if (record.patientId !== req.user.id && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Forbidden: You do not have permission to delete this record',
    });
    return;
  }

  const deleted = dbStore.deleteHealthRecord(id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Health record not found' });
    return;
  }

  // Audit Log
  dbStore.addAuditLog({
    eventType: 'RECORD_DELETE',
    actorId: req.user.id,
    actorEmail: req.user.email,
    actorRole: req.user.role,
    details: `Deleted health record "${record.title}" (${record.fileName}) from digital vault.`,
  });

  res.json({ success: true, message: 'Health record deleted' });
};
