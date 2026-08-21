import { dbStore } from '../store/inMemoryStore.js';
export const getAllDoctors = async (req, res) => {
    const { department, search } = req.query;
    let doctors = dbStore.getAllDoctors();
    if (department && typeof department === 'string' && department !== 'All') {
        doctors = doctors.filter(d => d.department.toLowerCase() === department.toLowerCase());
    }
    if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        doctors = doctors.filter(d => d.name.toLowerCase().includes(q) ||
            d.specialization.toLowerCase().includes(q) ||
            d.department.toLowerCase().includes(q) ||
            d.hospital.toLowerCase().includes(q));
    }
    res.json({ success: true, doctors });
};
export const getDoctorById = async (req, res) => {
    const { id } = req.params;
    const doctor = dbStore.findDoctorById(id);
    if (!doctor) {
        res.status(404).json({ success: false, message: 'Doctor not found' });
        return;
    }
    res.json({ success: true, doctor });
};
export const getDepartments = async (_req, res) => {
    const doctors = dbStore.getAllDoctors();
    const deptCounts = {};
    doctors.forEach(doc => {
        deptCounts[doc.department] = (deptCounts[doc.department] || 0) + 1;
    });
    const departments = Object.keys(deptCounts).map(dept => ({
        name: dept,
        doctorCount: deptCounts[dept],
    }));
    res.json({ success: true, departments });
};
export const getMyPatients = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
    }
    const patients = dbStore.users
        .filter(u => u.role === 'patient')
        .map(u => {
            const { password: _, ...clean } = u;
            return clean;
        });
    res.json({ success: true, patients, users: patients });
};
