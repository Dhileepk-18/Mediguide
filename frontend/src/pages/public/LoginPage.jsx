import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import { api } from '../../services/api.js';
import {
  Activity,
  ArrowRight,
  Lock,
  Mail,
  User,
  Stethoscope,
  Shield,
  Sparkles,
  Key,
  X,
} from 'lucide-react';

export const LoginPage = () => {
  const { login, demoLogin, isLoading, error } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [demoLoadingRole, setDemoLoadingRole] = useState(null);

  // Forgot Password Flow
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter OTP & new password
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      const currentUser = useAuthStore.getState().user;
      addToast({
        type: 'success',
        title: 'Login Successful',
        message: `Welcome back, ${currentUser?.name}!`,
      });
      if (currentUser?.role === 'patient') navigate('/dashboard');
      else if (currentUser?.role === 'doctor') navigate('/doctor/dashboard');
      else if (currentUser?.role === 'admin') navigate('/admin/dashboard');
    }
  };

  const handleDemoLogin = async role => {
    setDemoLoadingRole(role);
    const success = await demoLogin(role);
    setDemoLoadingRole(null);
    if (success) {
      const currentUser = useAuthStore.getState().user;
      addToast({
        type: 'success',
        title: `Demo ${role.toUpperCase()} Login`,
        message: `Logged in as ${currentUser?.name}`,
      });
      if (role === 'patient') navigate('/dashboard');
      else if (role === 'doctor') navigate('/doctor/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    }
  };

  const handleRequestOtp = async e => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsResetting(true);
    try {
      const res = await api.forgotPassword(forgotEmail);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Verification OTP Sent',
          message: res.message || 'Use demo OTP code: 123456',
        });
        setForgotStep(2);
        setOtpCode('123456'); // pre-fill demo OTP for convenience
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Request Failed',
        message: err.message || 'Could not send reset OTP.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetPassword = async e => {
    e.preventDefault();
    if (!otpCode.trim() || !newPassword.trim()) return;
    setIsResetting(true);
    try {
      const res = await api.resetPassword(forgotEmail, otpCode, newPassword);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Password Reset Successful! 🔐',
          message: 'You can now log in with your new credentials.',
        });
        setShowForgotModal(false);
        setForgotStep(1);
        setEmail(forgotEmail);
        setPassword(newPassword);
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: err.message || 'Invalid or expired OTP code.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fadeIn">
      <div className="max-w-md w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-health-600 text-white items-center justify-center shadow-soft mb-2">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-main">
            Welcome back to MediGuide
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            India's Clinical Healthcare & AI Medical Assistant
          </p>
        </div>

        {/* Standard Login Form */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft-lg space-y-6">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="aarav.sharma@example.in"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border font-medium focus:outline-none focus:border-health-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-ink-main">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email || 'aarav.sharma@example.in');
                    setForgotStep(1);
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] font-bold text-health-600 hover:text-health-700 underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border font-medium focus:outline-none focus:border-health-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || Boolean(demoLoadingRole)}
              className="w-full py-3 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-xs shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Accounts */}
          <div className="pt-2 border-t border-surface-border space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-bold text-ink-muted uppercase tracking-wider justify-center">
              <Sparkles className="w-3.5 h-3.5 text-health-500" />
              <span>1-Click Verified Indian Demo Accounts</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('patient')}
                disabled={Boolean(demoLoadingRole) || isLoading}
                className="p-2.5 rounded-2xl bg-health-50 hover:bg-health-100 border border-health-200 text-left transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-health-800 font-bold text-[11px]">
                  <User className="w-3.5 h-3.5 text-health-600" />
                  <span>Patient</span>
                </div>
                <div className="text-[10px] text-ink-muted truncate mt-0.5">Aarav (BLR)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('doctor')}
                disabled={Boolean(demoLoadingRole) || isLoading}
                className="p-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-blue-800 font-bold text-[11px]">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                  <span>Doctor</span>
                </div>
                <div className="text-[10px] text-ink-muted truncate mt-0.5">Dr. Priya (AIIMS)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={Boolean(demoLoadingRole) || isLoading}
                className="p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-purple-800 font-bold text-[11px]">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-ink-muted truncate mt-0.5">Aditi (HQ)</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-ink-muted">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-health-600 hover:text-health-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password OTP Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface rounded-3xl shadow-2xl border border-surface-border max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2 text-health-700">
                <Key className="w-5 h-5" />
                <h3 className="text-base font-bold text-ink-main">Reset Password</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-ink-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-ink-muted leading-relaxed">
                  Enter your registered email address to receive a 6-digit verification OTP.
                </p>
                <div>
                  <label className="block font-bold text-ink-main mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface font-medium focus:outline-none focus:border-health-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl border border-surface-border text-ink-muted font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-5 py-2 bg-health-500 hover:bg-health-600 text-white font-bold rounded-xl shadow-soft"
                  >
                    {isResetting ? 'Sending...' : 'Send OTP (123456)'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-ink-muted leading-relaxed">
                  Enter the 6-digit OTP sent for{' '}
                  <strong className="text-ink-main">{forgotEmail}</strong> and your new password.
                </p>
                <div>
                  <label className="block font-bold text-ink-main mb-1">
                    6-Digit Verification OTP
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    required
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface font-mono font-bold text-center tracking-widest text-sm focus:outline-none focus:border-health-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink-main mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface font-medium focus:outline-none focus:border-health-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="px-4 py-2 rounded-xl border border-surface-border text-ink-muted font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-5 py-2 bg-health-500 hover:bg-health-600 text-white font-bold rounded-xl shadow-soft"
                  >
                    {isResetting ? 'Updating...' : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
