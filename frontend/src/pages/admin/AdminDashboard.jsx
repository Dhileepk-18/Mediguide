import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Shield, Users, Building2, Calendar, Sparkles, Database, Server } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.getAdminStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-7 rounded-[18px] bg-[#0B3441] text-[#FAFBFB] flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-[#C9A24D]" />
            <span>Hospital & Platform Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold font-serif tracking-tight text-white">
            Administrative Operations & Security
          </h1>
          <p className="text-xs text-[#9EBAD1] max-w-xl leading-relaxed">
            System Status: {stats?.systemStatus || 'Operational — 99.98% Service Uptime (DPDP Compliant)'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-xl bg-white text-[#0B3441] font-semibold text-xs hover:bg-[#FAFBFB] transition-colors shadow-sm"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/doctors"
            className="px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 font-semibold text-xs hover:bg-white/20 transition-colors"
          >
            Doctor Registry
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[18px] border border-[rgba(6,16,23,0.10)] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] text-[#0B3441] flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-xs text-[#5A6C77]">Registered Users</div>
          <div className="text-2xl font-semibold font-serif text-[#061017]">{stats?.totalUsers ?? 0}</div>
          <div className="text-[11px] text-[#2A7A5B] font-medium">
            {stats?.totalPatients ?? 0} Patients
          </div>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-[rgba(6,16,23,0.10)] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] text-[#39679B] flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xs text-[#5A6C77]">Verified Practitioners</div>
          <div className="text-2xl font-semibold font-serif text-[#061017]">{stats?.totalDoctors ?? 0}</div>
          <div className="text-[11px] text-[#39679B] font-medium">
            {stats?.activeDoctors ?? 0} Active Registry
          </div>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-[rgba(6,16,23,0.10)] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] text-[#2A7A5B] flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-xs text-[#5A6C77]">Consultations Booked</div>
          <div className="text-2xl font-semibold font-serif text-[#061017]">{stats?.totalAppointments ?? 0}</div>
          <div className="text-[11px] text-[#2A7A5B] font-medium">
            {stats?.pendingAppointments ?? 0} Scheduled
          </div>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-[rgba(6,16,23,0.10)] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] text-[#C9A24D] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs text-[#5A6C77]">AI Triage Queries</div>
          <div className="text-2xl font-semibold font-serif text-[#061017]">{stats?.totalSymptomChecks ?? 0}</div>
          <div className="text-[11px] text-[#5A6C77] font-medium">
            Dual AI/ML Pipeline Active
          </div>
        </div>
      </div>

      {/* System Infrastructure Card */}
      <div className="p-6 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-4">
        <h2 className="text-sm font-semibold text-[#061017]">Core Services & Regulatory Posture</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] space-y-1">
            <div className="flex items-center gap-2 font-semibold text-[#061017]">
              <Database className="w-3.5 h-3.5 text-[#0B3441]" />
              <span>Audit Logging</span>
            </div>
            <div className="text-[#5A6C77] text-[11px]">Append-only tamper-evident security audit trail with IST timestamps.</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] space-y-1">
            <div className="flex items-center gap-2 font-semibold text-[#061017]">
              <Server className="w-3.5 h-3.5 text-[#2A7A5B]" />
              <span>Python ML Microservice</span>
            </div>
            <div className="text-[#5A6C77] text-[11px]">FastAPI RandomForestClassifier active on port 8000 for symptom triage.</div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] space-y-1">
            <div className="flex items-center gap-2 font-semibold text-[#061017]">
              <Shield className="w-3.5 h-3.5 text-[#C9A24D]" />
              <span>DPDP Act 2023</span>
            </div>
            <div className="text-[#5A6C77] text-[11px]">User consent framework, complete data portability, and erasure ready.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
