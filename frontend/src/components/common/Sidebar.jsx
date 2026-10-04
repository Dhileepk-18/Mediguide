import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  Activity,
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

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
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Symptom Triage', path: '/symptom-checker', icon: Sparkles, badge: 'AI ML' },
    { name: 'MediGuide Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'Doctors & Clinics', path: '/doctors', icon: Stethoscope },
    { name: 'Appointments', path: '/appointments', icon: Clock },
    { name: 'Medicine Schedule', path: '/medicines', icon: Pill },
    { name: 'Health Records', path: '/health-records', icon: FileText },
    { name: 'Prescriptions', path: '/prescriptions', icon: FileCheck2 },
    { name: 'Consult History', path: '/chat-history', icon: History },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Privacy & Security', path: '/privacy-settings', icon: ShieldCheck },
  ];

  const doctorNavItems = [
    { name: 'Doctor Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'My Appointments', path: '/doctor/appointments', icon: Clock },
    { name: 'Digital Prescriptions', path: '/doctor/prescriptions', icon: FileCheck2 },
    { name: 'Patient Directory', path: '/doctor/patients', icon: Users },
    { name: 'Practice Schedule', path: '/doctor/schedule', icon: Clock },
    { name: 'Doctor Profile', path: '/doctor/profile', icon: User },
  ];

  const adminNavItems = [
    { name: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Doctor Verification', path: '/admin/doctors', icon: Building2 },
    { name: 'Department Taxonomy', path: '/admin/departments', icon: Layers },
    { name: 'Appointments Oversight', path: '/admin/appointments', icon: ListFilter },
    { name: 'Security Audit Trail', path: '/admin/audit-logs', icon: FileSearch },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  let currentNavItems = patientNavItems;
  if (user.role === 'doctor') currentNavItems = doctorNavItems;
  else if (user.role === 'admin') currentNavItems = adminNavItems;

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 bg-white/95 backdrop-blur-xl border-r border-slate-200/80 transition-all duration-300 ease-in-out select-none z-30 sticky top-16 h-[calc(100vh-4rem)] ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Collapse Button */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>MediGuide</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {user.role}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">India Clinical Network</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto py-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav aria-label="Main Navigation" className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
        {currentNavItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border border-blue-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100/60 text-blue-700">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Emergency Quick Action */}
      <div className="p-2.5 border-t border-slate-100">
        <NavLink
          to="/emergency"
          title={isCollapsed ? 'India Emergency SOS (112 / 108)' : undefined}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100/80 text-red-700 border border-red-200/80 text-xs font-semibold transition-all ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <PhoneCall className="w-4 h-4 text-red-600 animate-pulse shrink-0" />
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between">
              <span>Emergency 112</span>
              <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black">
                SOS
              </span>
            </div>
          )}
        </NavLink>
      </div>

      {/* User Footer */}
      <div className="p-2.5 border-t border-slate-100 bg-slate-50/50">
        <div
          className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
        >
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
