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
    FileCheck2,
    Bot,
    Stethoscope,
    ArrowRight,
    Clock,
    CheckCircle2,
    Sparkles,
    Activity,
    Plus,
    HeartPulse,
    Moon,
    Flame,
    Send,
    ShieldCheck,
    ChevronRight,
    Check,
} from 'lucide-react';

export const PatientDashboard = () => {
    const { user } = useAuthStore();
    const { addToast } = useAppStore();
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [records, setRecords] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [aiInput, setAiInput] = useState('');

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

    const handleToggleAdherence = async (medId, timeSlot, currentStatus) => {
        const today = new Date().toISOString().split('T')[0];
        const newStatus = !currentStatus;
        try {
            const res = await api.logMedicineAdherence(medId, today, timeSlot, newStatus);
            if (res.success) {
                setMedicines(prev => prev.map(m => (m.id === medId ? res.medicine : m)));
                addToast({
                    type: newStatus ? 'success' : 'info',
                    title: newStatus ? 'Dose Logged as Taken' : 'Dose Marked as Pending',
                    message: `${res.medicine.name} (${timeSlot}) updated.`,
                });
            }
        } catch {
            addToast({
                type: 'error',
                title: 'Update failed',
                message: 'Could not log medication adherence.',
            });
        }
    };

    const handleAiSubmit = (e) => {
        e.preventDefault();
        if (!aiInput.trim()) return;
        navigate(`/ai-assistant?query=${encodeURIComponent(aiInput.trim())}`);
    };

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const upcomingAppointment = appointments.find(a => a.status === 'confirmed' || a.status === 'pending');
    const today = new Date().toISOString().split('T')[0];
    const takenDosesCount = medicines.reduce((acc, med) => {
        const logs = med.adherenceLogs?.[today] || {};
        return acc + Object.values(logs).filter(Boolean).length;
    }, 0);

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* 01 & 02: Editorial Hero Header */}
            <div className="relative rounded-3xl bg-health-700 text-white p-7 sm:p-10 shadow-luxury overflow-hidden border border-health-600/60">
                {/* Subtle luxury background elements */}
                <div className="absolute right-0 top-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-skydata/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-health-100 text-xs font-semibold backdrop-blur-md border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            <span>{getTimeGreeting()}, {user?.name || 'Rahul'}</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display leading-tight">
                            Your health, clearly guided.
                        </h1>
                        <p className="text-xs sm:text-sm text-health-100/90 leading-relaxed font-normal">
                            Understand what you are experiencing, keep your care organized, and know what to do next with AI-assisted clinical clarity.
                        </p>
                    </div>

                    {/* Primary & AI CTAs */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <Link
                            to="/symptom-checker"
                            className="px-5 py-3 rounded-2xl bg-white text-health-800 hover:bg-health-50 text-xs font-extrabold shadow-soft transition-all flex items-center gap-2"
                        >
                            <Stethoscope className="w-4 h-4 text-health-700" />
                            <span>Start a health check</span>
                        </Link>
                        <Link
                            to="/ai-assistant"
                            className="px-5 py-3 rounded-2xl bg-health-600/80 hover:bg-health-600 text-white border border-white/15 text-xs font-bold transition-all flex items-center gap-2"
                        >
                            <Bot className="w-4 h-4 text-accent" />
                            <span>Ask MediGuide AI</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* AI Safety Disclaimer */}
            <AiDisclaimerBanner compact />

            {/* 03: Health Snapshot (4 Metric Cards with Numerals & Trends) */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Health Snapshot & Vitals</h2>
                    <span className="text-[11px] font-semibold text-health-700">Live Clinical Vitals</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {/* Metric 1: Blood Pressure */}
                    <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-soft space-y-2 hover:shadow-soft-lg transition-all">
                        <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
                            <span>Blood Pressure</span>
                            <HeartPulse className="w-4 h-4 text-status-success" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-extrabold text-ink-main">118/78</span>
                            <span className="text-[10px] font-medium text-ink-muted">mmHg</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-surface-border/60">
                            <span className="px-2 py-0.5 rounded-full bg-health-50 text-status-success font-bold text-[10px]">
                                Optimal
                            </span>
                            <span className="text-ink-muted text-[10px]">Normal target</span>
                        </div>
                    </div>

                    {/* Metric 2: Resting Heart Rate */}
                    <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-soft space-y-2 hover:shadow-soft-lg transition-all">
                        <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
                            <span>Resting Heart Rate</span>
                            <Activity className="w-4 h-4 text-health-600" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-extrabold text-ink-main">72</span>
                            <span className="text-[10px] font-medium text-ink-muted">bpm</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-surface-border/60">
                            <span className="px-2 py-0.5 rounded-full bg-health-50 text-health-700 font-bold text-[10px]">
                                Steady
                            </span>
                            <span className="text-ink-muted text-[10px]">Resting zone</span>
                        </div>
                    </div>

                    {/* Metric 3: Sleep Architecture */}
                    <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-soft space-y-2 hover:shadow-soft-lg transition-all">
                        <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
                            <span>Sleep Duration</span>
                            <Moon className="w-4 h-4 text-skydata-dark" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-extrabold text-ink-main">7h 45m</span>
                            <span className="text-[10px] font-medium text-ink-muted">rest</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-surface-border/60">
                            <span className="px-2 py-0.5 rounded-full bg-skydata-50 text-skydata-dark font-bold text-[10px]">
                                Restorative
                            </span>
                            <span className="text-ink-muted text-[10px]">Deep & REM</span>
                        </div>
                    </div>

                    {/* Metric 4: Blood Glucose */}
                    <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-soft space-y-2 hover:shadow-soft-lg transition-all">
                        <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
                            <span>Blood Glucose</span>
                            <Flame className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-extrabold text-ink-main">94</span>
                            <span className="text-[10px] font-medium text-ink-muted">mg/dL</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-surface-border/60">
                            <span className="px-2 py-0.5 rounded-full bg-accent-light text-accent-dark font-bold text-[10px]">
                                Fasting Normal
                            </span>
                            <span className="text-ink-muted text-[10px]">Controlled</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 04 & 05: Care Spotlight & Conversational AI Feature Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left (7 cols): Care Spotlight (Next Appointment + Today's Medicines) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Next Appointment Card */}
                    <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-health-100 text-health-700 flex items-center justify-center">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-sm text-ink-main">Upcoming Care Consultation</h3>
                            </div>
                            <Link to="/appointments" className="text-xs font-bold text-health-700 hover:underline flex items-center gap-1">
                                <span>All ({appointments.length})</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {upcomingAppointment ? (
                            <div className="p-4 rounded-2xl bg-surface-muted border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-health-100 text-health-800 uppercase tracking-wider">
                                        {upcomingAppointment.type || 'In-Person Consultation'}
                                    </span>
                                    <h4 className="text-sm font-bold text-ink-main">{upcomingAppointment.doctorName}</h4>
                                    <p className="text-xs text-ink-muted">{upcomingAppointment.department} &bull; {upcomingAppointment.hospital || 'Apollo Clinic'}</p>
                                    <div className="flex items-center gap-2 text-xs font-semibold text-health-700 pt-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{upcomingAppointment.date} at {upcomingAppointment.time}</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/appointments`}
                                    className="px-4 py-2.5 rounded-xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft transition-all text-center shrink-0"
                                >
                                    Prepare Visit
                                </Link>
                            </div>
                        ) : (
                            <div className="p-6 rounded-2xl bg-surface-muted/60 text-center space-y-2">
                                <p className="text-xs text-ink-muted">No consultations scheduled for today.</p>
                                <Link to="/doctors" className="inline-block px-4 py-2 bg-health-700 text-white text-xs font-bold rounded-xl shadow-soft">
                                    Find a Doctor
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Today's Medicines Timeline Preview */}
                    <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-accent-light text-accent-dark flex items-center justify-center">
                                    <Pill className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-ink-main">Today's Medication Schedule</h3>
                                    <p className="text-[11px] text-ink-muted">{takenDosesCount} of {medicines.length} doses logged today</p>
                                </div>
                            </div>
                            <Link to="/medicines" className="text-xs font-bold text-health-700 hover:underline flex items-center gap-1">
                                <span>Tracker</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {medicines.length > 0 ? (
                            <div className="space-y-2.5">
                                {medicines.slice(0, 3).map((med) => {
                                    const isTaken = Boolean(med.adherenceLogs?.[today]?.Morning || med.adherenceLogs?.[today]?.Evening);
                                    return (
                                        <div
                                            key={med.id}
                                            className="p-3.5 rounded-2xl bg-surface-muted border border-surface-border flex items-center justify-between gap-3"
                                        >
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-xs font-bold text-ink-main">{med.name}</h4>
                                                    <span className="text-[10px] text-ink-muted">{med.dosage}</span>
                                                </div>
                                                <p className="text-[10px] text-ink-muted">{med.instructions || 'Take after breakfast with water'}</p>
                                            </div>

                                            <button
                                                onClick={() => handleToggleAdherence(med.id, 'Morning', isTaken)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                    isTaken
                                                        ? 'bg-status-success text-white shadow-soft'
                                                        : 'bg-surface border border-surface-border text-ink-muted hover:bg-health-50 hover:text-health-700'
                                                }`}
                                            >
                                                {isTaken ? <Check className="w-3.5 h-3.5" /> : null}
                                                <span>{isTaken ? 'Taken' : 'Mark Taken'}</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-ink-muted text-center py-4">No active medications logged.</p>
                        )}
                    </div>
                </div>

                {/* Right (5 cols): MediGuide AI Large Conversational Feature Panel */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="p-6 rounded-3xl bg-gradient-to-b from-health-800 to-health-900 text-white shadow-luxury space-y-5 relative overflow-hidden border border-health-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-accent text-health-900 flex items-center justify-center font-bold">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm text-white font-display">Ask MediGuide AI</h3>
                                    <span className="text-[10px] text-health-200">Connected to your health profile</span>
                                </div>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-accent border border-accent/20">
                                Live AI
                            </span>
                        </div>

                        <p className="text-xs text-health-100/85 leading-relaxed">
                            Need clarity on a symptom, lab test metric, or drug interaction? Type below for instant, structured medical guidance.
                        </p>

                        {/* Interactive Query Input */}
                        <form onSubmit={handleAiSubmit} className="relative">
                            <input
                                type="text"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                placeholder="e.g., 'How to relieve morning stiffness?'"
                                className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-health-200/60 focus:outline-none focus:border-accent transition-all backdrop-blur-md"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 p-2 rounded-xl bg-accent hover:bg-accent-hover text-health-950 transition-all font-bold"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </form>

                        {/* Quick Prompt Chips */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-health-300">Suggested Questions</span>
                            <div className="flex flex-col gap-1.5">
                                {[
                                    'How to manage sinus headache at home?',
                                    'Explain high blood pressure benchmarks',
                                    'What foods help lower cholesterol naturally?',
                                ].map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(`/ai-assistant?query=${encodeURIComponent(prompt)}`)}
                                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-left text-xs font-medium text-health-100 transition-all flex items-center justify-between group"
                                    >
                                        <span className="truncate">{prompt}</span>
                                        <ArrowRight className="w-3.5 h-3.5 text-accent opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Vault Summary */}
                    <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-soft flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-skydata-50 text-skydata-dark flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-ink-main">Digital Health Records</h4>
                                <p className="text-[10px] text-ink-muted">{records.length} documents &bull; {prescriptions.length} e-prescriptions</p>
                            </div>
                        </div>
                        <Link to="/health-records" className="px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-health-50 text-xs font-bold text-health-700 transition-colors">
                            Open Vault
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
