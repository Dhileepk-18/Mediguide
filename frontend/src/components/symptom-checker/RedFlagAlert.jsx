import React, { memo } from 'react';
import { ShieldAlert, Phone } from 'lucide-react';

export const RedFlagAlert = memo(() => {
  return (
    <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200 text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse-subtle">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-100 text-red-700 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
            <span>Urgent Red-Flag Presentation Detected</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Acute cardiovascular or respiratory indicators with moderate/severe intensity should not wait for outpatient appointment slots.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
        <a
          href="tel:112"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call 112 SOS</span>
        </a>
      </div>
    </div>
  );
});

RedFlagAlert.displayName = 'RedFlagAlert';
