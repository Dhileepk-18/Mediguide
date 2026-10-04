import { dbStore } from '../store/inMemoryStore.js';
import { isDbConnected } from '../config/db.js';
import { Doctor, Appointment, Prescription, User, AuditLog } from '../models/schemas.js';

export const getDoctors = async (req, res) => {
  try {
    const { department, search, city, state, mode, language, maxFee } = req.query;

    if (isDbConnected()) {
      const filter = {};
      if (department && department !== 'All') {
        filter.department = new RegExp(department, 'i');
      }
      if (city && city !== 'All') {
        filter.city = new RegExp(`^${city}$`, 'i');
      }
      if (state && state !== 'All') {
        filter.state = new RegExp(`^${state}$`, 'i');
      }
      if (mode && mode !== 'All') {
        filter.consultationModes = new RegExp(mode, 'i');
      }
      if (language && language !== 'All') {
        filter.languages = new RegExp(language, 'i');
      }
      if (maxFee) {
        const feeLimit = Number(maxFee);
        if (!isNaN(feeLimit)) {
          filter.consultationFee = { $lte: feeLimit };
        }
      }
      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [
          { name: regex },
          { specialization: regex },
          { department: regex },
          { hospital: regex },
          { city: regex },
          { qualification: regex },
        ];
      }

      const doctors = await Doctor.find(filter).lean();
      return res.json({
        success: true,
        totalDoctors: doctors.length,
        doctors,
      });
    }

    let doctors = dbStore.getAllDoctors();

    if (department && department !== 'All') {
      doctors = doctors.filter(
        d =>
          d.department.toLowerCase() === department.toLowerCase() ||
          d.department.toLowerCase().includes(department.toLowerCase())
      );
    }

    if (city && city !== 'All') {
      doctors = doctors.filter(d => d.city && d.city.toLowerCase() === city.toLowerCase());
    }

    if (state && state !== 'All') {
      doctors = doctors.filter(d => d.state && d.state.toLowerCase() === state.toLowerCase());
    }

    if (mode && mode !== 'All') {
      doctors = doctors.filter(
        d =>
          d.consultationModes &&
          d.consultationModes.some(m => m.toLowerCase().includes(mode.toLowerCase()))
      );
    }

    if (language && language !== 'All') {
      doctors = doctors.filter(
        d => d.languages && d.languages.some(l => l.toLowerCase() === language.toLowerCase())
      );
    }

    if (maxFee) {
      const feeLimit = Number(maxFee);
      if (!isNaN(feeLimit)) {
        doctors = doctors.filter(d => d.consultationFee <= feeLimit);
      }
    }

    if (search) {
      const q = search.toLowerCase();
      doctors = doctors.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.department.toLowerCase().includes(q) ||
          d.hospital.toLowerCase().includes(q) ||
          (d.city && d.city.toLowerCase().includes(q)) ||
          (d.qualification && d.qualification.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      totalDoctors: doctors.length,
      doctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch doctors' });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const doctor = await Doctor.findOne({ id }).lean();
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }
      return res.json({ success: true, doctor });
    }

    const doctor = dbStore.findDoctorById(id);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch doctor details' });
  }
};

export const getMyPatients = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      res
        .status(403)
        .json({ success: false, message: 'Only authorized doctors can view patients' });
      return;
    }

    if (isDbConnected()) {
      const doctorProfile = await Doctor.findOne({
        $or: [{ id: req.user.id }, { userId: req.user.id }, { email: req.user.email }],
      }).lean();

      const docId = doctorProfile ? doctorProfile.id : req.user.id;
      const appointments = await Appointment.find({ doctorId: docId }).lean();
      const patientIds = [...new Set(appointments.map(a => a.patientId))];

      const patients = await Promise.all(
        patientIds.map(async pid => {
          const user = await User.findOne({ id: pid }).lean();
          const patientApts = appointments.filter(a => a.patientId === pid);
          const patientPrescriptions = await Prescription.find({
            patientId: pid,
            doctorId: docId,
          }).lean();

          return {
            id: pid,
            name: user ? user.name : 'Unknown Patient',
            email: user ? user.email : '',
            phone: user ? user.phone : '',
            age: user ? user.age : 28,
            gender: user ? user.gender : 'Other',
            bloodGroup: user ? user.bloodGroup : 'O+',
            city: user ? user.city : 'Bengaluru',
            allergies: user ? user.allergies : [],
            chronicConditions: user ? user.chronicConditions : [],
            totalAppointments: patientApts.length,
            lastAppointmentDate: patientApts[0]?.date || 'N/A',
            lastAppointmentStatus: patientApts[0]?.status || 'N/A',
            prescriptionsCount: patientPrescriptions.length,
          };
        })
      );

      return res.json({ success: true, patients });
    }

    const doctorProfile =
      dbStore.findDoctorById(req.user.id) ||
      dbStore.getAllDoctors().find(d => d.userId === req.user.id || d.email === req.user.email);

    const docId = doctorProfile ? doctorProfile.id : req.user.id;
    const appointments = dbStore.getAppointmentsByDoctorId(docId);

    // Group unique patients who have appointments with this doctor
    const patientIds = [...new Set(appointments.map(a => a.patientId))];
    const patients = patientIds.map(pid => {
      const user = dbStore.findUserById(pid);
      const patientApts = appointments.filter(a => a.patientId === pid);
      const patientPrescriptions = dbStore
        .getPrescriptionsByPatientId(pid)
        .filter(p => p.doctorId === docId);
      return {
        id: pid,
        name: user ? user.name : 'Unknown Patient',
        email: user ? user.email : '',
        phone: user ? user.phone : '',
        age: user ? user.age : 28,
        gender: user ? user.gender : 'Other',
        bloodGroup: user ? user.bloodGroup : 'O+',
        city: user ? user.city : 'Bengaluru',
        allergies: user ? user.allergies : [],
        chronicConditions: user ? user.chronicConditions : [],
        totalAppointments: patientApts.length,
        lastAppointmentDate: patientApts[0]?.date || 'N/A',
        lastAppointmentStatus: patientApts[0]?.status || 'N/A',
        prescriptionsCount: patientPrescriptions.length,
      };
    });

    res.json({ success: true, patients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve patients' });
  }
};

