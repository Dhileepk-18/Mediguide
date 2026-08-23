import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import confetti from 'canvas-confetti';
import {
    Calendar,
    Search,
    Clock,
    Star,
    CheckCircle2,
    Building2,
    UserCheck,
    Check,
    X,
    Video,
    RefreshCw,
    AlertCircle,
    Stethoscope,
    Plus,
} from 'lucide-react';

export const AppointmentsPage = () => {
    const { user } = useAuthStore();
    const [searchParams] = useSearchParams();
    const prefilledDocId = searchParams.get('doctor');
    const prefilledDept = searchParams.get('department');
    const prefilledReason = searchParams.get('reason');

    const { addToast } = useAppStore();

    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [myAppointments, setMyAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState(user?.role === 'doctor' ? 'my-appointments' : 'browse');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [selectedDepartment, setSelectedDepartment] = useState(prefilledDept || 'All');
    const [searchQuery, setSearchQuery] = useState('');

    // Booking Modal
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingDate, setBookingDate] = useState(
        new Date(Date.now() + 86400000).toISOString().split('T')[0]
    );
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [bookingMode, setBookingMode] = useState('In-Person');
    const [bookingReason, setBookingReason] = useState(prefilledReason || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reschedule Modal
    const [reschedulingApt, setReschedulingApt] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState(
        new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
    );
    const [rescheduleSlot, setRescheduleSlot] = useState('11:00 AM');
    const [isRescheduling, setIsRescheduling] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedDepartment, searchQuery]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [docsRes, deptRes, aptRes] = await Promise.all([
                api.getDoctors({ department: selectedDepartment, search: searchQuery }),
                api.getDepartments(),
                api.getMyAppointments(),
            ]);

            if (docsRes.success) {
                setDoctors(docsRes.doctors || []);
                if (prefilledDocId) {
                    const matched = docsRes.doctors.find((d) => d.id === prefilledDocId);
                    if (matched) {
                        handleOpenBooking(matched);
                    }
                }
            }
            if (deptRes.success) setDepartments(deptRes.departments || []);
            if (aptRes.success) setMyAppointments(aptRes.appointments || []);
        } catch (err) {
            console.error('Failed to load appointments data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenBooking = (doctor) => {
        setSelectedDoctor(doctor);
        setSelectedTimeSlot(doctor.availableTimeSlots?.[0] || '09:00 AM');
        setBookingMode(doctor.consultationModes?.[0] || 'In-Person');
        if (prefilledReason) setBookingReason(prefilledReason);
        setIsBookingModalOpen(true);
    };

    const handleConfirmBooking = async (e) => {
        e.preventDefault();
        if (!selectedDoctor || !selectedTimeSlot || !bookingReason.trim()) {
            addToast({
                type: 'warning',
                title: 'Missing information',
                message: 'Please provide consultation reason and select a time slot.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.bookAppointment({
                doctorId: selectedDoctor.id,
                date: bookingDate,
                timeSlot: selectedTimeSlot,
                consultationMode: bookingMode,
                reason: bookingReason,
            });

            if (res.success) {
                confetti({
                    particleCount: 70,
                    spread: 60,
                    origin: { y: 0.6 },
                });
                addToast({
                    type: 'success',
                    title: 'Appointment Confirmed! 🎉',
                    message: `Consultation with ${selectedDoctor.name} booked for ${bookingDate} at ${selectedTimeSlot} IST.`,
                });
                setIsBookingModalOpen(false);
                setBookingReason('');
                loadData();
                setActiveTab('my-appointments');
            }
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Booking failed',
                message: err.message || 'Could not book appointment.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenReschedule = (apt) => {
        setReschedulingApt(apt);
        setRescheduleDate(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
        setRescheduleSlot(apt.timeSlot || '11:00 AM');
    };

    const handleConfirmReschedule = async (e) => {
        e.preventDefault();
        if (!reschedulingApt) return;
        setIsRescheduling(true);
        try {
            const res = await api.updateAppointmentStatus(
                reschedulingApt.id,
                'rescheduled',
                undefined,
                undefined,
                rescheduleDate,
                rescheduleSlot
            );
            if (res.success) {
                addToast({
                    type: 'success',
                    title: 'Appointment Rescheduled',
                    message: `Consultation updated to ${rescheduleDate} at ${rescheduleSlot} IST.`,
                });
                setReschedulingApt(null);
                loadData();
            }
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Reschedule Failed',
                message: err.message || 'Could not reschedule appointment.',
            });
        } finally {
            setIsRescheduling(false);
        }
    };

    const handleDoctorUpdateStatus = async (id, newStatus) => {
        try {
            const res = await api.updateAppointmentStatus(id, newStatus);
            if (res.success) {
                addToast({
                    type: 'success',
                    title: 'Status Updated',
                    message: `Consultation marked as ${newStatus}.`,
                });
                loadData();
            }
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Update failed',
                message: err.message || 'Could not update status.',
            });
        }
    };

    const handleCancelAppointment = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            const res = await api.updateAppointmentStatus(id, 'cancelled');
            if (res.success) {
                addToast({
                    type: 'info',
                    title: 'Appointment Cancelled',
                    message: 'Your time slot has been released.',
                });
                loadData();
            }
        } catch {
            addToast({
                type: 'error',
                title: 'Cancellation failed',
                message: 'Could not cancel appointment.',
            });
        }
    };

    const filteredAppointments = myAppointments.filter(apt => {
        if (statusFilter === 'All') return true;
        return apt.status.toLowerCase() === statusFilter.toLowerCase();
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-100 text-health-800 text-xs font-semibold mb-2">
                        <Calendar className="w-3.5 h-3.5 text-health-600" />
                        <span>Doctor Consultation Schedule (IST Asia/Kolkata)</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">Consultation Appointments</h1>
                    <p className="text-xs sm:text-sm text-ink-muted">
                        Book verified medical specialists, manage slot schedules, or reschedule appointments with conflict protection.
                    </p>
                </div>

                {user?.role === 'patient' && (
                    <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-surface-border self-start md:self-auto shadow-sm">
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'browse'
                                    ? 'bg-health-500 text-white shadow-soft'
                                    : 'text-ink-muted hover:text-ink-main'
                            }`}
                        >
                            Book Specialist
                        </button>
                        <button
                            onClick={() => setActiveTab('my-appointments')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                activeTab === 'my-appointments'
                                    ? 'bg-health-500 text-white shadow-soft'
                                    : 'text-ink-muted hover:text-ink-main'
                            }`}
                        >
                            <span>My Consultations</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                                {myAppointments.length}
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* TAB 1: BROWSE & BOOK DOCTORS */}
            {activeTab === 'browse' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-8 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by doctor name, specialty, or clinic..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-surface border border-surface-border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-health-500 shadow-sm"
                            />
                        </div>

                        <div className="sm:col-span-4">
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-surface border border-surface-border text-xs font-bold text-ink-main focus:outline-none focus:ring-1 focus:ring-health-500 shadow-sm"
                            >
                                <option value="All">All Departments</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Doctors List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map((doc) => (
                            <div
                                key={doc.id}
                                className="bg-surface rounded-3xl border border-surface-border p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={doc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`}
                                            alt={doc.name}
                                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-health-100 shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-bold text-ink-main truncate">{doc.name}</h3>
                                            <p className="text-xs text-health-600 font-semibold truncate">{doc.specialization}</p>
                                            <p className="text-[11px] text-ink-muted truncate">{doc.hospital}</p>
                                            <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-amber-600">
                                                <Star className="w-3 h-3 fill-amber-400" />
                                                <span>{doc.rating || 4.9} ({doc.reviewCount || 100}+ reviews)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-surface-muted/50 rounded-2xl border border-surface-border/60 text-xs space-y-1">
                                        <p className="text-ink-muted font-medium line-clamp-2">{doc.bio}</p>
                                        <div className="flex items-center gap-1.5 text-health-800 font-bold pt-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Slots: {doc.availableTimeSlots?.slice(0, 3).join(', ')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-surface-border flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold text-ink-muted block">Fee (IST)</span>
                                        <span className="text-base font-black text-ink-main">₹{doc.consultationFee}</span>
                                    </div>
                                    <button
                                        onClick={() => handleOpenBooking(doc)}
                                        className="px-4 py-2 bg-health-500 hover:bg-health-600 text-white rounded-xl text-xs font-bold shadow-soft transition-all"
                                    >
                                        Select Slot
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: MY APPOINTMENTS LIST */}
            {activeTab === 'my-appointments' && (
                <div className="space-y-6">
                    {/* Status Filter Buttons */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
                        {['All', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-2xl transition-all ${
                                    statusFilter === status
                                        ? 'bg-health-600 text-white shadow-soft'
                                        : 'bg-surface border border-surface-border text-ink-muted hover:bg-health-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {filteredAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {filteredAppointments.map((apt) => (
                                <div
                                    key={apt.id}
                                    className="bg-surface rounded-3xl border border-surface-border p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={apt.doctorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${apt.doctorName}`}
                                            alt={apt.doctorName}
                                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-health-200 shrink-0"
                                        />
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold text-ink-main">
                                                    {user?.role === 'doctor' ? apt.patientName : apt.doctorName}
                                                </h3>
                                                <span
                                                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
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
                                            </div>
                                            <p className="text-xs text-health-700 font-bold">{apt.department}</p>
                                            <p className="text-xs text-ink-muted flex items-center gap-2">
                                                <span>Reason: {apt.reason}</span>
                                                {apt.consultationMode && (
                                                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.2 rounded-md">
                                                        {apt.consultationMode}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Date & Action Buttons */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="text-left sm:text-right bg-surface-muted/60 p-3 rounded-2xl border border-surface-border">
                                            <div className="text-xs font-bold text-ink-main flex items-center gap-1.5 sm:justify-end">
                                                <Calendar className="w-3.5 h-3.5 text-health-600" />
                                                <span>{apt.date}</span>
                                            </div>
                                            <div className="text-xs text-health-700 font-semibold flex items-center gap-1.5 sm:justify-end">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{apt.timeSlot} (IST)</span>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2">
                                            {user?.role === 'patient' && ['confirmed', 'rescheduled'].includes(apt.status) && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenReschedule(apt)}
                                                        className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center gap-1"
                                                    >
                                                        <RefreshCw className="w-3 h-3" />
                                                        <span>Reschedule</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelAppointment(apt.id)}
                                                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}

                                            {user?.role === 'doctor' && ['confirmed', 'rescheduled'].includes(apt.status) && (
                                                <button
                                                    onClick={() => handleDoctorUpdateStatus(apt.id, 'completed')}
                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-soft flex items-center gap-1.5"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Mark Completed</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-surface rounded-3xl p-12 border border-surface-border shadow-soft text-center space-y-4">
                            <div className="w-16 h-16 rounded-3xl bg-health-50 text-health-600 flex items-center justify-center mx-auto">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-ink-main">No Consultations Found</h3>
                                <p className="text-xs text-ink-muted max-w-sm mx-auto">
                                    You don't have any appointments matching the current filter. Book a consultation or browse specialists.
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveTab('browse')}
                                className="px-5 py-2.5 bg-health-500 hover:bg-health-600 text-white font-bold rounded-2xl text-xs shadow-soft"
                            >
                                Browse Doctors
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Booking Modal */}
            {isBookingModalOpen && selectedDoctor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface rounded-3xl shadow-2xl border border-surface-border max-w-lg w-full overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-health-700 to-health-600 text-white flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src={selectedDoctor.avatar}
                                    alt={selectedDoctor.name}
                                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/40"
                                />
                                <div>
                                    <h3 className="text-base font-bold">{selectedDoctor.name}</h3>
                                    <p className="text-xs text-health-100">{selectedDoctor.specialization} &bull; ₹{selectedDoctor.consultationFee}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsBookingModalOpen(false)}
                                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmBooking} className="p-6 space-y-4 text-xs font-medium">
                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted mb-1">Consultation Mode</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['In-Person', 'Online Video'].map((mode) => (
                                        <button
                                            type="button"
                                            key={mode}
                                            onClick={() => setBookingMode(mode)}
                                            className={`p-3 rounded-2xl border text-center font-bold transition-all ${
                                                bookingMode === mode
                                                    ? 'bg-health-50 border-health-500 text-health-800'
                                                    : 'border-surface-border text-ink-muted hover:bg-surface-muted'
                                            }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted mb-1">Select Date (IST)</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-surface-border bg-surface text-ink-main font-semibold"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted mb-1">Select Time Slot (Asia/Kolkata)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {selectedDoctor.availableTimeSlots?.map((slot) => (
                                        <button
                                            type="button"
                                            key={slot}
                                            onClick={() => setSelectedTimeSlot(slot)}
                                            className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                                                selectedTimeSlot === slot
                                                    ? 'bg-health-600 text-white border-health-600'
                                                    : 'border-surface-border text-ink-main hover:bg-health-50'
                                            }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted mb-1">Reason for Visit / Symptoms</label>
                                <textarea
                                    rows="3"
                                    placeholder="Briefly state symptoms or health goals..."
                                    value={bookingReason}
                                    onChange={(e) => setBookingReason(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-surface-border bg-surface text-ink-main font-medium"
                                    required
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsBookingModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-surface-border text-ink-muted font-bold hover:bg-surface-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-health-500 hover:bg-health-600 text-white rounded-xl font-bold shadow-soft transition-all"
                                >
                                    {isSubmitting ? 'Booking...' : `Confirm (₹${selectedDoctor.consultationFee})`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {reschedulingApt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface rounded-3xl shadow-2xl border border-surface-border max-w-md w-full p-6 space-y-4 text-xs font-medium">
                        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                            <div>
                                <h3 className="text-base font-bold text-ink-main">Reschedule Consultation</h3>
                                <p className="text-xs text-ink-muted">With {reschedulingApt.doctorName}</p>
                            </div>
                            <button onClick={() => setReschedulingApt(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-ink-main">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmReschedule} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted mb-1">New Date (IST)</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={rescheduleDate}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-surface-border bg-surface text-ink-main font-semibold"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted mb-1">New Time Slot</label>
                                <select
                                    value={rescheduleSlot}
                                    onChange={(e) => setRescheduleSlot(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-surface-border bg-surface text-ink-main font-semibold"
                                >
                                    {['09:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '04:30 PM', '06:00 PM'].map(s => (
                                        <option key={s} value={s}>{s} (IST)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setReschedulingApt(null)}
                                    className="px-4 py-2 rounded-xl border border-surface-border text-ink-muted font-bold hover:bg-surface-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isRescheduling}
                                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-soft"
                                >
                                    {isRescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
