import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import {
  Plus,
  Stethoscope,
  FileCheck2,
} from 'lucide-react';

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
      if (aptRes.success) setAppointments(aptRes.appointments || []);
      if (rxRes.success) setPrescriptions(rxRes.prescriptions || []);
    } catch (err) {
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
    } catch {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: 'Could not update appointment status.',
      });
    }
  };

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-[18px] bg-[#0B3441] text-[#FAFBFB] flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
            <Stethoscope className="w-3.5 h-3.5 text-[#C9A24D]" />
            <span>Doctor Clinical Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold font-serif tracking-tight text-white">
            Welcome, {user?.name || 'Dr. Practitioner'}
          </h1>
          <p className="text-xs text-[#9EBAD1] max-w-xl leading-relaxed">
            You have {pendingCount} pending requests and {confirmedCount} confirmed consultations scheduled. Review clinical records prior to consultations.
          </p>
        </div>

        <Link
          to="/doctor/prescriptions"
          className="px-4 py-2.5 rounded-xl bg-white text-[#0B3441] hover:bg-[#FAFBFB] text-xs font-semibold transition-colors flex items-center gap-2 self-start md:self-auto shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Digital Prescription</span>
        </Link>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] text-[#C9A24D] flex items-center justify-center font-serif text-lg font-semibold shrink-0">
            {pendingCount}
          </div>
          <div>
            <div className="text-sm font-semibold text-[#061017]">Pending Consultations</div>
            <div className="text-xs text-[#5A6C77]">Awaiting acceptance</div>
          </div>
        </div>

        <div className="p-5 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] text-[#2A7A5B] flex items-center justify-center font-serif text-lg font-semibold shrink-0">
            {confirmedCount}
          </div>
          <div>
            <div className="text-sm font-semibold text-[#061017]">Confirmed Agenda</div>
            <div className="text-xs text-[#5A6C77]">Scheduled this week</div>
          </div>
        </div>

        <div className="p-5 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] text-[#39679B] flex items-center justify-center font-serif text-lg font-semibold shrink-0">
            {prescriptions.length}
          </div>
          <div>
            <div className="text-sm font-semibold text-[#061017]">Issued Prescriptions</div>
            <div className="text-xs text-[#5A6C77]">Digitally verified & PDF exported</div>
          </div>
        </div>
      </div>

      {/* Appointment Queue (Undecorated rows per Section 7) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#061017]">Patient Consultation Queue</h2>
          <Link to="/doctor/appointments" className="text-xs text-[#39679B] hover:underline font-medium">
            View full calendar
          </Link>
        </div>

        <div className="rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] divide-y divide-[rgba(6,16,23,0.08)] overflow-hidden">
          {appointments.length > 0 ? (
            appointments.slice(0, 5).map(apt => (
              <div key={apt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#061017]">{apt.patientName}</span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        apt.status === 'confirmed'
                          ? 'bg-[#2A7A5B]/10 text-[#2A7A5B]'
                          : apt.status === 'pending'
                            ? 'bg-[#C9A24D]/10 text-[#7D6025]'
                            : 'bg-black/5 text-[#5A6C77]'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#5A6C77]">
                    {apt.date} at {apt.timeSlot || apt.time} • {apt.consultationMode || 'In-Person'}
                  </div>
                  <div className="text-xs text-[#061017] pt-0.5">
                    Reason: {apt.reason || 'General clinical inquiry'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {apt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                        className="px-3 py-1.5 rounded-lg bg-[#2A7A5B] text-white text-xs font-semibold hover:bg-[#23684d]"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                        className="px-3 py-1.5 rounded-lg border border-[rgba(6,16,23,0.15)] text-xs text-[#B83A3A] hover:bg-red-50"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {apt.status === 'confirmed' && (
                    <Link
                      to={`/doctor/prescriptions?patientId=${apt.patientId || ''}&appointmentId=${apt.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#0B3441] text-white text-xs font-semibold hover:bg-[#08252E] flex items-center gap-1.5"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Write Rx</span>
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[#5A6C77]">
              No active patient consultation requests at this time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
