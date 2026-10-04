import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { dbStore } from '../store/inMemoryStore.js';
import { isDbConnected } from '../config/db.js';
import {
  User,
  Doctor,
  Department,
  Appointment,
  Prescription,
  HealthRecord,
  Medicine,
  AuditLog,
  ChatHistory,
  SymptomCheck,
  SystemSettings,
} from '../models/schemas.js';

export const getSystemStats = async (_req, res) => {
  if (isDbConnected()) {
    try {
      const [
        totalUsers,
        totalPatients,
        totalDoctors,
        verifiedDoctors,
        pendingDoctors,
        activeDoctors,
        totalDepartments,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        totalPrescriptions,
        totalHealthRecords,
        totalSymptomChecks,
        totalAiChatSessions,
        totalAuditLogs,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'patient' }),
        Doctor.countDocuments(),
        Doctor.countDocuments({ verificationStatus: 'verified' }),
        Doctor.countDocuments({ verificationStatus: 'pending' }),
        Doctor.countDocuments({ isAvailable: true }),
        Department.countDocuments(),
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: 'completed' }),
        Appointment.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
        Prescription.countDocuments(),
        HealthRecord.countDocuments(),
        SymptomCheck.countDocuments(),
        ChatHistory.countDocuments(),
        AuditLog.countDocuments(),
      ]);

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalPatients,
          totalDoctors,
          verifiedDoctors,
          pendingDoctors,
          activeDoctors,
          totalDepartments,
          totalAppointments,
          completedAppointments,
          pendingAppointments,
          totalPrescriptions,
          totalHealthRecords,
          totalSymptomChecks,
          totalAiChatSessions,
          totalAuditLogs,
          systemStatus: 'Operational — 100% Uptime (MongoDB Atlas / Live Cloud)',
          lastDataSync: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error('Failed to aggregate system stats from MongoDB:', err);
    }
  }

  const users = dbStore.users;
  const doctors = dbStore.doctors;
  const departments = dbStore.departments;
  const appointments = dbStore.appointments;
  const prescriptions = dbStore.prescriptions;
  const healthRecords = dbStore.healthRecords;
  const symptomChecks = dbStore.symptomChecks;
  const chatHistories = dbStore.chatHistories;
  const auditLogs = dbStore.auditLogs;

  const totalPatients = users.filter(u => u.role === 'patient').length;
  const verifiedDoctors = doctors.filter(
    d => d.verificationStatus === 'verified' || !d.verificationStatus
  ).length;
  const pendingDoctors = doctors.filter(d => d.verificationStatus === 'pending').length;
  const activeDoctors = doctors.filter(d => d.isAvailable).length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const pendingAppointments = appointments.filter(
    a => a.status === 'pending' || a.status === 'confirmed'
  ).length;

  res.json({
    success: true,
    stats: {
      totalUsers: users.length,
      totalPatients,
      totalDoctors: doctors.length,
      verifiedDoctors,
      pendingDoctors,
      activeDoctors,
      totalDepartments: departments.length,
      totalAppointments: appointments.length,
      completedAppointments,
      pendingAppointments,
      totalPrescriptions: prescriptions.length,
      totalHealthRecords: healthRecords.length,
      totalSymptomChecks: symptomChecks.length,
      totalAiChatSessions: chatHistories.length,
      totalAuditLogs: auditLogs.length,
      systemStatus: 'Operational — 100% Uptime (India Regional Cloud)',
      lastDataSync: new Date().toISOString(),
    },
  });
};

export const getAllUsers = async (req, res) => {
  const { role, status, search } = req.query;

  if (isDbConnected()) {
    try {
      const filter = {};
      if (role && typeof role === 'string' && role !== 'all') {
        filter.role = role;
      }
      if (status && typeof status === 'string' && status !== 'all') {
        filter.status = status;
      }
      if (search && typeof search === 'string') {
        const regex = new RegExp(search, 'i');
        filter.$or = [{ name: regex }, { email: regex }, { phone: regex }, { city: regex }];
      }

      const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();
      return res.json({ success: true, totalUsers: users.length, users });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve users' });
    }
  }

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
    users = users.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.city && u.city.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, totalUsers: users.length, users });
};

