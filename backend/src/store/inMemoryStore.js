import bcrypt from 'bcryptjs';
// Pre-hashed default password 'password123'
const defaultHashedPassword = bcrypt.hashSync('password123', 10);
const defaultAdminHashedPassword = bcrypt.hashSync('admin123', 10);
export class DataStore {
    users = [];
    doctors = [];
    appointments = [];
    medicines = [];
    healthRecords = [];
    prescriptions = [];
    chatHistories = [];
    symptomChecks = [];
    constructor() {
        this.seedInitialData();
    }
    seedInitialData() {
        // 1. Users - Clean Slate (0 accounts)
        this.users = [];

        // 2. Doctors - Clean Slate (0 doctors)
        this.doctors = [];

        // 3. Appointments - Clean Slate
        this.appointments = [];

        // 4. Medicines - Clean Slate
        this.medicines = [];

        // 5. Health Records - Clean Slate
        this.healthRecords = [];

        // 6. Prescriptions - Clean Slate
        this.prescriptions = [];

        // 7. Chat Histories - Clean Slate
        this.chatHistories = [];

        // 8. Symptom Check Results - Clean Slate
        this.symptomChecks = [];
    }
    // --- User methods ---
    findUserByEmail(email) {
        return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
    findUserById(id) {
        return this.users.find(u => u.id === id);
    }
    addUser(user) {
        this.users.push(user);
        return user;
    }
    updateUser(id, updates) {
        const user = this.findUserById(id);
        if (!user)
            return undefined;
        Object.assign(user, updates);
        return user;
    }
    deleteUser(id) {
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1)
            return false;
        this.users.splice(index, 1);
        return true;
    }
    // --- Doctor methods ---
    getAllDoctors() {
        return this.doctors;
    }
    findDoctorById(id) {
        return this.doctors.find(d => d.id === id || d.userId === id);
    }
    addDoctor(doctor) {
        this.doctors.push(doctor);
        return doctor;
    }
    updateDoctor(id, updates) {
        const doc = this.findDoctorById(id);
        if (!doc)
            return undefined;
        Object.assign(doc, updates);
        return doc;
    }
    // --- Appointment methods ---
    getAppointments() {
        return this.appointments;
    }
    getAppointmentsByPatientId(patientId) {
        return this.appointments.filter(a => a.patientId === patientId);
    }
    getAppointmentsByDoctorId(doctorId) {
        return this.appointments.filter(a => a.doctorId === doctorId);
    }
    findAppointmentById(id) {
        return this.appointments.find(a => a.id === id);
    }
    addAppointment(apt) {
        this.appointments.unshift(apt);
        return apt;
    }
    updateAppointment(id, updates) {
        const apt = this.findAppointmentById(id);
        if (!apt)
            return undefined;
        Object.assign(apt, updates);
        return apt;
    }
    // --- Medicine methods ---
    getMedicinesByPatientId(patientId) {
        return this.medicines.filter(m => m.patientId === patientId);
    }
    findMedicineById(id) {
        return this.medicines.find(m => m.id === id);
    }
    addMedicine(med) {
        this.medicines.unshift(med);
        return med;
    }
    updateMedicine(id, updates) {
        const med = this.findMedicineById(id);
        if (!med)
            return undefined;
        Object.assign(med, updates);
        return med;
    }
    deleteMedicine(id) {
        const index = this.medicines.findIndex(m => m.id === id);
        if (index === -1)
            return false;
        this.medicines.splice(index, 1);
        return true;
    }
    // --- Health Record methods ---
    getHealthRecordsByPatientId(patientId) {
        return this.healthRecords.filter(r => r.patientId === patientId);
    }
    findHealthRecordById(id) {
        return this.healthRecords.find(r => r.id === id);
    }
    addHealthRecord(record) {
        this.healthRecords.unshift(record);
        return record;
    }
    deleteHealthRecord(id) {
        const index = this.healthRecords.findIndex(r => r.id === id);
        if (index === -1)
            return false;
        this.healthRecords.splice(index, 1);
        return true;
    }
    // --- Prescription methods ---
    getPrescriptionsByPatientId(patientId) {
        return this.prescriptions.filter(p => p.patientId === patientId);
    }
    getPrescriptionsByDoctorId(doctorId) {
        return this.prescriptions.filter(p => p.doctorId === doctorId);
    }
    findPrescriptionById(id) {
        return this.prescriptions.find(p => p.id === id);
    }
    addPrescription(prescription) {
        this.prescriptions.unshift(prescription);
        return prescription;
    }
    // --- AI Chat History & Symptom Check methods ---
    getChatHistoriesByUserId(userId) {
        return this.chatHistories.filter(c => c.userId === userId);
    }
    findChatHistoryById(id) {
        return this.chatHistories.find(c => c.id === id);
    }
    saveChatHistory(history) {
        const existingIndex = this.chatHistories.findIndex(c => c.id === history.id);
        if (existingIndex >= 0) {
            this.chatHistories[existingIndex] = history;
        }
        else {
            this.chatHistories.unshift(history);
        }
        return history;
    }
    getSymptomChecksByUserId(userId) {
        return this.symptomChecks.filter(s => s.userId === userId);
    }
    addSymptomCheck(result) {
        this.symptomChecks.unshift(result);
        return result;
    }
}
export const dbStore = new DataStore();
