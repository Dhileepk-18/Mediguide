import React, { memo } from 'react';
import { Clock, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { DURATION_OPTIONS, AGE_GROUP_OPTIONS, CONDITION_OPTIONS } from './constants.js';

export const ClinicalContextStep = memo(({
  duration,
  onSelectDuration,
  ageGroup,
  onSelectAgeGroup,
  existingConditions,
  onToggleCondition,
  onBack,
  onContinue,
}) => {
  return (
    <div className="clinic-card p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Clinical Context & Timeline</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Providing timeline and personal factors refines specialist matching accuracy.
        </p>
      </div>

      {/* Duration Cards */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          How long have these symptoms persisted?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DURATION_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => onSelectDuration(d)}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                duration === d
                  ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-slate-400 mb-1" />
              <span>{d}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Age Group */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Patient Age Group
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {AGE_GROUP_OPTIONS.map(age => (
            <button
              key={age}
              onClick={() => onSelectAgeGroup(age)}
              className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                ageGroup === age
                  ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <User className="w-3.5 h-3.5 mx-auto text-slate-400 mb-1" />
              <span>{age}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pre-existing Conditions */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Pre-existing Medical Factors (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {CONDITION_OPTIONS.map(cond => {
            const isSelected = existingConditions.includes(cond);
            return (
              <button
                key={cond}
                onClick={() => onToggleCondition(cond)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {cond}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={onContinue}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
        >
          <span>Continue to Severity</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

ClinicalContextStep.displayName = 'ClinicalContextStep';
