import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import {
  Activity,
  User,
  Shield,
  ArrowRight,
  Key,
} from 'lucide-react';

const INDIAN_STATES = [
  'Karnataka',
  'Maharashtra',
  'Delhi',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Gujarat',
  'West Bengal',
  'Kerala',
  'Rajasthan',
];

export const RegisterPage = () => {
  const { register, isLoading, error } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [adminSecretCode, setAdminSecretCode] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState('Female');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [dpdpConsent, setDpdpConsent] = useState(true);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!dpdpConsent) {
      addToast({
        type: 'warning',
        title: 'DPDP Consent Required',
        message: 'Please accept the DPDP data processing agreement to continue.',
      });
      return;
    }

    const success = await register({
      name,
      email,
      password,
      role,
      adminSecretCode: role === 'admin' ? adminSecretCode : undefined,
      phone,
      age: Number(age),
      gender,
      bloodGroup,
      city,
      state,
    });

    if (success) {
      const currentUser = useAuthStore.getState().user;
      addToast({
        type: 'success',
        title: 'Account Created 🎉',
        message: `Welcome to MediGuide India, ${currentUser?.name || ''}!`,
      });
      if (currentUser?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fadeIn">
      <div className="max-w-lg w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-health-600 text-white items-center justify-center shadow-soft mb-2">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-main">
            Create MediGuide Account
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            India's Clinical Healthcare & AI Medical Assistant
          </p>
        </div>

        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft-lg space-y-6">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold text-ink-main mb-1.5">
              Select Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 ${
                  role === 'patient'
                    ? 'bg-health-50 border-health-500 text-health-900 font-bold shadow-sm'
                    : 'bg-surface-muted border-surface-border text-ink-muted hover:bg-surface'
                }`}
              >
                <User className="w-4 h-4 text-health-600" />
                <span className="text-xs">Patient Account</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 ${
                  role === 'admin'
                    ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold shadow-sm'
                    : 'bg-surface-muted border-surface-border text-ink-muted hover:bg-surface'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="text-xs">System Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            {/* Admin Secret Passcode Field */}
            {role === 'admin' && (
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-purple-700" />
                    Admin Secret Passcode
                  </label>
                  <span className="text-[10px] text-purple-600 font-semibold">
                    (Default: mediguide_admin_secret_2026)
                  </span>
                </div>
                <input
                  type="password"
                  required
                  value={adminSecretCode}
                  onChange={e => setAdminSecretCode(e.target.value)}
                  placeholder="Enter Admin Passcode"
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-purple-300 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-ink-main mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full p-2.5 bg-surface-muted rounded-xl border border-surface-border font-semibold focus:outline-none focus:border-health-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-ink-main mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="aarav@example.in"
                  className="w-full p-2.5 bg-surface-muted rounded-xl border border-surface-border font-medium focus:outline-none focus:border-health-400"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-main mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 bg-surface-muted rounded-xl border border-surface-border font-medium focus:outline-none focus:border-health-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-ink-main mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-surface-muted rounded-xl border border-surface-border font-medium focus:outline-none focus:border-health-400"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-main mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  className="w-full p-2.5 bg-surface-muted rounded-xl border border-surface-border font-semibold focus:outline-none focus:border-health-400"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-ink-main mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full p-2.5 bg-surface-muted rounded-xl border border-surface-border font-medium focus:outline-none focus:border-health-400"
                />
              </div>

              <div>
                <label className="block font-bold text-ink-main mb-1">State</label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full p-2.5 bg-surface-muted rounded-xl border border-surface-border font-semibold focus:outline-none focus:border-health-400"
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DPDP Act 2023 Consent Checkbox */}
            <div className="p-3.5 rounded-2xl bg-health-50/60 border border-health-200 space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dpdpConsent}
                  onChange={e => setDpdpConsent(e.target.checked)}
                  className="rounded accent-health-600 mt-0.5 w-4 h-4"
                />
                <span className="text-[11px] text-health-950 font-medium leading-relaxed">
                  I consent to secure clinical data processing and storage under India’s{' '}
                  <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-xs shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-ink-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-health-600 hover:text-health-700">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
