import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { Navbar } from './components/common/Navbar.jsx';
import { Sidebar } from './components/common/Sidebar.jsx';
import { Footer } from './components/common/Footer.jsx';
import { ToastContainer } from './components/common/ToastContainer.jsx';
import { BottomTabBar } from './components/common/BottomTabBar.jsx';

// Public Pages
const LandingPage = lazy(() => import('./pages/public/LandingPage.jsx').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/public/LoginPage.jsx').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage.jsx').then(m => ({ default: m.RegisterPage })));
const EmergencyPage = lazy(() => import('./pages/patient/EmergencyPage.jsx').then(m => ({ default: m.EmergencyPage })));

// Patient Pages
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard.jsx').then(m => ({ default: m.PatientDashboard })));
const DoctorDiscoveryPage = lazy(() => import('./pages/patient/DoctorDiscoveryPage.jsx').then(m => ({ default: m.DoctorDiscoveryPage })));
const AiAssistantPage = lazy(() => import('./pages/patient/AiAssistantPage.jsx').then(m => ({ default: m.AiAssistantPage })));
const SymptomCheckerPage = lazy(() => import('./pages/patient/SymptomCheckerPage.jsx').then(m => ({ default: m.SymptomCheckerPage })));
const AppointmentsPage = lazy(() => import('./pages/patient/AppointmentsPage.jsx').then(m => ({ default: m.AppointmentsPage })));
const MedicinesPage = lazy(() => import('./pages/patient/MedicinesPage.jsx').then(m => ({ default: m.MedicinesPage })));
const HealthRecordsPage = lazy(() => import('./pages/patient/HealthRecordsPage.jsx').then(m => ({ default: m.HealthRecordsPage })));
const PrescriptionsPage = lazy(() => import('./pages/patient/PrescriptionsPage.jsx').then(m => ({ default: m.PrescriptionsPage })));
const ChatHistoryPage = lazy(() => import('./pages/patient/ChatHistoryPage.jsx').then(m => ({ default: m.ChatHistoryPage })));
const PatientProfilePage = lazy(() => import('./pages/patient/PatientProfilePage.jsx').then(m => ({ default: m.PatientProfilePage })));
const PrivacySettingsPage = lazy(() => import('./pages/patient/PrivacySettingsPage.jsx').then(m => ({ default: m.PrivacySettingsPage })));

// Doctor Pages
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard.jsx').then(m => ({ default: m.DoctorDashboard })));
const DoctorPrescriptionsPage = lazy(() => import('./pages/doctor/DoctorPrescriptionsPage.jsx').then(m => ({ default: m.DoctorPrescriptionsPage })));
const DoctorPatientsPage = lazy(() => import('./pages/doctor/DoctorPatientsPage.jsx').then(m => ({ default: m.DoctorPatientsPage })));
const DoctorSchedulePage = lazy(() => import('./pages/doctor/DoctorSchedulePage.jsx').then(m => ({ default: m.DoctorSchedulePage })));
const DoctorProfilePage = lazy(() => import('./pages/doctor/DoctorProfilePage.jsx').then(m => ({ default: m.DoctorProfilePage })));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx').then(m => ({ default: m.AdminDashboard })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage.jsx').then(m => ({ default: m.AdminUsersPage })));
const AdminDoctorsPage = lazy(() => import('./pages/admin/AdminDoctorsPage.jsx').then(m => ({ default: m.AdminDoctorsPage })));
const AdminDepartmentsPage = lazy(() => import('./pages/admin/AdminDepartmentsPage.jsx').then(m => ({ default: m.AdminDepartmentsPage })));
const AdminAppointmentsPage = lazy(() => import('./pages/admin/AdminAppointmentsPage.jsx').then(m => ({ default: m.AdminAppointmentsPage })));
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage.jsx').then(m => ({ default: m.AdminAuditLogsPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage.jsx').then(m => ({ default: m.AdminSettingsPage })));

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
        <Suspense
          fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-health-200 border-t-health-600 rounded-full animate-spin" />
            </div>
          }
        >
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
      </Suspense>
    </AppLayout>
    </Router>
  );
};
