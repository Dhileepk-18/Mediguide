import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { Navbar } from './components/common/Navbar.jsx';
import { Sidebar } from './components/common/Sidebar.jsx';
import { Footer } from './components/common/Footer.jsx';
import { ToastContainer } from './components/common/ToastContainer.jsx';

// Public Pages
import { LandingPage } from './pages/public/LandingPage.jsx';
import { LoginPage } from './pages/public/LoginPage.jsx';
import { RegisterPage } from './pages/public/RegisterPage.jsx';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard.jsx';
import { DoctorDiscoveryPage } from './pages/patient/DoctorDiscoveryPage.jsx';
import { AiAssistantPage } from './pages/patient/AiAssistantPage.jsx';
import { SymptomCheckerPage } from './pages/patient/SymptomCheckerPage.jsx';
import { AppointmentsPage } from './pages/patient/AppointmentsPage.jsx';
import { MedicinesPage } from './pages/patient/MedicinesPage.jsx';
import { HealthRecordsPage } from './pages/patient/HealthRecordsPage.jsx';
import { PrescriptionsPage } from './pages/patient/PrescriptionsPage.jsx';
import { ChatHistoryPage } from './pages/patient/ChatHistoryPage.jsx';
import { PatientProfilePage } from './pages/patient/PatientProfilePage.jsx';
import { PrivacySettingsPage } from './pages/patient/PrivacySettingsPage.jsx';
import { EmergencyPage } from './pages/patient/EmergencyPage.jsx';
import { BottomTabBar } from './components/common/BottomTabBar.jsx';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard.jsx';
import { DoctorPrescriptionsPage } from './pages/doctor/DoctorPrescriptionsPage.jsx';
import { DoctorPatientsPage } from './pages/doctor/DoctorPatientsPage.jsx';
import { DoctorSchedulePage } from './pages/doctor/DoctorSchedulePage.jsx';
import { DoctorProfilePage } from './pages/doctor/DoctorProfilePage.jsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.jsx';
import { AdminDoctorsPage } from './pages/admin/AdminDoctorsPage.jsx';
import { AdminDepartmentsPage } from './pages/admin/AdminDepartmentsPage.jsx';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage.jsx';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage.jsx';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.jsx';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-health-200 border-t-health-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppLayout = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isEmergency = location.pathname === '/emergency';

  if (isEmergency) {
    return (
      <>
        {children}
        <ToastContainer />
      </>
    );
  }

  const isPublic = ['/', '/login', '/register'].includes(location.pathname);
  const isAiChat = location.pathname === '/ai-assistant';
  const showSidebar = isAuthenticated && user && !isPublic;

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#F8FAFC] ${isAiChat ? 'h-screen overflow-hidden' : ''}`}
    >
      <Navbar />
      <div className={`flex flex-1 ${isAiChat ? 'overflow-hidden min-h-0' : ''}`}>
        {showSidebar && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        )}
        <main
          className={`flex-1 min-w-0 ${isAiChat ? 'flex flex-col h-full overflow-hidden min-h-0' : 'overflow-x-hidden'} ${showSidebar ? 'pb-16 md:pb-0' : ''}`}
        >
          {children}
        </main>
      </div>
      {showSidebar && <BottomTabBar />}
      {isPublic && <Footer />}
      <ToastContainer />
    </div>
  );
};

export const App = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />

          {/* Patient Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
                <DoctorDiscoveryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <AiAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/symptom-checker"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <SymptomCheckerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medicines"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MedicinesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health-records"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <HealthRecordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prescriptions"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PrescriptionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat-history"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <ChatHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/privacy-settings"
            element={
              <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
                <PrivacySettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescriptions"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorPrescriptionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorPatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/schedule"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDoctorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDepartmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};
