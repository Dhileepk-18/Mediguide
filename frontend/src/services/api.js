const API_BASE = '/api';

let refreshPromise = null;

async function tryRefreshToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('mediguide_refresh_token');
    if (!refreshToken) {
      localStorage.removeItem('mediguide_token');
      localStorage.removeItem('mediguide_refresh_token');
      return null;
    }
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
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function request(path, options = {}, isRetry = false) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const token = localStorage.getItem('mediguide_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body,
  });

  if (res.status === 401 && !isRetry && !path.includes('/auth/login') && !path.includes('/auth/refresh-token')) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      return request(path, options, true);
    }
  }

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
    return request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async register(userData) {
    return request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },

  async demoLogin(role) {
    return request('/auth/demo-login', {
      method: 'POST',
      body: { role },
    });
  },

  async getMe() {
    return request('/auth/me');
  },

  async updateProfile(updates) {
    return request('/auth/profile', {
      method: 'PUT',
      body: updates,
    });
  },

  async forgotPassword(email) {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  async resetPassword(email, otp, newPassword) {
    return request('/auth/reset-password', {
      method: 'POST',
      body: { email, otp, newPassword },
    });
  },

  async exportUserData() {
    return request('/auth/export-data');
  },

  async deleteUserAccount() {
    return request('/auth/delete-account', {
      method: 'DELETE',
    });
  },

  async refreshToken(refreshToken) {
    return request('/auth/refresh-token', {
      method: 'POST',
      body: { refreshToken },
    });
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('mediguide_token');
    localStorage.removeItem('mediguide_refresh_token');
  },

  // In-App Notifications (FR-15)
  async getNotifications() {
    return request('/notifications');
  },

  async markNotificationRead(id) {
    return request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsRead() {
    return request('/notifications/read-all', {
      method: 'PATCH',
    });
  },

  async deleteNotification(id) {
    return request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  // AI API
  async getAiConfig() {
    return request('/ai/config');
  },

  async setAiApiKey(apiKey) {
    return request('/ai/config', {
      method: 'POST',
      body: { apiKey },
    });
  },

  async sendChatMessage(message, conversationId, history) {
    return request('/ai/chat', {
      method: 'POST',
      body: { message, conversationId, history },
    });
  },

  async analyzeSymptoms(symptomsOrOptions, severity, duration, bodyArea, additionalNotes) {
    let payload;
    if (symptomsOrOptions && typeof symptomsOrOptions === 'object' && !Array.isArray(symptomsOrOptions)) {
      payload = symptomsOrOptions;
    } else {
      let finalSeverity = severity;
      let finalDuration = duration;
      const validSeverities = ['Mild', 'Moderate', 'Severe'];
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
    return request('/ai/symptom-check', {
      method: 'POST',
      body: payload,
    });
  },

  async getChatHistories() {
    return request('/ai/chat-history');
  },

  async getSymptomHistories() {
    return request('/ai/symptom-history');
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

    const query = params.toString();
    return request(query ? `/doctors?${query}` : '/doctors');
  },

  async getDoctorById(id) {
    return request(`/doctors/${id}`);
  },

  async getMyPatients() {
    return request('/doctors/my-patients');
  },

  async getDoctorSchedule() {
    return request('/doctors/schedule/me');
  },

  async updateDoctorSchedule(scheduleData) {
    return request('/doctors/schedule/me', {
      method: 'PUT',
      body: scheduleData,
    });
  },

  async updateDoctorProfile(profileData) {
    return request('/doctors/profile/me', {
      method: 'PUT',
      body: profileData,
    });
  },

  // Medical Departments API
  async getDepartments() {
    return request('/departments');
  },

  async getDepartmentById(id) {
    return request(`/departments/${id}`);
  },

  async createDepartment(data) {
    return request('/departments', {
      method: 'POST',
      body: data,
    });
  },

  async updateDepartment(id, updates) {
    return request(`/departments/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },

  async deleteDepartment(id) {
    return request(`/departments/${id}`, {
      method: 'DELETE',
    });
  },

  // Appointments API
  async bookAppointment(data) {
    const payload = {
      ...data,
      timeSlot: data.timeSlot || data.time,
    };
    return request('/appointments', {
      method: 'POST',
      body: payload,
    });
  },

  async createAppointment(data) {
    return this.bookAppointment(data);
  },

  async getMyAppointments() {
    return request('/appointments/my');
  },

  async updateAppointmentStatus(id, status, notes, prescriptionId, date, timeSlot) {
    return request(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: { status, notes, prescriptionId, date, timeSlot },
    });
  },

  // Medicines API
  async getMedicines(patientId) {
    const path = patientId ? `/medicines?patientId=${patientId}` : '/medicines';
    return request(path);
  },

  async addMedicine(data) {
    return request('/medicines', {
      method: 'POST',
      body: data,
    });
  },

  async updateMedicine(id, updates) {
    return request(`/medicines/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },

  async deleteMedicine(id) {
    return request(`/medicines/${id}`, {
      method: 'DELETE',
    });
  },

  async logMedicineAdherence(id, date, timeSlot, taken) {
    return request(`/medicines/${id}/adherence`, {
      method: 'POST',
      body: { date, timeSlot, taken },
    });
  },

  // Health Records API
  async getHealthRecords(patientId) {
    const path = patientId ? `/health-records?patientId=${patientId}` : '/health-records';
    return request(path);
  },

  async addHealthRecord(record) {
    return request('/health-records', {
      method: 'POST',
      body: record,
    });
  },

  async deleteHealthRecord(id) {
    return request(`/health-records/${id}`, {
      method: 'DELETE',
    });
  },

  // Prescriptions API
  async getMyPrescriptions() {
    return request('/prescriptions/my');
  },

  async getPrescriptionById(id) {
    return request(`/prescriptions/${id}`);
  },

  async createPrescription(data) {
    return request('/prescriptions', {
      method: 'POST',
      body: data,
    });
  },

  // Admin API
  async getAdminStats() {
    return request('/admin/stats');
  },

  async getAdminUsers(role, status, search) {
    const params = new URLSearchParams();
    if (role && role !== 'all') params.append('role', role);
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString();
    return request(query ? `/admin/users?${query}` : '/admin/users');
  },

  async updateAdminUser(id, updates) {
    return request(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: updates,
    });
  },

  async deleteAdminUser(id) {
    return request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  async addDoctor(data) {
    return request('/admin/doctors', {
      method: 'POST',
      body: data,
    });
  },

  async approveDoctor(id) {
    return request(`/admin/doctors/${id}/approve`, {
      method: 'PATCH',
    });
  },

  async suspendDoctor(id) {
    return request(`/admin/doctors/${id}/suspend`, {
      method: 'PATCH',
    });
  },

  async toggleDoctorAvailability(id) {
    return request(`/admin/doctors/${id}/availability`, {
      method: 'PATCH',
    });
  },

  async getAdminAppointments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.doctorId && filters.doctorId !== 'All') params.append('doctorId', filters.doctorId);
    if (filters.patientId && filters.patientId !== 'All')
      params.append('patientId', filters.patientId);
    if (filters.date) params.append('date', filters.date);
    if (filters.search) params.append('search', filters.search);

    const query = params.toString();
    return request(query ? `/admin/appointments?${query}` : '/admin/appointments');
  },

  async getAuditLogs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.eventType && filters.eventType !== 'ALL')
      params.append('eventType', filters.eventType);
    if (filters.role && filters.role !== 'ALL') params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);

    const query = params.toString();
    return request(query ? `/audit-logs?${query}` : '/audit-logs');
  },

  async getSystemSettings() {
    return request('/admin/settings');
  },

  async updateSystemSettings(settings) {
    return request('/admin/settings', {
      method: 'PUT',
      body: settings,
    });
  },
};
