const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('mediguide_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function tryRefreshToken() {
  const refreshToken = localStorage.getItem('mediguide_refresh_token');
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success && data.accessToken) {
      localStorage.setItem('mediguide_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('mediguide_refresh_token', data.refreshToken);
      }
      return data.accessToken;
    }
  } catch {
    // Refresh attempt failed
  }
  localStorage.removeItem('mediguide_token');
  localStorage.removeItem('mediguide_refresh_token');
  return null;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('mediguide_token');
      localStorage.removeItem('mediguide_refresh_token');
    }
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
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },
  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
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
  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },
  async resetPassword(email, otp, newPassword) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    return handleResponse(res);
  },
  async exportUserData() {
    const res = await fetch(`${API_BASE}/auth/export-data`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  async deleteUserAccount() {
    const res = await fetch(`${API_BASE}/auth/delete-account`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  async refreshToken(refreshToken) {
    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse(res);
  },
  async logout() {
    const token = localStorage.getItem('mediguide_token');
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('mediguide_token');
    localStorage.removeItem('mediguide_refresh_token');
  },

  // In-App Notifications (FR-15)
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  async deleteNotification(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // AI API
  async getAiConfig() {
    const res = await fetch(`${API_BASE}/ai/config`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  async setAiApiKey(apiKey) {
    const res = await fetch(`${API_BASE}/ai/config`, {
      method: 'POST',
      headers: getAuthHeaders(),
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
  async analyzeSymptoms(symptomsOrOptions, severity, duration, bodyArea, additionalNotes) {
    let payload;
    if (symptomsOrOptions && typeof symptomsOrOptions === 'object' && !Array.isArray(symptomsOrOptions)) {
      payload = symptomsOrOptions;
    } else {
      let finalSeverity = severity;
      let finalDuration = duration;
      const validSeverities = ['Mild', 'Moderate', 'Severe'];
      // Defensive check: if caller accidentally passed duration in 2nd arg and severity in 3rd arg
      if (!validSeverities.includes(severity) && validSeverities.includes(duration)) {
        finalSeverity = duration;
        finalDuration = severity;
      }
      payload = {
        symptoms: symptomsOrOptions,
        severity: finalSeverity || 'Moderate',
        duration: finalDuration || '2-3 days',
        bodyArea,
        additionalNotes,
      };
    }
    const res = await fetch(`${API_BASE}/ai/symptom-check`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
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

  // Doctors API & Discovery
  async getDoctors(filters = {}) {
    const params = new URLSearchParams();
    if (filters.department && filters.department !== 'All')
      params.append('department', filters.department);
    if (filters.city && filters.city !== 'All') params.append('city', filters.city);
    if (filters.state && filters.state !== 'All') params.append('state', filters.state);
    if (filters.mode && filters.mode !== 'All') params.append('mode', filters.mode);
    if (filters.language && filters.language !== 'All') params.append('language', filters.language);
    if (filters.maxFee) params.append('maxFee', filters.maxFee);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/doctors?${params.toString()}`);
    return handleResponse(res);
  },
  async getDoctorById(id) {
    const res = await fetch(`${API_BASE}/doctors/${id}`);
    return handleResponse(res);
  },
  async getMyPatients() {
    const res = await fetch(`${API_BASE}/doctors/my-patients`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  async getDoctorSchedule() {
    const res = await fetch(`${API_BASE}/doctors/schedule/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  async updateDoctorSchedule(scheduleData) {
    const res = await fetch(`${API_BASE}/doctors/schedule/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(scheduleData),
    });
    return handleResponse(res);
  },
  async updateDoctorProfile(profileData) {
    const res = await fetch(`${API_BASE}/doctors/profile/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  // Medical Departments API
  async getDepartments() {
    const res = await fetch(`${API_BASE}/departments`);
    return handleResponse(res);
  },
  async getDepartmentById(id) {
    const res = await fetch(`${API_BASE}/departments/${id}`);
    return handleResponse(res);
  },
  async createDepartment(data) {
    const res = await fetch(`${API_BASE}/departments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async updateDepartment(id, updates) {
    const res = await fetch(`${API_BASE}/departments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },
  async deleteDepartment(id) {
    const res = await fetch(`${API_BASE}/departments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Appointments API
  async bookAppointment(data) {
    const payload = {
      ...data,
      timeSlot: data.timeSlot || data.time,
    };
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async createAppointment(data) {
    return this.bookAppointment(data);
  },
  async getMyAppointments() {
    const res = await fetch(`${API_BASE}/appointments/my`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  async updateAppointmentStatus(id, status, notes, prescriptionId, date, timeSlot) {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes, prescriptionId, date, timeSlot }),
    });
    return handleResponse(res);
  },

  // Medicines API
  async getMedicines(patientId) {
    const url = patientId
      ? `${API_BASE}/medicines?patientId=${patientId}`
      : `${API_BASE}/medicines`;
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
    const url = patientId
      ? `${API_BASE}/health-records?patientId=${patientId}`
      : `${API_BASE}/health-records`;
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
  async getPrescriptionById(id) {
    const res = await fetch(`${API_BASE}/prescriptions/${id}`, {
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
    if (role && role !== 'all') params.append('role', role);
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
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
  async approveDoctor(id) {
    const res = await fetch(`${API_BASE}/admin/doctors/${id}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  async suspendDoctor(id) {
    const res = await fetch(`${API_BASE}/admin/doctors/${id}/suspend`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
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
  async getAdminAppointments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.doctorId && filters.doctorId !== 'All') params.append('doctorId', filters.doctorId);
    if (filters.patientId && filters.patientId !== 'All')
      params.append('patientId', filters.patientId);
    if (filters.date) params.append('date', filters.date);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/admin/appointments?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  async getAuditLogs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.eventType && filters.eventType !== 'ALL')
      params.append('eventType', filters.eventType);
    if (filters.role && filters.role !== 'ALL') params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/audit-logs?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  async getSystemSettings() {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  async updateSystemSettings(settings) {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse(res);
  },
};
