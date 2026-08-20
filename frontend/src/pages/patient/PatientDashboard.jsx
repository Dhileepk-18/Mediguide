import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import { api } from '../../services/api.js';
import { AiDisclaimerBanner } from '../../components/common/AiDisclaimerBanner.jsx';
import { Calendar, Pill, FileText, FileCheck2, Bot, Stethoscope, ArrowRight, Clock, CheckCircle2, Sparkles, Activity, Plus, } from 'lucide-react';
export const PatientDashboard = () => {
    const { user } = useAuthStore();
    const { addToast } = useAppStore();
    const [appointments, setAppointments] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [records, setRecords] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
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
            if (aptRes.success)
                setAppointments(aptRes.appointments);
            if (medRes.success)
                setMedicines(medRes.medicines);
            if (recRes.success)
                setRecords(recRes.records);
            if (rxRes.success)
                setPrescriptions(rxRes.prescriptions);
        }
        catch (err) {
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
        }
        catch {
            addToast({
                type: 'error',
                title: 'Update failed',
                message: 'Could not log medication adherence.',
            });
        }
    };
    const upcomingAppointment = appointments.find(a => a.status === 'confirmed' || a.status === 'pending');
    const today = new Date().toISOString().split('T')[0];
    return (<div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Welcome Greeting Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-health-600 via-health-500 to-health-700 text-white shadow-soft-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"/>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-health-100 text-xs font-semibold backdrop-blur-sm">
              <Activity className="w-3.5 h-3.5 text-health-200"/>
              <span>Personal Health Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {user?.name || 'Sarah'}!
            </h1>
            <p className="text-xs sm:text-sm text-health-100 max-w-xl leading-relaxed">
              Your vitals are stable. You have {medicines.length} active medications and{' '}
              {upcomingAppointment ? '1 upcoming consultation' : 'no immediate appointments scheduled'}.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap gap-2.5">
            <Link to="/ai-assistant" className="px-4 py-2.5 rounded-2xl bg-white text-health-900 hover:bg-health-50 text-xs font-bold shadow-sm transition-all flex items-center gap-2">
              <Bot className="w-4 h-4 text-health-600"/>
              <span>Ask AI Assistant</span>
            </Link>
            <Link to="/symptom-checker" className="px-4 py-2.5 rounded-2xl bg-health-700/80 hover:bg-health-700 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-health-200"/>
              <span>Check Symptoms</span>
            </Link>
          </div>
        </div>
      </div>

      {/* AI Safety Banner */}
      <AiDisclaimerBanner compact/>

      {/* 2. Top Metric Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6"/>
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted">Appointments</div>
            <div className="text-xl font-extrabold text-ink-main">{appointments.length}</div>
            <div className="text-[10px] text-health-600 font-semibold">
              {appointments.filter(a => a.status === 'confirmed').length} Confirmed
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-mint-light text-health-800 flex items-center justify-center shrink-0">
            <Pill className="w-6 h-6 text-health-600"/>
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted">Active Medicines</div>
            <div className="text-xl font-extrabold text-ink-main">{medicines.length}</div>
            <div className="text-[10px] text-status-success font-semibold">Daily Reminders On</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6"/>
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted">Health Records</div>
            <div className="text-xl font-extrabold text-ink-main">{records.length}</div>
            <div className="text-[10px] text-blue-600 font-semibold">Reports & Scans</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6"/>
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted">Prescriptions</div>
            <div className="text-xl font-extrabold text-ink-main">{prescriptions.length}</div>
            <div className="text-[10px] text-purple-600 font-semibold">Digitally Signed</div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid (Upcoming Appointment & Today's Medicines) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Upcoming Appointment & Health Summary */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upcoming Appointment Card */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-health-600"/>
                <h3 className="font-bold text-sm text-ink-main">Next Doctor Appointment</h3>
              </div>
              <Link to="/appointments" className="text-xs font-bold text-health-600 hover:text-health-700 flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5"/>
              </Link>
            </div>

            {upcomingAppointment ? (<div className="p-4 rounded-2xl bg-health-50/70 border border-health-200/80 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={upcomingAppointment.doctorAvatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80'} alt={upcomingAppointment.doctorName} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-health-200"/>
                    <div>
                      <h4 className="font-bold text-sm text-ink-main">{upcomingAppointment.doctorName}</h4>
                      <p className="text-xs text-ink-muted">{upcomingAppointment.doctorSpecialization}</p>
                      <span className="text-[10px] font-bold text-health-800 bg-health-200/70 px-2 py-0.5 rounded-md">
                        {upcomingAppointment.department}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${upcomingAppointment.status === 'confirmed'
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800'}`}>
                    {upcomingAppointment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-health-200/60 text-xs text-ink-muted">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-health-600"/>
                    <span>{upcomingAppointment.date} at {upcomingAppointment.timeSlot}</span>
                  </div>
                  <div className="truncate">
                    <strong>Reason:</strong> {upcomingAppointment.reason}
                  </div>
                </div>
              </div>) : (<div className="p-8 text-center bg-surface-muted rounded-2xl border border-dashed border-surface-border space-y-2">
                <p className="text-xs text-ink-muted">No upcoming appointments scheduled.</p>
                <Link to="/appointments" className="inline-flex items-center gap-1.5 text-xs font-bold text-health-600 hover:text-health-700">
                  <Plus className="w-3.5 h-3.5"/> Book a Consultation
                </Link>
              </div>)}
          </div>

          {/* Quick AI Assistant Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-surface to-health-50 border border-health-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-health-600"/>
                <h3 className="font-bold text-sm text-ink-main">Instant AI Health Assistant</h3>
              </div>
              <span className="text-[10px] font-bold bg-health-100 text-health-800 px-2 py-0.5 rounded-full">
                Gemini 1.5
              </span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Have questions about your medication, symptoms, diet, or lab results? Start a real-time conversational chat with MediGuide AI.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
            'Explain high blood pressure',
            'Cold vs Seasonal Allergy',
            'Tips for restful sleep',
        ].map((prompt, i) => (<Link key={i} to={`/ai-assistant?query=${encodeURIComponent(prompt)}`} className="px-3 py-1.5 rounded-xl bg-surface hover:bg-health-100 border border-surface-border text-[11px] font-semibold text-ink-main transition-colors">
                  "{prompt}" →
                </Link>))}
            </div>
            <Link to="/ai-assistant" className="inline-flex items-center gap-2 text-xs font-bold text-health-700 hover:text-health-800 pt-1">
              <span>Open AI Conversation Console</span>
              <ArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </div>
        </div>

        {/* Right Col: Today's Medicine Reminders & Recent Records */}
        <div className="lg:col-span-5 space-y-6">
          {/* Today's Medicines Timeline */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-health-600"/>
                <h3 className="font-bold text-sm text-ink-main">Today's Medication Tracker</h3>
              </div>
              <Link to="/medicines" className="text-xs font-bold text-health-600 hover:text-health-700 flex items-center gap-1">
                Manage <ArrowRight className="w-3.5 h-3.5"/>
              </Link>
            </div>

            {medicines.length > 0 ? (<div className="space-y-3">
                {medicines.map((med) => {
                const timeSlot = med.timings[0] || '08:00 AM';
                const adherenceEntry = med.adherenceHistory.find(a => a.date === today && a.timeSlot === timeSlot);
                const isTaken = adherenceEntry ? adherenceEntry.taken : false;
                return (<div key={med.id} className="p-3.5 rounded-2xl bg-surface-muted/60 border border-surface-border flex items-center justify-between hover:bg-surface-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleToggleAdherence(med.id, timeSlot, isTaken)} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isTaken
                        ? 'bg-status-success text-white shadow-sm'
                        : 'border-2 border-surface-border hover:border-health-400 bg-surface'}`} title={isTaken ? 'Mark as Not Taken' : 'Mark as Taken'}>
                          {isTaken && <CheckCircle2 className="w-4 h-4"/>}
                        </button>
                        <div>
                          <h4 className="text-xs font-bold text-ink-main">{med.name}</h4>
                          <p className="text-[11px] text-ink-muted">{med.dosage} • {timeSlot}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isTaken ? 'bg-green-100 text-green-800' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                        {isTaken ? 'Taken ✓' : 'Due'}
                      </span>
                    </div>);
            })}
              </div>) : (<p className="text-xs text-ink-muted text-center py-4">No active medicines logged.</p>)}
          </div>

          {/* Recent Records Snippet */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-health-600"/>
                <h3 className="font-bold text-sm text-ink-main">Recent Health Records</h3>
              </div>
              <Link to="/health-records" className="text-xs font-bold text-health-600 hover:text-health-700 flex items-center gap-1">
                Vault <ArrowRight className="w-3.5 h-3.5"/>
              </Link>
            </div>

            <div className="space-y-2.5">
              {records.slice(0, 2).map((rec) => (<div key={rec.id} className="p-3 rounded-2xl bg-surface-muted/60 border border-surface-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-health-100 text-health-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4"/>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ink-main truncate max-w-[170px]">{rec.title}</div>
                      <div className="text-[10px] text-ink-muted">{rec.category} • {rec.recordDate}</div>
                    </div>
                  </div>
                  <a href={rec.fileUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-health-600 hover:text-health-700 px-2 py-1 bg-surface rounded-lg border border-surface-border">
                    View
                  </a>
                </div>))}
            </div>
          </div>
        </div>
      </div>
    </div>);
};
