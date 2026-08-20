import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import { LayoutDashboard, Bot, Stethoscope, Calendar, Pill, FileText, FileCheck2, History, User, Users, Building2, LogOut, Sparkles, } from 'lucide-react';
export const Sidebar = () => {
    const { user, logout } = useAuthStore();
    const { addToast } = useAppStore();
    const navigate = useNavigate();
    if (!user)
        return null;
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
        { name: 'AI Assistant', path: '/ai-assistant', icon: Bot, badge: 'AI' },
        { name: 'Symptom Checker', path: '/symptom-checker', icon: Stethoscope, badge: 'Smart' },
        { name: 'Appointments', path: '/appointments', icon: Calendar },
        { name: 'Medicines', path: '/medicines', icon: Pill },
        { name: 'Health Records', path: '/health-records', icon: FileText },
        { name: 'Prescriptions', path: '/prescriptions', icon: FileCheck2 },
        { name: 'Chat History', path: '/chat-history', icon: History },
        { name: 'My Health Profile', path: '/profile', icon: User },
    ];
    const doctorNavItems = [
        { name: 'Doctor Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
        { name: 'Patient Appointments', path: '/doctor/appointments', icon: Calendar },
        { name: 'Digital Prescriptions', path: '/doctor/prescriptions', icon: FileCheck2 },
        { name: 'Patients Directory', path: '/doctor/patients', icon: Users },
    ];
    const adminNavItems = [
        { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'User Management', path: '/admin/users', icon: Users },
        { name: 'Doctor Management', path: '/admin/doctors', icon: Building2 },
    ];
    let currentNavItems = patientNavItems;
    if (user.role === 'doctor')
        currentNavItems = doctorNavItems;
    else if (user.role === 'admin')
        currentNavItems = adminNavItems;
    return (<aside className="w-64 bg-surface border-r border-surface-border flex flex-col shrink-0 h-[calc(100vh-5rem)] sticky top-20 select-none overflow-y-auto">
      {/* Role Banner */}
      <div className="p-4 mx-3 mt-3 mb-2 rounded-2xl bg-health-50 border border-health-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-health-500 animate-pulse"/>
          <span className="text-xs font-bold uppercase tracking-wider text-health-900">
            {user.role} Portal
          </span>
        </div>
        <span className="text-[10px] font-semibold text-health-700 bg-health-200/60 px-2 py-0.5 rounded-full">
          Live Sync
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-2 space-y-1">
        {currentNavItems.map((item) => {
            const Icon = item.icon;
            return (<NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${isActive
                    ? 'bg-health-500 text-white shadow-soft font-bold'
                    : 'text-ink-muted hover:text-ink-main hover:bg-health-50'}`}>
              {({ isActive }) => (<>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-health-100' : 'text-ink-muted'}`}/>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (<span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-0.5 ${isActive
                            ? 'bg-health-600 text-health-100'
                            : 'bg-health-100 text-health-800'}`}>
                      <Sparkles className="w-2.5 h-2.5"/>
                      {item.badge}
                    </span>)}
                </>)}
            </NavLink>);
        })}
      </div>

      {/* User Footer Profile & Quick Logout */}
      <div className="p-3 border-t border-surface-border">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-muted/60 hover:bg-surface-muted transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-8 h-8 rounded-xl object-cover ring-1 ring-health-200 shrink-0"/>
            <div className="min-w-0">
              <div className="text-xs font-bold text-ink-main truncate">{user.name}</div>
              <div className="text-[10px] text-ink-muted capitalize truncate">{user.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-xl text-ink-muted hover:text-status-danger hover:bg-red-50 transition-colors" title="Sign Out">
            <LogOut className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </aside>);
};
