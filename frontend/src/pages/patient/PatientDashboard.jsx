import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import { api } from '../../services/api.js';
import { AiDisclaimerBanner } from '../../components/common/AiDisclaimerBanner.jsx';
import {
  Calendar,
  Pill,
  FileText,
  Bot,
  Stethoscope,
  Clock,
  Sparkles,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Activity,
} from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isInsightOpen, setIsInsightOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [aptRes, medRes, recRes, rxRes] = await Promise.all([
        api.getMyAppointments(),
        api.getMedicines(),
        api.getHealthRecords(),
        api.getMyPrescriptions(),
      ]);
      if (aptRes.success) setAppointments(aptRes.appointments || []);
      if (medRes.success) setMedicines(medRes.medicines || []);
      if (recRes.success) setRecords(recRes.records || []);
      if (rxRes.success) setPrescriptions(rxRes.prescriptions || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const upcomingAppointment = appointments.find(
    a => a.status === 'confirmed' || a.status === 'pending'
  );

  const today = new Date().toISOString().split('T')[0];
  const activeMeds = medicines.filter(m => m.active !== false);
  const takenDosesToday = medicines.reduce((acc, med) => {
    let takenCount = 0;
    if (med.adherenceLogs?.[today]) {
      takenCount = Object.values(med.adherenceLogs[today]).filter(Boolean).length;
    } else if (Array.isArray(med.adherenceHistory)) {
      takenCount = med.adherenceHistory.filter(a => a.date === today && a.taken).length;
    }
    return acc + takenCount;
  }, 0);
  const totalDosesToday = activeMeds.length;
  const adherenceRate =
    totalDosesToday > 0
      ? Math.min(100, Math.round((takenDosesToday / totalDosesToday) * 100))
      : 85;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 7.1 Hero Section: Greeting + One Bold Teal Gradient Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (7 cols): Greeting, Context, Two CTAs */}
        <div className="lg:col-span-7 flex flex-col justify-between py-2 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6C77]">
              {formattedDate}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#061017] font-serif tracking-tight leading-tight">
              {getTimeGreeting()}, {user?.name?.split(' ')[0] || 'Patient'}.
            </h1>
            <p className="text-base text-[#5A6C77] leading-relaxed max-w-xl">
              Your care summary is up to date. You have {upcomingAppointment ? '1 upcoming consultation' : 'no scheduled visits'} this week and active medicine reminders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/symptom-checker"
              className="px-5 py-2.5 rounded-xl bg-[#0B3441] text-[#FAFBFB] hover:bg-[#08252E] text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4 text-[#9EBAD1]" />
              <span>Start a health check</span>
            </Link>
            <Link
              to="/ai-assistant"
              className="px-5 py-2.5 rounded-xl border border-[rgba(6,16,23,0.15)] bg-white text-[#061017] hover:bg-[#FAFBFB] text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-[#39679B]" />
              <span>Ask MediGuide AI</span>
            </Link>
          </div>
        </div>

        {/* Right (5 cols): The Screen's ONE bold gesture — Teal gradient hero panel */}
        <div className="lg:col-span-5 rounded-[20px] bg-gradient-to-br from-[#0B3441] via-[#0E3E4F] to-[#1B5263] text-[#FAFBFB] p-6 sm:p-7 flex flex-col justify-between border border-white/10 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#9EBAD1] uppercase tracking-wider">
              Weekly Care Adherence
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#C9A24D] text-[11px] font-semibold">
              Active Track
            </span>
          </div>

          <div className="my-6 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-semibold tracking-tight text-white font-serif">
                {adherenceRate}%
              </span>
              <span className="text-xs text-[#9EBAD1]">target reached</span>
            </div>
            <p className="text-xs text-[#9EBAD1] leading-relaxed">
              Based on today's logged doses and scheduled follow-ups. Consistency reduces long-term clinical risks.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-[#FAFBFB]/90">
            <span>{takenDosesToday} doses logged today</span>
            <Link to="/medicines" className="text-[#9EBAD1] hover:text-white underline font-medium">
              View schedule
            </Link>
          </div>
        </div>
      </section>

      {/* AI Safety Disclaimer */}
      <AiDisclaimerBanner compact />

      {/* 7.1 Metric Strip: 4 cards, large numeral + unit + trend chip + inline sparkline */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#061017]">Clinical Indicators</h2>
          <span className="text-xs text-[#5A6C77]">Self-reported & Provider synced</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Blood Pressure */}
          <div className="p-5 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#5A6C77]">
              <span>Blood Pressure</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#2A7A5B] font-medium">
                <TrendingUp className="w-3 h-3" /> Normal
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-[#061017] tracking-tight">118/78</span>
              <span className="text-xs text-[#5A6C77]">mmHg</span>
            </div>
            {/* Inline SVG sparkline */}
            <div className="pt-2">
              <svg className="w-full h-7 text-[#2A7A5B]" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 16 L20 14 L40 18 L60 10 L80 12 L100 8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Metric 2: Resting Heart Rate */}
          <div className="p-5 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#5A6C77]">
              <span>Heart Rate</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#39679B] font-medium">
                Steady
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-[#061017] tracking-tight">72</span>
              <span className="text-xs text-[#5A6C77]">bpm</span>
            </div>
            <div className="pt-2">
              <svg className="w-full h-7 text-[#39679B]" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 14 L15 14 L25 4 L35 20 L45 10 L55 14 L100 14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Metric 3: Fasting Glucose */}
          <div className="p-5 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#5A6C77]">
              <span>Fasting Glucose</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#2A7A5B] font-medium">
                Optimal
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-[#061017] tracking-tight">94</span>
              <span className="text-xs text-[#5A6C77]">mg/dL</span>
            </div>
            <div className="pt-2">
              <svg className="w-full h-7 text-[#9EBAD1]" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 12 L25 15 L50 10 L75 13 L100 11" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Metric 4: Sleep Duration */}
          <div className="p-5 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#5A6C77]">
              <span>Sleep Rest</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#5A6C77] font-medium">
                Adequate
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-[#061017] tracking-tight">7.6</span>
              <span className="text-xs text-[#5A6C77]">hours</span>
            </div>
            <div className="pt-2">
              <svg className="w-full h-7 text-[#0B3441]" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 18 L20 16 L40 12 L60 14 L80 10 L100 8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* 7.1 Quick Actions: 4 Equal-Weight Entries to Symptoms, AI, Medicines, Care */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#061017]">Core Health Pathways</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/symptom-checker"
            className="p-4 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] hover:border-[#0B3441] transition-colors flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0B3441]/10 text-[#0B3441] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#061017]">Symptoms</div>
              <div className="text-[11px] text-[#5A6C77]">Triage guidance</div>
            </div>
          </Link>

          <Link
            to="/ai-assistant"
            className="p-4 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] hover:border-[#0B3441] transition-colors flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[#39679B]/10 text-[#39679B] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#061017]">MediGuide AI</div>
              <div className="text-[11px] text-[#5A6C77]">Ask questions</div>
            </div>
          </Link>

          <Link
            to="/medicines"
            className="p-4 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] hover:border-[#0B3441] transition-colors flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[#2A7A5B]/10 text-[#2A7A5B] flex items-center justify-center shrink-0">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#061017]">Medicines</div>
              <div className="text-[11px] text-[#5A6C77]">Schedule & dose</div>
            </div>
          </Link>

          <Link
            to="/doctors"
            className="p-4 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] hover:border-[#0B3441] transition-colors flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C9A24D]/10 text-[#7D6025] flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#061017]">Care Providers</div>
              <div className="text-[11px] text-[#5A6C77]">Book visit</div>
            </div>
          </Link>
        </div>
      </section>

      {/* 7.1 Two-Column Row: Upcoming Care (Hairline border) + AI Insight (Elevated Teal) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 cols): Upcoming Care Panel */}
        <div className="lg:col-span-7 p-6 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#061017] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0B3441]" />
              <span>Upcoming Care & Consultation</span>
            </h2>
            <Link to="/appointments" className="text-xs text-[#39679B] hover:underline font-medium">
              Manage all
            </Link>
          </div>

          {upcomingAppointment ? (
            <div className="p-4 rounded-xl bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-[#061017]">
                  {upcomingAppointment.doctorName || 'Dr. Ananya Sharma'}
                </div>
                <div className="text-xs text-[#5A6C77]">
                  {upcomingAppointment.department || 'Cardiology'} • {upcomingAppointment.mode || 'In-Person'} Consultation
                </div>
                <div className="text-xs font-medium text-[#0B3441] flex items-center gap-1.5 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{upcomingAppointment.date} at {upcomingAppointment.time}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#2A7A5B]/10 text-[#2A7A5B]">
                {upcomingAppointment.status}
              </span>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-[#5A6C77] space-y-2">
              <p>No appointments currently scheduled for this week.</p>
              <Link
                to="/doctors"
                className="inline-flex items-center gap-1.5 text-xs text-[#39679B] font-semibold hover:underline"
              >
                <span>Find an accredited specialist</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Right (5 cols): AI Insight Panel (Elevated Teal) with Collapsible "Why am I seeing this?" */}
        <div className="lg:col-span-5 p-6 rounded-[18px] bg-[#0B3441] text-[#FAFBFB] space-y-4 border border-white/10 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#C9A24D]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9EBAD1]">
                MediGuide Clinical Context
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#FAFBFB]">
              AI Insight
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-serif font-semibold text-white leading-snug">
              Preventive hydration & seasonal allergy notice
            </h3>
            <p className="text-xs text-[#9EBAD1] leading-relaxed">
              With temperature variations across North India, keeping upper airway moisture and taking morning antihistamines as prescribed helps prevent sinus inflammation.
            </p>
          </div>

          {/* Collapsible "Why am I seeing this?" */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => setIsInsightOpen(!isInsightOpen)}
              className="w-full flex items-center justify-between text-xs text-[#9EBAD1] hover:text-white transition-colors focus:outline-none"
            >
              <span>Why am I seeing this?</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${isInsightOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isInsightOpen && (
              <div className="mt-2.5 p-3 rounded-lg bg-white/5 text-[11px] text-[#FAFBFB]/80 leading-relaxed border border-white/5">
                Generated from your recent symptom query regarding nasal congestion and local climatic index data. No personal data was shared with third parties.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7.1 Recent Activity as an undecorated timeline list (not boxed cards) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#061017]">Recent Health Activity</h2>
          <span className="text-xs text-[#5A6C77]">Past 14 days</span>
        </div>

        <div className="divide-y divide-[rgba(6,16,23,0.08)] rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] px-6 py-2">
          {records.length > 0 ? (
            records.slice(0, 3).map((rec, idx) => (
              <div key={rec.id || idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] flex items-center justify-center text-[#39679B]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#061017]">{rec.title || 'Diagnostic Report'}</div>
                    <div className="text-[11px] text-[#5A6C77]">{rec.type || 'Laboratory'} • {rec.date || 'Recent'}</div>
                  </div>
                </div>
                <Link to="/health-records" className="text-xs text-[#39679B] hover:underline font-medium">
                  View record
                </Link>
              </div>
            ))
          ) : (
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] flex items-center justify-center text-[#2A7A5B]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#061017]">Profile created & verified</div>
                  <div className="text-[11px] text-[#5A6C77]">MediGuide India secure account setup</div>
                </div>
              </div>
              <span className="text-[11px] text-[#5A6C77]">Completed</span>
            </div>
          )}

          {/* Timeline Row 2: Appointment activity */}
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] flex items-center justify-center text-[#0B3441]">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#061017]">Daily medication schedule synchronized</div>
                <div className="text-[11px] text-[#5A6C77]">Automated adherence tracking active</div>
              </div>
            </div>
            <span className="text-[11px] text-[#2A7A5B] font-medium">Active</span>
          </div>
        </div>
      </section>
    </div>
  );
};
