import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { Modal } from '../../components/common/Modal.jsx';
import { Plus } from 'lucide-react';
export const AdminDoctorsPage = () => {
    const { addToast } = useAppStore();
    const [doctors, setDoctors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // New Doctor Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [specialization, setSpecialization] = useState('Consultant Specialist');
    const [department, setDepartment] = useState('General Medicine');
    const [qualification, setQualification] = useState('MBBS, MD');
    const [experienceYears, setExperienceYears] = useState(8);
    const [hospital, setHospital] = useState('St. Jude Health Center');
    const [consultationFee, setConsultationFee] = useState(80);
    const [bio, setBio] = useState('Dedicated clinical specialist committed to patient wellness.');
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => {
        loadDoctors();
    }, []);
    const loadDoctors = async () => {
        try {
            const res = await api.getDoctors();
            if (res.success) {
                setDoctors(res.doctors);
            }
        }
        catch (err) {
            console.error('Failed to load doctors:', err);
        }
    };
    const handleToggleAvailability = async (doc) => {
        try {
            const res = await api.toggleDoctorAvailability(doc.id);
            if (res.success) {
                addToast({
                    type: 'info',
                    title: 'Availability Updated',
                    message: `${doc.name} status updated.`,
                });
                loadDoctors();
            }
        }
        catch {
            addToast({
                type: 'error',
                title: 'Update failed',
                message: 'Could not toggle availability.',
            });
        }
    };
    const handleAddDoctor = async (e) => {
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
                specialization,
                department,
                qualification,
                experienceYears: Number(experienceYears),
                hospital,
                consultationFee: Number(consultationFee),
                bio,
            });
            if (res.success) {
                addToast({
                    type: 'success',
                    title: 'Doctor Registered & Credentialed 🩺',
                    message: `${name} has been added to MediGuide.`,
                });
                setIsModalOpen(false);
                setName('');
                setEmail('');
                loadDoctors();
            }
        }
        catch (err) {
            addToast({
                type: 'error',
                title: 'Registration failed',
                message: err.message || 'Could not register doctor.',
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">Doctor Management & Credentialing</h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Onboard new practitioners, configure department specializations, and manage clinical schedules.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-4 h-4"/>
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (<div key={doc.id} className="bg-surface rounded-3xl p-6 border border-surface-border shadow-soft flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <img src={doc.avatar} alt={doc.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-health-200"/>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${doc.isAvailable
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'}`}>
                  {doc.isAvailable ? 'Available' : 'Inactive'}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-ink-main">{doc.name}</h3>
                <p className="text-xs text-health-700 font-semibold">{doc.specialization}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-health-100 text-health-800">
                  {doc.department}
                </span>
              </div>

              <div className="p-3 bg-surface-muted rounded-2xl space-y-1 text-xs text-ink-muted">
                <div className="flex justify-between">
                  <span>Hospital:</span>
                  <span className="font-semibold text-ink-main truncate max-w-[150px]">{doc.hospital}</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <span className="font-semibold text-ink-main">{doc.experienceYears} Years</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee / Session:</span>
                  <span className="font-bold text-health-900">${doc.consultationFee}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-surface-border flex gap-2">
              <button onClick={() => handleToggleAvailability(doc)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${doc.isAvailable
                ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                : 'bg-green-50 text-green-900 border-green-200 hover:bg-green-100'}`}>
                {doc.isAvailable ? 'Set Inactive' : 'Set Available'}
              </button>
            </div>
          </div>))}
      </div>

      {/* Add Doctor Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Onboard New Doctor" subtitle="Register clinical credentials and departmental assignment.">
        <form onSubmit={handleAddDoctor} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Doctor Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dr. Maya Lin, MD" className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Doctor Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="doctor.lin@mediguide.com" className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400">
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="ENT">ENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Specialization Title</label>
              <input type="text" required value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. Senior Pediatric Specialist" className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-ink-main mb-1">Qualification</label>
              <input type="text" value={qualification} onChange={(e) => setQualification(e.target.value)} className="w-full px-3 py-2 text-xs bg-surface-muted rounded-xl border border-surface-border"/>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-main mb-1">Experience (Years)</label>
              <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} className="w-full px-3 py-2 text-xs bg-surface-muted rounded-xl border border-surface-border"/>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-main mb-1">Fee ($)</label>
              <input type="number" value={consultationFee} onChange={(e) => setConsultationFee(Number(e.target.value))} className="w-full px-3 py-2 text-xs bg-surface-muted rounded-xl border border-surface-border"/>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-main mb-1.5">Hospital / Clinic Facility</label>
            <input type="text" value={hospital} onChange={(e) => setHospital(e.target.value)} className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-main mb-1.5">Doctor Bio</label>
            <textarea rows={2} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-ink-muted hover:bg-surface-muted">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="flex-1 py-2.5 rounded-xl bg-health-500 hover:bg-health-600 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-1.5 disabled:opacity-50">
              <span>{isSaving ? 'Registering...' : 'Register Doctor'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>);
};
