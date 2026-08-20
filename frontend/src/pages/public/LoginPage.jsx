import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import { Activity, ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginPage = () => {
    const { login, isLoading, error } = useAuthStore();
    const { addToast } = useAppStore();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            const currentUser = useAuthStore.getState().user;
            addToast({
                type: 'success',
                title: 'Login Successful',
                message: `Welcome back, ${currentUser?.name}!`,
            });
            if (currentUser?.role === 'patient')
                navigate('/dashboard');
            else if (currentUser?.role === 'doctor')
                navigate('/doctor/dashboard');
            else if (currentUser?.role === 'admin')
                navigate('/admin/dashboard');
        }
    };

    return (<div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-health-500 text-white items-center justify-center shadow-soft mb-2">
            <Activity className="w-6 h-6"/>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-main">Welcome back to MediGuide</h2>
          <p className="text-xs sm:text-sm text-ink-muted">Access your personalized healthcare dashboard</p>
        </div>

        {/* Standard Login Form */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft-lg space-y-6">

          {error && (<div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>)}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="patient@mediguide.com" className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-xs shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4"/>
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-ink-muted">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-health-600 hover:text-health-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>);
};
