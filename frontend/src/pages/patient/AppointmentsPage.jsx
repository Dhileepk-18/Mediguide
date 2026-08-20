import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { Modal } from '../../components/common/Modal.jsx';
import confetti from 'canvas-confetti';
import { Calendar, Search, Clock, Star, CheckCircle2, Building2, UserCheck, } from 'lucide-react';
export const AppointmentsPage = () => {
    const [searchParams] = useSearchParams();
    const prefilledDocId = searchParams.get('doctor');
    const prefilledDept = searchParams.get('department');
    const prefilledReason = searchParams.get('reason');
    const { addToast } = useAppStore();
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [myAppointments, setMyAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState('browse');
    // Filters
    const [selectedDepartment, setSelectedDepartment] = useState(prefilledDept || 'All');
    const [searchQuery, setSearchQuery] = useState('');
    // Booking Modal
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [bookingReason, setBookingReason] = useState(prefilledReason || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        loadData();
    }, [selectedDepartment, searchQuery]);
    const loadData = async () => {
        try {
            const [docsRes, deptRes, aptRes] = await Promise.all([
                api.getDoctors(selectedDepartment, searchQuery),
                api.getDepartments(),
                api.getMyAppointments(),
            ]);
            if (docsRes.success) {
                setDoctors(docsRes.doctors);
                if (prefilledDocId) {
                    const matched = docsRes.doctors.find((d) => d.id === prefilledDocId);
                    if (matched) {
                        handleOpenBooking(matched);
                    }
                }
            }
            if (deptRes.success)
                setDepartments(deptRes.departments);
            if (aptRes.success)
                setMyAppointments(aptRes.appointments);
        }
        catch (err) {
            console.error('Failed to load appointments data:', err);
        }
    };
    const handleOpenBooking = (doctor) => {
        setSelectedDoctor(doctor);
        setSelectedTimeSlot(doctor.availableTimeSlots[0] || '09:00 AM');
        if (prefilledReason)
            setBookingReason(prefilledReason);
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
                    message: `Consultation with ${selectedDoctor.name} booked for ${bookingDate} at ${selectedTimeSlot}.`,
                });
                setIsBookingModalOpen(false);
                setBookingReason('');
                loadData();
                setActiveTab('my-appointments');
            }
        }
        catch (err) {
            addToast({
                type: 'error',
                title: 'Booking failed',
                message: err.message || 'Could not book appointment.',
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleCancelAppointment = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?'))
            return;
        try {
            const res = await api.updateAppointmentStatus(id, 'cancelled');
            if (res.success) {
                addToast({
                    type: 'info',
                    title: 'Appointment Cancelled',
                    message: 'Your slot has been released.',
                });
                loadData();
            }
        }
        catch {
            addToast({
                type: 'error',
                title: 'Cancellation failed',
                message: 'Could not cancel appointment.',
            });
        }
    };
    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">Doctor Appointments</h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Book consultations with certified medical specialists or manage scheduled visits.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1.5 bg-surface rounded-2xl border border-surface-border self-start md:self-auto shadow-sm">
          <button onClick={() => setActiveTab('browse')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'browse'
            ? 'bg-health-500 text-white shadow-soft'
            : 'text-ink-muted hover:text-ink-main'}`}>
            Find Doctors ({doctors.length})
          </button>
          <button onClick={() => setActiveTab('my-appointments')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'my-appointments'
            ? 'bg-health-500 text-white shadow-soft'
            : 'text-ink-muted hover:text-ink-main'}`}>
            My Appointments ({myAppointments.length})
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (<div className="space-y-6">
          {/* Search & Department Filters */}
          <div className="p-4 bg-surface rounded-3xl border border-surface-border shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by doctor, hospital, or specialty..." className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>

            {/* Department Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              <button onClick={() => setSelectedDepartment('All')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${selectedDepartment === 'All'
                ? 'bg-health-500 text-white border-health-600 shadow-sm'
                : 'bg-surface-muted text-ink-muted border-surface-border hover:bg-surface'}`}>
                All Departments
              </button>
              {departments.map((dept) => (<button key={dept.name} onClick={() => setSelectedDepartment(dept.name)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${selectedDepartment === dept.name
                    ? 'bg-health-500 text-white border-health-600 shadow-sm'
                    : 'bg-surface-muted text-ink-muted border-surface-border hover:bg-surface'}`}>
                  {dept.name}
                </button>))}
            </div>
          </div>

          {/* Doctor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (<div key={doctor.id} className="bg-surface rounded-3xl p-6 border border-surface-border shadow-soft hover:shadow-md hover:border-health-300 transition-all flex flex-col justify-between space-y-4 group">
                <div className="space-y-4">
                  {/* Top Doctor Row */}
                  <div className="flex items-start gap-4">
                    <img src={doctor.avatar} alt={doctor.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-health-200 shrink-0 group-hover:scale-105 transition-transform"/>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-sm text-ink-main">{doctor.name}</h3>
                        <UserCheck className="w-3.5 h-3.5 text-health-600"/>
                      </div>
                      <p className="text-xs font-medium text-health-700">{doctor.specialization}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-health-100 text-health-800">
                        {doctor.department}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">{doctor.bio}</p>

                  {/* Badges Info */}
                  <div className="space-y-1.5 pt-2 border-t border-surface-border text-xs text-ink-muted">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-health-600"/>
                        <span className="truncate max-w-[170px]">{doctor.hospital}</span>
                      </span>
                      <span className="font-bold text-ink-main flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500"/>
                        {doctor.rating} ({doctor.reviewCount})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-ink-muted">{doctor.experienceYears} Years Exp.</span>
                      <span className="font-extrabold text-xs text-health-800">
                        ${doctor.consultationFee} / session
                      </span>
                    </div>
                  </div>
                </div>

                {/* Book Button */}
                <button onClick={() => handleOpenBooking(doctor)} className="w-full py-2.5 rounded-2xl bg-health-500 hover:bg-health-600 text-white text-xs font-bold shadow-soft transition-all flex items-center justify-center gap-2">
                  <Calendar className="w-3.5 h-3.5"/>
                  <span>Book Appointment</span>
                </button>
              </div>))}
          </div>
        </div>) : (
        /* My Appointments Tab */
        <div className="space-y-4">
          {myAppointments.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myAppointments.map((apt) => (<div key={apt.id} className="bg-surface p-6 rounded-3xl border border-surface-border shadow-soft space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img src={apt.doctorAvatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80'} alt={apt.doctorName} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-health-200"/>
                      <div>
                        <h4 className="font-bold text-sm text-ink-main">{apt.doctorName}</h4>
                        <p className="text-xs text-ink-muted">{apt.doctorSpecialization}</p>
                        <span className="text-[10px] font-bold text-health-800 bg-health-100 px-2 py-0.5 rounded-md">
                          {apt.department}
                        </span>
                      </div>
                    </div>

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

                  <div className="p-3 rounded-2xl bg-surface-muted space-y-2 text-xs">
                    <div className="flex items-center justify-between font-semibold text-ink-main">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-health-600"/>
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-health-600"/>
                        {apt.timeSlot}
                      </span>
                    </div>
                    <p className="text-ink-muted">
                      <strong>Reason:</strong> {apt.reason}
                    </p>
                    {apt.notes && (<p className="text-health-800 font-medium bg-health-50 p-2 rounded-xl border border-health-200">
                        Doctor Note: {apt.notes}
                      </p>)}
                  </div>

                  {apt.status === 'confirmed' && (<div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
                      <button onClick={() => handleCancelAppointment(apt.id)} className="px-3 py-1.5 rounded-xl border border-red-200 text-status-danger hover:bg-red-50 text-xs font-semibold transition-colors">
                        Cancel Appointment
                      </button>
                    </div>)}
                </div>))}
            </div>) : (<div className="p-12 bg-surface rounded-3xl border border-surface-border text-center space-y-3">
              <Calendar className="w-10 h-10 text-health-500 mx-auto"/>
              <h3 className="font-bold text-sm text-ink-main">No appointments booked yet</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                Explore our catalog of certified doctors to schedule your consultation.
              </p>
              <button onClick={() => setActiveTab('browse')} className="px-4 py-2 bg-health-500 text-white rounded-xl text-xs font-bold">
                Browse Doctors
              </button>
            </div>)}
        </div>)}

      {/* Booking Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title={selectedDoctor ? `Book Consultation with ${selectedDoctor.name}` : 'Book Appointment'} subtitle={selectedDoctor ? `${selectedDoctor.specialization} • ${selectedDoctor.hospital}` : ''}>
        {selectedDoctor && (<form onSubmit={handleConfirmBooking} className="space-y-4">
            {/* Doctor summary */}
            <div className="flex items-center gap-3 p-3 bg-health-50 rounded-2xl border border-health-200">
              <img src={selectedDoctor.avatar} alt={selectedDoctor.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-health-200"/>
              <div>
                <h4 className="text-xs font-bold text-ink-main">{selectedDoctor.name}</h4>
                <p className="text-[11px] text-ink-muted">{selectedDoctor.qualification}</p>
                <p className="text-[11px] font-bold text-health-800">
                  Fee: ${selectedDoctor.consultationFee} • Available: {selectedDoctor.availableDays.join(', ')}
                </p>
              </div>
            </div>

            {/* Date picker */}
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Select Appointment Date</label>
              <input type="date" required min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>

            {/* Time Slot Chips */}
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Select Available Time Slot</label>
              <div className="grid grid-cols-3 gap-2">
                {selectedDoctor.availableTimeSlots.map((slot) => (<button key={slot} type="button" onClick={() => setSelectedTimeSlot(slot)} className={`py-2 rounded-xl text-xs font-bold border transition-all ${selectedTimeSlot === slot
                    ? 'bg-health-500 text-white border-health-600 shadow-sm'
                    : 'bg-surface-muted text-ink-muted border-surface-border hover:bg-surface'}`}>
                    {slot}
                  </button>))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Reason for Visit / Symptoms</label>
              <textarea required rows={3} value={bookingReason} onChange={(e) => setBookingReason(e.target.value)} placeholder="Describe why you are booking this appointment..." className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsBookingModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-ink-muted hover:bg-surface-muted">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-health-500 hover:bg-health-600 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-1.5 disabled:opacity-50">
                <CheckCircle2 className="w-4 h-4"/>
                <span>{isSubmitting ? 'Confirming...' : 'Confirm Appointment'}</span>
              </button>
            </div>
          </form>)}
      </Modal>
    </div>);
};
