import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import {
  Clock,
  Calendar,
  Save,
} from 'lucide-react';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS_SAMPLE = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '06:00 PM',
];

export const DoctorSchedulePage = () => {
  const { addToast } = useAppStore();

  const [availableDays, setAvailableDays] = useState([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([
    '09:00 AM',
    '10:30 AM',
    '02:00 PM',
    '04:30 PM',
  ]);
  const [workingHours, setWorkingHours] = useState('09:00 AM - 06:00 PM');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(30);
  const [consultationModes, setConsultationModes] = useState(['In-Person', 'Online Video']);
  const [consultationFee, setConsultationFee] = useState(750);
  const [isAvailable, setIsAvailable] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setIsLoading(true);
      const res = await api.getDoctorSchedule();
      if (res.success && res.schedule) {
        const s = res.schedule;
        setAvailableDays(
          s.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        );
        setAvailableTimeSlots(
          s.availableTimeSlots || ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']
        );
        setWorkingHours(s.workingHours || '09:00 AM - 06:00 PM');
        setSlotDurationMinutes(s.slotDurationMinutes || 30);
        setConsultationModes(s.consultationModes || ['In-Person', 'Online Video']);
        setConsultationFee(s.consultationFee || 750);
        setIsAvailable(s.isAvailable !== false);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = day => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const toggleSlot = slot => {
    if (availableTimeSlots.includes(slot)) {
      setAvailableTimeSlots(availableTimeSlots.filter(s => s !== slot));
    } else {
      setAvailableTimeSlots([...availableTimeSlots, slot]);
    }
  };

  const toggleMode = mode => {
    if (consultationModes.includes(mode)) {
      if (consultationModes.length === 1) {
        addToast({
          type: 'warning',
          title: 'At least one mode required',
          message: 'You must provide at least one consultation mode.',
        });
        return;
      }
      setConsultationModes(consultationModes.filter(m => m !== mode));
    } else {
      setConsultationModes([...consultationModes, mode]);
    }
  };

  const handleSaveSchedule = async e => {
    e.preventDefault();
    if (availableDays.length === 0 || availableTimeSlots.length === 0) {
      addToast({
        type: 'warning',
        title: 'Incomplete Schedule',
        message: 'Please select at least one working day and one time slot.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.updateDoctorSchedule({
        availableDays,
        availableTimeSlots,
        workingHours,
        slotDurationMinutes: Number(slotDurationMinutes),
        consultationModes,
        consultationFee: Number(consultationFee),
        isAvailable,
      });

      if (res.success) {
        addToast({
          type: 'success',
          title: 'Schedule Updated',
          message: 'Your consultation availability and pricing have been saved in IST.',
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not update schedule.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-100 text-health-800 text-xs font-semibold mb-2">
          <Clock className="w-3.5 h-3.5 text-health-600" />
          <span>Practice Management &bull; IST Schedule</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">
          Consultation Schedule & Slots
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted">
          Configure your working days, consultation slot duration, in-person and video modes, and
          consultation fee in Indian Rupees (₹).
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-health-200 border-t-health-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-ink-muted">Loading your schedule...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveSchedule} className="space-y-6">
          {/* Status Banner */}
          <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink-main">Accepting Patient Bookings</h3>
              <p className="text-xs text-ink-muted">
                When active, patients can discover and schedule slots on your calendar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                isAvailable
                  ? 'bg-emerald-600 text-white shadow-soft'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              <span>{isAvailable ? 'Online & Available' : 'On Leave / Offline'}</span>
            </button>
          </div>

          {/* Working Days */}
          <div className="bg-surface p-6 rounded-3xl border border-surface-border shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-ink-main flex items-center gap-2">
              <Calendar className="w-4 h-4 text-health-600" />
              Consultation Working Days
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {ALL_DAYS.map(day => {
                const active = availableDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border text-center transition-all ${
                      active
                        ? 'bg-health-600 border-health-600 text-white shadow-soft'
                        : 'border-surface-border text-ink-muted hover:bg-surface-muted'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Available Time Slots */}
          <div className="bg-surface p-6 rounded-3xl border border-surface-border shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink-main flex items-center gap-2">
                <Clock className="w-4 h-4 text-health-600" />
                Available Time Slots (Asia/Kolkata IST)
              </h3>
              <span className="text-xs font-bold text-health-700 bg-health-50 px-2.5 py-0.5 rounded-full">
                {availableTimeSlots.length} Slots Selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {TIME_SLOTS_SAMPLE.map(slot => {
                const active = availableTimeSlots.includes(slot);
                return (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => toggleSlot(slot)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border text-center transition-all ${
                      active
                        ? 'bg-health-600 border-health-600 text-white shadow-sm'
                        : 'border-surface-border text-ink-main hover:bg-health-50'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modes, Duration & Pricing */}
          <div className="bg-surface p-6 rounded-3xl border border-surface-border shadow-soft grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            {/* Modes */}
            <div>
              <label className="block font-bold text-ink-main mb-2">Consultation Modes</label>
              <div className="space-y-2 font-semibold">
                {['In-Person', 'Online Video'].map(mode => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consultationModes.includes(mode)}
                      onChange={() => toggleMode(mode)}
                      className="rounded accent-health-600 w-4 h-4"
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block font-bold text-ink-main mb-1.5">Slot Duration</label>
              <select
                value={slotDurationMinutes}
                onChange={e => setSlotDurationMinutes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-bold focus:outline-none focus:border-health-400"
              >
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes (Standard)</option>
                <option value={45}>45 Minutes (Extended)</option>
              </select>
            </div>

            {/* Fee */}
            <div>
              <label className="block font-bold text-ink-main mb-1.5">
                Consultation Fee (₹ INR)
              </label>
              <input
                type="number"
                min="200"
                max="5000"
                step="50"
                value={consultationFee}
                onChange={e => setConsultationFee(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-bold text-health-800 text-sm focus:outline-none focus:border-health-400"
                required
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3.5 bg-health-500 hover:bg-health-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-soft transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Practice Schedule'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
