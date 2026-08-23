import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import { api } from '../../services/api.js';
import { EmergencyModal } from './EmergencyModal.jsx';
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
    PhoneCall,
    ShieldAlert,
    FileText,
    Pill,
    Stethoscope,
    ExternalLink,
    Lock,
} from 'lucide-react';

export const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const { addToast } = useAppStore();
    const navigate = useNavigate();
    const location = useLocation();

    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

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
            // Polling notifications every 30s
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

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            try {
                await api.markNotificationRead(notif.id);
                setNotifications(prev =>
                    prev.map(n => (n.id === notif.id ? { ...n, isRead: true } : n))
                );
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

    const getDashboardPath = () => {
        if (!user) return '/login';
        if (user.role === 'patient') return '/dashboard';
        if (user.role === 'doctor') return '/doctor/dashboard';
        if (user.role === 'admin') return '/admin/dashboard';
        return '/dashboard';
    };

    const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

    const getNotifIcon = (type) => {
        switch (type) {
            case 'appointment':
                return <Calendar className="w-4 h-4 text-sky-500" />;
            case 'prescription':
                return <FileText className="w-4 h-4 text-emerald-500" />;
            case 'medicine':
                return <Pill className="w-4 h-4 text-amber-500" />;
            case 'security':
                return <Lock className="w-4 h-4 text-purple-500" />;
            default:
                return <Activity className="w-4 h-4 text-health-500" />;
        }
    };

    return (
        <>
            <nav className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-border transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-health-600 to-health-400 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
                                <Activity className="w-6 h-6 text-health-100" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-xl tracking-tight text-ink-main">
                                        Medi<span className="text-health-500">Guide</span>
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-orange-100 text-orange-900 rounded-full border border-orange-200">
                                        India
                                    </span>
                                </div>
                                <p className="text-[11px] text-ink-muted hidden sm:block">AI Healthcare Companion (IST)</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links for Public */}
                        {isPublicPage && (
                            <div className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-muted">
                                <Link to="/" className="hover:text-health-600 transition-colors">Home</Link>
                                <a href="#features" className="hover:text-health-600 transition-colors">Features</a>
                                <a href="#preview" className="hover:text-health-600 transition-colors flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-health-500" />
                                    Live Preview
                                </a>
                                <a href="#roles" className="hover:text-health-600 transition-colors">Portals</a>
                                <a href="#how-it-works" className="hover:text-health-600 transition-colors">How It Works</a>
                            </div>
                        )}

                        {/* Action Buttons & Helpers */}
                        <div className="flex items-center gap-3">
                            {/* Emergency SOS Button (India 112/108) */}
                            <button
                                onClick={() => setIsEmergencyModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 group"
                                title="India 24x7 Emergency Helplines (112, 108, 102)"
                            >
                                <PhoneCall className="w-3.5 h-3.5 text-red-600 animate-pulse group-hover:scale-110" />
                                <span className="hidden sm:inline">Emergency SOS</span>
                                <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-black">112</span>
                            </button>

                            {/* Notifications Center Popover */}
                            {isAuthenticated && (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                        className="relative p-2 rounded-xl text-ink-muted hover:text-ink-main hover:bg-health-50 border border-transparent hover:border-health-200 transition-all"
                                        title="In-App Notifications"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white font-black text-[10px] rounded-full flex items-center justify-center animate-bounce shadow-soft">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isNotificationOpen && (
                                        <div
                                            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-surface-border p-3 z-50 animate-fadeIn"
                                            onMouseLeave={() => setIsNotificationOpen(false)}
                                        >
                                            <div className="flex items-center justify-between px-3 py-2 border-b border-surface-border">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-xs font-bold text-ink-main uppercase tracking-wider">Notifications</h4>
                                                    {unreadCount > 0 && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                                                            {unreadCount} unread
                                                        </span>
                                                    )}
                                                </div>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={handleMarkAllRead}
                                                        className="text-[11px] font-semibold text-health-600 hover:text-health-800 flex items-center gap-1"
                                                    >
                                                        <CheckCheck className="w-3.5 h-3.5" />
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>

                                            <div className="max-h-72 overflow-y-auto divide-y divide-surface-border mt-1">
                                                {notifications.length === 0 ? (
                                                    <div className="py-8 text-center text-xs text-ink-muted">
                                                        <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                                        No new notifications
                                                    </div>
                                                ) : (
                                                    notifications.map(n => (
                                                        <div
                                                            key={n.id}
                                                            onClick={() => handleNotificationClick(n)}
                                                            className={`p-3 rounded-2xl cursor-pointer transition-colors flex items-start gap-3 ${
                                                                n.isRead ? 'hover:bg-slate-50 opacity-75' : 'bg-health-50/70 hover:bg-health-50 font-medium'
                                                            }`}
                                                        >
                                                            <div className="p-2 rounded-xl bg-white shadow-sm shrink-0 mt-0.5">
                                                                {getNotifIcon(n.type)}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-xs font-bold text-ink-main truncate">{n.title}</p>
                                                                    {!n.isRead && (
                                                                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                                                    )}
                                                                </div>
                                                                <p className="text-[11px] text-ink-muted leading-tight mt-0.5 line-clamp-2">
                                                                    {n.message}
                                                                </p>
                                                                <span className="text-[9px] text-slate-400 mt-1 block">
                                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Auth Buttons / Profile */}
                            {isAuthenticated && user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-health-50 border border-transparent hover:border-health-200 transition-all"
                                    >
                                        <img
                                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                                            alt={user.name}
                                            className="w-9 h-9 rounded-xl object-cover ring-2 ring-health-200"
                                        />
                                        <div className="hidden lg:block text-left">
                                            <div className="text-xs font-bold text-ink-main leading-tight">{user.name}</div>
                                            <div className="text-[10px] capitalize text-health-600 font-semibold">{user.role} Portal</div>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-ink-muted" />
                                    </button>

                                    {isProfileDropdownOpen && (
                                        <div
                                            className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl shadow-xl border border-surface-border p-2 z-50"
                                            onMouseLeave={() => setIsProfileDropdownOpen(false)}
                                        >
                                            <div className="px-3 py-2 border-b border-surface-border">
                                                <p className="text-xs font-bold text-ink-main">{user.name}</p>
                                                <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                to={getDashboardPath()}
                                                onClick={() => setIsProfileDropdownOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink-main hover:bg-health-50 rounded-xl transition-colors mt-1"
                                            >
                                                <Activity className="w-4 h-4 text-health-600" />
                                                Dashboard
                                            </Link>

                                            {user.role === 'patient' && (
                                                <>
                                                    <Link
                                                        to="/doctors"
                                                        onClick={() => setIsProfileDropdownOpen(false)}
                                                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink-main hover:bg-health-50 rounded-xl transition-colors"
                                                    >
                                                        <Stethoscope className="w-4 h-4 text-health-600" />
                                                        Doctor Discovery
                                                    </Link>
                                                    <Link
                                                        to="/ai-assistant"
                                                        onClick={() => setIsProfileDropdownOpen(false)}
                                                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink-main hover:bg-health-50 rounded-xl transition-colors"
                                                    >
                                                        <Bot className="w-4 h-4 text-health-600" />
                                                        AI Assistant
                                                    </Link>
                                                    <Link
                                                        to="/appointments"
                                                        onClick={() => setIsProfileDropdownOpen(false)}
                                                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink-main hover:bg-health-50 rounded-xl transition-colors"
                                                    >
                                                        <Calendar className="w-4 h-4 text-health-600" />
                                                        Appointments
                                                    </Link>
                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setIsProfileDropdownOpen(false)}
                                                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink-main hover:bg-health-50 rounded-xl transition-colors"
                                                    >
                                                        <User className="w-4 h-4 text-health-600" />
                                                        My Health Profile
                                                    </Link>
                                                    <Link
                                                        to="/privacy-settings"
                                                        onClick={() => setIsProfileDropdownOpen(false)}
                                                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink-main hover:bg-health-50 rounded-xl transition-colors"
                                                    >
                                                        <Lock className="w-4 h-4 text-health-600" />
                                                        Privacy & DPDP Rights
                                                    </Link>
                                                </>
                                            )}

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-status-danger hover:bg-red-50 rounded-xl transition-colors border-t border-surface-border mt-1"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login" className="px-4 py-2 text-xs font-semibold text-ink-main hover:text-health-700 transition-colors">
                                        Log In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 text-xs font-semibold bg-health-500 hover:bg-health-600 text-white rounded-xl shadow-soft hover:shadow-md transition-all flex items-center gap-1.5"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-health-200" />
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 md:hidden rounded-xl text-ink-muted hover:text-ink-main hover:bg-health-50"
                            >
                                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden px-4 pt-2 pb-6 border-t border-surface-border bg-surface space-y-3">
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-ink-main hover:bg-health-50 rounded-xl">
                            Home
                        </Link>
                        <Link to="/doctors" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-ink-main hover:bg-health-50 rounded-xl">
                            Doctor Discovery (India)
                        </Link>
                        <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-ink-main hover:bg-health-50 rounded-xl">
                            Features
                        </a>
                        <a href="#roles" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-ink-main hover:bg-health-50 rounded-xl">
                            User Roles
                        </a>
                        {isAuthenticated ? (
                            <Link to={getDashboardPath()} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-bold text-health-700 bg-health-50 rounded-xl">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <div className="flex gap-2 pt-2">
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center py-2 text-sm font-semibold border border-surface-border rounded-xl">
                                    Log In
                                </Link>
                                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center py-2 text-sm font-semibold bg-health-500 text-white rounded-xl">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* Indian Emergency Modal */}
            <EmergencyModal
                isOpen={isEmergencyModalOpen}
                onClose={() => setIsEmergencyModalOpen(false)}
            />
        </>
    );
};