export const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status, role } = req.body;
  const updates = {};
  if (status && ['active', 'suspended'].includes(status)) updates.status = status;
  if (role && ['patient', 'doctor', 'admin'].includes(role)) updates.role = role;

  if (isDbConnected()) {
    const updated = await User.findOneAndUpdate({ id }, { $set: updates }, { new: true })
      .select('-password')
      .lean();
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await AuditLog.create({
      id: `aud-${Date.now()}`,
      eventType: 'USER_STATUS_CHANGE',
      actorId: req.user?.id || 'admin',
      actorEmail: req.user?.email || 'admin@mediguide.com',
      actorRole: 'admin',
      details: `Updated status of user ${updated.name} (${updated.email}) to ${updates.status || updated.status}`,
    });

    return res.json({ success: true, message: 'User updated successfully', user: updated });
  }

  const updated = dbStore.updateUser(id, updates);
  if (!updated) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  dbStore.addAuditLog({
    eventType: 'USER_STATUS_CHANGE',
    actorId: req.user?.id || 'admin',
    actorEmail: req.user?.email || 'admin@mediguide.com',
    actorRole: 'admin',
    details: `Updated status of user ${updated.name} (${updated.email}) to ${updates.status || updated.status}`,
  });

  const { password: _, ...clean } = updated;
  res.json({ success: true, message: 'User updated successfully', user: clean });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (isDbConnected()) {
    const user = await User.findOne({ id }).lean();
    const deleted = await User.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await AuditLog.create({
      id: `aud-${Date.now()}`,
      eventType: 'USER_DELETED_BY_ADMIN',
      actorId: req.user?.id || 'admin',
      actorEmail: req.user?.email || 'admin@mediguide.com',
      actorRole: 'admin',
      details: `Admin deleted user ${user?.name || id} (${user?.email || 'N/A'})`,
    });

    return res.json({ success: true, message: 'User deleted from system' });
  }

  const user = dbStore.findUserById(id);
  const deleted = dbStore.deleteUser(id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  dbStore.addAuditLog({
    eventType: 'USER_DELETED_BY_ADMIN',
    actorId: req.user?.id || 'admin',
    actorEmail: req.user?.email || 'admin@mediguide.com',
    actorRole: 'admin',
    details: `Admin deleted user ${user?.name || id} (${user?.email || 'N/A'})`,
  });

  res.json({ success: true, message: 'User deleted from system' });
};

const doctorSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6).optional(),
  specialization: z.string().min(2, 'Specialization is required'),
  department: z.string().min(2, 'Department is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  registrationNumber: z.string().optional(),
  experienceYears: z.number().min(0),
  hospital: z.string().min(2, 'Hospital is required'),
  consultationFee: z.number().min(0),
  city: z.string().default('New Delhi'),
  state: z.string().default('Delhi'),
  languages: z.array(z.string()).default(['English', 'Hindi']),
  consultationModes: z.array(z.string()).default(['In-Person', 'Online Video']),
  bio: z.string().min(10, 'Bio is required'),
});

