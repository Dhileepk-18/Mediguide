import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import { Activity, User, LogOut, ChevronDown, Menu, X, Sparkles, Bot, Calendar } from 'lucide-react';

export const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const { addToast } = useAppStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        if (!user)
            return '/login';
        if (user.role === 'patient')
            return '/dashboard';
        if (user.role === 'doctor')
            return '/doctor/dashboard';
        if (user.role === 'admin')
            return '/admin/dashboard';
        return '/dashboard';
    };
    const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);
    return (<nav className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-health-600 to-health-400 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-health-100"/>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-ink-main">Medi<span className="text-health-500">Guide</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-health-100 text-health-800 rounded-full border border-health-200">
                  AI Health
                </span>
              </div>
              <p className="text-[11px] text-ink-muted hidden sm:block">Intelligent Healthcare Assistant</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isPublicPage && (
            <div className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-muted">
              <Link to="/" className="hover:text-health-600 transition-colors">Home</Link>
              <a href="#features" className="hover:text-health-600 transition-colors">Features</a>
              <a href="#preview" className="hover:text-health-600 transition-colors flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-health-500"/>
                Interactive Preview
              </a>
              <a href="#roles" className="hover:text-health-600 transition-colors">Roles</a>
              <a href="#how-it-works" className="hover:text-health-600 transition-colors">How It Works</a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">

            {/* Auth Buttons / Profile */}
            {isAuthenticated && user ? (<div className="relative">
                <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-health-50 border border-transparent hover:border-health-200 transition-all">
                  <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-9 h-9 rounded-xl object-cover ring-2 ring-health-200"/>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-ink-main leading-tight">{user.name}</div>
                    <div className="text-[10px] capitalize text-health-600 font-semibold">{user.role} Portal</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-ink-muted"/>
                </button>

                {isProfileDropdownOpen && (<div className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl shadow-xl border border-surface-border p-2 z-50" onMouseLeave={() => setIsProfileDropdownOpen(false)}>
                    <div className="px-3 py-2 border-b border-surface-border">
                      <p className="text-xs font-bold text-ink-main">{user.name}</p>
                      <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
                    </div>
                    <Link to={getDashboardPath()} onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink-main hover:bg-health-50 rounded-xl transition-colors mt-1">
                      <Activity className="w-4 h-4 text-health-600"/>
                      Dashboard
                    </Link>
                    {user.role === 'patient' && (<>
                        <Link to="/ai-assistant" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink-main hover:bg-health-50 rounded-xl transition-colors">
                          <Bot className="w-4 h-4 text-health-600"/>
                          AI Assistant
                        </Link>
                        <Link to="/appointments" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink-main hover:bg-health-50 rounded-xl transition-colors">
                          <Calendar className="w-4 h-4 text-health-600"/>
                          Appointments
                        </Link>
                        <Link to="/profile" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink-main hover:bg-health-50 rounded-xl transition-colors">
                          <User className="w-4 h-4 text-health-600"/>
                          My Health Profile
                        </Link>
                      </>)}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-status-danger hover:bg-red-50 rounded-xl transition-colors border-t border-surface-border mt-1">
                      <LogOut className="w-4 h-4"/>
                      Sign Out
                    </button>
                  </div>)}
              </div>) : (<div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-xs font-semibold text-ink-main hover:text-health-700 transition-colors">
                  Log In
                </Link>
                <Link to="/register" className="px-4 py-2 text-xs font-semibold bg-health-500 hover:bg-health-600 text-white rounded-xl shadow-soft hover:shadow-md transition-all flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-health-200"/>
                  Get Started
                </Link>
              </div>)}

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 md:hidden rounded-xl text-ink-muted hover:text-ink-main hover:bg-health-50">
              {isMobileMenuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (<div className="md:hidden px-4 pt-2 pb-6 border-t border-surface-border bg-surface space-y-3">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-ink-main hover:bg-health-50 rounded-xl">
            Home
          </Link>
          <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-ink-main hover:bg-health-50 rounded-xl">
            Features
          </a>
          <a href="#preview" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-ink-main hover:bg-health-50 rounded-xl">
            Interactive Preview
          </a>
          <a href="#roles" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-ink-main hover:bg-health-50 rounded-xl">
            User Roles
          </a>
          <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-ink-main hover:bg-health-50 rounded-xl">
            How It Works
          </a>
          {isAuthenticated ? (<Link to={getDashboardPath()} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-bold text-health-700 bg-health-50 rounded-xl">
              Go to Dashboard
            </Link>) : (<div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center py-2 text-sm font-semibold border border-surface-border rounded-xl">
                Log In
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center py-2 text-sm font-semibold bg-health-500 text-white rounded-xl">
                Get Started
              </Link>
            </div>)}
        </div>)}
    </nav>);
};
