import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { Modal } from '../../components/common/Modal.jsx';
import {
    Pill,
    Plus,
    Clock,
    CheckCircle2,
    Trash2,
    Edit2,
    Sun,
    Sunset,
    Moon,
    Check,
    Bot,
    Sparkles,
    Calendar,
    Award,
    Activity,
    Info,
    ChevronRight,
} from 'lucide-react';

export const MedicinesPage = () => {
    const { addToast } = useAppStore();
    const [medicines, setMedicines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State for Add / Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMedId, setEditingMedId] = useState(null);
    const [name, setName] = useState('');
    const [strength, setStrength] = useState('');
    const [dosage, setDosage] = useState('1 Tablet');
    const [slotTiming, setSlotTiming] = useState('Morning');
    const [mealTiming, setMealTiming] = useState('After Food');
    const [instructions, setInstructions] = useState('Take with water after meals');
    const [isSaving, setIsSaving] = useState(false);

    // Education / Info Slide-out modal
    const [infoMed, setInfoMed] = useState(null);

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

    const handleOpenEdit = (med) => {
        setEditingMedId(med.id);
        setName(med.name);
        setStrength(med.strength || '');
        setDosage(med.dosage);
        setSlotTiming(med.slotTiming || 'Morning');
        setMealTiming(med.mealTiming || 'After Food');
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
                        title: 'Medicine Added 🎉',
                        message: `Reminder set for ${name}.`,
                    });
                }
            }
            setIsModalOpen(false);
            loadMedicines();
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Save failed',
                message: err.message || 'Could not save medicine.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id, medName) => {
        if (!window.confirm(`Delete reminder for ${medName}?`)) return;
        try {
            const res = await api.deleteMedicine(id);
            if (res.success) {
                setMedicines(prev => prev.filter(m => m.id !== id));
                addToast({
                    type: 'info',
                    title: 'Reminder Removed',
                    message: `${medName} deleted.`,
                });
            }
        } catch {
            addToast({
                type: 'error',
                title: 'Delete failed',
                message: 'Could not remove medicine.',
            });
        }
    };

    const handleToggleTaken = async (medId, timeSlot, currentStatus) => {
        const newStatus = !currentStatus;
        try {
            const res = await api.logMedicineAdherence(medId, today, timeSlot, newStatus);
            if (res.success) {
                setMedicines(prev => prev.map(m => (m.id === medId ? res.medicine : m)));
                addToast({
                    type: newStatus ? 'success' : 'info',
                    title: newStatus ? 'Dose Logged as Taken ✨' : 'Dose Marked as Pending',
                    message: `${res.medicine.name} (${timeSlot}) recorded.`,
                });
            }
        } catch {
            addToast({
                type: 'error',
                title: 'Update failed',
                message: 'Could not log medication adherence.',
            });
        }
    };

    // Calculate adherence stats
    const totalDosesToday = medicines.length;
    const takenDosesToday = medicines.reduce((acc, med) => {
        const logs = med.adherenceLogs?.[today] || {};
        return acc + (Object.values(logs).some(Boolean) ? 1 : 0);
    }, 0);
    const adherencePercent = totalDosesToday > 0 ? Math.round((takenDosesToday / totalDosesToday) * 100) : 100;

    // Filter by slots
    const morningMeds = medicines.filter(m => !m.slotTiming || m.slotTiming === 'Morning');
    const afternoonMeds = medicines.filter(m => m.slotTiming === 'Afternoon');
    const eveningMeds = medicines.filter(m => m.slotTiming === 'Evening' || m.slotTiming === 'Night');

    const renderMedCard = (med, defaultSlot) => {
        const slot = med.slotTiming || defaultSlot;
        const isTaken = Boolean(med.adherenceLogs?.[today]?.[slot] || med.adherenceLogs?.[today]?.Morning);

        return (
            <div
                key={med.id}
                className="p-5 rounded-2xl bg-surface border border-surface-border shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-soft-lg transition-all"
            >
                <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isTaken ? 'bg-status-success text-white' : 'bg-accent-light text-accent-dark'
                    }`}>
                        <Pill className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-ink-main truncate">{med.name}</h4>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-surface-muted text-ink-muted border border-surface-border">
                                {med.dosage}
                            </span>
                        </div>
                        <p className="text-xs text-ink-muted leading-relaxed">
                            {med.instructions || 'Take after meal with water'} &bull; <span className="font-semibold text-health-700">{med.mealTiming || 'After Food'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {/* Ask AI shortcut */}
                    <Link
                        to={`/ai-assistant?query=${encodeURIComponent(`Explain dosage, side effects, and precautions for ${med.name} (${med.dosage})`)}`}
                        className="p-2 rounded-xl text-ink-muted hover:text-health-700 hover:bg-health-50 transition-colors"
                        title="Ask AI about this medication"
                    >
                        <Bot className="w-4 h-4" />
                    </Link>

                    {/* Edit button */}
                    <button
                        type="button"
                        onClick={() => handleOpenEdit(med)}
                        className="p-2 rounded-xl text-ink-muted hover:text-health-700 hover:bg-health-50 transition-colors"
                        title="Edit medicine"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                        type="button"
                        onClick={() => handleDelete(med.id, med.name)}
                        className="p-2 rounded-xl text-ink-muted hover:text-status-danger hover:bg-red-50 transition-colors"
                        title="Delete reminder"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Morphing Mark-Taken CTA */}
                    <button
                        type="button"
                        onClick={() => handleToggleTaken(med.id, slot, isTaken)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                            isTaken
                                ? 'bg-status-success text-white shadow-soft ring-2 ring-status-success/30'
                                : 'bg-health-700 hover:bg-health-800 text-white shadow-soft'
                        }`}
                    >
                        {isTaken ? (
                            <>
                                <Check className="w-3.5 h-3.5 animate-scaleIn" />
                                <span>Taken</span>
                            </>
                        ) : (
                            <span>Mark Taken</span>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
            {/* Header with Add CTA */}
            <div className="p-6 sm:p-8 rounded-3xl bg-health-700 text-white shadow-luxury relative overflow-hidden border border-health-600">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-health-100 text-xs font-semibold backdrop-blur-md">
                            <Pill className="w-3.5 h-3.5 text-accent" />
                            <span>Medication Schedule & Adherence</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
                            Stay on track, one dose at a time.
                        </h1>
                        <p className="text-xs text-health-100/90 max-w-xl leading-relaxed">
                            Organize your daily medication timeline, log your taken doses, and understand potential side-effects with AI guidance.
                        </p>
                    </div>

                    <button
                        onClick={handleOpenAdd}
                        className="px-5 py-3 rounded-2xl bg-white text-health-800 hover:bg-health-50 text-xs font-extrabold shadow-soft transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4 text-health-700" />
                        <span>Add New Medicine</span>
                    </button>
                </div>
            </div>

            {/* Adherence Score Ring & Weekly Insight Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 7-Day Adherence Visual Ring */}
                <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft flex items-center gap-5">
                    <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-surface-border"
                                strokeWidth="3.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-status-success transition-all duration-1000 ease-out"
                                strokeDasharray={`${adherencePercent}, 100`}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-sm font-extrabold text-ink-main">{adherencePercent}%</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Today's Adherence</span>
                        <h3 className="text-sm font-bold text-ink-main">
                            {takenDosesToday} of {totalDosesToday} doses taken
                        </h3>
                        <p className="text-[11px] text-status-success font-semibold">
                            {adherencePercent >= 80 ? 'Excellent adherence streak!' : 'Doses scheduled for today'}
                        </p>
                    </div>
                </div>

                {/* 7-Day Calendar Streak */}
                <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
                        <span>7-Day Adherence History</span>
                        <Award className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex items-center justify-between gap-1 pt-1">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'].map((day, i) => (
                            <div key={day} className="flex flex-col items-center gap-1.5">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold ${
                                    i === 6
                                        ? takenDosesToday > 0 ? 'bg-status-success text-white shadow-soft' : 'bg-accent-light text-accent-dark'
                                        : 'bg-health-50 text-health-700'
                                }`}>
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[9px] font-semibold text-ink-muted">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Interaction Check */}
                <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-health-700">
                            <Sparkles className="w-4 h-4 text-accent" />
                            <span>AI Drug Interaction Safety</span>
                        </div>
                        <p className="text-xs text-ink-muted leading-relaxed">
                            Have questions about taking your medications together? Ask MediGuide AI for guidance.
                        </p>
                    </div>
                    <Link
                        to={`/ai-assistant?query=${encodeURIComponent(`Check for drug interactions between: ${medicines.map(m => m.name).join(', ')}`)}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-health-700 hover:underline pt-1"
                    >
                        <span>Check Drug Interactions</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Timeline Sections: Morning / Afternoon / Evening */}
            <div className="space-y-6">
                {/* Morning Slot */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink-main">
                        <div className="w-7 h-7 rounded-xl bg-accent-light text-accent-dark flex items-center justify-center">
                            <Sun className="w-4 h-4" />
                        </div>
                        <span>Morning (08:00 AM &ndash; 12:00 PM)</span>
                    </div>

                    {morningMeds.length > 0 ? (
                        <div className="space-y-2.5">
                            {morningMeds.map(m => renderMedCard(m, 'Morning'))}
                        </div>
                    ) : (
                        <div className="p-4 rounded-2xl bg-surface-muted border border-surface-border text-xs text-ink-muted text-center">
                            No morning medications scheduled.
                        </div>
                    )}
                </div>

                {/* Afternoon Slot */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink-main">
                        <div className="w-7 h-7 rounded-xl bg-skydata-100 text-skydata-dark flex items-center justify-center">
                            <Sunset className="w-4 h-4" />
                        </div>
                        <span>Afternoon (01:00 PM &ndash; 04:00 PM)</span>
                    </div>

                    {afternoonMeds.length > 0 ? (
                        <div className="space-y-2.5">
                            {afternoonMeds.map(m => renderMedCard(m, 'Afternoon'))}
                        </div>
                    ) : (
                        <div className="p-4 rounded-2xl bg-surface-muted border border-surface-border text-xs text-ink-muted text-center">
                            No afternoon medications scheduled.
                        </div>
                    )}
                </div>

                {/* Evening / Night Slot */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink-main">
                        <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                            <Moon className="w-4 h-4" />
                        </div>
                        <span>Evening & Night (07:00 PM &ndash; 10:00 PM)</span>
                    </div>

                    {eveningMeds.length > 0 ? (
                        <div className="space-y-2.5">
                            {eveningMeds.map(m => renderMedCard(m, 'Evening'))}
                        </div>
                    ) : (
                        <div className="p-4 rounded-2xl bg-surface-muted border border-surface-border text-xs text-ink-muted text-center">
                            No evening medications scheduled.
                        </div>
                    )}
                </div>
            </div>

            {/* Add / Edit Medicine Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingMedId ? 'Edit Medication Reminder' : 'Add Medication Reminder'}
                subtitle="Configure schedule, dosage, and meal instructions."
            >
                <form onSubmit={handleSaveMedicine} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-ink-main mb-1">Medicine Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Amlodipine, Metformin, Paracetamol"
                            className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-ink-main mb-1">Dosage</label>
                            <input
                                type="text"
                                required
                                value={dosage}
                                onChange={(e) => setDosage(e.target.value)}
                                placeholder="e.g. 1 Tablet, 500mg, 5ml"
                                className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-ink-main mb-1">Time Slot</label>
                            <select
                                value={slotTiming}
                                onChange={(e) => setSlotTiming(e.target.value)}
                                className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
                            >
                                <option value="Morning">Morning (8:00 AM)</option>
                                <option value="Afternoon">Afternoon (1:00 PM)</option>
                                <option value="Evening">Evening (8:00 PM)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-ink-main mb-1">Meal Relation</label>
                        <select
                            value={mealTiming}
                            onChange={(e) => setMealTiming(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
                        >
                            <option value="After Food">After Food</option>
                            <option value="Before Food">Before Food</option>
                            <option value="With Food">With Food</option>
                            <option value="Empty Stomach">Empty Stomach</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-ink-main mb-1">Instructions</label>
                        <input
                            type="text"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="e.g. Take with a full glass of water after breakfast"
                            className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
                        />
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-ink-muted hover:bg-surface-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-2.5 rounded-xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            <span>{isSaving ? 'Saving...' : 'Save Reminder'}</span>
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
