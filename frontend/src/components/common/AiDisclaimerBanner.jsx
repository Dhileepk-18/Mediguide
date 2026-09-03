import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
export const AiDisclaimerBanner = ({ className = '', compact = false }) => {
  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 bg-health-50 border border-health-200/80 rounded-xl text-xs text-health-800 ${className}`}
      >
        <AlertCircle className="w-4 h-4 text-health-600 shrink-0" />
        <span>
          <strong>AI Safety Notice:</strong> Preliminary guidance only. Not a medical diagnosis. In
          emergencies, call local emergency services immediately.
        </span>
      </div>
    );
  }
  return (
    <div
      className={`p-4 bg-gradient-to-r from-health-50 via-white to-health-50 border border-health-200 rounded-2xl shadow-sm text-sm text-health-900 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-health-100 text-health-700 rounded-xl shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-health-900">Clinical Safety & AI Disclaimer</h4>
            <span className="text-[11px] font-medium bg-health-200/70 text-health-800 px-2 py-0.5 rounded-full">
              Non-Diagnostic
            </span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            MediGuide AI provides informational guidance and preliminary symptom triage to support
            your wellness journey. It does not substitute for clinical diagnosis, treatment, or
            professional advice by a licensed physician. If you experience acute chest pain, severe
            shortness of breath, or trauma, seek emergency medical care immediately.
          </p>
        </div>
      </div>
    </div>
  );
};
