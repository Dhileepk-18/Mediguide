import { z } from 'zod';
import { dbStore } from '../store/inMemoryStore.js';

const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timeSlot: z.string().optional(),
  time: z.string().optional(),
  consultationMode: z.string().default('In-Person'),
  mode: z.string().optional(),
  reason: z.string().min(3, 'Please provide a reason for the consultation'),
  symptoms: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const createAppointment = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const data = createAppointmentSchema.parse(req.body);
    const timeSlot = data.timeSlot || data.time;
    if (!timeSlot) {
      res.status(400).json({ success: false, message: 'Time slot is required' });
      return;
    }
    const mode = data.mode || data.consultationMode || 'In-Person';

    const doctor = dbStore.findDoctorById(data.doctorId);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Selected doctor not found' });
      return;
    }

    // Double booking prevention: Check if doctor already has an active appointment at that time
    const existingBooking = dbStore
      .getAppointments()
      .find(
        a =>
          a.doctorId === doctor.id &&
          a.date === data.date &&
          (a.timeSlot === timeSlot || a.time === timeSlot) &&
          ['confirmed', 'pending'].includes(a.status)
      );

    if (existingBooking) {
      res.status(400).json({
        success: false,
        message: `This time slot (${timeSlot} on ${data.date}) is already booked with ${doctor.name}. Please select a different time slot.`,
      });
      return;
    }

    const newAppointment = {
      id: `apt-${Date.now()}`,
      patientId: req.user.id,
      patientName: req.user.name,
      patientEmail: req.user.email,
      patientPhone: req.user.phone,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      doctorAvatar: doctor.avatar,
      department: doctor.department,
      consultationMode: data.consultationMode || 'In-Person',
      date: data.date,
      timeSlot: data.timeSlot,
      status: 'confirmed', // Instant confirmation for streamlined demo
      reason: data.reason,
      symptoms: data.symptoms || [],
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    const saved = dbStore.addAppointment(newAppointment);

    // Audit Log
    dbStore.addAuditLog({
      eventType: 'APPOINTMENT_BOOKED',
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      details: `Appointment booked with ${doctor.name} on ${data.date} at ${data.timeSlot} (${data.consultationMode}).`,
    });

    // Patient Notification
    dbStore.addNotification({
      userId: req.user.id,
      role: 'patient',
      type: 'appointment',
      title: 'Appointment Confirmed',
      message: `Your appointment with ${doctor.name} on ${data.date} at ${data.timeSlot} IST is confirmed.`,
      link: '/appointments',
    });

    // Doctor Notification (if doctor user exists)
    if (doctor.userId) {
      dbStore.addNotification({
        userId: doctor.userId,
        role: 'doctor',
        type: 'appointment',
        title: 'New Patient Appointment',
        message: `${req.user.name} booked a consultation for ${data.date} at ${data.timeSlot} (${data.reason}).`,
        link: '/doctor/appointments',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: saved,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to book appointment' });
  }
};

export const getMyAppointments = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  let appointments = [];
  if (req.user.role === 'patient') {
    appointments = dbStore.getAppointmentsByPatientId(req.user.id);
  } else if (req.user.role === 'doctor') {
    const doc =
      dbStore.findDoctorById(req.user.id) ||
      dbStore.getAllDoctors().find(d => d.userId === req.user?.id || d.email === req.user?.email);
    if (doc) {
      appointments = dbStore.getAppointmentsByDoctorId(doc.id);
    } else {
      appointments = [];
    }
  } else if (req.user.role === 'admin') {
    appointments = dbStore.getAppointments();
  }
  res.json({ success: true, appointments });
};

export const getAppointmentById = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const { id } = req.params;
  const appointment = dbStore.findAppointmentById(id);
  if (!appointment) {
    res.status(404).json({ success: false, message: 'Appointment not found' });
    return;
  }

  const isOwnerPatient = appointment.patientId === req.user.id;
  const doctorProfile =
    dbStore.findDoctorById(req.user.id) ||
    dbStore.getAllDoctors().find(d => d.userId === req.user?.id || d.email === req.user?.email);
  const isAssignedDoctor = doctorProfile && appointment.doctorId === doctorProfile.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwnerPatient && !isAssignedDoctor && !isAdmin) {
    res
      .status(403)
      .json({
        success: false,
        message: 'Forbidden: You do not have permission to view this appointment',
      });
    return;
  }
  res.json({ success: true, appointment });
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const { status, date, timeSlot, notes, prescriptionId } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }
    const appointment = dbStore.findAppointmentById(id);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    const isOwnerPatient = appointment.patientId === req.user.id;
    const doctorProfile =
      dbStore.findDoctorById(req.user.id) ||
      dbStore.getAllDoctors().find(d => d.userId === req.user?.id || d.email === req.user?.email);
    const isAssignedDoctor = doctorProfile && appointment.doctorId === doctorProfile.id;
    const isAdmin = req.user.role === 'admin';

    // Authorization check: Patients can only cancel or reschedule their own appointment
    if (isOwnerPatient && !isAssignedDoctor && !isAdmin) {
      if (status && !['cancelled', 'rescheduled'].includes(status)) {
        res
          .status(403)
          .json({
            success: false,
            message: 'Patients can only cancel or reschedule their own appointments',
          });
        return;
      }
    } else if (!isAssignedDoctor && !isAdmin && !isOwnerPatient) {
      res
        .status(403)
        .json({
          success: false,
          message: 'Forbidden: You do not have permission to modify this appointment',
        });
      return;
    }

    const updates = {};
    if (status) updates.status = status;
    if (date) updates.date = date;
    if (timeSlot) updates.timeSlot = timeSlot;
    if (notes !== undefined) updates.notes = notes;
    if (prescriptionId !== undefined) updates.prescriptionId = prescriptionId;

    const updated = dbStore.updateAppointment(id, updates);

    dbStore.addAuditLog({
      eventType: 'APPOINTMENT_STATUS_CHANGE',
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      details: `Appointment #${id} updated to ${updated.status} by ${req.user.name} (${req.user.role}).`,
    });

    // Send notifications on status change
    const targetUserId = isOwnerPatient ? doctorProfile?.userId : appointment.patientId;
    if (targetUserId) {
      dbStore.addNotification({
        userId: targetUserId,
        role: isOwnerPatient ? 'doctor' : 'patient',
        type: 'appointment',
        title: `Appointment ${status === 'rescheduled' ? 'Rescheduled' : status.toUpperCase()}`,
        message: `Appointment for ${appointment.patientName} with ${appointment.doctorName} was marked as ${updated.status}${date ? ` for ${date} at ${timeSlot}` : ''}.`,
        link: isOwnerPatient ? '/doctor/appointments' : '/appointments',
      });
    }

    res.json({
      success: true,
      message: `Appointment updated to ${updated.status}`,
      appointment: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update appointment' });
  }
};
