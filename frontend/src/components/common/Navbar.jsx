import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import { api } from '../../services/api.js';
import {
  Activity,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Bot,
  Calendar,
  Bell,
  CheckCheck,
  FileText,
  Pill,
  Stethoscope,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoadingNotifs(true);
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // Ignore background polling errors
    } finally {
      setIsLoadingNotifs(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const timer = setInterval(loadNotifications, 30000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      addToast({
        type: 'success',
        title: 'Notifications Cleared',
        message: 'All notifications marked as read',
      });
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async notif => {
    if (!notif.isRead) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications(prev => prev.map(n => (n.id === notif.id ? { ...n, isRead: true } : n)));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    }
    setIsNotificationOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been safely signed out.',
    });
    navigate('/');
  };

  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  // Determine current active page label for clean breadcrumb
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path.includes('symptom-checker')) return 'Symptom Triage';
    if (path.includes('ai-assistant')) return 'MediGuide Assistant';
    if (path.includes('doctors')) return 'Doctors & Care Discovery';
    if (path.includes('appointments')) return 'Appointments';
    if (path.includes('medicines')) return 'Medicine Schedule';
    if (path.includes('health-records')) return 'Health Records Vault';
    if (path.includes('prescriptions')) return 'Digital Prescriptions';
    if (path.includes('chat-history')) return 'Consultation History';
    if (path.includes('profile')) return 'Account Profile';
    if (path.includes('dashboard')) return user?.role === 'doctor' ? 'Doctor Portal' : user?.role === 'admin' ? 'Admin Control' : 'Patient Dashboard';
    return '';
  };

  const breadcrumb = getBreadcrumbTitle();

  const getNotificationIcon = category => {
    switch (category) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'prescription':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'medicine':
        return <Pill className="w-4 h-4 text-amber-600" />;
      case 'security':
        return <Lock className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Breadcrumb */}
            <div className="flex items-center gap-3">
              <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-slate-900">
                    Medi<span className="text-blue-600">Guide</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 hidden sm:inline-block">
                    India
                  </span>
                </div>
              </Link>

              {/* Clean Active Section Breadcrumb */}
              {isAuthenticated && breadcrumb && (
                <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs font-medium text-slate-400">
                  <span>/</span>
                  <span className="text-slate-700 font-semibold">{breadcrumb}</span>
                </div>
              )}
            </div>

            {/* Desktop Navigation Links for Public Pages */}
            {isPublicPage && (
              <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  Home
                </Link>
                <a href="#features" className="hover:text-blue-600 transition-colors">
                  Clinical Capabilities
                </a>
                <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
                  How It Works
                </a>
              </div>
            )}

            {/* Action Buttons & Helpers */}
            <div className="flex items-center gap-2.5 sm:gap-3">

              {/* Notifications Center Popover */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 border border-transparent transition-all"
                    title="In-App Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute 1 top-1 right-1 w-4 h-4 bg-red-500 text-white font-black text-[9px] rounded-full flex items-center justify-center shadow-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isNotificationOpen && (
                    <div
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-fadeIn"
                      onMouseLeave={() => setIsNotificationOpen(false)}
                    >
                      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 tracking-wider">
                            Notifications
                          </h4>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-full border border-red-200">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-1">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            <Bell className="w-7 h-7 mx-auto text-slate-300 mb-2" />
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-start gap-2.5 ${
                                n.isRead
                                  ? 'hover:bg-slate-50 opacity-70'
                                  : 'bg-blue-50/50 hover:bg-blue-50 font-medium'
                              }`}
                            >
                              <div className="p-1.5 rounded-lg bg-white shadow-2xs shrink-0 mt-0.5 border border-slate-100">
                                {getNotificationIcon(n.category)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-900 line-clamp-1">{n.title}</p>
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                  {n.message}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {new Date(n.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Profile or Login CTA */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100/80 transition-all border border-slate-200/80"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 hidden md:block max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn"
                      onMouseLeave={() => setIsProfileDropdownOpen(false)}
                    >
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to={user.role === 'doctor' ? '/doctor/profile' : '/profile'}
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          View Profile
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Drawer Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 animate-fadeIn">
            {isAuthenticated ? (
              <div className="space-y-1">
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Activity className="w-4 h-4 text-blue-600" />
                  Dashboard
                </Link>
                <Link
                  to="/symptom-checker"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Symptom Triage
                </Link>
                <Link
                  to="/ai-assistant"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Bot className="w-4 h-4 text-blue-600" />
                  AI Assistant
                </Link>
                <Link
                  to="/doctors"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  Doctors & Appointments
                </Link>
                <Link
                  to="/medicines"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Pill className="w-4 h-4 text-blue-600" />
                  Medicines
                </Link>
                <Link
                  to="/health-records"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  Health Records
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-2 text-xs font-semibold text-slate-700 bg-slate-50 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl"
                >
                  Register Account
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

    </>
  );
};
