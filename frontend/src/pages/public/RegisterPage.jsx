import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import { Activity, User, Stethoscope, Shield, ArrowRight, Lock, Mail, Phone, } from 'lucide-react';
export const RegisterPage = () => {
    const { register, isLoading, error } = useAuthStore();
    const { addToast } = useAppStore();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState(25);
    const [gender, setGender] = useState('Female');
    const [bloodGroup, setBloodGroup] = useState('O+');
    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register({
            name,
            email,
            password,
            phone,
            age: Number(age),
            gender,
            bloodGroup,
        });
        if (success) {
            addToast({
                type: 'success',
                title: 'Account Created 🎉',
                message: 'Welcome to MediGuide!',
            });
            navigate('/dashboard');
        }
    };
    return (<div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-health-500 text-white items-center justify-center shadow-soft mb-2">
            <Activity className="w-6 h-6"/>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-main">Create Your Patient Account</h2>
          <p className="text-xs sm:text-sm text-ink-muted">Join the intelligent AI-powered digital healthcare network</p>
        </div>

        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft-lg space-y-6">
          {error && (<div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>)}

          <div className="p-3 rounded-2xl bg-health-50 border border-health-200 flex items-center justify-between text-xs text-health-800">
            <span className="font-semibold flex items-center gap-1.5">
              <User className="w-4 h-4 text-health-600"/>
              Patient Registration
            </span>
            <span className="text-[11px] text-ink-muted">
              (Doctors are credentialed by Admin)
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Johnson" className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-main mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah@example.com" className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-main mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 234-5678" className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
              </div>
            </div>

            {role === 'patient' && (<div className="p-3.5 rounded-2xl bg-surface-muted border border-surface-border grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink-main mb-1">Age</label>
                  <input type="number" value={age || ''} onChange={(e) => setAge(Number(e.target.value))} className="w-full px-2.5 py-1.5 text-xs bg-surface rounded-lg border border-surface-border"/>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-main mb-1">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-2.5 py-1.5 text-xs bg-surface rounded-lg border border-surface-border">
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-main mb-1">Blood Group</label>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full px-2.5 py-1.5 text-xs bg-surface rounded-lg border border-surface-border">
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
              </div>)}

            <button type="submit" disabled={isLoading} className="w-full py-3 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-xs shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <span>{isLoading ? 'Creating Account...' : 'Register Account'}</span>
              <ArrowRight className="w-4 h-4"/>
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
    </div>);
};
