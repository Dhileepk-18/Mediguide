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
  HeartPulse,
  ArrowRight,
  PhoneCall,
  Check,
  ShieldCheck,
  User,
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
      : 88;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Clinic Greeting & Hero Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Personalized Greeting & Quick Actions (7 cols) */}
        <div className="lg:col-span-7 clinic-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {formattedDate} • IST
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {getTimeGreeting()}, {user?.name?.split(' ')[0] || 'Patient'}.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
              Your clinical dashboard is synced. You have{' '}
              <strong className="text-slate-800">
                {upcomingAppointment ? '1 upcoming consultation' : 'no pending visits'}
              </strong>{' '}
              this week and {activeMeds.length} active medicine schedules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/symptom-checker"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs group"
            >
              <Sparkles className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
              <span>Start Symptom Triage</span>
            </Link>
            <Link
              to="/ai-assistant"
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/40 text-slate-800 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-blue-600" />
              <span>Chat with AI Assistant</span>
            </Link>
          </div>
        </div>

        {/* Right: Adherence Radial / Progress Hero (5 cols) */}
        <div className="lg:col-span-5 clinic-card p-6 sm:p-7 bg-gradient-to-br from-blue-900 to-indigo-950 text-white flex flex-col justify-between shadow-md relative overflow-hidden border-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Daily Care Adherence
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-800/80 text-blue-200 border border-blue-700/60 text-[10px] font-bold">
              Active Track
            </span>
          </div>

          <div className="my-5 flex items-center gap-6">
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-blue-950"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-400"
                  strokeDasharray={`${adherenceRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xl font-extrabold text-white">
                {adherenceRate}%
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Target Reached</h3>
              <p className="text-xs text-blue-200/80 leading-relaxed">
                Consistency with prescribed dosages and clinical checkups significantly improves outcomes.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-blue-800/60 text-xs text-blue-200">
            <span>{takenDosesToday} of {totalDosesToday || 1} doses logged</span>
            <Link to="/medicines" className="text-white hover:text-blue-200 font-semibold underline">
              View medicines
            </Link>
          </div>
        </div>
      </section>

      {/* Safety Notice Banner */}
      <AiDisclaimerBanner compact />

      {/* Clinical Indicator Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Clinical Vitals & Indicators</h2>
          <span className="text-xs text-slate-400">Self-monitored & Provider verified</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* BP */}
          <div className="clinic-card p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Blood Pressure</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                <TrendingUp className="w-3 h-3" /> Normal
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">118/78</span>
              <span className="text-xs text-slate-400 font-medium">mmHg</span>
            </div>
            <div className="pt-1">
              <svg className="w-full h-6 text-emerald-500" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 16 L20 14 L40 18 L60 10 L80 12 L100 8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Resting Heart Rate */}
          <div className="clinic-card p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Heart Rate</span>
              <span className="text-[11px] text-blue-600 font-bold">Steady</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">72</span>
              <span className="text-xs text-slate-400 font-medium">bpm</span>
            </div>
            <div className="pt-1">
              <svg className="w-full h-6 text-blue-500" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 14 L15 14 L25 4 L35 20 L45 10 L55 14 L100 14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Fasting Glucose */}
          <div className="clinic-card p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Fasting Glucose</span>
              <span className="text-[11px] text-emerald-600 font-bold">Optimal</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">94</span>
              <span className="text-xs text-slate-400 font-medium">mg/dL</span>
            </div>
            <div className="pt-1">
              <svg className="w-full h-6 text-emerald-500" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 12 L25 15 L50 10 L75 13 L100 11" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Sleep */}
          <div className="clinic-card p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Rest & Sleep</span>
              <span className="text-[11px] text-slate-600 font-bold">7.6 hrs</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Adequate</span>
            </div>
            <div className="pt-1">
              <svg className="w-full h-6 text-indigo-500" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 18 L20 16 L40 12 L60 14 L80 10 L100 8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Core Health Pathways */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Primary Care Pathways</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <Link
            to="/symptom-checker"
            className="clinic-card clinic-card-hover p-4 flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Symptom Triage
              </div>
              <div className="text-[11px] text-slate-400">ML guidance</div>
            </div>
          </Link>

          <Link
            to="/ai-assistant"
            className="clinic-card clinic-card-hover p-4 flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                AI Assistant
              </div>
              <div className="text-[11px] text-slate-400">Clinical chat</div>
            </div>
          </Link>

          <Link
            to="/medicines"
            className="clinic-card clinic-card-hover p-4 flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Medicines
              </div>
              <div className="text-[11px] text-slate-400">Dose schedule</div>
            </div>
          </Link>

          <Link
            to="/doctors"
            className="clinic-card clinic-card-hover p-4 flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Doctor Discovery
              </div>
              <div className="text-[11px] text-slate-400">Book in IST</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Two-Column Row: Upcoming Care & Clinical Insight */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Upcoming Care */}
        <div className="lg:col-span-7 clinic-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Upcoming Consultations</span>
            </h2>
            <Link to="/appointments" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
              Manage all
            </Link>
          </div>

          {upcomingAppointment ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {upcomingAppointment.doctorName || 'Dr. Ananya Sharma'}
                </h3>
                <p className="text-xs text-slate-500">
                  {upcomingAppointment.department || 'Cardiology'} • {upcomingAppointment.mode || 'In-Person'} Consultation
                </p>
                <div className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{upcomingAppointment.date} at {upcomingAppointment.time}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {upcomingAppointment.status}
              </span>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <p>No consultations scheduled for this week.</p>
              <Link
                to="/doctors"
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
              >
                <span>Find an accredited specialist</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Right: AI Clinical Insight Card */}
        <div className="lg:col-span-5 clinic-card p-6 space-y-3 bg-gradient-to-br from-slate-50 to-blue-50/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Clinical Context
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              AI Insight
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900">
            Preventive hydration & seasonal allergy advisory
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            With seasonal climatic variations, maintaining upper airway hydration and adhering to morning antihistamine doses prevents sinus irritation.
          </p>

          <div className="pt-2 border-t border-slate-200/60">
            <button
              onClick={() => setIsInsightOpen(!isInsightOpen)}
              className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              <span>Why am I seeing this?</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${isInsightOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isInsightOpen && (
              <div className="mt-2.5 p-3 rounded-xl bg-white text-[11px] text-slate-600 leading-relaxed border border-slate-200 shadow-2xs">
                Derived from your logged profile factors, regional weather patterns, and recent symptom searches. Your data is isolated per DPDP standards.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Health Activity */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Recent Health Activity</h2>
          <span className="text-xs text-slate-400">Past 14 days</span>
        </div>

        <div className="divide-y divide-slate-100 clinic-card px-6 py-1">
          {records.length > 0 ? (
            records.slice(0, 3).map((rec, idx) => (
              <div key={rec.id || idx} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{rec.title || 'Diagnostic Report'}</h3>
                    <p className="text-[11px] text-slate-400">{rec.type || 'Laboratory'} • {rec.date || 'Recent'}</p>
                  </div>
                </div>
                <Link to="/health-records" className="text-xs text-blue-600 font-semibold hover:underline">
                  View record
                </Link>
              </div>
            ))
          ) : (
            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Profile Verified & Active</h3>
                  <p className="text-[11px] text-slate-400">MediGuide India secure account setup</p>
                </div>
              </div>
              <span className="text-[11px] text-emerald-600 font-bold">Active</span>
            </div>
          )}

          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Daily Medicine Schedule Active</h3>
                <p className="text-[11px] text-slate-400">Automated adherence reminders synced</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Tracking</span>
          </div>
        </div>
      </section>
    </div>
  );
};