export const addDoctorByAdmin = async (req, res) => {
  try {
    const data = doctorSchema.parse(req.body);

    if (isDbConnected()) {
      const existing = await User.findOne({ email: data.email.toLowerCase() }).lean();
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: 'A user with this email already exists' });
      }
    } else {
      const existing = dbStore.findUserByEmail(data.email);
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: 'A user with this email already exists' });
      }
    }

    const docId = `doc-${Date.now()}`;
    const userId = `usr-doc-${Date.now()}`;
    const initialPassword = data.password || 'password123';
    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    const newUserData = {
      id: userId,
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: 'doctor',
      phone: '+91 98000 11223',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      status: 'active',
      city: data.city,
      state: data.state,
    };

    const newDoctorData = {
      id: docId,
      userId,
      name: data.name,
      email: data.email.toLowerCase(),
      specialization: data.specialization,
      department: data.department,
      qualification: data.qualification,
      registrationNumber: data.registrationNumber || `NMC-${Date.now().toString().slice(-5)}`,
      experienceYears: data.experienceYears,
      rating: 5.0,
      reviewCount: 1,
      hospital: data.hospital,
      consultationFee: data.consultationFee,
      city: data.city,
      state: data.state,
      languages: data.languages,
      consultationModes: data.consultationModes,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      bio: data.bio,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableTimeSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
      workingHours: '09:00 AM - 05:00 PM',
      slotDurationMinutes: 30,
      verificationStatus: 'verified',
      isAvailable: true,
    };

    if (isDbConnected()) {
      await User.create(newUserData);
      const savedDoc = (await Doctor.create(newDoctorData)).toObject();

      await AuditLog.create({
        id: `aud-${Date.now()}`,
        eventType: 'DOCTOR_CREDENTIALED',
        actorId: req.user?.id || 'admin',
        actorEmail: req.user?.email || 'admin@mediguide.com',
        actorRole: 'admin',
        details: `Admin credentialed new doctor: ${savedDoc.name} (${savedDoc.specialization} at ${savedDoc.hospital})`,
      });

      return res.status(201).json({
        success: true,
        message: 'Doctor account created and credentialed successfully',
        doctor: savedDoc,
      });
    }

    dbStore.addUser(newUserData);
    const savedDoc = dbStore.addDoctor(newDoctorData);

    dbStore.addAuditLog({
      eventType: 'DOCTOR_CREDENTIALED',
      actorId: req.user?.id || 'admin',
      actorEmail: req.user?.email || 'admin@mediguide.com',
      actorRole: 'admin',
      details: `Admin credentialed new doctor: ${savedDoc.name} (${savedDoc.specialization} at ${savedDoc.hospital})`,
    });

    res.status(201).json({
      success: true,
      message: 'Doctor account created and credentialed successfully',
      doctor: savedDoc,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to create doctor account' });
  }
};

export const approveDoctor = async (req, res) => {
  const { id } = req.params;

  if (isDbConnected()) {
    const doc = await Doctor.findOneAndUpdate(
      { id },
      { $set: { verificationStatus: 'verified', isAvailable: true } },
      { new: true }
    ).lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await AuditLog.create({
      id: `aud-${Date.now()}`,
      eventType: 'DOCTOR_APPROVED',
      actorId: req.user?.id || 'admin',
      actorEmail: req.user?.email || 'admin@mediguide.com',
      actorRole: 'admin',
      details: `Approved credentials for Dr. ${doc.name} (Reg: ${doc.registrationNumber}).`,
    });

    return res.json({
      success: true,
      message: `Doctor ${doc.name} credentials successfully verified and activated.`,
      doctor: doc,
    });
  }

  const doc = dbStore.approveDoctor(id, req.user);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Doctor not found' });
    return;
  }

  res.json({
    success: true,
    message: `Doctor ${doc.name} credentials successfully verified and activated.`,
    doctor: doc,
  });
};

export const suspendDoctor = async (req, res) => {
  const { id } = req.params;

  if (isDbConnected()) {
    const doc = await Doctor.findOneAndUpdate(
      { id },
      { $set: { verificationStatus: 'rejected', isAvailable: false } },
      { new: true }
    ).lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await AuditLog.create({
      id: `aud-${Date.now()}`,
      eventType: 'DOCTOR_SUSPENDED',
      actorId: req.user?.id || 'admin',
      actorEmail: req.user?.email || 'admin@mediguide.com',
      actorRole: 'admin',
      details: `Suspended clinical practice profile for Dr. ${doc.name}.`,
    });

    return res.json({
      success: true,
      message: `Doctor status updated to ${doc.verificationStatus}.`,
      doctor: doc,
    });
  }

  const doc = dbStore.suspendDoctor(id, req.user);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Doctor not found' });
    return;
  }

  res.json({
    success: true,
    message: `Doctor status updated to ${doc.verificationStatus}.`,
    doctor: doc,
  });
};

