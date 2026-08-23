import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { Modal } from '../../components/common/Modal.jsx';
import {
    Search,
    Stethoscope,
    MapPin,
    GraduationCap,
    Star,
    Calendar,
    Video,
    UserCheck,
    Clock,
    Sparkles,
    ShieldCheck,
    CheckCircle2,
    Filter,
    X,
    Building2,
    ArrowRight,
    ArrowLeft,
    Check,
    ChevronRight,
} from 'lucide-react';

const INDIAN_CITIES = [
    'All', 'New Delhi', 'Bengaluru', 'Mumbai', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune'
];

export const DoctorDiscoveryPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToast } = useAppStore();

    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter states
    const [selectedDept, setSelectedDept] = useState(searchParams.get('department') || 'All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('All');

    // 3-Step Booking Flow State
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingStep, setBookingStep] = useState(1); // 1: Time/Slot, 2: Reason/Mode, 3: Confirmation
    const [bookingDate, setBookingDate] = useState(
        new Date(Date.now() + 86400000).toISOString().split('T')[0]
    );
    const [bookingSlot, setBookingSlot] = useState('');
    const [bookingMode, setBookingMode] = useState('In-Person');
    const [bookingReason, setBookingReason] = useState('');
    const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

    useEffect(() => {
        const deptParam = searchParams.get('department');
        if (deptParam) {
            setSelectedDept(deptParam);
        }
    }, [searchParams]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [deptRes, docRes] = await Promise.all([
                api.getDepartments(),
                api.getDoctors({
                    department: selectedDept !== 'All' ? selectedDept : undefined,
                    city: selectedCity !== 'All' ? selectedCity : undefined,
                    search: searchQuery || undefined,
                }),
            ]);

            if (deptRes.success) setDepartments(deptRes.departments || []);
            if (docRes.success) setDoctors(docRes.doctors || []);
        } catch {
            addToast({
                type: 'error',
                title: 'Loading Error',
                message: 'Failed to load doctor directory.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedDept, selectedCity]);

    const handleSelectDepartment = (deptName) => {
        setSelectedDept(deptName);
        if (deptName === 'All') {
            searchParams.delete('department');
        } else {
            searchParams.set('department', deptName);
        }
        setSearchParams(searchParams);
    };

    const handleOpenBooking = (doc) => {
        setSelectedDoctor(doc);
        setBookingStep(1);
        setBookingSlot(doc.availableTimeSlots?.[0] || '10:00 AM');
        setBookingMode(doc.consultationModes?.[0] || 'In-Person');
        setBookingReason('');
    };

    const handleConfirmBooking = async () => {
        if (!selectedDoctor) return;
        if (!bookingReason.trim()) {
            addToast({
                type: 'error',
                title: 'Reason required',
                message: 'Please provide a short reason for consultation.',
            });
            return;
        }

        try {
            setIsSubmittingBooking(true);
            const res = await api.bookAppointment({
                doctorId: selectedDoctor.id,
                date: bookingDate,
                timeSlot: bookingSlot,
                consultationMode: bookingMode,
                reason: bookingReason,
            });

            if (res.success) {
                addToast({
                    type: 'success',
                    title: 'Appointment Confirmed ✨',
                    message: `Scheduled with ${selectedDoctor.name} on ${bookingDate} at ${bookingSlot}.`,
                });
                setSelectedDoctor(null);
            }
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Booking failed',
                message: err.message || 'Could not schedule appointment.',
            });
        } finally {
            setIsSubmittingBooking(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="p-6 sm:p-8 rounded-3xl bg-health-700 text-white shadow-luxury relative overflow-hidden border border-health-600">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-health-100 text-xs font-semibold backdrop-blur-md">
                            <Stethoscope className="w-3.5 h-3.5 text-accent" />
                            <span>Verified Clinical Specialists &bull; India</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
                            Find verified care & book seamlessly.
                        </h1>
                        <p className="text-xs text-health-100/90 max-w-xl leading-relaxed">
                            Discover licensed department specialists, check consultation fee benchmarks, and book in-person or telemedicine slots.
                        </p>
                    </div>

                    {/* Search Bar in Header */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            loadData();
                        }}
                        className="flex items-center gap-2 max-w-md w-full"
                    >
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-health-300 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search doctor, specialty, or condition..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-health-200/60 focus:outline-none focus:border-accent"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2.5 rounded-2xl bg-accent hover:bg-accent-hover text-health-950 text-xs font-extrabold shadow-soft transition-all"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {/* Department Filter Chips */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Filter by Specialty</span>
                    <span className="text-xs font-semibold text-health-700">{doctors.length} Doctors Available</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleSelectDepartment('All')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedDept === 'All'
                                ? 'bg-health-700 text-white shadow-soft'
                                : 'bg-surface border border-surface-border text-ink-muted hover:bg-health-50 hover:text-health-700'
                        }`}
                    >
                        All Specialties
                    </button>
                    {departments.map((dept) => (
                        <button
                            key={dept.id}
                            onClick={() => handleSelectDepartment(dept.name)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                selectedDept === dept.name
                                    ? 'bg-health-700 text-white shadow-soft'
                                    : 'bg-surface border border-surface-border text-ink-muted hover:bg-health-50 hover:text-health-700'
                            }`}
                        >
                            {dept.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Doctor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-12 text-center text-xs text-ink-muted">
                        Loading verified doctors...
                    </div>
                ) : doctors.length > 0 ? (
                    doctors.map((doc) => (
                        <div
                            key={doc.id}
                            className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft flex flex-col justify-between space-y-4 hover:shadow-luxury transition-all"
                        >
                            {/* Doctor Avatar & Specialty */}
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={doc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(doc.name)}`}
                                            alt={doc.name}
                                            onError={(e) => {
                                                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(doc.name)}`;
                                            }}
                                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-health-100 shrink-0 bg-health-50"
                                        />
                                        <div>
                                            <h3 className="text-sm font-bold text-ink-main">{doc.name}</h3>
                                            <span className="text-[11px] font-semibold text-health-700">{doc.qualification || 'MBBS, MD'}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-health-50 text-health-800 border border-health-200">
                                        {doc.department}
                                    </span>
                                </div>

                                <div className="space-y-1 text-xs text-ink-muted">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-ink-subtle" />
                                        <span>{doc.hospital || 'Apollo Hospitals'} &bull; {doc.city || 'Bengaluru'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-ink-subtle" />
                                        <span>{doc.experience || '10+'} years clinical experience</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fee & Booking CTA */}
                            <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-3">
                                <div>
                                    <span className="text-[10px] text-ink-muted">Consultation Fee</span>
                                    <div className="text-sm font-extrabold text-ink-main">₹{doc.consultationFee || 800}</div>
                                </div>

                                <button
                                    onClick={() => handleOpenBooking(doc)}
                                    className="px-4 py-2 rounded-xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft transition-all"
                                >
                                    Book Visit
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center space-y-2 bg-surface rounded-3xl border border-surface-border">
                        <p className="text-xs text-ink-muted">No doctors found matching your selected filters.</p>
                        <button
                            onClick={() => {
                                setSelectedDept('All');
                                setSearchQuery('');
                            }}
                            className="text-xs font-bold text-health-700 underline"
                        >
                            Reset filters
                        </button>
                    </div>
                )}
            </div>

            {/* 3-Step Appointment Booking Modal */}
            <Modal
                isOpen={Boolean(selectedDoctor)}
                onClose={() => setSelectedDoctor(null)}
                title={`Book Consultation: ${selectedDoctor?.name || ''}`}
                subtitle={`Step ${bookingStep} of 3 &bull; ${selectedDoctor?.department || ''}`}
            >
                {selectedDoctor && (
                    <div className="space-y-5">
                        {/* Step Progress Stepper */}
                        <div className="flex items-center justify-between border-b border-surface-border pb-3">
                            <div className={`text-xs font-bold ${bookingStep === 1 ? 'text-health-700' : 'text-ink-muted'}`}>
                                1. Slot & Date
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-ink-subtle" />
                            <div className={`text-xs font-bold ${bookingStep === 2 ? 'text-health-700' : 'text-ink-muted'}`}>
                                2. Details & Mode
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-ink-subtle" />
                            <div className={`text-xs font-bold ${bookingStep === 3 ? 'text-health-700' : 'text-ink-muted'}`}>
                                3. Confirmation
                            </div>
                        </div>

                        {/* STEP 1: Date & Time Slot */}
                        {bookingStep === 1 && (
                            <div className="space-y-4 animate-fadeIn">
                                <div>
                                    <label className="block text-xs font-bold text-ink-main mb-1.5">Select Date</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-ink-main mb-1.5">Available Time Slots</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(selectedDoctor.availableTimeSlots || ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM', '06:00 PM']).map((slot) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => setBookingSlot(slot)}
                                                className={`p-2.5 rounded-xl text-xs font-bold text-center transition-all ${
                                                    bookingSlot === slot
                                                        ? 'bg-health-700 text-white shadow-soft'
                                                        : 'bg-surface-muted border border-surface-border text-ink-main hover:bg-health-50'
                                                }`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-surface-border flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setBookingStep(2)}
                                        disabled={!bookingSlot}
                                        className="px-5 py-2.5 rounded-xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        <span>Next: Reason & Mode</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Reason & Mode */}
                        {bookingStep === 2 && (
                            <div className="space-y-4 animate-fadeIn">
                                <div>
                                    <label className="block text-xs font-bold text-ink-main mb-1.5">Consultation Mode</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['In-Person', 'Video Call'].map((mode) => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setBookingMode(mode)}
                                                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                                                    bookingMode === mode
                                                        ? 'bg-health-50 border-health-600 text-health-800 shadow-soft'
                                                        : 'bg-surface-muted border-surface-border text-ink-muted'
                                                }`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-ink-main mb-1.5">Reason for Visit</label>
                                    <textarea
                                        rows={3}
                                        value={bookingReason}
                                        onChange={(e) => setBookingReason(e.target.value)}
                                        placeholder="Describe symptoms, concerns, or previous lab test history..."
                                        className="w-full p-3 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
                                    />
                                </div>

                                <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setBookingStep(1)}
                                        className="px-4 py-2 rounded-xl border border-surface-border text-xs font-bold text-ink-muted"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBookingStep(3)}
                                        disabled={!bookingReason.trim()}
                                        className="px-5 py-2.5 rounded-xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        <span>Next: Review & Confirm</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Review & Final Confirmation */}
                        {bookingStep === 3 && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="p-4 rounded-2xl bg-health-50 border border-health-200 space-y-2 text-xs">
                                    <div className="font-bold text-health-900 text-sm">{selectedDoctor.name}</div>
                                    <div className="text-ink-muted">{selectedDoctor.department} &bull; {selectedDoctor.hospital}</div>
                                    <div className="pt-2 border-t border-health-200 grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-ink-muted block text-[10px]">Date & Time</span>
                                            <strong className="text-ink-main">{bookingDate} at {bookingSlot}</strong>
                                        </div>
                                        <div>
                                            <span className="text-ink-muted block text-[10px]">Mode</span>
                                            <strong className="text-ink-main">{bookingMode}</strong>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-ink-muted block text-[10px]">Reason</span>
                                            <span className="text-ink-main">{bookingReason}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setBookingStep(2)}
                                        className="px-4 py-2 rounded-xl border border-surface-border text-xs font-bold text-ink-muted"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmBooking}
                                        disabled={isSubmittingBooking}
                                        className="px-6 py-2.5 rounded-xl bg-status-success hover:bg-green-700 text-white text-xs font-extrabold shadow-soft flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        {isSubmittingBooking ? 'Scheduling...' : 'Confirm Appointment'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};
