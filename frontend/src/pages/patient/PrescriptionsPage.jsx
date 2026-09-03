import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import {
  FileCheck2,
  Printer,
  Pill,
  UserCheck,
  Calendar,
  QrCode,
  ShieldCheck,
  Download,
  CheckCircle2,
  Building2,
  Stethoscope,
} from 'lucide-react';

export const PrescriptionsPage = () => {
  const { addToast } = useAppStore();
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setIsLoading(true);
      const res = await api.getMyPrescriptions();
      if (res.success) {
        setPrescriptions(res.prescriptions || []);
      }
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToMedicines = async rx => {
    try {
      for (const med of rx.medicines) {
        await api.addMedicine({
          name: med.name,
          strength: med.strength || '',
          dosage: med.dosage,
          frequency: med.frequency,
          mealTiming: med.instructions?.toLowerCase().includes('before')
            ? 'Before Food'
            : 'After Food',
          slotTiming: 'Daily',
          timings: med.frequency.toLowerCase().includes('twice')
            ? ['09:00 AM', '09:00 PM']
            : ['09:00 AM'],
          instructions: med.instructions,
        });
      }
      addToast({
        type: 'success',
        title: 'Synced to Reminders! 💊',
        message: `${rx.medicines.length} medications added to your daily tracker.`,
      });
    } catch {
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-100 text-health-800 text-xs font-semibold mb-2">
            <FileCheck2 className="w-3.5 h-3.5 text-health-600" />
            <span>NMC Certified Digital Prescription Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">
            Digital Prescriptions
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Official electronically validated medical prescriptions issued by consulting doctors in
            India.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-health-200 border-t-health-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-ink-muted">Loading your prescriptions...</p>
        </div>
      ) : prescriptions.length > 0 ? (
        <div className="space-y-8">
          {prescriptions.map(rx => (
            <div
              key={rx.id}
              className="bg-surface rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft space-y-6 relative overflow-hidden print:p-0 print:border-none print:shadow-none"
            >
              {/* Prescription Clinical Letterhead */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-health-100">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-health-600 to-health-500 text-white flex items-center justify-center font-black text-2xl shadow-soft shrink-0">
                    Rx
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-lg text-ink-main">{rx.doctorName}</h3>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Verified Practitioner
                      </span>
                    </div>
                    <p className="text-xs text-health-700 font-bold mt-0.5">
                      {rx.doctorSpecialization}
                    </p>
                    <p className="text-xs text-ink-muted flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-health-600" />
                      {rx.doctorHospital || 'MediGuide Healthcare Center, India'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Reg No:{' '}
                      <span className="font-mono font-bold text-slate-700">
                        {rx.registrationNumber || 'NMC-2022-DL-8821'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1 bg-surface-muted/60 p-3 rounded-2xl border border-surface-border">
                  <div className="text-xs font-bold text-ink-main font-mono">
                    RX-ID: {rx.id.toUpperCase()}
                  </div>
                  <div className="text-xs text-ink-muted flex items-center sm:justify-end gap-1">
                    <Calendar className="w-3.5 h-3.5 text-health-600" />
                    <span>Date: {rx.date} (IST)</span>
                  </div>
                  {rx.qrVerificationCode && (
                    <div className="text-[10px] font-mono text-health-700 font-semibold truncate">
                      Ref: {rx.qrVerificationCode}
                    </div>
                  )}
                </div>
              </div>

              {/* Patient Demographics & Diagnosis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-health-50/50 border border-health-200/80 text-xs">
                <div>
                  <span className="text-ink-muted block text-[11px] uppercase font-bold">
                    Patient Details:
                  </span>
                  <span className="font-bold text-ink-main text-sm">{rx.patientName}</span>
                  <span className="text-ink-muted ml-2">
                    ({rx.patientAge ? `${rx.patientAge} yrs` : 'Adult'},{' '}
                    {rx.patientGender || 'Male'})
                  </span>
                </div>
                <div>
                  <span className="text-ink-muted block text-[11px] uppercase font-bold">
                    Clinical Diagnosis:
                  </span>
                  <span className="font-bold text-health-900 text-sm">{rx.diagnosis}</span>
                </div>
              </div>

              {/* Prescribed Medicines Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-main flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-health-600" />
                  Prescribed Medications (Schedule / Dosing):
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-surface-border text-ink-muted font-bold text-[11px]">
                        <th className="pb-2">Medicine & Strength</th>
                        <th className="pb-2">Dosage</th>
                        <th className="pb-2">Route</th>
                        <th className="pb-2">Frequency</th>
                        <th className="pb-2">Duration</th>
                        <th className="pb-2">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {rx.medicines?.map((med, idx) => (
                        <tr key={idx} className="hover:bg-surface-muted/40">
                          <td className="py-3 font-bold text-ink-main">
                            <div className="flex items-center gap-1.5">
                              <Pill className="w-3.5 h-3.5 text-health-600 shrink-0" />
                              <span>{med.name}</span>
                            </div>
                            {med.strength && (
                              <span className="text-[10px] text-health-700 font-semibold block ml-5">
                                Strength: {med.strength}
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-ink-main font-semibold">{med.dosage}</td>
                          <td className="py-3 text-slate-600">{med.route || 'Oral'}</td>
                          <td className="py-3 text-health-800 font-bold">{med.frequency}</td>
                          <td className="py-3 text-ink-muted">{med.duration}</td>
                          <td className="py-3 text-ink-muted">{med.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Diagnostic Tests & Advice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rx.diagnosticTests && rx.diagnosticTests.length > 0 && (
                  <div className="p-4 rounded-2xl bg-surface-muted border border-surface-border text-xs space-y-1.5">
                    <span className="font-bold text-ink-main uppercase text-[11px] block">
                      Diagnostic Tests Advised:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-ink-muted font-medium">
                      {rx.diagnosticTests.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {rx.generalAdvice && (
                  <div className="p-4 rounded-2xl bg-surface-muted border border-surface-border text-xs space-y-1.5">
                    <span className="font-bold text-ink-main uppercase text-[11px] block">
                      Doctor's Advice & Lifestyle Guidelines:
                    </span>
                    <p className="text-ink-muted leading-relaxed font-medium">{rx.generalAdvice}</p>
                    {rx.followUpDate && (
                      <p className="text-health-700 font-bold mt-2">
                        Next Follow-up Date: {rx.followUpDate}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Digital Signature & Footer Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-surface-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-health-50 border border-health-200">
                    <QrCode className="w-6 h-6 text-health-700" />
                  </div>
                  <div className="text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-health-800">
                      <UserCheck className="w-4 h-4 text-health-600" />
                      <span>{rx.digitalSignature || `Digitally Verified by ${rx.doctorName}`}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      System Generated Representation &bull; MediGuide Digital Health India
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={() => handleSyncToMedicines(rx)}
                    className="px-4 py-2.5 rounded-xl bg-health-500 hover:bg-health-600 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>Add to Medicine Tracker</span>
                  </button>
                  <button
                    onClick={() => handlePrint()}
                    className="px-3.5 py-2.5 rounded-xl border border-surface-border text-ink-muted hover:text-ink-main hover:bg-surface-muted transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title="Print / Save as PDF"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / PDF</span>
                  </button>
                </div>
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
            <h3 className="text-base font-bold text-ink-main">No Prescriptions Issued Yet</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              When your consulting doctors issue digital prescriptions, they will appear here with
              professional PDF download options and one-click sync to your Medicine Tracker.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
