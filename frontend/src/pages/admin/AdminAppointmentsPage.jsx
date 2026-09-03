import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import {
  Calendar,
  Search,
  Clock,
  User,
  CheckCircle2,
  X,
  Filter,
  Stethoscope,
  Building2,
  RefreshCw,
} from 'lucide-react';

export const AdminAppointmentsPage = () => {
  const { addToast } = useAppStore();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminAppointments();
      if (res.success) {
        setAppointments(res.appointments || []);
      }
    } catch (err) {
      console.error('Failed to load admin appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.updateAppointmentStatus(id, newStatus);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Appointment Updated',
          message: `Status updated to ${newStatus}.`,
        });
        loadAppointments();
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not change status.',
      });
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus =
      statusFilter === 'All' || apt.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalCount = appointments.length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-100 text-health-800 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5 text-health-600" />
            <span>System-Wide Clinical Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">
            Appointments Oversight
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Real-time oversight of all consultations, booking statuses, doctor availability, and
            cancellation metrics.
          </p>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
        <div className="p-4 rounded-2xl bg-surface border border-surface-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-ink-muted block">
            Total Consultations
          </span>
          <span className="text-2xl font-black text-ink-main mt-0.5 block">{totalCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">
            Confirmed / Scheduled
          </span>
          <span className="text-2xl font-black text-emerald-900 mt-0.5 block">
            {confirmedCount}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
          <span className="text-[10px] uppercase font-bold text-sky-800 block">Completed</span>
          <span className="text-2xl font-black text-sky-900 mt-0.5 block">{completedCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
          <span className="text-[10px] uppercase font-bold text-red-800 block">Cancelled</span>
          <span className="text-2xl font-black text-red-900 mt-0.5 block">{cancelledCount}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, doctor, or department..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface border border-surface-border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-health-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-bold">
          {['All', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-health-600 text-white shadow-soft'
                  : 'bg-surface border border-surface-border text-ink-muted hover:bg-health-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-health-200 border-t-health-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-ink-muted">Loading appointments...</p>
        </div>
      ) : (
        <div className="bg-surface rounded-3xl border border-surface-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted border-b border-surface-border text-ink-muted font-bold text-[11px] uppercase">
                <tr>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Doctor & Department</th>
                  <th className="py-3.5 px-4">Date & Slot (IST)</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border font-medium">
                {filteredAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-surface-muted/40">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-ink-main">{apt.patientName}</div>
                      <div className="text-[10px] text-ink-muted">Reason: {apt.reason}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-health-800">{apt.doctorName}</div>
                      <div className="text-[10px] text-ink-muted">{apt.department}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-ink-main">{apt.date}</div>
                      <div className="text-[10px] text-health-700">{apt.timeSlot}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        {apt.consultationMode || 'In-Person'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'rescheduled'
                              ? 'bg-purple-100 text-purple-800'
                              : apt.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'completed')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-[11px]"
                          >
                            Complete
                          </button>
                        )}
                        {apt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                            className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-lg text-[11px]"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
