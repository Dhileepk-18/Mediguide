import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Download,
  Trash2,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

export const PrivacySettingsPage = () => {
  const { user, logout } = useAuthStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();

  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Consent preferences
  const [consentAI, setConsentAI] = useState(true);
  const [consentReminders, setConsentReminders] = useState(true);
  const [consentAudit, setConsentAudit] = useState(true);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const res = await api.exportUserData();
      if (res.success && res.data) {
        const dataStr =
          'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute(
          'download',
          `mediguide_health_data_${user.id}_${Date.now()}.json`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        addToast({
          type: 'success',
          title: 'Data Exported',
          message: 'Your personal health data archive has been downloaded as JSON.',
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: err.message || 'Could not export user health data.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toLowerCase() !== 'delete my account') {
      addToast({
        type: 'error',
        title: 'Confirmation Mismatch',
        message: 'Please type "DELETE MY ACCOUNT" exactly to confirm.',
      });
      return;
    }

    try {
      setIsDeleting(true);
      const res = await api.deleteUserAccount();
      if (res.success) {
        addToast({
          type: 'info',
          title: 'Account Erased',
          message:
            'Your account and medical documents have been permanently removed under DPDP guidelines.',
        });
        logout();
        navigate('/');
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message || 'Could not purge account.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-health-900 via-health-800 to-slate-900 text-white shadow-soft">
        <div className="flex items-center gap-2 px-3 py-1 bg-health-700/60 border border-health-500/40 text-health-200 text-xs font-semibold rounded-full w-fit mb-3">
          <ShieldCheck className="w-4 h-4 text-health-300" />
          Digital Personal Data Protection (DPDP) Act, 2023 Compliant Model
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Privacy, Data Rights & Consent Settings
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-health-100/90 leading-relaxed max-w-3xl">
          MediGuide is architected around India’s digital healthcare principles: your medical
          records, symptom conversations, and prescriptions belong solely to you. You maintain full
          rights to view, export, or permanently erase your data.
        </p>
      </div>

      {/* DPDP Compliance Card */}
      <div className="bg-surface rounded-3xl border border-surface-border p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-ink-main uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-health-600" />
          Indian DPDP Framework Alignment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-health-50 border border-health-200/80 space-y-1.5">
            <div className="font-bold text-health-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-health-600" />
              Purpose Limitation
            </div>
            <p className="text-ink-muted leading-relaxed">
              Your health records are accessed solely to provide AI guidance and appointment
              coordination. Data is never sold or used for ad tracking.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200/80 space-y-1.5">
            <div className="font-bold text-sky-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              Right to Access & Portability
            </div>
            <p className="text-ink-muted leading-relaxed">
              You have the right to obtain a full digital summary and downloadable JSON export of
              your medical vault at any time.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200/80 space-y-1.5">
            <div className="font-bold text-purple-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              Right to Erasure
            </div>
            <p className="text-ink-muted leading-relaxed">
              You can request complete permanent erasure of your account, symptom check history,
              active medicines, and uploaded PDF records.
            </p>
          </div>
        </div>
      </div>

      {/* Consent Preferences */}
      <div className="bg-surface rounded-3xl border border-surface-border p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-ink-main uppercase tracking-wider flex items-center gap-2">
          <Eye className="w-4 h-4 text-health-600" />
          Consent & Processing Preferences
        </h2>

        <div className="divide-y divide-surface-border text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-ink-main">AI Clinical Symptom Guidance</p>
              <p className="text-ink-muted">
                Allow MediGuide’s AI engine to process entered symptoms for preliminary triage and
                department suggestions.
              </p>
            </div>
            <input
              type="checkbox"
              checked={consentAI}
              onChange={e => setConsentAI(e.target.checked)}
              className="w-5 h-5 accent-health-600 cursor-pointer rounded"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-ink-main">Medicine & Appointment In-App Reminders</p>
              <p className="text-ink-muted">
                Receive live notifications for dosage schedules and scheduled doctor appointments.
              </p>
            </div>
            <input
              type="checkbox"
              checked={consentReminders}
              onChange={e => setConsentReminders(e.target.checked)}
              className="w-5 h-5 accent-health-600 cursor-pointer rounded"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-ink-main">Security Audit Trail Logging</p>
              <p className="text-ink-muted">
                Record timestamps and session security events to protect your medical vault from
                unauthorized access.
              </p>
            </div>
            <input
              type="checkbox"
              checked={consentAudit}
              onChange={e => setConsentAudit(e.target.checked)}
              className="w-5 h-5 accent-health-600 cursor-pointer rounded"
            />
          </div>
        </div>
      </div>

      {/* Data Export & Portability Action */}
      <div className="bg-surface rounded-3xl border border-surface-border p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-ink-main flex items-center gap-2">
            <Download className="w-4 h-4 text-health-600" />
            Download My Personal Healthcare Archive
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Export an encrypted JSON package containing your profile, appointments, prescriptions,
            health record metadata, and symptom check history.
          </p>
        </div>
        <button
          onClick={handleExportData}
          disabled={isExporting}
          className="px-5 py-2.5 bg-health-50 hover:bg-health-100 text-health-800 border border-health-200 font-bold rounded-2xl text-xs shadow-sm transition-all flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export Data (JSON)'}
        </button>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-red-50/60 rounded-3xl border border-red-200 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-900">Right to Erasure & Account Purge</h3>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              Permanently delete your account, consultation history, stored prescriptions, and all
              uploaded medical records from MediGuide. This action is irreversible.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-soft transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Permanently Delete My Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-red-300 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-2xl bg-red-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Confirm Account Erasure</h3>
                <p className="text-[11px] text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              All your health records, active medicine reminders, and appointment logs for{' '}
              <strong className="text-slate-900">{user?.email}</strong> will be wiped from the
              system.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Type <strong className="text-red-700">DELETE MY ACCOUNT</strong> to confirm:
              </label>
              <input
                type="text"
                placeholder="DELETE MY ACCOUNT"
                value={deleteConfirmationText}
                onChange={e => setDeleteConfirmationText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={
                  isDeleting || deleteConfirmationText.trim().toLowerCase() !== 'delete my account'
                }
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-soft"
              >
                {isDeleting ? 'Erasing Data...' : 'Confirm Permanent Erasure'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
