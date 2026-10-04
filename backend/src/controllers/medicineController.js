import { z } from 'zod';
import { dbStore } from '../store/inMemoryStore.js';
import { isDbConnected } from '../config/db.js';
import { Medicine, DoseLog, Doctor, Appointment } from '../models/schemas.js';

const medicineSchema = z.object({
  name: z.string().min(2, 'Medicine name is required'),
  strength: z.string().optional(),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  timings: z.array(z.string()).min(1, 'At least one reminder time is required'),
  mealTiming: z.string().default('After Food'),
  slotTiming: z.string().default('Morning'),
  instructions: z.string().default('Take with water after meals'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const updateMedicineSchema = z.object({
  name: z.string().min(2).optional(),
  strength: z.string().optional(),
  dosage: z.string().min(1).optional(),
  frequency: z.string().min(1).optional(),
  timings: z.array(z.string()).optional(),
  mealTiming: z.string().optional(),
  slotTiming: z.string().optional(),
  instructions: z.string().optional(),
  isActive: z.boolean().optional(),
  active: z.boolean().optional(),
});

const adherenceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  taken: z.boolean().default(true),
});

export const getMedicines = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  let patientId = req.user.id;

  // 1. Patient RBAC: Patients can only view their own medicine tracker
  if (req.user.role === 'patient') {
    if (req.query.patientId && req.query.patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Patients can only access their own medication tracker',
      });
    }
  }

  // 2. Doctor RBAC: Doctors can only access medicines of patients they have an appointment with
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
            message: 'Forbidden: Doctors can only access medications of patients with whom they have an appointment',
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
            message: 'Forbidden: Doctors can only access medications of patients with whom they have an appointment',
          });
        }
      }
      patientId = targetPatientId;
    }
  }

  // 3. Admin RBAC: Admins can inspect requested patientId
  if (req.user.role === 'admin' && req.query.patientId && typeof req.query.patientId === 'string') {
    patientId = req.query.patientId;
  }

  if (isDbConnected()) {
    try {
      const medicines = await Medicine.find({ patientId }).sort({ createdAt: -1 }).lean();
      return res.json({ success: true, medicines });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve medicines' });
    }
  }

  const medicines = dbStore.getMedicinesByPatientId(patientId);
  res.json({ success: true, medicines });
};

export const addMedicine = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const data = medicineSchema.parse(req.body);
    const newMedicine = {
      id: `med-${Date.now()}`,
      patientId: req.user.id,
      name: data.name,
      strength: data.strength || '',
      dosage: data.dosage,
      frequency: data.frequency,
      timings: data.timings,
      mealTiming: data.mealTiming,
      slotTiming: data.slotTiming,
      instructions: data.instructions,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate,
      isActive: true,
      adherenceHistory: {},
    };

    if (isDbConnected()) {
      const savedDoc = await Medicine.create(newMedicine);
      return res
        .status(201)
        .json({ success: true, message: 'Medicine reminder added', medicine: savedDoc.toObject() });
    }

    const saved = dbStore.addMedicine(newMedicine);
    res.status(201).json({ success: true, message: 'Medicine reminder added', medicine: saved });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to add medicine' });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const validatedData = updateMedicineSchema.parse(req.body);

    if (isDbConnected()) {
      const medicine = await Medicine.findOne({ id }).lean();
      if (!medicine) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }
      if (medicine.patientId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to update this medicine',
        });
      }

      const updated = await Medicine.findOneAndUpdate(
        { id },
        { $set: validatedData },
        { new: true }
      ).lean();
      return res.json({ success: true, message: 'Medicine updated', medicine: updated });
    }

    const medicine = dbStore.findMedicineById(id);
    if (!medicine) {
      res.status(404).json({ success: false, message: 'Medicine not found' });
      return;
    }
    if (medicine.patientId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to update this medicine',
      });
      return;
    }
    const updated = dbStore.updateMedicine(id, validatedData);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Medicine not found' });
      return;
    }
    res.json({ success: true, message: 'Medicine updated', medicine: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Failed to update medicine' });
  }
};

export const deleteMedicine = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const { id } = req.params;

  if (isDbConnected()) {
    try {
      const medicine = await Medicine.findOne({ id }).lean();
      if (!medicine) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }
      if (medicine.patientId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to delete this medicine',
        });
      }

      await Medicine.findOneAndDelete({ id });
      return res.json({ success: true, message: 'Medicine reminder deleted' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to delete medicine' });
    }
  }

  const medicine = dbStore.findMedicineById(id);
  if (!medicine) {
    res.status(404).json({ success: false, message: 'Medicine not found' });
    return;
  }
  if (medicine.patientId !== req.user.id && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Forbidden: You do not have permission to delete this medicine',
    });
    return;
  }
  const deleted = dbStore.deleteMedicine(id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Medicine not found' });
    return;
  }
  res.json({ success: true, message: 'Medicine reminder deleted' });
};

export const logAdherence = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const { date, timeSlot, taken } = adherenceSchema.parse(req.body);

    if (isDbConnected()) {
      const medicine = await Medicine.findOne({ id });
      if (!medicine) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }
      if (medicine.patientId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to log adherence for this medicine',
        });
      }

      const history = medicine.adherenceHistory || {};
      if (!history[date]) {
        history[date] = {};
      }
      history[date][timeSlot] = taken;
      medicine.adherenceHistory = history;
      medicine.markModified('adherenceHistory');
      await medicine.save();

      // Log in atomic DoseLog
      await DoseLog.create({
        id: `dose-${Date.now()}`,
        medicineId: id,
        patientId: medicine.patientId,
        date,
        timeSlot,
        taken: Boolean(taken),
      });

      return res.json({ success: true, message: 'Adherence logged', medicine: medicine.toObject() });
    }

    const medicine = dbStore.findMedicineById(id);
    if (!medicine) {
      res.status(404).json({ success: false, message: 'Medicine not found' });
      return;
    }
    if (medicine.patientId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to log adherence for this medicine',
      });
      return;
    }
    const updated = dbStore.logMedicineAdherence(id, { date, timeSlot, taken });
    res.json({ success: true, message: 'Adherence logged', medicine: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Failed to log adherence' });
  }
};
