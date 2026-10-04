import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import {
  ShieldCheck,
  Bell,
  Link2,
  Sliders,
  Save,
  Download,
} from 'lucide-react';

export const PatientProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const { addToast } = useAppStore();

  // Basic Info State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [city, setCity] = useState(user?.city || 'Bengaluru');
  const [state, setState] = useState(user?.state || 'Karnataka');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '+91 91234 56789');

  // Settings State for the 4 Groups (Section 7.7)
  const [prefLang, setPrefLang] = useState(user?.preferredLanguage || 'English');
  const [prefMode, setPrefMode] = useState('In-Person');
  const [abhaConnected, setAbhaConnected] = useState(false);
  const [syncReminders, setSyncReminders] = useState(true);
  const [dpdpConsent, setDpdpConsent] = useState(true);
  const [telemetryOptIn, setTelemetryOptIn] = useState(false);
  const [doseNotifications, setDoseNotifications] = useState(true);
  const [aptNotifications, setAptNotifications] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async e => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const success = await updateUser({
        name,
        phone,
        city,
        state,
        emergencyContact,
        preferredLanguage: prefLang,
      });

      if (success) {
        addToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Personal clinical settings saved.',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not update profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0B3441]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6C77]">
            Account & System Preferences
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold font-serif text-[#061017] tracking-tight">
          Profile & Care Settings
        </h1>
        <p className="text-sm text-[#5A6C77]">
          Manage your personal information, privacy controls, and communication channels.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0B3441] text-white flex items-center justify-center font-serif text-xl font-semibold shrink-0">
            {name ? name[0] : 'P'}
          </div>
          <div>
            <div className="text-base font-semibold text-[#061017]">{name || 'Rahul Verma'}</div>
            <div className="text-xs text-[#5A6C77]">{user?.email || 'patient@mediguide.in'} • Patient Role</div>
            <div className="text-xs text-[#2A7A5B] font-medium pt-0.5">Accredited MediGuide India Account</div>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="px-4 py-2 rounded-xl bg-[#0B3441] text-white hover:bg-[#08252E] text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* 4 Grouped Settings (Section 7.7: plain-language name + one-line description + single control) */}
      <div className="space-y-6">
        {/* GROUP 1: Preferences */}
        <div className="p-6 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(6,16,23,0.08)]">
            <Sliders className="w-4 h-4 text-[#0B3441]" />
            <h2 className="text-sm font-semibold text-[#061017]">Preferences</h2>
          </div>

          <div className="divide-y divide-[rgba(6,16,23,0.06)]">
            {/* Row 1: Language */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#061017]">Primary Healthcare Language</div>
                <div className="text-[11px] text-[#5A6C77]">
                  Preferred language for AI responses and appointment notifications.
                </div>
              </div>
              <select
                value={prefLang}
                onChange={e => setPrefLang(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[rgba(6,16,23,0.15)] bg-[#FAFBFB] text-xs text-[#061017] focus:outline-none"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              </select>
            </div>

            {/* Row 2: Default Consultation Mode */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#061017]">Default Consultation Mode</div>
                <div className="text-[11px] text-[#5A6C77]">
                  Standard pre-selection when initiating appointment booking.
                </div>
              </div>
              <select
                value={prefMode}
                onChange={e => setPrefMode(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[rgba(6,16,23,0.15)] bg-[#FAFBFB] text-xs text-[#061017] focus:outline-none"
              >
                <option value="In-Person">In-Person Clinic Visit</option>
                <option value="Audio/Telehealth">Audio Telehealth</option>
              </select>
            </div>

            {/* Row 3: Emergency Contact */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#061017]">Emergency SOS Contact</div>
                <div className="text-[11px] text-[#5A6C77]">
                  Contact number notified when priority emergency mode is activated.
                </div>
              </div>
              <input
                type="text"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[rgba(6,16,23,0.15)] bg-[#FAFBFB] text-xs text-[#061017] focus:outline-none max-w-[180px]"
              />
            </div>
          </div>
        </div>

        {/* GROUP 2: Connected Services */}
        <div className="p-6 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(6,16,23,0.08)]">
            <Link2 className="w-4 h-4 text-[#39679B]" />
            <h2 className="text-sm font-semibold text-[#061017]">Connected Services</h2>
          </div>

          <div className="divide-y divide-[rgba(6,16,23,0.06)]">
            {/* Row 1: Ayushman Bharat Health Account */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#061017]">ABHA / ABDM Healthcare ID</div>
                <div className="text-[11px] text-[#5A6C77]">
                  Link 14-digit National Digital Health ID for seamless inter-hospital records.
                </div>
              </div>
              <button
                onClick={() => setAbhaConnected(!abhaConnected)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  abhaConnected
                    ? 'bg-[#2A7A5B] text-white'
                    : 'bg-[#FAFBFB] border border-[rgba(6,16,23,0.15)] text-[#061017] hover:border-[#0B3441]'
                }`}
              >
                {abhaConnected ? 'Connected' : 'Connect ID'}
              </button>
            </div>

            {/* Row 2: Device Calendar Sync */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#061017]">Device Calendar Sync</div>
                <div className="text-[11px] text-[#5A6C77]">
                  Automatically push confirmed doctor appointments to Google / Apple Calendar.
                </div>
              </div>
              <input
                type="checkbox"
                checked={syncReminders}
                onChange={e => setSyncReminders(e.target.checked)}
                className="w-4 h-4 accent-[#0B3441] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* GROUP 3: Privacy & Consent */}
        <div className="p-6 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(6,16,23,0.08)]">
            <ShieldCheck className="w-4 h-4 text-[#2A7A5B]" />
            <h2 className="text-sm font-semibold text-[#061017]">Privacy & Consent (DPDP Act 2023)</h2>
          </div>

          <div className="divide-y divide-[rgba(6,16,23,0.06)]">
            {/* Row 1: Consent Framework */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#061017]">Clinical Data Consent</div>
                <div className="text-[11px] text-[#5A6C77]">
                  Permit attending physicians to view previous lab reports during an active appointment.
                </div>
              </div>
              <input
                type="checkbox"
                checked={dpdpConsent}
                onChange={e => setDpdpConsent(e.target.checked)}
                className="w-4 h-4 accent-[#0B3441] rounded cursor-pointer"
              />
            </div>

            {/* Row 2: Anonymous Clinical Research */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#061017]">De-identified Health Analytics</div>
                <div className="text-[11px] text-[#5A6C77]">
                  Contribute anonymized symptom trends to improve machine-learning triage accuracy.
                </div>
              </div>
              <input
                type="checkbox"
                checked={telemetryOptIn}
                onChange={e => setTelemetryOptIn(e.target.checked)}
                className="w-4 h-4 accent-[#0B3441] rounded cursor-pointer"
              />
            </div>

            {/* Row 3: Export Data */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#061017]">Download All Health Records</div>
                <div className="text-[11px] text-[#5A6C77]">
                  Export a complete encrypted ZIP archive of your prescriptions and health vault files.
                </div>
              </div>
              <button
                onClick={() =>
                  addToast({
                    type: 'info',
                    title: 'Export Started',
                    message: 'Preparing your encrypted healthcare package.',
                  })
                }
                className="px-3 py-1.5 rounded-lg border border-[rgba(6,16,23,0.15)] bg-[#FAFBFB] text-xs font-medium text-[#061017] hover:bg-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#5A6C77]" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* GROUP 4: Notifications */}
        <div className="p-6 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(6,16,23,0.08)]">
            <Bell className="w-4 h-4 text-[#C9A24D]" />
            <h2 className="text-sm font-semibold text-[#061017]">Notifications & Alerts</h2>
          </div>

          <div className="divide-y divide-[rgba(6,16,23,0.06)]">
            {/* Row 1: Medicine Reminders */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#061017]">Medicine Dose Alerts</div>
                <div className="text-[11px] text-[#5A6C77]">
                  Receive morning, afternoon, and evening in-app push notifications for prescribed medicines.
                </div>
              </div>
              <input
                type="checkbox"
                checked={doseNotifications}
                onChange={e => setDoseNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#0B3441] rounded cursor-pointer"
              />
            </div>

            {/* Row 2: Appointment Status Updates */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#061017]">Appointment Reminders</div>
                <div className="text-[11px] text-[#5A6C77]">
                  Alerts when your doctor confirms, reschedules, or adds notes to your booking.
                </div>
              </div>
              <input
                type="checkbox"
                checked={aptNotifications}
                onChange={e => setAptNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#0B3441] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
