const API_BASE = '/api';
const getAuthHeaders = () => {
    const token = localStorage.getItem('mediguide_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};
async function handleResponse(res) {
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'API request failed');
    }
    return data;
}
export const api = {
    // Auth API
    async login(email, password) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: password || 'password123' }),
        });
        return handleResponse(res);
    },
    async register(userData) {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...userData,
                password: userData.password || 'password123',
            }),
        });
        return handleResponse(res);
    },
    async demoLogin(role) {
        const res = await fetch(`${API_BASE}/auth/demo-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role }),
        });
        return handleResponse(res);
    },
    async getMe() {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },
    async updateProfile(updates) {
        const res = await fetch(`${API_BASE}/auth/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates),
        });
        return handleResponse(res);
    },
    // AI API
    async getAiConfig() {
        const res = await fetch(`${API_BASE}/ai/config`);
        return handleResponse(res);
    },
    async setAiApiKey(apiKey) {
        const res = await fetch(`${API_BASE}/ai/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey }),
        });
        return handleResponse(res);
    },
    async sendChatMessage(message, conversationId, history) {
        const res = await fetch(`${API_BASE}/ai/chat`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ message, conversationId, history }),
        });
        return handleResponse(res);
    },
    async analyzeSymptoms(symptoms, severity, duration, bodyArea, additionalNotes) {
        const res = await fetch(`${API_BASE}/ai/symptom-check`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ symptoms, severity, duration, bodyArea, additionalNotes }),
        });
        return handleResponse(res);
    },
    async getChatHistories() {
        const res = await fetch(`${API_BASE}/ai/chat-history`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },
    async getSymptomHistories() {
        const res = await fetch(`${API_BASE}/ai/symptom-history`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },
    // Doctors API
    async getDoctors(department, search) {
        const params = new URLSearchParams();
        if (department && department !== 'All')
            params.append('department', department);
        if (search)
            params.append('search', search);
        const res = await fetch(`${API_BASE}/doctors?${params.toString()}`);
        return handleResponse(res);
    },
    async getDoctorById(id) {
        const res = await fetch(`${API_BASE}/doctors/${id}`);
        return handleResponse(res);
    },
    async getDepartments() {
        const res = await fetch(`${API_BASE}/doctors/meta/departments`);
        return handleResponse(res);
    },
    async getMyPatients() {
        const res = await fetch(`${API_BASE}/doctors/my-patients`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },
    // Appointments API
    async bookAppointment(data) {
        const res = await fetch(`${API_BASE}/appointments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },
    async getMyAppointments() {
        const res = await fetch(`${API_BASE}/appointments/my`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },
    async updateAppointmentStatus(id, status, notes, prescriptionId) {
        const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status, notes, prescriptionId }),
        });
        return handleResponse(res);
    },
    // Medicines API
    async getMedicines(patientId) {
        const url = patientId ? `${API_BASE}/medicines?patientId=${patientId}` : `${API_BASE}/medicines`;
        const res = await fetch(url, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },
    async addMedicine(data) {
        const res = await fetch(`${API_BASE}/medicines`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },
    async updateMedicine(id, updates) {
        const res = await fetch(`${API_BASE}/medicines/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates),
        });
        return handleResponse(res);
    },
    async deleteMedicine(id) {
        const res = await fetch(`${API_BASE}/medicines/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },
    async logMedicineAdherence(id, date, timeSlot, taken) {
        const res = await fetch(`${API_BASE}/medicines/${id}/adherence`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ date, timeSlot, taken }),
        });
        return handleResponse(res);
    },
    // Health Records API
    async getHealthRecords(patientId) {
        const url = patientId ? `${API_BASE}/health-records?patientId=${patientId}` : `${API_BASE}/health-records`;
        const res = await fetch(url, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },
    async addHealthRecord(record) {
        const res = await fetch(`${API_BASE}/health-records`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(record),
        });
        return handleResponse(res);
    },
    async deleteHealthRecord(id) {
        const res = await fetch(`${API_BASE}/health-records/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },
    // Prescriptions API
    async getMyPrescriptions() {
        const res = await fetch(`${API_BASE}/prescriptions/my`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },
    async createPrescription(data) {
        const res = await fetch(`${API_BASE}/prescriptions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },
    // Admin API
    async getAdminStats() {
        const res = await fetch(`${API_BASE}/admin/stats`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },
    async getAdminUsers(role, status, search) {
        const params = new URLSearchParams();
        if (role && role !== 'all')
            params.append('role', role);
        if (status && status !== 'all')
            params.append('status', status);
        if (search)
            params.append('search', search);
        const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },
    async updateAdminUser(id, updates) {
        const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates),
        });
        return handleResponse(res);
    },
    async deleteAdminUser(id) {
        const res = await fetch(`${API_BASE}/admin/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },
    async addDoctor(data) {
        const res = await fetch(`${API_BASE}/admin/doctors`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },
    async toggleDoctorAvailability(id) {
        const res = await fetch(`${API_BASE}/admin/doctors/${id}/availability`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },
};
