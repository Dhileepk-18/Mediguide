import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import {
  LayoutDashboard,
  Bot,
  Sparkles,
  Stethoscope,
  Pill,
  FileText,
  FileCheck2,
  History,
  User,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Users,
  Building2,
  Layers,
  ListFilter,
  FileSearch,
  Settings,
  Clock,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been safely signed out.',
    });
    navigate('/');
  };

  const patientNavItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Symptoms', path: '/symptom-checker', icon: Sparkles },
    { name: 'MediGuide AI', path: '/ai-assistant', icon: Bot },
    { name: 'Medicines', path: '/medicines', icon: Pill },
    { name: 'Care', path: '/doctors', icon: Stethoscope },
    { name: 'Appointments', path: '/appointments', icon: Clock },
    { name: 'Records', path: '/health-records', icon: FileText },
    { name: 'Prescriptions', path: '/prescriptions', icon: FileCheck2 },
    { name: 'Consult History', path: '/chat-history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Privacy & Consent', path: '/privacy-settings', icon: ShieldCheck },
  ];

  const doctorNavItems = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/doctor/appointments', icon: Clock },
    { name: 'Prescriptions', path: '/doctor/prescriptions', icon: FileCheck2 },
    { name: 'Patients', path: '/doctor/patients', icon: Users },
    { name: 'Schedule', path: '/doctor/schedule', icon: Clock },
    { name: 'Profile', path: '/doctor/profile', icon: User },
  ];

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Doctor Verification', path: '/admin/doctors', icon: Building2 },
    { name: 'Departments', path: '/admin/departments', icon: Layers },
    { name: 'Appointments Oversight', path: '/admin/appointments', icon: ListFilter },
    { name: 'Audit Trail', path: '/admin/audit-logs', icon: FileSearch },
    { name: 'Safety Settings', path: '/admin/settings', icon: Settings },
  ];

  let currentNavItems = patientNavItems;
  if (user.role === 'doctor') currentNavItems = doctorNavItems;
  else if (user.role === 'admin') currentNavItems = adminNavItems;

  return (
    <aside className="hidden md:flex w-[250px] bg-[#0B3441] text-[#FAFBFB] flex-col shrink-0 h-[calc(100vh-4.5rem)] sticky top-[4.5rem] select-none border-r border-white/10 z-30">
      {/* Role tag */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C9A24D]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              {user.role}
            </span>
          </div>
          <span className="text-[10px] text-[#9EBAD1] font-medium">India</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Main Navigation" className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {currentNavItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-[#9EBAD1] hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#C9A24D]' : 'text-[#9EBAD1]'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Pinned Emergency Entry near bottom (Section 6 & 7.8) */}
      <div className="px-3 pt-2 pb-1 border-t border-white/10">
        <NavLink
          to="/emergency"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#B83A3A]/20 hover:bg-[#B83A3A]/30 border border-[#B83A3A]/40 text-white transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#B83A3A] shrink-0" />
            <span>Urgent Emergency</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-[#FAFBFB] bg-[#B83A3A] px-1.5 py-0.5 rounded">
            112
          </span>
        </NavLink>
      </div>

      {/* User Footer Profile & Quick Logout */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/20 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-[#9EBAD1] capitalize truncate">{user.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#9EBAD1] hover:text-[#B83A3A] hover:bg-white/10 transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
