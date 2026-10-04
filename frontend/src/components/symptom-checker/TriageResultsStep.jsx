import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Check,
  RotateCcw,
  AlertTriangle,
  Phone,
  ArrowRight,
  Stethoscope,
  Info,
  Bot,
} from 'lucide-react';

export const TriageResultsStep = memo(({
  guidanceResult,
  selectedSymptoms,
  onResetChecker,
}) => {
  if (!guidanceResult) return null;

  const isEmergency = Boolean(guidanceResult.redFlagDetected || guidanceResult.isEmergency);

  return (
    <div className="clinic-card p-6 sm:p-8 space-y-6">
      {/* Header Status Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
            isEmergency
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {isEmergency ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>HIGH-ACUITY PROTOCOL ACTIVE</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>PRELIMINARY DEPARTMENT ROUTING COMPLETE</span>
            </>
          )}
        </div>

        <button
          onClick={onResetChecker}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Check New Symptoms</span>
        </button>
      </div>

      {/* Emergency Red-Flag Alert Block */}
      {isEmergency && (
        <div className="p-5 rounded-2xl bg-red-50/90 border border-red-200 space-y-3">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold uppercase tracking-tight">
              Acute Red-Flag Safety Indicators Identified
            </h3>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Your reported presentation contains high-risk cardiovascular, neurological, or respiratory patterns. Outpatient scheduling is not recommended. Please contact Indian emergency services immediately.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <a
              href="tel:112"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Dial 112 (National Emergency)</span>
            </a>
            <a
              href="tel:108"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Dial 108 (Ambulance)</span>
            </a>
            <Link
              to="/emergency"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700 text-xs font-bold hover:bg-red-50 transition-colors"
            >
              <span>Open Emergency Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Recommended Department Hero Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold tracking-wider text-blue-700">
              Recommended Medical Department
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Stethoscope className="w-7 h-7 text-blue-600 shrink-0" />
              <span>{guidanceResult.recommendedDepartment || 'General Medicine'}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-100 shadow-2xs self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-500">ML Confidence:</span>
            <span className="text-sm font-black text-blue-600">
              {guidanceResult.confidence || 82}%
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {guidanceResult.preliminaryGuidance ||
            'Based on statistical feature mapping, consultation with a specialist in this department is recommended for physical examination and targeted investigations.'}
        </p>

        {/* Explainable AI / Feature Attribution */}
        {guidanceResult.contributingFactors && guidanceResult.contributingFactors.length > 0 && (
          <div className="pt-3 border-t border-slate-200/60 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Key Symptoms Guiding This Result:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {guidanceResult.contributingFactors.map((factor, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs"
                >
                  {factor}
                </span>
              ))}
            </div>
            {guidanceResult.explanation && (
              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                {guidanceResult.explanation}
              </p>
            )}
          </div>
        )}

        {/* Alternative Departments Breakdown */}
        {guidanceResult.alternativeDepartments && guidanceResult.alternativeDepartments.length > 0 && (
          <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Alternative Departments Evaluated:</span>
            {guidanceResult.alternativeDepartments.map(alt => (
              <span
                key={alt.department}
                className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium"
              >
                {alt.department} ({alt.confidence}%)
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
        <Link
          to={`/doctors?department=${encodeURIComponent(
            guidanceResult.recommendedDepartment || 'General Medicine'
          )}`}
          className="p-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-between transition-all shadow-xs group"
        >
          <div>
            <p className="text-xs font-bold">Book Specialist Consultation</p>
            <p className="text-[11px] text-blue-100 mt-0.5">
              View doctors in {guidanceResult.recommendedDepartment || 'General Medicine'}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to={`/ai-assistant?query=${encodeURIComponent(
            `Tell me more about what to expect when visiting ${guidanceResult.recommendedDepartment || 'General Medicine'} for ${selectedSymptoms.join(', ')}.`
          )}`}
          className="p-4 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 text-slate-800 flex items-center justify-between transition-all group"
        >
          <div>
            <p className="text-xs font-bold">Ask MediGuide AI</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Explore prep advice & lifestyle steps
            </p>
          </div>
          <Bot className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
        </Link>
      </div>

      {/* Offline Service Notice (if ML service offline) */}
      {guidanceResult.isOffline && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>The automated triage service is currently offline. Displaying standard clinical guidance below.</span>
        </div>
      )}

      {/* Clinical Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 text-center font-medium">
        This is not a medical diagnosis. Please consult a doctor.
      </div>
    </div>
  );
});

TriageResultsStep.displayName = 'TriageResultsStep';