export const getDoctorSchedule = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      res
        .status(403)
        .json({ success: false, message: 'Only doctors can access schedule settings' });
      return;
    }

    let doctor;
    if (isDbConnected()) {
      doctor = await Doctor.findOne({
        $or: [{ id: req.user.id }, { userId: req.user.id }, { email: req.user.email }],
      }).lean();
    } else {
      doctor =
        dbStore.findDoctorById(req.user.id) ||
        dbStore.getAllDoctors().find(d => d.userId === req.user.id || d.email === req.user.email);
    }

    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }

    res.json({
      success: true,
      schedule: {
        availableDays: doctor.availableDays || [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
        ],
        availableTimeSlots: doctor.availableTimeSlots || [
          '09:00 AM',
          '11:00 AM',
          '02:00 PM',
          '04:00 PM',
        ],
        workingHours: doctor.workingHours || '09:00 AM - 06:00 PM',
        slotDurationMinutes: doctor.slotDurationMinutes || 30,
        consultationModes: doctor.consultationModes || ['In-Person', 'Online Video'],
        consultationFee: doctor.consultationFee || 750,
        isAvailable: doctor.isAvailable !== false,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get schedule' });
  }
};

export const updateDoctorSchedule = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      res.status(403).json({ success: false, message: 'Only doctors can modify schedule' });
      return;
    }

    let doctor;
    if (isDbConnected()) {
      doctor = await Doctor.findOne({
        $or: [{ id: req.user.id }, { userId: req.user.id }, { email: req.user.email }],
      }).lean();
    } else {
      doctor =
        dbStore.findDoctorById(req.user.id) ||
        dbStore.getAllDoctors().find(d => d.userId === req.user.id || d.email === req.user.email);
    }

    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }

    const allowed = [
      'availableDays',
      'availableTimeSlots',
      'workingHours',
      'slotDurationMinutes',
      'consultationModes',
      'consultationFee',
      'isAvailable',
    ];
    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        updates[k] = req.body[k];
      }
    }

    if (isDbConnected()) {
      const updated = await Doctor.findOneAndUpdate({ id: doctor.id }, { $set: updates }, { new: true }).lean();
      await AuditLog.create({
        id: `aud-${Date.now()}`,
        eventType: 'DOCTOR_SCHEDULE_UPDATED',
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: 'doctor',
        details: `Doctor ${doctor.name} updated consultation availability & fee (₹${updates.consultationFee || doctor.consultationFee}).`,
      });
      return res.json({ success: true, message: 'Schedule updated successfully', doctor: updated });
    }

    const updated = dbStore.updateDoctor(doctor.id, updates);
    dbStore.addAuditLog({
      eventType: 'DOCTOR_SCHEDULE_UPDATED',
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: 'doctor',
      details: `Doctor ${doctor.name} updated consultation availability & fee (₹${updates.consultationFee || doctor.consultationFee}).`,
    });

    res.json({ success: true, message: 'Schedule updated successfully', doctor: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update schedule' });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      res.status(403).json({ success: false, message: 'Only doctors can modify doctor profile' });
      return;
    }

    let doctor;
    if (isDbConnected()) {
      doctor = await Doctor.findOne({
        $or: [{ id: req.user.id }, { userId: req.user.id }, { email: req.user.email }],
      }).lean();
    } else {
      doctor =
        dbStore.findDoctorById(req.user.id) ||
        dbStore.getAllDoctors().find(d => d.userId === req.user.id || d.email === req.user.email);
    }

    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }

    const allowed = [
      'qualification',
      'registrationNumber',
      'hospital',
      'bio',
      'languages',
      'city',
      'state',
      'experienceYears',
      'specialization',
    ];
    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        updates[k] = req.body[k];
      }
    }

    if (isDbConnected()) {
      const updated = await Doctor.findOneAndUpdate({ id: doctor.id }, { $set: updates }, { new: true }).lean();
      await AuditLog.create({
        id: `aud-${Date.now()}`,
        eventType: 'DOCTOR_PROFILE_UPDATED',
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: 'doctor',
        details: `Doctor ${doctor.name} updated clinical profile and registration credentials.`,
      });
      return res.json({ success: true, message: 'Doctor profile updated', doctor: updated });
    }

    const updated = dbStore.updateDoctor(doctor.id, updates);
    dbStore.addAuditLog({
      eventType: 'DOCTOR_PROFILE_UPDATED',
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: 'doctor',
      details: `Doctor ${doctor.name} updated clinical profile and registration credentials.`,
    });

    res.json({ success: true, message: 'Doctor profile updated', doctor: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update doctor profile' });
  }
};
