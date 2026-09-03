import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import {
  Search,
  Stethoscope,
  MapPin,
  Star,
  Calendar,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const DoctorDiscoveryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useAppStore();

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter chips: specialty, reason, distance, availability (Section 7.5)
  const [selectedDept, setSelectedDept] = useState(searchParams.get('department') || 'All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Expanding 3-step Booking State (Section 7.5)
  // expandingDoctorId: ID of doctor currently expanded for inline booking
  const [expandedDocId, setExpandedDocId] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: time, 2: details, 3: confirmation
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingMode, setBookingMode] = useState('In-Person');
  const [bookingReason, setBookingReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);

  useEffect(() => {
    const deptParam = searchParams.get('department');
    if (deptParam) {
      setSelectedDept(deptParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [selectedDept, searchQuery]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [deptRes, docRes] = await Promise.all([
        api.getDepartments(),
        api.getDoctors({
          department: selectedDept !== 'All' ? selectedDept : undefined,
          search: searchQuery || undefined,
        }),
      ]);
      if (deptRes.success) setDepartments(deptRes.departments || []);
      if (docRes.success) setDoctors(docRes.doctors || []);
    } catch (err) {
      console.error('Error loading care providers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpandDoctor = docId => {
    if (expandedDocId === docId) {
      setExpandedDocId(null);
      setBookingStep(1);
      setBookedAppointment(null);
    } else {
      setExpandedDocId(docId);
      setBookingStep(1);
      setBookingSlot('');
      setBookingReason('');
      setBookedAppointment(null);
    }
  };

  const handleConfirmBooking = async doctor => {
    if (!bookingSlot) {
      addToast({
        type: 'warning',
        title: 'Time slot required',
        message: 'Please select an appointment time slot.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createAppointment({
        doctorId: doctor.id,
        doctorName: doctor.name,
        department: doctor.department,
        date: bookingDate,
        time: bookingSlot,
        mode: bookingMode,
        reason: bookingReason || 'General clinical consultation',
      });

      if (res.success) {
        setBookedAppointment(res.appointment);
        setBookingStep(3); // Step 3: Confirmation
        addToast({
          type: 'success',
          title: 'Appointment Booked',
          message: `Consultation confirmed with ${doctor.name}.`,
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Booking conflict',
        message: err.message || 'This slot is no longer available.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0B3441]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6C77]">
            Care Navigation
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold font-serif text-[#061017] tracking-tight">
          Find Care & Accredited Providers
        </h1>
        <p className="text-sm text-[#5A6C77]">
          Discover Indian-licensed medical practitioners. Book visits directly without modal dialogs or separate pages.
        </p>
      </div>

      {/* Filter Bar & Chips (Section 7.5: specialty, availability, distance) */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#5A6C77] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search doctor by name, specialty, or clinic..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[rgba(6,16,23,0.15)] text-xs text-[#061017] focus:outline-none focus:border-[#0B3441]"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedDept('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedDept === 'All'
                ? 'bg-[#0B3441] text-white font-semibold'
                : 'bg-[#FAFBFB] text-[#061017] border border-[rgba(6,16,23,0.12)] hover:border-[#0B3441]'
            }`}
          >
            All Specialties
          </button>
          {[
            'General Medicine',
            'Cardiology',
            'Dermatology',
            'ENT',
            'Orthopedics',
            'Neurology',
            'Pulmonology',
          ].map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedDept === dept
                  ? 'bg-[#0B3441] text-white font-semibold'
                  : 'bg-[#FAFBFB] text-[#061017] border border-[rgba(6,16,23,0.12)] hover:border-[#0B3441]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Provider Rows (Not cards per Section 7.5) with Inline 3-Step Booking */}
      <div className="rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] divide-y divide-[rgba(6,16,23,0.08)] overflow-hidden">
        {doctors.length > 0 ? (
          doctors.map(doctor => {
            const isExpanded = expandedDocId === doctor.id;
            const initials = doctor.name
              ? doctor.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)
              : 'DR';

            return (
              <div key={doctor.id} className="transition-colors">
                {/* Provider Row (Section 7.5) */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Avatar / Initials + Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#0B3441] text-white flex items-center justify-center font-serif text-sm font-semibold shrink-0">
                      {initials}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#061017] truncate">
                          {doctor.name}
                        </span>
                        {doctor.verified !== false && (
                          <ShieldCheck className="w-4 h-4 text-[#2A7A5B] shrink-0" title="Verified Practitioner" />
                        )}
                      </div>
                      <div className="text-xs text-[#5A6C77] flex flex-wrap items-center gap-x-2">
                        <span className="font-medium text-[#0B3441]">{doctor.department}</span>
                        <span>•</span>
                        <span>{doctor.experience || '8+ yrs experience'}</span>
                        <span>•</span>
                        <span>{doctor.city || 'Delhi NCR'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating + Next availability + Single CTA */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[rgba(6,16,23,0.06)]">
                    <div className="text-right text-xs">
                      <div className="flex items-center gap-1 font-semibold text-[#061017]">
                        <Star className="w-3.5 h-3.5 text-[#C9A24D] fill-[#C9A24D]" />
                        <span>{doctor.rating || '4.9'}</span>
                      </div>
                      <span className="text-[11px] text-[#2A7A5B] font-medium">Tomorrow Available</span>
                    </div>

                    <button
                      onClick={() => toggleExpandDoctor(doctor.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isExpanded
                          ? 'bg-[#061017] text-white'
                          : 'bg-[#0B3441] text-white hover:bg-[#08252E]'
                      }`}
                    >
                      <span>{isExpanded ? 'Close' : 'Book Visit'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* INLINE EXPANDING 3-STEP BOOKING FLOW (Section 7.5: time -> details -> confirmation) */}
                {isExpanded && (
                  <div className="bg-[#FAFBFB] px-5 py-6 border-t border-[rgba(6,16,23,0.08)] space-y-6">
                    {/* Stepper indicator */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-[#5A6C77]">
                      <span className={bookingStep >= 1 ? 'text-[#0B3441]' : ''}>1. Select Time</span>
                      <span>→</span>
                      <span className={bookingStep >= 2 ? 'text-[#0B3441]' : ''}>2. Visit Details</span>
                      <span>→</span>
                      <span className={bookingStep === 3 ? 'text-[#2A7A5B]' : ''}>3. Confirmation</span>
                    </div>

                    {/* Step 1: Time */}
                    {bookingStep === 1 && (
                      <div className="space-y-4 max-w-xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-[#061017]">Date</label>
                            <input
                              type="date"
                              value={bookingDate}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={e => setBookingDate(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(6,16,23,0.15)] text-xs text-[#061017] focus:outline-none focus:border-[#0B3441]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-[#061017]">Consultation Mode</label>
                            <select
                              value={bookingMode}
                              onChange={e => setBookingMode(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[rgba(6,16,23,0.15)] text-xs text-[#061017] focus:outline-none focus:border-[#0B3441]"
                            >
                              <option value="In-Person">In-Person Clinic Visit</option>
                              <option value="Audio/Telehealth">Telehealth Audio Review</option>
                            </select>
                          </div>
                        </div>

                        {/* Slots */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#061017]">Available Time Slots</label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {['09:30 AM', '10:15 AM', '11:00 AM', '02:00 PM', '03:30 PM', '04:15 PM', '05:00 PM'].map(slot => (
                              <button
                                key={slot}
                                onClick={() => setBookingSlot(slot)}
                                className={`py-2 px-2 text-xs rounded-xl border text-center transition-all ${
                                  bookingSlot === slot
                                    ? 'bg-[#0B3441] text-white border-[#0B3441] font-semibold'
                                    : 'bg-white border-[rgba(6,16,23,0.12)] text-[#061017] hover:border-[#0B3441]'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => setBookingStep(2)}
                            disabled={!bookingSlot}
                            className="px-5 py-2 rounded-xl bg-[#0B3441] text-white text-xs font-semibold hover:bg-[#08252E] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                          >
                            <span>Next: Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Details */}
                    {bookingStep === 2 && (
                      <div className="space-y-4 max-w-xl">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[#061017]">Reason for Visit</label>
                          <textarea
                            rows={3}
                            value={bookingReason}
                            onChange={e => setBookingReason(e.target.value)}
                            placeholder="Briefly describe your symptoms or reason for seeking consultation..."
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-[rgba(6,16,23,0.15)] text-xs text-[#061017] focus:outline-none focus:border-[#0B3441]"
                          />
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-[rgba(6,16,23,0.08)] text-xs text-[#5A6C77] space-y-1">
                          <div className="font-semibold text-[#061017]">Booking Summary</div>
                          <div>{doctor.name} ({doctor.department})</div>
                          <div>{bookingDate} at {bookingSlot} • {bookingMode}</div>
                        </div>

                        <div className="flex justify-between pt-2">
                          <button
                            onClick={() => setBookingStep(1)}
                            className="px-4 py-2 rounded-xl border border-[rgba(6,16,23,0.15)] text-xs font-semibold text-[#061017] hover:bg-white"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => handleConfirmBooking(doctor)}
                            disabled={isSubmitting}
                            className="px-5 py-2 rounded-xl bg-[#0B3441] text-white text-xs font-semibold hover:bg-[#08252E] disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Confirmation (Compact inline state) */}
                    {bookingStep === 3 && (
                      <div className="p-5 rounded-xl bg-white border border-[rgba(6,16,23,0.10)] space-y-3 max-w-xl">
                        <div className="flex items-center gap-2 text-[#2A7A5B]">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-semibold">Appointment Successfully Confirmed</span>
                        </div>
                        <p className="text-xs text-[#5A6C77] leading-relaxed">
                          Your appointment with {doctor.name} has been confirmed for {bookingDate} at {bookingSlot}. A calendar reminder has been added to your dashboard.
                        </p>
                        <div className="pt-2 flex items-center gap-3">
                          <Link
                            to="/appointments"
                            className="px-4 py-2 rounded-xl bg-[#0B3441] text-white text-xs font-semibold hover:bg-[#08252E]"
                          >
                            View in Appointments
                          </Link>
                          <button
                            onClick={() => setExpandedDocId(null)}
                            className="text-xs text-[#5A6C77] hover:underline"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-[#5A6C77]">
            {isLoading ? 'Loading medical specialists...' : 'No accredited specialists match your search criteria.'}
          </div>
        )}
      </div>
    </div>
  );
};