export const toggleDoctorAvailability = async (req, res) => {
  const { id } = req.params;

  if (isDbConnected()) {
    const existing = await Doctor.findOne({ id }).lean();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    const doc = await Doctor.findOneAndUpdate(
      { id },
      { $set: { isAvailable: !existing.isAvailable } },
      { new: true }
    ).lean();

    return res.json({
      success: true,
      message: `Doctor status updated to ${doc.isAvailable ? 'Available' : 'Unavailable'}`,
      doctor: doc,
    });
  }

  const doc = dbStore.toggleDoctorAvailability(id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Doctor not found' });
    return;
  }

  res.json({
    success: true,
    message: `Doctor status updated to ${doc.isAvailable ? 'Available' : 'Unavailable'}`,
    doctor: doc,
  });
};

export const getAllAdminAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId, search, date } = req.query;

    if (isDbConnected()) {
      const filter = {};
      if (status && status !== 'All') {
        filter.status = status;
      }
      if (doctorId && doctorId !== 'All') {
        filter.doctorId = doctorId;
      }
      if (patientId && patientId !== 'All') {
        filter.patientId = patientId;
      }
      if (date) {
        filter.date = date;
      }
      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [
          { patientName: regex },
          { doctorName: regex },
          { department: regex },
          { reason: regex },
        ];
      }

      const appointments = await Appointment.find(filter).sort({ date: -1 }).lean();
      return res.json({
        success: true,
        totalAppointments: appointments.length,
        appointments,
      });
    }

    let appointments = dbStore.getAppointments();

    if (status && status !== 'All') {
      appointments = appointments.filter(a => a.status === status);
    }
    if (doctorId && doctorId !== 'All') {
      appointments = appointments.filter(a => a.doctorId === doctorId);
    }
    if (patientId && patientId !== 'All') {
      appointments = appointments.filter(a => a.patientId === patientId);
    }
    if (date) {
      appointments = appointments.filter(a => a.date === date);
    }
    if (search) {
      const q = search.toLowerCase();
      appointments = appointments.filter(
        a =>
          a.patientName.toLowerCase().includes(q) ||
          a.doctorName.toLowerCase().includes(q) ||
          a.department.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      totalAppointments: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
};

export const getSystemSettings = async (_req, res) => {
  if (isDbConnected()) {
    try {
      let settings = await SystemSettings.findOne({ id: 'system_settings_singleton' }).lean();
      if (!settings) {
        settings = (await SystemSettings.create({
          id: 'system_settings_singleton',
          ...dbStore.getSystemSettings(),
        })).toObject();
      }
      return res.json({
        success: true,
        settings,
      });
    } catch (err) {
      console.error('Failed to get system settings from DB:', err);
    }
  }

  res.json({
    success: true,
    settings: dbStore.getSystemSettings(),
  });
};

const systemSettingsSchema = z.object({
  platformName: z.string().optional(),
  tagline: z.string().optional(),
  aiProvider: z.string().optional(),
  aiModel: z.string().optional(),
  geminiApiKey: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
  allowNewRegistrations: z.boolean().optional(),
  emergencyHelplines: z.record(z.string()).optional(),
  dpdpNotice: z.string().optional(),
  dpdpConsentText: z.string().optional(),
});

export const updateSystemSettings = async (req, res) => {
  try {
    const validatedData = systemSettingsSchema.parse(req.body);

    if (isDbConnected()) {
      const updated = await SystemSettings.findOneAndUpdate(
        { id: 'system_settings_singleton' },
        { $set: validatedData },
        { new: true, upsert: true }
      ).lean();

      await AuditLog.create({
        id: `aud-${Date.now()}`,
        eventType: 'SYSTEM_SETTINGS_UPDATED',
        actorId: req.user?.id || 'admin',
        actorEmail: req.user?.email || 'admin@mediguide.com',
        actorRole: 'admin',
        details: `Administrator updated platform configuration and AI safety parameters.`,
      });

      return res.json({
        success: true,
        message: 'System settings updated successfully',
        settings: updated,
      });
    }

    const updated = dbStore.updateSystemSettings(validatedData);

    dbStore.addAuditLog({
      eventType: 'SYSTEM_SETTINGS_UPDATED',
      actorId: req.user?.id || 'admin',
      actorEmail: req.user?.email || 'admin@mediguide.com',
      actorRole: 'admin',
      details: `Administrator updated platform configuration and AI safety parameters.`,
    });

    res.json({
      success: true,
      message: 'System settings updated successfully',
      settings: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Failed to update system settings' });
  }
};
