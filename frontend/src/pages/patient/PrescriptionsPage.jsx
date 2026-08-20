import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { FileCheck2, Printer, Pill, UserCheck, Calendar, } from 'lucide-react';
export const PrescriptionsPage = () => {
    const { addToast } = useAppStore();
    const [prescriptions, setPrescriptions] = useState([]);
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
    const handleSyncToMedicines = async (rx) => {
        try {
            for (const med of rx.medicines) {
                await api.addMedicine({
                    name: med.name,
                    dosage: med.dosage,
                    frequency: med.frequency,
                    timings: med.frequency.toLowerCase().includes('twice') ? ['09:00 AM', '09:00 PM'] : ['09:00 AM'],
                    instructions: med.instructions,
                });
            }
            addToast({
                type: 'success',
                title: 'Synced to Reminders! 💊',
                message: `${rx.medicines.length} medications added to your daily schedule.`,
            });
        }
        catch {
            addToast({
                type: 'error',
                title: 'Sync failed',
                message: 'Could not sync prescribed medicines.',
            });
        }
    };
    const handlePrint = () => {
        window.print();
    };
    return (<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">Digital Prescriptions</h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Official digitally signed medical prescriptions issued by your consulting doctors.
          </p>
        </div>
      </div>

      {prescriptions.length > 0 ? (<div className="space-y-8">
          {prescriptions.map((rx) => (<div key={rx.id} className="bg-surface rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft space-y-6 relative overflow-hidden">
              {/* Prescription Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center font-bold text-lg">
                    Rx
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-ink-main">{rx.doctorName}</h3>
                    <p className="text-xs text-health-700 font-semibold">{rx.doctorSpecialization}</p>
                    <p className="text-[11px] text-ink-muted">{rx.doctorHospital}</p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <div className="text-xs font-bold text-ink-main">Prescription #{rx.id.toUpperCase()}</div>
                  <div className="text-xs text-ink-muted flex items-center sm:justify-end gap-1">
                    <Calendar className="w-3.5 h-3.5 text-health-600"/>
                    <span>Date: {rx.date}</span>
                  </div>
                </div>
              </div>

              {/* Patient Info & Diagnosis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-muted border border-surface-border text-xs">
                <div>
                  <span className="text-ink-muted block">Patient Name:</span>
                  <span className="font-bold text-ink-main text-sm">{rx.patientName}</span>
                  <span className="text-ink-muted ml-2">
                    ({rx.patientAge ? `${rx.patientAge} yrs` : 'Adult'}, {rx.patientGender || 'Female'})
                  </span>
                </div>
                <div>
                  <span className="text-ink-muted block">Clinical Diagnosis:</span>
                  <span className="font-bold text-health-900 text-sm">{rx.diagnosis}</span>
                </div>
              </div>

              {/* Prescribed Medicines Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-main">
                  Prescribed Medications:
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-surface-border text-ink-muted font-bold text-[11px]">
                        <th className="pb-2">Medicine</th>
                        <th className="pb-2">Dosage</th>
                        <th className="pb-2">Frequency</th>
                        <th className="pb-2">Duration</th>
                        <th className="pb-2">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {rx.medicines.map((med, idx) => (<tr key={idx} className="hover:bg-surface-muted/40">
                          <td className="py-2.5 font-bold text-ink-main flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-health-600"/>
                            {med.name}
                          </td>
                          <td className="py-2.5 text-ink-muted font-semibold">{med.dosage}</td>
                          <td className="py-2.5 text-health-800 font-semibold">{med.frequency}</td>
                          <td className="py-2.5 text-ink-muted">{med.duration}</td>
                          <td className="py-2.5 text-ink-muted">{med.instructions}</td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* General Advice & Follow-up */}
              {rx.generalAdvice && (<div className="p-3.5 rounded-2xl bg-health-50 border border-health-200 text-xs space-y-1">
                  <span className="font-bold text-health-900">Doctor's Advice & Lifestyle Notes:</span>
                  <p className="text-ink-muted leading-relaxed">{rx.generalAdvice}</p>
                </div>)}

              {/* Digital Signature & Footer Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-surface-border">
                <div className="flex items-center gap-2 text-xs font-bold text-health-800">
                  <UserCheck className="w-4 h-4 text-health-600"/>
                  <span>{rx.digitalSignature}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleSyncToMedicines(rx)} className="px-4 py-2 rounded-xl bg-health-500 hover:bg-health-600 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5"/>
                    <span>Sync to Medicine Reminders</span>
                  </button>
                  <button onClick={() => handlePrint()} className="p-2 rounded-xl border border-surface-border text-ink-muted hover:text-ink-main hover:bg-surface-muted transition-colors" title="Print Prescription">
                    <Printer className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            </div>))}
        </div>) : (<div className="p-12 bg-surface rounded-3xl border border-surface-border text-center space-y-3">
          <FileCheck2 className="w-10 h-10 text-health-500 mx-auto"/>
          <h3 className="font-bold text-sm text-ink-main">No digital prescriptions issued yet</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">
            When your consulting doctors issue prescriptions, they will be digitally verified and accessible here.
          </p>
        </div>)}
    </div>);
};
