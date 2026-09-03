import { z } from 'zod';
import { dbStore } from '../store/inMemoryStore.js';
import bcrypt from 'bcryptjs';

export const getSystemStats = async (_req, res) => {
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
    const existing = dbStore.findUserByEmail(data.email);
    if (existing) {
      res.status(400).json({ success: false, message: 'A user with this email already exists' });
      return;
    }

    const docId = `doc-${Date.now()}`;
    const userId = `usr-doc-${Date.now()}`;
    const initialPassword = data.password || 'password123';
    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    dbStore.addUser({
      id: userId,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: 'doctor',
      phone: '+91 98000 11223',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      status: 'active',
      doctorId: docId,
      city: data.city,
      state: data.state,
      createdAt: new Date().toISOString(),
    });

    const newDoctor = {
      id: docId,
      userId,
      name: data.name,
      email: data.email,
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

    const savedDoc = dbStore.addDoctor(newDoctor);

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
  const doc = dbStore.findDoctorById(id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Doctor not found' });
    return;
  }

  doc.verificationStatus = 'verified';
  doc.isAvailable = true;
  dbStore.persist();

  dbStore.addAuditLog({
    eventType: 'DOCTOR_VERIFIED',
    actorId: req.user?.id || 'admin',
    actorEmail: req.user?.email || 'admin@mediguide.com',
    actorRole: 'admin',
    details: `Administrator approved clinical credentials for ${doc.name} (Reg #${doc.registrationNumber || 'NMC-Verified'}).`,
  });

  res.json({
    success: true,
    message: `Doctor ${doc.name} credentials successfully verified and activated.`,
    doctor: doc,
  });
};

export const suspendDoctor = async (req, res) => {
  const { id } = req.params;
  const doc = dbStore.findDoctorById(id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Doctor not found' });
    return;
  }

  doc.verificationStatus = doc.verificationStatus === 'suspended' ? 'verified' : 'suspended';
  doc.isAvailable = doc.verificationStatus === 'verified';
  dbStore.persist();

  dbStore.addAuditLog({
    eventType: 'DOCTOR_SUSPENDED_TOGGLE',
    actorId: req.user?.id || 'admin',
    actorEmail: req.user?.email || 'admin@mediguide.com',
    actorRole: 'admin',
    details: `Administrator toggled doctor ${doc.name} status to ${doc.verificationStatus}.`,
  });

  res.json({
    success: true,
    message: `Doctor status updated to ${doc.verificationStatus}.`,
    doctor: doc,
  });
};

export const toggleDoctorAvailability = async (req, res) => {
  const { id } = req.params;
  const doc = dbStore.findDoctorById(id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Doctor not found' });
    return;
  }
  doc.isAvailable = !doc.isAvailable;
  dbStore.persist();
  res.json({
    success: true,
    message: `Doctor status updated to ${doc.isAvailable ? 'Available' : 'Unavailable'}`,
    doctor: doc,
  });
};

export const getAllAdminAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId, search, date } = req.query;
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
  res.json({
    success: true,
    settings: dbStore.getSystemSettings(),
  });
};

export const updateSystemSettings = async (req, res) => {
  try {
    const updated = dbStore.updateSystemSettings(req.body);

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
    res.status(500).json({ success: false, message: 'Failed to update system settings' });
  }
};
