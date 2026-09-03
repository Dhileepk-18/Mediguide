import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import {
  Building2,
  Plus,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Stethoscope,
  GraduationCap,
  MapPin,
  Search,
  X,
  AlertTriangle,
} from 'lucide-react';

const INDIAN_STATES = [
  'Delhi',
  'Karnataka',
  'Maharashtra',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Gujarat',
  'West Bengal',
  'Kerala',
  'Rajasthan',
];

export const AdminDoctorsPage = () => {
  const { addToast } = useAppStore();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // New Doctor Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Doctor@123');
  const [specialization, setSpecialization] = useState('Consultant Physician');
  const [department, setDepartment] = useState('General Medicine');
  const [qualification, setQualification] = useState('MBBS, MD - General Medicine');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState(10);
  const [hospital, setHospital] = useState('AIIMS Hospital, New Delhi');
  const [city, setCity] = useState('New Delhi');
  const [state, setState] = useState('Delhi');
  const [consultationFee, setConsultationFee] = useState(800);
  const [bio, setBio] = useState(
    'Experienced medical specialist committed to evidence-based clinical care.'
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [docRes, deptRes] = await Promise.all([api.getDoctors(), api.getDepartments()]);
      if (docRes.success) {
        setDoctors(docRes.doctors || []);
      }
      if (deptRes.success) {
        setDepartments(deptRes.departments || []);
        if (deptRes.departments.length > 0) {
          setDepartment(deptRes.departments[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDoctor = async (docId, docName) => {
    try {
      const res = await api.approveDoctor(docId);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Doctor Approved & Verified',
          message: `${docName}'s credentials have been approved for active clinical consultations.`,
        });
        loadData();
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Approval Failed',
        message: 'Could not approve doctor.',
      });
    }
  };

  const handleSuspendDoctor = async (docId, docName) => {
    if (!window.confirm(`Are you sure you want to suspend / deactivate ${docName}?`)) return;
    try {
      const res = await api.suspendDoctor(docId);
      if (res.success) {
        addToast({
          type: 'info',
          title: 'Doctor Suspended',
          message: `${docName} has been temporarily deactivated.`,
        });
        loadData();
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not suspend doctor.',
      });
    }
  };

  const handleAddDoctor = async e => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing fields',
        message: 'Please provide doctor name and email.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.addDoctor({
        name,
        email,
        password: password.trim() ? password : 'Doctor@123',
        specialization,
        department,
        qualification,
        registrationNumber: registrationNumber || `NMC-${Date.now().toString().slice(-6)}`,
        experienceYears: Number(experienceYears),
        hospital,
        city,
        state,
        consultationFee: Number(consultationFee),
        bio,
      });

      if (res.success) {
        addToast({
          type: 'success',
          title: 'Doctor Credentialed 🩺',
          message: `${name} onboarded to MediGuide India.`,
        });
        setIsModalOpen(false);
        setName('');
        setEmail('');
        setRegistrationNumber('');
        loadData();
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Registration failed',
        message: err.message || 'Could not register doctor.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDoctors = doctors.filter(
    d =>
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hospital?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-100 text-health-800 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-health-600" />
            <span>NMC Registration & Verification Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">
            Doctor Management & Credentialing
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Verify NMC medical registration numbers, onboard new specialists, manage approval
            states, and review hospital affiliations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Doctor</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search doctor by name, specialty, hospital, or city..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface border border-surface-border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-health-500 shadow-sm"
        />
      </div>

      {/* Doctors Grid */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-health-200 border-t-health-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-ink-muted">Loading registered doctors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doc => (
            <div
              key={doc.id}
              className="bg-surface rounded-3xl p-6 border border-surface-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <img
                    src={
                      doc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`
                    }
                    alt={doc.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-health-100 shrink-0"
                  />
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      doc.isAvailable !== false
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {doc.isAvailable !== false ? 'Verified & Active' : 'Suspended'}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-ink-main">{doc.name}</h3>
                  <p className="text-xs text-health-700 font-semibold">{doc.specialization}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-health-100 text-health-800">
                    {doc.department}
                  </span>
                </div>

                <div className="p-3 bg-surface-muted/60 rounded-2xl space-y-1 text-xs text-ink-muted border border-surface-border/60">
                  <div className="flex justify-between">
                    <span>Reg No:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {doc.registrationNumber || 'NMC-2022-DL'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hospital:</span>
                    <span className="font-semibold text-ink-main truncate max-w-[150px]">
                      {doc.hospital}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-semibold text-ink-main">
                      {doc.city || 'Delhi'}, {doc.state || 'India'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee:</span>
                    <span className="font-bold text-health-800">₹{doc.consultationFee}</span>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-2 text-xs">
                {doc.isAvailable === false ? (
                  <button
                    onClick={() => handleApproveDoctor(doc.id, doc.name)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-soft"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve / Restore</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSuspendDoctor(doc.id, doc.name)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Suspend</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onboard Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface rounded-3xl shadow-2xl border border-surface-border max-w-2xl w-full overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-6 bg-gradient-to-r from-health-700 to-health-600 text-white flex items-start justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold">Onboard Healthcare Practitioner</h3>
                <p className="text-xs text-health-100">National Medical Council credentialing</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddDoctor}
              className="p-6 space-y-4 overflow-y-auto text-xs font-medium flex-1"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-ink-muted mb-1">
                    Doctor Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Anand Verma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface font-semibold focus:outline-none focus:border-health-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-muted mb-1">
                    Doctor Login Email
                  </label>
                  <input
                    type="email"
                    placeholder="anand.verma@aiims.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface font-semibold focus:outline-none focus:border-health-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-ink-muted mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface font-semibold"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-muted mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Consultant Cardiologist"
                    value={specialization}
                    onChange={e => setSpecialization(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-muted mb-1">
                    NMC Reg Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NMC-2022-DL-9912"
                    value={registrationNumber}
                    onChange={e => setRegistrationNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-ink-muted mb-1">
                    Qualifications
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MBBS, MD, DM"
                    value={qualification}
                    onChange={e => setQualification(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-muted mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={e => setExperienceYears(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-muted mb-1">
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={e => setConsultationFee(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface font-bold text-health-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-ink-muted mb-1">
                    Hospital / Clinic
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fortis Hospital, Mumbai"
                    value={hospital}
                    onChange={e => setHospital(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-muted mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-muted mb-1">State</label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface"
                  >
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ink-muted mb-1">
                  Biography / Clinical Scope
                </label>
                <textarea
                  rows="2"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-surface-border bg-surface"
                  required
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
                  {isSaving ? 'Registering...' : 'Onboard & Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
