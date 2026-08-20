import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { useAppStore } from '../../store/appStore.js';
import { Heart, AlertTriangle, X, Save, } from 'lucide-react';
export const PatientProfilePage = () => {
    const { user, updateUser } = useAuthStore();
    const { addToast } = useAppStore();
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [age, setAge] = useState(user?.age || 28);
    const [gender, setGender] = useState(user?.gender || 'Female');
    const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
    const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');
    const [allergies, setAllergies] = useState(user?.allergies || ['Penicillin', 'Peanuts']);
    const [newAllergy, setNewAllergy] = useState('');
    const [chronicConditions, setChronicConditions] = useState(user?.chronicConditions || ['Mild Asthma']);
    const [newCondition, setNewCondition] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const handleAddAllergy = (e) => {
        e.preventDefault();
        if (!newAllergy.trim())
            return;
        if (!allergies.includes(newAllergy.trim())) {
            setAllergies([...allergies, newAllergy.trim()]);
        }
        setNewAllergy('');
    };
    const handleAddCondition = (e) => {
        e.preventDefault();
        if (!newCondition.trim())
            return;
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
                emergencyContact,
                allergies,
                chronicConditions,
            });
            if (success) {
                addToast({
                    type: 'success',
                    title: 'Health Profile Updated',
                    message: 'Your vitals and emergency contacts have been saved.',
                });
            }
        }
        catch {
            addToast({
                type: 'error',
                title: 'Save failed',
                message: 'Could not update profile.',
            });
        }
        finally {
            setIsSaving(false);
        }
    };
    return (<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">Personal Health Profile</h1>
        <p className="text-xs sm:text-sm text-ink-muted">
          Manage your vital clinical information, emergency contacts, known allergies, and medical conditions.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Card */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-surface-border">
            <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-health-100"/>
            <div>
              <h2 className="text-lg font-bold text-ink-main">{name}</h2>
              <p className="text-xs text-ink-muted">{user?.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-health-100 text-health-800">
                Verified Patient ID: {user?.id}
              </span>
            </div>
          </div>

          {/* Demographic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Age</label>
              <input type="number" value={age || ''} onChange={(e) => setAge(Number(e.target.value))} className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400">
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">Blood Group</label>
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full px-3 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400">
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
              <label className="block text-xs font-bold text-ink-main mb-1.5">Emergency Contact</label>
              <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Name (Relationship) - Phone" className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>
          </div>
        </div>

        {/* Clinical Tags: Allergies & Chronic Conditions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Allergies */}
          <div className="bg-surface p-6 rounded-3xl border border-surface-border shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-status-warning"/>
              <h3 className="font-bold text-sm text-ink-main">Known Allergies</h3>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[44px]">
              {allergies.map((allergy) => (<span key={allergy} className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <span>{allergy}</span>
                  <button type="button" onClick={() => setAllergies(allergies.filter((a) => a !== allergy))} className="hover:text-amber-700">
                    <X className="w-3 h-3"/>
                  </button>
                </span>))}
            </div>

            <div className="flex gap-2">
              <input type="text" value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} placeholder="Add allergy (e.g. Sulfa drugs)..." className="flex-1 px-3 py-2 text-xs bg-surface-muted rounded-xl border border-surface-border"/>
              <button type="button" onClick={handleAddAllergy} className="px-3 py-2 bg-health-100 text-health-900 font-bold text-xs rounded-xl">
                Add
              </button>
            </div>
          </div>

          {/* Chronic Conditions */}
          <div className="bg-surface p-6 rounded-3xl border border-surface-border shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-health-600"/>
              <h3 className="font-bold text-sm text-ink-main">Chronic Conditions</h3>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[44px]">
              {chronicConditions.map((cond) => (<span key={cond} className="px-3 py-1 bg-health-50 text-health-900 border border-health-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <span>{cond}</span>
                  <button type="button" onClick={() => setChronicConditions(chronicConditions.filter((c) => c !== cond))} className="hover:text-health-700">
                    <X className="w-3 h-3"/>
                  </button>
                </span>))}
            </div>

            <div className="flex gap-2">
              <input type="text" value={newCondition} onChange={(e) => setNewCondition(e.target.value)} placeholder="Add condition (e.g. Hypertension)..." className="flex-1 px-3 py-2 text-xs bg-surface-muted rounded-xl border border-surface-border"/>
              <button type="button" onClick={handleAddCondition} className="px-3 py-2 bg-health-100 text-health-900 font-bold text-xs rounded-xl">
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button type="submit" disabled={isSaving} className="px-8 py-3.5 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 disabled:opacity-50">
            <Save className="w-4 h-4"/>
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>);
};
