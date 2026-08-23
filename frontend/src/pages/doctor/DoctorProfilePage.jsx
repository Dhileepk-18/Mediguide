import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import {
    User,
    GraduationCap,
    Building2,
    ShieldCheck,
    Languages,
    MapPin,
    Save,
    CheckCircle2,
    Stethoscope,
    FileText,
} from 'lucide-react';

const INDIAN_STATES = [
    'Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
    'Gujarat', 'West Bengal', 'Kerala', 'Rajasthan', 'Madhya Pradesh', 'Punjab', 'Haryana'
];

export const DoctorProfilePage = () => {
    const { user } = useAuthStore();
    const { addToast } = useAppStore();

    const [specialization, setSpecialization] = useState('');
    const [department, setDepartment] = useState('General Medicine');
    const [qualification, setQualification] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [hospital, setHospital] = useState('');
    const [city, setCity] = useState('New Delhi');
    const [state, setState] = useState('Delhi');
    const [experienceYears, setExperienceYears] = useState(12);
    const [languages, setLanguages] = useState(['English', 'Hindi']);
    const [bio, setBio] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadDoctorProfile();
    }, []);

    const loadDoctorProfile = async () => {
        try {
            setIsLoading(true);
            const docRes = await api.getDoctors();
            if (docRes.success && docRes.doctors) {
                const currentDoc = docRes.doctors.find(d => d.userId === user?.id || d.email === user?.email);
                if (currentDoc) {
                    setSpecialization(currentDoc.specialization || '');
                    setDepartment(currentDoc.department || 'General Medicine');
                    setQualification(currentDoc.qualification || '');
                    setRegistrationNumber(currentDoc.registrationNumber || 'NMC-2022-DL-8821');
                    setHospital(currentDoc.hospital || '');
                    setCity(currentDoc.city || 'New Delhi');
                    setState(currentDoc.state || 'Delhi');
                    setExperienceYears(currentDoc.experienceYears || 12);
                    setLanguages(currentDoc.languages || ['English', 'Hindi']);
                    setBio(currentDoc.bio || '');
                }
            }
        } catch (err) {
            console.error('Failed to load doctor profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await api.updateDoctorProfile({
                specialization,
                qualification,
                registrationNumber,
                hospital,
                city,
                state,
                experienceYears: Number(experienceYears),
                languages,
                bio,
            });

            if (res.success) {
                addToast({
                    type: 'success',
                    title: 'Profile Updated',
                    message: 'Your medical credentials and hospital affiliations have been saved.',
                });
            }
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Update Failed',
                message: err.message || 'Could not update profile.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-100 text-health-800 text-xs font-semibold mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-health-600" />
                    <span>NMC Clinical Registration & Profile Credentials</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">Doctor Clinical Profile</h1>
                <p className="text-xs sm:text-sm text-ink-muted">
                    Maintain your professional medical council registration numbers, university qualifications, and practice locations.
                </p>
            </div>

            {isLoading ? (
                <div className="py-16 text-center">
                    <div className="w-10 h-10 border-4 border-health-200 border-t-health-600 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-ink-muted">Loading credentials...</p>
                </div>
            ) : (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Doctor Header Card */}
                    <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft flex items-center gap-4">
                        <img
                            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                            alt={user?.name}
                            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-health-100 shrink-0"
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-ink-main">{user?.name}</h2>
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    Verified Practitioner
                                </span>
                            </div>
                            <p className="text-xs text-health-700 font-bold">{specialization || 'Consultant Physician'}</p>
                            <p className="text-[11px] text-ink-muted">{user?.email}</p>
                        </div>
                    </div>

                    {/* Medical Credentials */}
                    <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft space-y-4 text-xs font-medium">
                        <h3 className="text-sm font-bold text-ink-main uppercase tracking-wider flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-health-600" />
                            Qualifications & Medical Council Registration
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-ink-main mb-1.5">Specialization / Clinical Designation</label>
                                <input
                                    type="text"
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    placeholder="e.g. Consultant Internal Medicine & Diabetology"
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-semibold focus:outline-none focus:border-health-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-ink-main mb-1.5">Degrees & Certifications</label>
                                <input
                                    type="text"
                                    value={qualification}
                                    onChange={(e) => setQualification(e.target.value)}
                                    placeholder="e.g. MBBS, MD (AIIMS New Delhi), FACC"
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-semibold focus:outline-none focus:border-health-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-ink-main mb-1.5">Medical Council Registration Number (NMC / State)</label>
                                <input
                                    type="text"
                                    value={registrationNumber}
                                    onChange={(e) => setRegistrationNumber(e.target.value)}
                                    placeholder="e.g. MCI-19482 / DMC-2012-DL"
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-mono font-bold text-slate-800 focus:outline-none focus:border-health-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-ink-main mb-1.5">Years of Clinical Experience</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={experienceYears}
                                    onChange={(e) => setExperienceYears(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-semibold focus:outline-none focus:border-health-400"
                                    required
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-bold text-ink-main mb-1.5">Primary Hospital / Clinic Facility Name</label>
                                <input
                                    type="text"
                                    value={hospital}
                                    onChange={(e) => setHospital(e.target.value)}
                                    placeholder="e.g. AIIMS & MediGuide Specialty Clinic, New Delhi"
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-semibold focus:outline-none focus:border-health-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-ink-main mb-1.5">City</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-semibold focus:outline-none focus:border-health-400"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-ink-main mb-1.5">State</label>
                                <select
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-semibold focus:outline-none focus:border-health-400"
                                >
                                    {INDIAN_STATES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-bold text-ink-main mb-1.5">Languages Spoken (comma separated)</label>
                                <input
                                    type="text"
                                    value={languages.join(', ')}
                                    onChange={(e) => setLanguages(e.target.value.split(',').map(s => s.trim()))}
                                    placeholder="e.g. English, Hindi, Tamil, Kannada"
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-semibold focus:outline-none focus:border-health-400"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-bold text-ink-main mb-1.5">Professional Biography & Special Interests</label>
                                <textarea
                                    rows="3"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Summarize your clinical focus, patient philosophy, and special interest areas..."
                                    className="w-full p-3 rounded-xl border border-surface-border bg-surface-muted font-medium focus:outline-none focus:border-health-400 leading-relaxed"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-8 py-3.5 bg-health-500 hover:bg-health-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-soft transition-all flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? 'Saving Credentials...' : 'Save Clinical Profile'}</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
