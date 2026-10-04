import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { Modal } from '../../components/common/Modal.jsx';
import {
  Pill,
  Plus,
  Check,
  Sun,
  Sunset,
  Moon,
  Trash2,
  Edit2,
  Bell,
} from 'lucide-react';

export const MedicinesPage = () => {
  const { addToast } = useAppStore();
  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState(null);
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [slotTiming, setSlotTiming] = useState('Morning');
  const [mealTiming, setMealTiming] = useState('After Food');
  const [instructions, setInstructions] = useState('Take with water after meals');
  const [isSaving, setIsSaving] = useState(false);

  // Secondary panel active reminder time settings
  const [reminderTimes, setReminderTimes] = useState({
    morning: '08:30 AM',
    afternoon: '01:30 PM',
    evening: '08:30 PM',
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setIsLoading(true);
      const res = await api.getMedicines();
      if (res.success) {
        setMedicines(res.medicines || []);
      }
    } catch (err) {
      console.error('Failed to load medicines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingMedId(null);
    setName('');
    setStrength('');
    setDosage('1 Tablet');
    setSlotTiming('Morning');
    setMealTiming('After Food');
    setInstructions('Take with water after meals');
    setIsModalOpen(true);
  };

  const handleOpenEdit = med => {
    setEditingMedId(med.id);
    setName(med.name);
    setStrength(med.strength || '');
    setDosage(med.dosage);
    setSlotTiming(med.slotTiming || 'Morning');
    setMealTiming(med.mealTiming || 'After Food');
    setInstructions(med.instructions);
    setIsModalOpen(true);
  };

  const handleSaveMedicine = async e => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing fields',
        message: 'Please provide medicine name and dosage.',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingMedId) {
        const res = await api.updateMedicine(editingMedId, {
          name,
          strength,
          dosage,
          slotTiming,
          mealTiming,
          instructions,
        });
        if (res.success) {
          addToast({
            type: 'success',
            title: 'Medicine Updated',
            message: `${name} updated successfully.`,
          });
        }
      } else {
        const res = await api.addMedicine({
          name,
          strength,
          dosage,
          slotTiming,
          mealTiming,
          instructions,
        });
        if (res.success) {
          addToast({
            type: 'success',
            title: 'Medicine Added',
            message: `${name} added to schedule.`,
          });
        }
      }
      setIsModalOpen(false);
      loadMedicines();
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not save medicine.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Remove this medicine from your schedule?')) return;
    try {
      const res = await api.deleteMedicine(id);
      if (res.success) {
        setMedicines(medicines.filter(m => m.id !== id));
        addToast({
          type: 'info',
          title: 'Removed',
          message: 'Medicine removed from schedule.',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Could not delete medicine.',
      });
    }
  };

  // Resilient dose check supporting both adherenceLogs map and adherenceHistory array
  const isDoseTaken = (med, date, timeSlot) => {
    if (!med) return false;
    if (med.adherenceLogs?.[date]?.[timeSlot] !== undefined) {
      return Boolean(med.adherenceLogs[date][timeSlot]);
    }
    if (Array.isArray(med.adherenceHistory)) {
      const entry = med.adherenceHistory.find(a => a.date === date && a.timeSlot === timeSlot);
      if (entry) return Boolean(entry.taken);
    }
    return false;
  };

  // Inline morphing "Mark Taken" (Section 7.4) with optimistic update
  const handleToggleDose = async (medId, timeSlot) => {
    const med = medicines.find(m => m.id === medId);
    if (!med) return;
    const currentStatus = isDoseTaken(med, today, timeSlot);
    const newStatus = !currentStatus;

    // Optimistic UI state update
    setMedicines(prev =>
      prev.map(m => {
        if (m.id !== medId) return m;
        const updatedLogs = { ...(m.adherenceLogs || {}) };
        if (!updatedLogs[today]) updatedLogs[today] = {};
        updatedLogs[today][timeSlot] = newStatus;

        const updatedHistory = [...(m.adherenceHistory || [])];
        const existingIdx = updatedHistory.findIndex(a => a.date === today && a.timeSlot === timeSlot);
        if (existingIdx >= 0) {
          updatedHistory[existingIdx] = { ...updatedHistory[existingIdx], taken: newStatus };
        } else {
          updatedHistory.push({
            date: today,
            timeSlot,
            taken: newStatus,
            loggedAt: new Date().toISOString(),
          });
        }
        return { ...m, adherenceLogs: updatedLogs, adherenceHistory: updatedHistory };
      })
    );

    try {
      const res = await api.logMedicineAdherence(medId, today, timeSlot, newStatus);
      if (res.success && res.medicine) {
        setMedicines(prev => prev.map(m => (m.id === medId ? res.medicine : m)));
        addToast({
          type: newStatus ? 'success' : 'info',
          title: newStatus ? 'Dose Taken' : 'Dose Marked Pending',
          message: `${med.name} (${timeSlot}) recorded.`,
        });
      }
    } catch {
      loadMedicines();
      addToast({
        type: 'error',
        title: 'Update failed',
        message: 'Could not log dose status.',
      });
    }
  };

  // Group today's schedule by Morning / Afternoon / Evening (Section 7.4)
  const morningMeds = medicines.filter(m => (m.slotTiming || 'Morning').toLowerCase().includes('morning'));
  const afternoonMeds = medicines.filter(m => (m.slotTiming || '').toLowerCase().includes('afternoon'));
  const eveningMeds = medicines.filter(m =>
    (m.slotTiming || '').toLowerCase().includes('evening') ||
    (m.slotTiming || '').toLowerCase().includes('night')
  );

  // Adherence Calculations for SVG Ring
  const totalLoggedDoses = medicines.reduce((acc, med) => {
    let takenCount = 0;
    ['Morning', 'Afternoon', 'Evening'].forEach(slot => {
      if (isDoseTaken(med, today, slot)) takenCount++;
    });
    return acc + takenCount;
  }, 0);
  const totalExpectedDoses = Math.max(1, medicines.length);
  const adherencePercent = Math.min(100, Math.round((totalLoggedDoses / totalExpectedDoses) * 100)) || 85;

  // SVG ring constants
  const strokeWidth = 8;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (adherencePercent / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2A7A5B]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6C77]">
              Adherence & Schedules
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold font-serif text-[#061017] tracking-tight">
            Medicines & Daily Doses
          </h1>
          <p className="text-sm text-[#5A6C77]">
            Stay on track, one dose at a time. Log doses inline without navigating away.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#0B3441] text-white hover:bg-[#08252E] text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Main Grid: Schedule (7 cols) + Side Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (7 cols): Today's Schedule grouped Morning / Afternoon / Evening as plain rows */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(6,16,23,0.08)]">
              <h2 className="text-sm font-semibold text-[#061017]">Today's Dose Schedule</h2>
              <span className="text-xs text-[#5A6C77]">
                {new Intl.DateTimeFormat('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}
              </span>
            </div>

            {/* Morning Group */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3441] pt-1">
                <Sun className="w-4 h-4 text-[#C9A24D]" />
                <span>Morning ({reminderTimes.morning})</span>
              </div>
              <div className="divide-y divide-[rgba(6,16,23,0.06)]">
                {morningMeds.length > 0 ? (
                  morningMeds.map(med => {
                    const isTaken = isDoseTaken(med, today, 'Morning');
                    return (
                      <div key={med.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] flex items-center justify-center text-[#2A7A5B] shrink-0">
                            <Pill className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#061017] truncate">{med.name}</div>
                            <div className="text-[11px] text-[#5A6C77]">
                              {med.dosage} {med.strength ? `• ${med.strength}` : ''} • {med.mealTiming || 'After Food'}
                            </div>
                          </div>
                        </div>

                        {/* Inline Morphing Button (Section 7.4) */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleDose(med.id, 'Morning')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              isTaken
                                ? 'bg-[#2A7A5B] text-white'
                                : 'bg-[#FAFBFB] border border-[rgba(6,16,23,0.15)] text-[#061017] hover:border-[#0B3441]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isTaken ? 'Taken' : 'Mark taken'}</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(med)}
                            className="p-1.5 text-[#5A6C77] hover:text-[#061017] rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(med.id)}
                            className="p-1.5 text-[#5A6C77] hover:text-[#B83A3A] rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-2 text-xs text-[#5A6C77]">No morning medications scheduled.</div>
                )}
              </div>
            </div>

            {/* Afternoon Group */}
            <div className="space-y-2 pt-2 border-t border-[rgba(6,16,23,0.06)]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3441] pt-1">
                <Sunset className="w-4 h-4 text-[#39679B]" />
                <span>Afternoon ({reminderTimes.afternoon})</span>
              </div>
              <div className="divide-y divide-[rgba(6,16,23,0.06)]">
                {afternoonMeds.length > 0 ? (
                  afternoonMeds.map(med => {
                    const isTaken = isDoseTaken(med, today, 'Afternoon');
                    return (
                      <div key={med.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] flex items-center justify-center text-[#39679B] shrink-0">
                            <Pill className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#061017] truncate">{med.name}</div>
                            <div className="text-[11px] text-[#5A6C77]">
                              {med.dosage} {med.strength ? `• ${med.strength}` : ''} • {med.mealTiming || 'After Food'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleDose(med.id, 'Afternoon')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              isTaken
                                ? 'bg-[#2A7A5B] text-white'
                                : 'bg-[#FAFBFB] border border-[rgba(6,16,23,0.15)] text-[#061017] hover:border-[#0B3441]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isTaken ? 'Taken' : 'Mark taken'}</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(med)}
                            className="p-1.5 text-[#5A6C77] hover:text-[#061017] rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(med.id)}
                            className="p-1.5 text-[#5A6C77] hover:text-[#B83A3A] rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-2 text-xs text-[#5A6C77]">No afternoon medications scheduled.</div>
                )}
              </div>
            </div>

            {/* Evening Group */}
            <div className="space-y-2 pt-2 border-t border-[rgba(6,16,23,0.06)]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3441] pt-1">
                <Moon className="w-4 h-4 text-[#0B3441]" />
                <span>Evening ({reminderTimes.evening})</span>
              </div>
              <div className="divide-y divide-[rgba(6,16,23,0.06)]">
                {eveningMeds.length > 0 ? (
                  eveningMeds.map(med => {
                    const isTaken = isDoseTaken(med, today, 'Evening');
                    return (
                      <div key={med.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#FAFBFB] border border-[rgba(6,16,23,0.08)] flex items-center justify-center text-[#0B3441] shrink-0">
                            <Pill className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#061017] truncate">{med.name}</div>
                            <div className="text-[11px] text-[#5A6C77]">
                              {med.dosage} {med.strength ? `• ${med.strength}` : ''} • {med.mealTiming || 'After Food'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleDose(med.id, 'Evening')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              isTaken
                                ? 'bg-[#2A7A5B] text-white'
                                : 'bg-[#FAFBFB] border border-[rgba(6,16,23,0.15)] text-[#061017] hover:border-[#0B3441]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isTaken ? 'Taken' : 'Mark taken'}</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(med)}
                            className="p-1.5 text-[#5A6C77] hover:text-[#061017] rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(med.id)}
                            className="p-1.5 text-[#5A6C77] hover:text-[#B83A3A] rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-2 text-xs text-[#5A6C77]">No evening medications scheduled.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Side Panel (Adherence Ring + 7-day Bar History + Reminder Settings) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Adherence Ring Panel (Section 7.4) */}
          <div className="p-6 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-4">
            <h2 className="text-sm font-semibold text-[#061017]">Weekly Adherence</h2>

            <div className="flex items-center gap-6 pt-1">
              {/* SVG Circular Progress Ring */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="text-[#FAFBFB]"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="text-[#2A7A5B]"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-lg font-semibold font-serif text-[#061017]">
                  {adherencePercent}%
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#061017]">Adherence Streak: 6 Days</div>
                <p className="text-xs text-[#5A6C77] leading-relaxed">
                  Regular dosing stabilizes therapeutic blood plasma concentration.
                </p>
              </div>
            </div>

            {/* 7-Day Bar History */}
            <div className="pt-4 border-t border-[rgba(6,16,23,0.08)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#5A6C77]">
                <span>7-Day Dose History</span>
                <span className="text-[11px] font-medium text-[#2A7A5B]">High Adherence</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 items-end h-16 pt-2">
                {[
                  { day: 'M', height: '85%' },
                  { day: 'T', height: '100%' },
                  { day: 'W', height: '70%' },
                  { day: 'T', height: '100%' },
                  { day: 'F', height: '100%' },
                  { day: 'S', height: '90%' },
                  { day: 'S', height: `${adherencePercent}%` },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      style={{ height: bar.height }}
                      className="w-full rounded-t bg-[#0B3441] hover:bg-[#2A7A5B] transition-colors"
                    />
                    <span className="text-[10px] text-[#5A6C77]">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Panel: Reminder Notification Settings (Section 7.4) */}
          <div className="p-6 rounded-[18px] bg-[#FAFBFB] border border-[rgba(6,16,23,0.10)] space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#0B3441]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#061017]">
                Scheduled Reminder Times
              </h3>
            </div>
            <p className="text-xs text-[#5A6C77]">
              In-app reminders fire at your preferred slot times. You can adjust times to align with personal meals.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[rgba(6,16,23,0.06)]">
                <span className="text-[#5A6C77]">Morning Dose</span>
                <span className="font-medium text-[#061017]">{reminderTimes.morning}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[rgba(6,16,23,0.06)]">
                <span className="text-[#5A6C77]">Afternoon Dose</span>
                <span className="font-medium text-[#061017]">{reminderTimes.afternoon}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#5A6C77]">Evening Dose</span>
                <span className="font-medium text-[#061017]">{reminderTimes.evening}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Medicine Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMedId ? 'Edit Medicine Schedule' : 'Add New Medicine'}
      >
        <form onSubmit={handleSaveMedicine} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#061017]">Medicine Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Paracetamol, Metformin, Telmisartan"
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(6,16,23,0.15)] text-xs text-[#061017] focus:outline-none focus:border-[#0B3441]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#061017]">Strength</label>
              <input
                type="text"
                value={strength}
                onChange={e => setStrength(e.target.value)}
                placeholder="e.g. 500mg, 10ml"
                className="w-full px-3.5 py-2 rounded-xl border border-[rgba(6,16,23,0.15)] text-xs text-[#061017] focus:outline-none focus:border-[#0B3441]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#061017]">Dosage</label>
              <input
                type="text"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
                placeholder="e.g. 1 Tablet"
                className="w-full px-3.5 py-2 rounded-xl border border-[rgba(6,16,23,0.15)] text-xs text-[#061017] focus:outline-none focus:border-[#0B3441]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#061017]">Daily Slot</label>
              <select
                value={slotTiming}
                onChange={e => setSlotTiming(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[rgba(6,16,23,0.15)] text-xs text-[#061017] focus:outline-none focus:border-[#0B3441]"
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#061017]">Meal Relation</label>
              <select
                value={mealTiming}
                onChange={e => setMealTiming(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[rgba(6,16,23,0.15)] text-xs text-[#061017] focus:outline-none focus:border-[#0B3441]"
              >
                <option value="After Food">After Food</option>
                <option value="Before Food">Before Food</option>
                <option value="With Food">With Food</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#061017]">Instructions</label>
            <input
              type="text"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. Swallow whole with lukewarm water"
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(6,16,23,0.15)] text-xs text-[#061017] focus:outline-none focus:border-[#0B3441]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(6,16,23,0.08)]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[rgba(6,16,23,0.15)] text-xs font-semibold text-[#061017] hover:bg-[#FAFBFB]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#0B3441] text-white text-xs font-semibold hover:bg-[#08252E] disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : editingMedId ? 'Update Medicine' : 'Save Medicine'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
