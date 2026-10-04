import React from 'react';
import { PhoneCall, AlertTriangle, X, ShieldAlert, Activity } from 'lucide-react';

export const EmergencyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const emergencyNumbers = [
    {
      number: '112',
      title: 'National Emergency Helpline (All-in-One)',
      desc: 'Immediate dispatch for police, fire, medical ambulance, or critical distress anywhere across India.',
      badge: 'Toll Free 24x7',
      bg: 'bg-red-50 border-red-200 text-red-700',
      btnBg: 'bg-red-600 hover:bg-red-700 text-white',
    },
    {
      number: '108',
      title: 'National Ambulance & Medical Emergency Service',
      desc: 'Rapid medical response ambulance, critical trauma transport, and emergency medical technicians.',
      badge: 'Emergency Medical',
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    {
      number: '102',
      title: 'Maternal & Child Healthcare Transport',
      desc: 'Dedicated transport for pregnant women, neonatal care, and infant health emergencies (Janani Shishu Suraksha).',
      badge: 'Maternal Care',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      number: '14416',
      title: 'Tele-MANAS Mental Health Helpline',
      desc: 'National mental health helpline offering free, confidential 24x7 counseling across Indian languages.',
      badge: 'Tele-MANAS',
      bg: 'bg-purple-50 border-purple-200 text-purple-800',
      btnBg: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-red-200 max-w-xl w-full overflow-hidden">
        {/* Emergency Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">
                  India Emergency Healthcare Helplines
                </h3>
                <span className="bg-white text-red-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  24x7 Active
                </span>
              </div>
              <p className="text-xs text-red-100 mt-0.5">
                If you or someone around you has life-threatening symptoms, dial immediately.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Notice */}
        <div className="p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-xs font-semibold text-red-800">
              MediGuide is an informational assistant. In sudden acute chest pain, stroke signs
              (face drooping, arm weakness), or severe bleeding, please call emergency services
              right away.
            </p>
          </div>

          {emergencyNumbers.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${item.bg} flex items-center justify-between gap-4 transition-all hover:shadow-md`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/80 border border-current">
                    {item.badge}
                  </span>
                  <h4 className="text-sm font-bold truncate">{item.title}</h4>
                </div>
                <p className="text-xs opacity-90 leading-relaxed">{item.desc}</p>
              </div>
              <a
                href={`tel:${item.number.split(' ')[0]}`}
                className={`px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shrink-0 shadow-soft transition-transform active:scale-95 ${item.btnBg}`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>{item.number}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-red-500" />
            Government of India Emergency Medical Network
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
