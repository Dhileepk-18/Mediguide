import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import { Plus, ArrowRight, Stethoscope, } from 'lucide-react';
export const DoctorDashboard = () => {
    const { user } = useAuthStore();
    const { addToast } = useAppStore();
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    useEffect(() => {
        loadDoctorData();
    }, []);
    const loadDoctorData = async () => {
        try {
            const [aptRes, rxRes] = await Promise.all([
                api.getMyAppointments(),
                api.getMyPrescriptions(),
            ]);
            if (aptRes.success)
                setAppointments(aptRes.appointments);
            if (rxRes.success)
                setPrescriptions(rxRes.prescriptions);
        }
        catch (err) {
            console.error('Failed to load doctor dashboard:', err);
        }
    };
    const handleUpdateStatus = async (id, status) => {
        try {
            const res = await api.updateAppointmentStatus(id, status);
            if (res.success) {
                addToast({
                    type: 'success',
                    title: 'Status Updated',
                    message: `Appointment marked as ${status}.`,
                });
                loadDoctorData();
            }
        }
        catch {
            addToast({
                type: 'error',
                title: 'Update failed',
                message: 'Could not update appointment status.',
            });
        }
    };
    const pendingCount = appointments.filter((a) => a.status === 'pending').length;
    const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-health-600 to-blue-900 text-white shadow-soft-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-sm">
            <Stethoscope className="w-3.5 h-3.5"/>
            <span>Doctor Clinical Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Dr. John Smith'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            You have {pendingCount} pending requests and {confirmedCount} confirmed consultations scheduled.
          </p>
        </div>

        <Link to="/doctor/prescriptions" className="px-5 py-3 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold shadow-sm transition-all flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-4 h-4"/>
          <span>Write Digital Prescription</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            {pendingCount}
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted">Pending Requests</div>
            <div className="text-xl font-extrabold text-ink-main">{pendingCount} Awaiting Review</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center font-bold text-lg">
            {confirmedCount}
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted">Confirmed Queue</div>
            <div className="text-xl font-extrabold text-ink-main">{confirmedCount} Active Appointments</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
            {prescriptions.length}
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted">Prescriptions Issued</div>
            <div className="text-xl font-extrabold text-ink-main">{prescriptions.length} Digital Rx</div>
          </div>
        </div>
      </div>

      {/* Patient Consultation Queue */}
      <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <h2 className="text-base font-bold text-ink-main">Patient Consultation Queue</h2>
          <Link to="/doctor/appointments" className="text-xs font-bold text-health-600 hover:text-health-700 flex items-center gap-1">
            <span>Full Schedule</span>
            <ArrowRight className="w-3.5 h-3.5"/>
          </Link>
        </div>

        {appointments.length > 0 ? (<div className="space-y-4">
            {appointments.slice(0, 5).map((apt) => (<div key={apt.id} className="p-4 rounded-2xl bg-surface-muted/60 border border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-health-100 text-health-800 font-bold flex items-center justify-center shrink-0">
                    {apt.patientName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-ink-main">{apt.patientName}</h4>
                      <span className="text-[10px] text-ink-muted font-medium">{apt.patientEmail}</span>
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5">
                      <strong>Reason:</strong> {apt.reason}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-health-700 font-semibold mt-1">
                      <span>📅 {apt.date}</span>
                      <span>⏰ {apt.timeSlot}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {apt.status === 'pending' && (<>
                      <button onClick={() => handleUpdateStatus(apt.id, 'confirmed')} className="px-3 py-1.5 rounded-xl bg-status-success text-white text-xs font-bold shadow-sm">
                        Accept
                      </button>
                      <button onClick={() => handleUpdateStatus(apt.id, 'cancelled')} className="px-3 py-1.5 rounded-xl bg-red-50 text-status-danger text-xs font-bold border border-red-200">
                        Decline
                      </button>
                    </>)}
                  {apt.status === 'confirmed' && (<button onClick={() => handleUpdateStatus(apt.id, 'completed')} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm">
                      Mark Completed
                    </button>)}
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${apt.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : apt.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : apt.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'}`}>
                    {apt.status}
                  </span>
                </div>
              </div>))}
          </div>) : (<p className="text-xs text-ink-muted text-center py-6">No patient appointments assigned.</p>)}
      </div>
    </div>);
};
