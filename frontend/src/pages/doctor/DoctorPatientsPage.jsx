import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { Mail } from 'lucide-react';
export const DoctorPatientsPage = () => {
    const [patients, setPatients] = useState([]);
    useEffect(() => {
        loadPatients();
    }, []);
    const loadPatients = async () => {
        try {
            const res = await api.getMyPatients();
            if (res.success && res.patients) {
                setPatients(res.patients);
            }
        }
        catch (err) {
            console.error('Failed to load doctor patients:', err);
        }
    };
    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">Assigned Patients Directory</h1>
        <p className="text-xs sm:text-sm text-ink-muted">
          Review medical vitals, allergy records, and history for your consulting patients.
        </p>
      </div>

      {patients.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {patients.map((p) => (<div key={p.id} className="bg-surface rounded-3xl p-6 border border-surface-border shadow-soft space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-surface-border">
              <img src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt={p.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-health-200 shrink-0"/>
              <div>
                <h3 className="font-extrabold text-sm text-ink-main">{p.name}</h3>
                <div className="text-xs text-ink-muted flex items-center gap-2 mt-0.5">
                  <span>{p.gender || 'Patient'}{p.age ? `, ${p.age} yrs` : ''}</span>
                  <span>•</span>
                  <span className="font-bold text-health-800">Blood: {p.bloodGroup || 'Not set'}</span>
                </div>
                <div className="text-[11px] text-ink-muted mt-1 flex items-center gap-1.5">
                  <Mail className="w-3 h-3"/>
                  <span>{p.email}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="font-bold text-amber-900 block mb-1">Allergies:</span>
                <span className="text-amber-800 font-medium">
                  {p.allergies && p.allergies.length > 0 ? p.allergies.join(', ') : 'None known'}
                </span>
              </div>

              <div className="p-3 bg-health-50 rounded-2xl border border-health-200">
                <span className="font-bold text-health-900 block mb-1">Chronic Conditions:</span>
                <span className="text-health-800 font-medium">
                  {p.chronicConditions && p.chronicConditions.length > 0
                ? p.chronicConditions.join(', ')
                : 'None reported'}
                </span>
              </div>
            </div>

            {p.emergencyContact && (<div className="text-[11px] text-ink-muted p-2 rounded-xl bg-surface-muted">
                <strong>Emergency:</strong> {p.emergencyContact}
              </div>)}
          </div>))}
      </div>) : (<div className="p-12 bg-surface rounded-3xl border border-surface-border text-center space-y-2">
          <p className="text-xs text-ink-muted">No patient profiles registered yet.</p>
        </div>)}
    </div>);
};
