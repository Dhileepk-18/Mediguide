import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { Modal } from '../../components/common/Modal.jsx';
import {
    FileCheck2,
    Plus,
    Trash2,
    Printer,
    Pill,
    Calendar,
    Building2,
    UserCheck,
    QrCode,
    CheckCircle2,
    X,
} from 'lucide-react';

export const DoctorPrescriptionsPage = () => {
    const { addToast } = useAppStore();
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRxForPrint, setSelectedRxForPrint] = useState(null);

    // Form State
    const [patientId, setPatientId] = useState('usr-patient-1');
    const [diagnosis, setDiagnosis] = useState('');
    const [diagnosticTestsInput, setDiagnosticTestsInput] = useState('');
    const [followUpDate, setFollowUpDate] = useState(
        new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
    );
    const [generalAdvice, setGeneralAdvice] = useState('Maintain good hydration, avoid cold foods, and take full prescribed course.');
    const [medicines, setMedicines] = useState([
        {
            name: 'Augmentin 625 Duo (Amoxicillin + Clavulanate)',
            strength: '500mg + 125mg',
            dosage: '1 Tablet',
            route: 'Oral',
            frequency: 'Twice daily',
            duration: '5 days',
            instructions: 'Take after food with warm water',
        },
        {
            name: 'Pan-D (Pantoprazole + Domperidone)',
            strength: '40mg + 30mg',
            dosage: '1 Capsule',
            route: 'Oral',
            frequency: 'Once daily',
            duration: '5 days',
            instructions: 'Take 30 mins before breakfast on empty stomach',
        },
    ]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [rxRes, patRes] = await Promise.all([
                api.getMyPrescriptions(),
                api.getMyPatients(),
            ]);
            if (rxRes.success) {
                setPrescriptions(rxRes.prescriptions || []);
            }
            if (patRes.success && patRes.patients) {
                setPatients(patRes.patients || []);
                if (patRes.patients.length > 0) {
                    setPatientId(patRes.patients[0].id);
                }
            }
        } catch (err) {
            console.error('Failed to load prescription data:', err);
        }
    };

    const handleAddMedicineRow = () => {
        setMedicines([
            ...medicines,
            {
                name: '',
                strength: '',
                dosage: '1 Tablet',
                route: 'Oral',
                frequency: 'Once daily',
                duration: '5 days',
                instructions: 'Take after food',
            },
        ]);
    };

    const handleRemoveMedicineRow = (index) => {
        setMedicines(medicines.filter((_, i) => i !== index));
    };

    const handleUpdateMedicine = (index, field, val) => {
        const updated = [...medicines];
        updated[index][field] = val;
        setMedicines(updated);
    };

    const handleCreatePrescription = async (e) => {
        e.preventDefault();
        if (!diagnosis.trim() || medicines.some((m) => !m.name.trim())) {
            addToast({
                type: 'warning',
                title: 'Missing information',
                message: 'Please provide clinical diagnosis and medicine names.',
            });
            return;
        }

        setIsSaving(true);
        try {
            const testsArray = diagnosticTestsInput
                ? diagnosticTestsInput.split(',').map(s => s.trim()).filter(Boolean)
                : [];

            const res = await api.createPrescription({
                patientId,
                diagnosis,
                medicines,
                diagnosticTests: testsArray,
                generalAdvice,
                followUpDate,
            });

            if (res.success) {
                addToast({
                    type: 'success',
                    title: 'Prescription Issued & Signed! ✍️',
                    message: 'Prescription generated and automatically synced to patient medication tracker.',
                });
                setIsModalOpen(false);
                setDiagnosis('');
                setDiagnosticTestsInput('');
                loadData();
            }
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Issuance failed',
                message: err.message || 'Could not issue prescription.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-100 text-health-800 text-xs font-semibold mb-2">
                        <FileCheck2 className="w-3.5 h-3.5 text-health-600" />
                        <span>NMC Certified Digital Prescription Builder</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">Digital Prescriptions Console</h1>
                    <p className="text-xs sm:text-sm text-ink-muted">
                        Create structured e-prescriptions with diagnostic test recommendations, food timings, and professional PDF generation.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center gap-2 self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create New Prescription</span>
                </button>
            </div>

            {/* Prescriptions List */}
            <div className="space-y-4">
                <h2 className="text-base font-bold text-ink-main">Issued Prescriptions ({prescriptions.length})</h2>

                {prescriptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {prescriptions.map((rx) => (
                            <div
                                key={rx.id}
                                className="bg-surface rounded-3xl p-6 border border-surface-border shadow-sm hover:shadow-md transition-all space-y-4"
                            >
                                <div className="flex items-start justify-between pb-3 border-b border-surface-border">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-sm text-ink-main">{rx.patientName}</h3>
                                            <span className="text-[10px] text-ink-muted">
                                                ({rx.patientAge ? `${rx.patientAge} yrs` : 'Adult'}, {rx.patientGender || 'Male'})
                                            </span>
                                        </div>
                                        <p className="text-xs text-health-800 font-bold mt-0.5">{rx.diagnosis}</p>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-surface-muted px-2 py-1 rounded-md">
                                        {rx.date}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                    <span className="text-[10px] font-bold uppercase text-ink-muted block">Prescribed Medicines ({rx.medicines?.length}):</span>
                                    <div className="space-y-1">
                                        {rx.medicines?.map((m, i) => (
                                            <div key={i} className="p-2.5 rounded-xl bg-surface-muted/60 flex items-center justify-between text-xs">
                                                <span className="font-bold text-ink-main">
                                                    {m.name} {m.strength ? `(${m.strength})` : ''}
                                                </span>
                                                <span className="text-health-800 font-semibold">{m.frequency} &bull; {m.duration}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {rx.generalAdvice && (
                                    <p className="text-xs text-ink-muted bg-health-50/50 p-2.5 rounded-xl border border-health-100 italic">
                                        "{rx.generalAdvice}"
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-surface-border text-xs">
                                    <span className="text-[10px] font-bold text-health-800 flex items-center gap-1">
                                        <UserCheck className="w-3.5 h-3.5 text-health-600" />
                                        <span>{rx.digitalSignature || 'Digitally Verified'}</span>
                                    </span>
                                    <button
                                        onClick={() => setSelectedRxForPrint(rx)}
                                        className="p-2 text-ink-muted hover:text-health-700 hover:bg-health-50 rounded-xl transition-colors flex items-center gap-1 font-bold text-xs"
                                        title="Print / Export PDF"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Print PDF</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface rounded-3xl p-12 border border-surface-border shadow-soft text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-health-50 text-health-600 flex items-center justify-center mx-auto">
                            <FileCheck2 className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-ink-main">No Prescriptions Issued</h3>
                            <p className="text-xs text-ink-muted max-w-sm mx-auto">
                                Issue digital prescriptions to your consulting patients with automatic medication tracking and downloadable PDF generation.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Prescription Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface rounded-3xl shadow-2xl border border-surface-border max-w-3xl w-full overflow-hidden max-h-[92vh] flex flex-col">
                        <div className="p-6 bg-gradient-to-r from-health-700 to-health-600 text-white flex items-start justify-between shrink-0">
                            <div>
                                <h3 className="text-base font-bold">Create Structured Digital Prescription</h3>
                                <p className="text-xs text-health-100">NMC Compliant &bull; Auto-syncs to patient tracker</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePrescription} className="p-6 space-y-4 overflow-y-auto text-xs font-medium flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-ink-muted mb-1">Select Patient</label>
                                    <select
                                        value={patientId}
                                        onChange={(e) => setPatientId(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-surface-border bg-surface text-ink-main font-semibold focus:outline-none focus:ring-1 focus:ring-health-500"
                                    >
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.gender || 'Patient'}) - {p.city || 'India'}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-ink-muted mb-1">Clinical Diagnosis</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Acute Pharyngitis & Allergic Rhinitis"
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-surface-border bg-surface text-ink-main font-semibold"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Medicines Table Builder */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-xs text-ink-main uppercase tracking-wider flex items-center gap-1.5">
                                        <Pill className="w-4 h-4 text-health-600" />
                                        Prescribed Medicines List
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={handleAddMedicineRow}
                                        className="px-3 py-1.5 bg-health-50 text-health-700 hover:bg-health-100 rounded-xl font-bold text-xs flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Medicine</span>
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {medicines.map((med, idx) => (
                                        <div key={idx} className="p-3.5 rounded-2xl bg-surface-muted/50 border border-surface-border space-y-2.5">
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                                <div className="sm:col-span-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Medicine Name (e.g. Augmentin 625)"
                                                        value={med.name}
                                                        onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                                                        className="w-full p-2 rounded-xl border border-surface-border bg-surface font-semibold text-xs"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Strength (e.g. 625mg)"
                                                        value={med.strength}
                                                        onChange={(e) => handleUpdateMedicine(idx, 'strength', e.target.value)}
                                                        className="w-full p-2 rounded-xl border border-surface-border bg-surface text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Dosage (e.g. 1 Tab)"
                                                        value={med.dosage}
                                                        onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                                                        className="w-full p-2 rounded-xl border border-surface-border bg-surface text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                                                <div>
                                                    <select
                                                        value={med.frequency}
                                                        onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                                                        className="w-full p-2 rounded-xl border border-surface-border bg-surface text-xs font-semibold"
                                                    >
                                                        <option value="Once daily">Once daily</option>
                                                        <option value="Twice daily">Twice daily</option>
                                                        <option value="Thrice daily">Thrice daily</option>
                                                        <option value="As needed (SOS)">As needed (SOS)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Duration (e.g. 5 days)"
                                                        value={med.duration}
                                                        onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                                                        className="w-full p-2 rounded-xl border border-surface-border bg-surface text-xs"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2 flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Instructions (e.g. After food)"
                                                        value={med.instructions}
                                                        onChange={(e) => handleUpdateMedicine(idx, 'instructions', e.target.value)}
                                                        className="w-full p-2 rounded-xl border border-surface-border bg-surface text-xs"
                                                    />
                                                    {medicines.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveMedicineRow(idx)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl shrink-0"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-ink-muted mb-1">Diagnostic Tests Advised (comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. CBC, Serum IgE, Fasting Blood Sugar"
                                        value={diagnosticTestsInput}
                                        onChange={(e) => setDiagnosticTestsInput(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-surface-border bg-surface"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-ink-muted mb-1">Next Follow-Up Date</label>
                                    <input
                                        type="date"
                                        value={followUpDate}
                                        onChange={(e) => setFollowUpDate(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-surface-border bg-surface"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted mb-1">Doctor Advice / Lifestyle Notes</label>
                                <textarea
                                    rows="2"
                                    value={generalAdvice}
                                    onChange={(e) => setGeneralAdvice(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-surface-border text-ink-muted font-bold hover:bg-surface-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2.5 bg-health-500 hover:bg-health-600 text-white rounded-xl font-bold shadow-soft transition-all"
                                >
                                    {isSaving ? 'Issuing...' : 'Issue & Digitally Sign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Print Modal for Selected Rx */}
            {selectedRxForPrint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-300 max-w-2xl w-full p-8 space-y-6 text-slate-800">
                        {/* Printable Prescription Layout */}
                        <div className="flex items-start justify-between pb-4 border-b-2 border-health-500">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{selectedRxForPrint.doctorName}</h2>
                                <p className="text-xs text-health-700 font-bold">{selectedRxForPrint.doctorSpecialization}</p>
                                <p className="text-xs text-slate-600">{selectedRxForPrint.doctorHospital || 'MediGuide Clinic, India'}</p>
                                <p className="text-[11px] text-slate-500 font-mono">Reg No: {selectedRxForPrint.registrationNumber || 'NMC-2022-DL-8821'}</p>
                            </div>
                            <div className="text-right">
                                <div className="w-12 h-12 rounded-xl bg-health-600 text-white font-black text-2xl flex items-center justify-center ml-auto">
                                    Rx
                                </div>
                                <p className="text-xs font-mono text-slate-500 mt-1">Date: {selectedRxForPrint.date}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl text-xs">
                            <div>
                                <span className="text-slate-400 block text-[10px] font-bold uppercase">Patient:</span>
                                <span className="font-bold text-slate-900">{selectedRxForPrint.patientName}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px] font-bold uppercase">Diagnosis:</span>
                                <span className="font-bold text-health-900">{selectedRxForPrint.diagnosis}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Rx Medications:</h4>
                            <table className="w-full text-xs text-left">
                                <thead className="border-b border-slate-300 text-slate-500 font-bold">
                                    <tr>
                                        <th className="pb-1.5">Medicine</th>
                                        <th className="pb-1.5">Dosage</th>
                                        <th className="pb-1.5">Frequency</th>
                                        <th className="pb-1.5">Duration</th>
                                        <th className="pb-1.5">Instructions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedRxForPrint.medicines?.map((m, i) => (
                                        <tr key={i}>
                                            <td className="py-2 font-bold">{m.name}</td>
                                            <td className="py-2">{m.dosage}</td>
                                            <td className="py-2 text-health-800 font-bold">{m.frequency}</td>
                                            <td className="py-2">{m.duration}</td>
                                            <td className="py-2 text-slate-600">{m.instructions}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {selectedRxForPrint.generalAdvice && (
                            <div className="p-3 bg-slate-50 rounded-xl text-xs">
                                <span className="font-bold block text-[11px] text-slate-700">Advice:</span>
                                <p className="text-slate-600">{selectedRxForPrint.generalAdvice}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                            <div className="text-xs">
                                <p className="font-bold text-slate-900">{selectedRxForPrint.digitalSignature}</p>
                                <p className="text-[10px] text-slate-400">Ref: {selectedRxForPrint.qrVerificationCode || 'MG-RX-IN-2026'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedRxForPrint(null)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="px-5 py-2 text-xs font-bold bg-health-600 text-white hover:bg-health-700 rounded-xl shadow-soft flex items-center gap-1.5"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Print / Save PDF</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
