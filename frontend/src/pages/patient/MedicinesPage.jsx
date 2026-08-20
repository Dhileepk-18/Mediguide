import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { Modal } from '../../components/common/Modal.jsx';
import { Pill, Plus, Clock, CheckCircle2, Trash2, Edit2, Flame, Award, } from 'lucide-react';
export const MedicinesPage = () => {
    const { addToast } = useAppStore();
    const [medicines, setMedicines] = useState([]);
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMedId, setEditingMedId] = useState(null);
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('Once daily');
    const [timings, setTimings] = useState(['08:00 AM']);
    const [instructions, setInstructions] = useState('Take with a glass of water after food');
    const [isSaving, setIsSaving] = useState(false);
    const today = new Date().toISOString().split('T')[0];
    useEffect(() => {
        loadMedicines();
    }, []);
    const loadMedicines = async () => {
        try {
            const res = await api.getMedicines();
            if (res.success) {
                setMedicines(res.medicines);
            }
        }
        catch (err) {
            console.error('Failed to load medicines:', err);
        }
    };
    const handleOpenAdd = () => {
        setEditingMedId(null);
        setName('');
        setDosage('');
        setFrequency('Once daily');
        setTimings(['08:00 AM']);
        setInstructions('Take with a glass of water after meals');
        setIsModalOpen(true);
    };
    const handleOpenEdit = (med) => {
        setEditingMedId(med.id);
        setName(med.name);
        setDosage(med.dosage);
        setFrequency(med.frequency);
        setTimings(med.timings);
        setInstructions(med.instructions);
        setIsModalOpen(true);
    };
    const handleSaveMedicine = async (e) => {
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
                    dosage,
                    frequency,
                    timings,
                    instructions,
                });
                if (res.success) {
                    addToast({
                        type: 'success',
                        title: 'Medicine Updated',
                        message: `${name} updated successfully.`,
                    });
                }
            }
            else {
                const res = await api.addMedicine({
                    name,
                    dosage,
                    frequency,
                    timings,
                    instructions,
                });
                if (res.success) {
                    addToast({
                        type: 'success',
                        title: 'Medicine Added 🎉',
                        message: `Reminder set for ${name} (${dosage}).`,
                    });
                }
            }
            setIsModalOpen(false);
            loadMedicines();
        }
        catch (err) {
            addToast({
                type: 'error',
                title: 'Save failed',
                message: err.message || 'Could not save medicine.',
            });
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleDeleteMedicine = async (id, medName) => {
        if (!window.confirm(`Delete reminder for ${medName}?`))
            return;
        try {
            const res = await api.deleteMedicine(id);
            if (res.success) {
                addToast({
                    type: 'info',
                    title: 'Medicine Removed',
                    message: `${medName} removed from reminders.`,
                });
                setMedicines((prev) => prev.filter((m) => m.id !== id));
            }
        }
        catch {
            addToast({
                type: 'error',
                title: 'Delete failed',
                message: 'Could not delete medicine reminder.',
            });
        }
    };
    const handleToggleDose = async (med, timeSlot) => {
        const adherenceEntry = med.adherenceHistory.find((a) => a.date === today && a.timeSlot === timeSlot);
        const newStatus = !adherenceEntry?.taken;
        try {
            const res = await api.logMedicineAdherence(med.id, today, timeSlot, newStatus);
            if (res.success) {
                setMedicines((prev) => prev.map((m) => (m.id === med.id ? res.medicine : m)));
                addToast({
                    type: newStatus ? 'success' : 'info',
                    title: newStatus ? 'Dose Logged as Taken! ✓' : 'Dose Marked Pending',
                    message: `${med.name} (${timeSlot}) recorded.`,
                });
            }
        }
        catch {
            addToast({
                type: 'error',
                title: 'Logging error',
                message: 'Failed to record adherence.',
            });
        }
    };
    // Calculate stats
    let totalDosesToday = 0;
    let takenDosesToday = 0;
    medicines.forEach((m) => {
        m.timings.forEach((slot) => {
            totalDosesToday++;
            const entry = m.adherenceHistory.find((a) => a.date === today && a.timeSlot === slot);
            if (entry?.taken)
                takenDosesToday++;
        });
    });
    const adherencePercentage = totalDosesToday > 0 ? Math.round((takenDosesToday / totalDosesToday) * 100) : (medicines.length > 0 ? 100 : 0);
    const activeStreak = medicines.reduce((max, m) => {
        const loggedDays = new Set(m.adherenceHistory.filter(h => h.taken).map(h => h.date)).size;
        return Math.max(max, loggedDays);
    }, 0);
    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Adherence Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">Medicine Reminders</h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Track daily medications, dosage schedules, and maintain high adherence streaks.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="px-5 py-2.5 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-4 h-4"/>
          <span>Add Medicine Reminder</span>
        </button>
      </div>

      {/* Adherence Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6"/>
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted">Today's Adherence</div>
            <div className="text-2xl font-extrabold text-health-900">{adherencePercentage}%</div>
            <div className="text-[11px] text-ink-muted">
              {takenDosesToday} of {totalDosesToday} doses taken today
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6"/>
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted">Current Streak</div>
            <div className="text-2xl font-extrabold text-ink-main">{activeStreak} {activeStreak === 1 ? 'Day' : 'Days'} Active</div>
            <div className="text-[11px] text-amber-700 font-semibold">{activeStreak > 0 ? 'Keep it up! 🔥' : 'Log doses to build streak'}</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-mint-light text-health-800 flex items-center justify-center shrink-0">
            <Pill className="w-6 h-6 text-health-600"/>
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted">Total Prescriptions</div>
            <div className="text-2xl font-extrabold text-ink-main">{medicines.length} Tracked</div>
            <div className="text-[11px] text-health-700 font-semibold">Active Schedules</div>
          </div>
        </div>
      </div>

      {/* Medicines List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-ink-main">Your Medication Schedule</h2>

        {medicines.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((med) => (<div key={med.id} className="bg-surface rounded-3xl p-6 border border-surface-border shadow-soft flex flex-col justify-between space-y-4 hover:border-health-300 transition-all group">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center shrink-0">
                        <Pill className="w-5 h-5"/>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-ink-main">{med.name}</h3>
                        <p className="text-xs text-health-700 font-semibold">{med.dosage}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEdit(med)} className="p-1.5 rounded-lg text-ink-muted hover:text-health-700 hover:bg-health-50" title="Edit Reminder">
                        <Edit2 className="w-3.5 h-3.5"/>
                      </button>
                      <button onClick={() => handleDeleteMedicine(med.id, med.name)} className="p-1.5 rounded-lg text-ink-muted hover:text-status-danger hover:bg-red-50" title="Delete Reminder">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-muted rounded-2xl space-y-1.5 text-xs text-ink-muted">
                    <div className="flex items-center justify-between">
                      <span>Frequency:</span>
                      <span className="font-bold text-ink-main">{med.frequency}</span>
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      <strong>Instructions:</strong> {med.instructions}
                    </div>
                  </div>

                  {/* Dose Checkers */}
                  <div className="space-y-2 pt-2 border-t border-surface-border">
                    <span className="text-[11px] font-bold text-ink-main block">
                      Today's Dose Check-in:
                    </span>
                    <div className="space-y-1.5">
                      {med.timings.map((slot) => {
                    const entry = med.adherenceHistory.find((a) => a.date === today && a.timeSlot === slot);
                    const isTaken = Boolean(entry?.taken);
                    return (<div key={slot} className="flex items-center justify-between p-2 rounded-xl bg-surface-muted/60 border border-surface-border text-xs">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-health-600"/>
                              <span className="font-medium text-ink-main">{slot}</span>
                            </div>
                            <button onClick={() => handleToggleDose(med, slot)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${isTaken
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-surface hover:bg-health-100 border border-surface-border text-ink-muted'}`}>
                              {isTaken ? (<>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600"/>
                                  <span>Taken ✓</span>
                                </>) : (<>
                                  <Plus className="w-3.5 h-3.5"/>
                                  <span>Mark Taken</span>
                                </>)}
                            </button>
                          </div>);
                })}
                    </div>
                  </div>
                </div>
              </div>))}
          </div>) : (<div className="p-12 bg-surface rounded-3xl border border-surface-border text-center space-y-3">
            <Pill className="w-10 h-10 text-health-500 mx-auto"/>
            <h3 className="font-bold text-sm text-ink-main">No medication reminders</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              Add your daily prescription medications to receive automated adherence prompts.
            </p>
            <button onClick={handleOpenAdd} className="px-4 py-2 bg-health-500 text-white rounded-xl text-xs font-bold">
              Add First Medicine
            </button>
          </div>)}
      </div>

      {/* Add / Edit Medicine Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMedId ? 'Edit Medicine Reminder' : 'Add New Medicine Reminder'} subtitle="Specify dosage and reminder schedule.">
        <form onSubmit={handleSaveMedicine} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-main mb-1.5">Medicine Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amoxicillin, Cetirizine, Vitamin D3" className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Dosage</label>
              <input type="text" required value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 500 mg, 10 ml" className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Frequency</label>
              <select value={frequency} onChange={(e) => {
            setFrequency(e.target.value);
            if (e.target.value.includes('Twice')) {
                setTimings(['09:00 AM', '09:00 PM']);
            }
            else if (e.target.value.includes('Three')) {
                setTimings(['08:00 AM', '02:00 PM', '08:00 PM']);
            }
            else {
                setTimings(['08:00 AM']);
            }
        }} className="w-full px-3 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400">
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="As needed">As needed (SOS)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-main mb-1.5">Reminder Timings</label>
            <div className="flex flex-wrap gap-2">
              {timings.map((t, idx) => (<input key={idx} type="text" value={t} onChange={(e) => {
                const newTimings = [...timings];
                newTimings[idx] = e.target.value;
                setTimings(newTimings);
            }} className="w-28 px-3 py-1.5 text-xs bg-surface-muted rounded-lg border border-surface-border"/>))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-main mb-1.5">Instructions</label>
            <textarea rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. Take after breakfast with water..." className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-ink-muted hover:bg-surface-muted">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="flex-1 py-2.5 rounded-xl bg-health-500 hover:bg-health-600 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-1.5 disabled:opacity-50">
              <span>{isSaving ? 'Saving...' : 'Save Reminder'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>);
};
