import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import {
    Heart,
    AlertTriangle,
    X,
    Save,
    MapPin,
    Languages,
    ShieldCheck,
    Info,
    Plus,
    User,
    PhoneCall,
} from 'lucide-react';

const INDIAN_STATES = [
    'Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
    'Gujarat', 'West Bengal', 'Kerala', 'Rajasthan', 'Madhya Pradesh', 'Punjab',
    'Haryana', 'Bihar', 'Odisha', 'Andhra Pradesh', 'Assam', 'Jharkhand'
];

const LANGUAGES = [
    'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Malayalam', 'Gujarati'
];

export const PatientProfilePage = () => {
    const { user, updateUser } = useAuthStore();
    const { addToast } = useAppStore();

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '+91 ');
    const [age, setAge] = useState(user?.age || 28);
    const [gender, setGender] = useState(user?.gender || 'Male');
    const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
    const [city, setCity] = useState(user?.city || 'Bengaluru');
    const [state, setState] = useState(user?.state || 'Karnataka');
    const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'English');
    const [abhaId, setAbhaId] = useState(user?.abhaId || '');
    const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');

    const [allergies, setAllergies] = useState(user?.allergies || []);
    const [newAllergy, setNewAllergy] = useState('');
    const [chronicConditions, setChronicConditions] = useState(user?.chronicConditions || []);
    const [newCondition, setNewCondition] = useState('');

    const [isSaving, setIsSaving] = useState(false);

    const handleAddAllergy = (e) => {
        e.preventDefault();
        if (!newAllergy.trim()) return;
        if (!allergies.includes(newAllergy.trim())) {
            setAllergies([...allergies, newAllergy.trim()]);
        }
        setNewAllergy('');
    };

    const handleAddCondition = (e) => {
        e.preventDefault();
        if (!newCondition.trim()) return;
        if (!chronicConditions.includes(newCondition.trim())) {
            setChronicConditions([...chronicConditions, newCondition.trim()]);
        }
        setNewCondition('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const success = await updateUser({
                name,
                phone,
                age: Number(age),
                gender,
                bloodGroup,
                city,
                state,
                preferredLanguage,
                abhaId,
                emergencyContact,
                allergies,
                chronicConditions,
            });
            if (success) {
                addToast({
                    type: 'success',
                    title: 'Health Profile Updated',
                    message: 'Your demographic and clinical vitals have been securely saved.',
                });
            }
        } catch {
            addToast({
                type: 'error',
                title: 'Save failed',
                message: 'Could not update profile.',
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
                    <User className="w-3.5 h-3.5 text-health-600" />
                    <span>Personal Healthcare Profile &bull; India First</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">My Health Profile</h1>
                <p className="text-xs sm:text-sm text-ink-muted">
                    Manage your clinical vitals, emergency contacts, Indian state/city location, and optional 14-digit ABHA details.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Profile Identity Card */}
                <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft space-y-6">
                    <div className="flex items-center gap-4 pb-6 border-b border-surface-border">
                        <img
                            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                            alt={name}
                            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-health-100 shrink-0"
                        />
                        <div>
                            <h2 className="text-lg font-bold text-ink-main">{name}</h2>
                            <p className="text-xs text-ink-muted">{user?.email}</p>
                            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-health-100 text-health-800">
                                Patient UID: {user?.id}
                            </span>
                        </div>
                    </div>

                    {/* Demographic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="block font-bold text-ink-main mb-1.5">Full Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-surface-muted rounded-xl border border-surface-border font-semibold focus:outline-none focus:border-health-400"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-ink-main mb-1.5">Mobile Number (Defaults to +91)</label>
                            <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-2.5 bg-surface-muted rounded-xl border border-surface-border font-semibold focus:outline-none focus:border-health-400"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-ink-main mb-1.5">Age</label>
                            <input
                                type="number"
                                value={age || ''}
                                onChange={(e) => setAge(Number(e.target.value))}
                                className="w-full px-4 py-2.5 bg-surface-muted rounded-xl border border-surface-border font-semibold focus:outline-none focus:border-health-400"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-ink-main mb-1.5">Gender</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface-muted rounded-xl border border-surface-border font-semibold focus:outline-none focus:border-health-400"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-ink-main mb-1.5">Blood Group</label>
                            <select
                                value={bloodGroup}
                                onChange={(e) => setBloodGroup(e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface-muted rounded-xl border border-surface-border font-semibold focus:outline-none focus:border-health-400"
                            >
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-ink-main mb-1.5">Preferred Language</label>
                            <select
                                value={preferredLanguage}
                                onChange={(e) => setPreferredLanguage(e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface-muted rounded-xl border border-surface-border font-semibold focus:outline-none focus:border-health-400"
                            >
                                {LANGUAGES.map(l => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-ink-main mb-1.5">City / Locality</label>
                            <input
                                type="text"
                                placeholder="e.g. Bengaluru, Mumbai, Indiranagar"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-2.5 bg-surface-muted rounded-xl border border-surface-border font-semibold focus:outline-none focus:border-health-400"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-ink-main mb-1.5">State / Union Territory</label>
                            <select
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="w-full px-3 py-2.5 bg-surface-muted rounded-xl border border-surface-border font-semibold focus:outline-none focus:border-health-400"
                            >
                                {INDIAN_STATES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block font-bold text-ink-main mb-1.5">Emergency Contact Details</label>
                            <input
                                type="text"
                                value={emergencyContact}
                                onChange={(e) => setEmergencyContact(e.target.value)}
                                placeholder="e.g. Priya Sharma (Spouse) - +91 98765 12345"
                                className="w-full px-4 py-2.5 bg-surface-muted rounded-xl border border-surface-border font-semibold focus:outline-none focus:border-health-400"
                            />
                        </div>

                        {/* Optional 14-Digit ABHA ID */}
                        <div className="sm:col-span-2 p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="font-bold text-sky-900 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                                    Ayushman Bharat Health Account (ABHA ID) &bull; Optional
                                </label>
                                <span className="text-[10px] text-sky-700 font-semibold bg-sky-100 px-2 py-0.5 rounded-full">
                                    14-digit format
                                </span>
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. 91-4820-1948-2849"
                                value={abhaId}
                                onChange={(e) => setAbhaId(e.target.value)}
                                className="w-full px-4 py-2 bg-white rounded-xl border border-sky-300 font-mono font-bold text-xs focus:outline-none focus:border-sky-500"
                            />
                            <p className="text-[10px] text-sky-700 leading-relaxed">
                                Note: MediGuide uses an ABDM-compatible data structure. ABHA linking remains conceptual until live sandbox gateway credentials are provided.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Clinical Tags: Allergies & Chronic Conditions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Allergies */}
                    <div className="bg-surface p-6 rounded-3xl border border-surface-border shadow-soft space-y-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-status-warning" />
                            <h3 className="font-bold text-sm text-ink-main">Known Allergies (Food / Drugs)</h3>
                        </div>

                        <div className="flex flex-wrap gap-2 min-h-[44px]">
                            {allergies.map((allergy) => (
                                <span
                                    key={allergy}
                                    className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                                >
                                    <span>{allergy}</span>
                                    <button
                                        type="button"
                                        onClick={() => setAllergies(allergies.filter((a) => a !== allergy))}
                                        className="hover:text-red-700"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {allergies.length === 0 && (
                                <span className="text-xs text-ink-muted italic">No allergies recorded.</span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add allergy (e.g. Sulfa, Peanuts)..."
                                value={newAllergy}
                                onChange={(e) => setNewAllergy(e.target.value)}
                                className="flex-1 px-3 py-2 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
                            />
                            <button
                                onClick={handleAddAllergy}
                                className="px-3 py-2 bg-health-100 text-health-800 rounded-xl text-xs font-bold hover:bg-health-200"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Chronic Conditions */}
                    <div className="bg-surface p-6 rounded-3xl border border-surface-border shadow-soft space-y-4">
                        <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-health-600" />
                            <h3 className="font-bold text-sm text-ink-main">Existing Chronic Conditions</h3>
                        </div>

                        <div className="flex flex-wrap gap-2 min-h-[44px]">
                            {chronicConditions.map((condition) => (
                                <span
                                    key={condition}
                                    className="px-3 py-1 bg-health-50 text-health-900 border border-health-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                                >
                                    <span>{condition}</span>
                                    <button
                                        type="button"
                                        onClick={() => setChronicConditions(chronicConditions.filter((c) => c !== condition))}
                                        className="hover:text-red-700"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {chronicConditions.length === 0 && (
                                <span className="text-xs text-ink-muted italic">No conditions recorded.</span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add condition (e.g. Hypertension, Thyroid)..."
                                value={newCondition}
                                onChange={(e) => setNewCondition(e.target.value)}
                                className="flex-1 px-3 py-2 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
                            />
                            <button
                                onClick={handleAddCondition}
                                className="px-3 py-2 bg-health-100 text-health-800 rounded-xl text-xs font-bold hover:bg-health-200"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Action */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-8 py-3.5 bg-health-500 hover:bg-health-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-soft transition-all flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Saving Changes...' : 'Save Health Profile'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
