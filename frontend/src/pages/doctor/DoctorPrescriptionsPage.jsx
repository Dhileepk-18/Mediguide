import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { Modal } from '../../components/common/Modal.jsx';
import { FileCheck2, Plus, Trash2, } from 'lucide-react';
export const DoctorPrescriptionsPage = () => {
    const { addToast } = useAppStore();
    const [prescriptions, setPrescriptions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Form State
    const [patientId, setPatientId] = useState('usr-patient-1');
    const [diagnosis, setDiagnosis] = useState('');
    const [generalAdvice, setGeneralAdvice] = useState('Maintain good hydration and take full course of medication.');
    const [medicines, setMedicines] = useState([
        {
            name: 'Amoxicillin',
            dosage: '500 mg',
            frequency: 'Three times daily',
            duration: '7 days',
            instructions: 'Take after meals with water',
        },
    ]);
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => {
        loadPrescriptions();
    }, []);
    const loadPrescriptions = async () => {
        try {
            const res = await api.getMyPrescriptions();
            if (res.success) {
                setPrescriptions(res.prescriptions);
            }
        }
        catch (err) {
            console.error('Failed to load prescriptions:', err);
        }
    };
    const handleAddMedicineRow = () => {
        setMedicines([
            ...medicines,
            {
                name: '',
                dosage: '500 mg',
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
                message: 'Please provide diagnosis and medicine names.',
            });
            return;
        }
        setIsSaving(true);
        try {
            const res = await api.createPrescription({
                patientId,
                diagnosis,
                medicines,
                generalAdvice,
            });
            if (res.success) {
                addToast({
                    type: 'success',
                    title: 'Prescription Issued & Signed! ✍️',
                    message: 'Prescription generated and synced to patient medication schedule.',
                });
                setIsModalOpen(false);
                setDiagnosis('');
                loadPrescriptions();
            }
        }
        catch (err) {
            addToast({
                type: 'error',
                title: 'Issuance failed',
                message: err.message || 'Could not issue prescription.',
            });
        }
        finally {
            setIsSaving(false);
        }
    };
    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">Digital Prescriptions Console</h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Issue digitally signed e-prescriptions with automatic medication schedule syncing.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-4 h-4"/>
          <span>New Prescription</span>
        </button>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-ink-main">Issued Prescriptions ({prescriptions.length})</h2>

        {prescriptions.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prescriptions.map((rx) => (<div key={rx.id} className="bg-surface rounded-3xl p-6 border border-surface-border shadow-soft space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-surface-border">
                  <div>
                    <h3 className="font-bold text-sm text-ink-main">Patient: {rx.patientName}</h3>
                    <p className="text-xs text-health-800 font-semibold">{rx.diagnosis}</p>
                  </div>
                  <span className="text-[10px] text-ink-muted">{rx.date}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-ink-muted">Medicines:</span>
                  <div className="space-y-1">
                    {rx.medicines.map((m, i) => (<div key={i} className="p-2 rounded-xl bg-surface-muted flex items-center justify-between text-xs">
                        <span className="font-bold text-ink-main">{m.name} ({m.dosage})</span>
                        <span className="text-ink-muted">{m.frequency} • {m.duration}</span>
                      </div>))}
                  </div>
                </div>

                <div className="text-[10px] text-health-800 font-bold pt-2 border-t border-surface-border">
                  {rx.digitalSignature}
                </div>
              </div>))}
          </div>) : (<div className="p-12 bg-surface rounded-3xl border border-surface-border text-center space-y-3">
            <FileCheck2 className="w-10 h-10 text-health-500 mx-auto"/>
            <h3 className="font-bold text-sm text-ink-main">No digital prescriptions issued yet</h3>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-health-500 text-white rounded-xl text-xs font-bold">
              Write First Prescription
            </button>
          </div>)}
      </div>

      {/* New Prescription Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Digital Prescription" subtitle="Specify diagnosis and multiple medicine lines." maxWidth="2xl">
        <form onSubmit={handleCreatePrescription} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Select Patient</label>
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full px-3 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400">
                <option value="usr-patient-1">Sarah Johnson (28 yrs, Female, O+)</option>
                <option value="usr-patient-2">Michael Davis (45 yrs, Male, A+)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Clinical Diagnosis</label>
              <input type="text" required value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Acute Bronchitis / Allergic Rhinitis" className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>
          </div>

          {/* Medicines Dynamic Rows */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink-main">Medications Line Items:</label>
              <button type="button" onClick={handleAddMedicineRow} className="px-3 py-1 bg-health-100 text-health-900 text-xs font-bold rounded-lg flex items-center gap-1">
                <Plus className="w-3.5 h-3.5"/>
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, idx) => (<div key={idx} className="p-3.5 rounded-2xl bg-surface-muted/70 border border-surface-border space-y-2 relative">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input type="text" required placeholder="Medicine Name" value={med.name} onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)} className="px-3 py-2 text-xs bg-surface rounded-lg border border-surface-border font-bold"/>
                    <input type="text" placeholder="Dosage (500mg)" value={med.dosage} onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)} className="px-3 py-2 text-xs bg-surface rounded-lg border border-surface-border"/>
                    <input type="text" placeholder="Frequency" value={med.frequency} onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)} className="px-3 py-2 text-xs bg-surface rounded-lg border border-surface-border"/>
                    <input type="text" placeholder="Duration (7 days)" value={med.duration} onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)} className="px-3 py-2 text-xs bg-surface rounded-lg border border-surface-border"/>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="Instructions (e.g. take after food)" value={med.instructions} onChange={(e) => handleUpdateMedicine(idx, 'instructions', e.target.value)} className="flex-1 px-3 py-1.5 text-xs bg-surface rounded-lg border border-surface-border"/>
                    {medicines.length > 1 && (<button type="button" onClick={() => handleRemoveMedicineRow(idx)} className="p-1.5 rounded-lg text-status-danger hover:bg-red-50">
                        <Trash2 className="w-4 h-4"/>
                      </button>)}
                  </div>
                </div>))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-main mb-1.5">General Advice</label>
            <textarea rows={2} value={generalAdvice} onChange={(e) => setGeneralAdvice(e.target.value)} className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-ink-muted hover:bg-surface-muted">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="flex-1 py-2.5 rounded-xl bg-health-500 hover:bg-health-600 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-1.5 disabled:opacity-50">
              <span>{isSaving ? 'Signing...' : 'Sign & Issue Prescription'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>);
};
