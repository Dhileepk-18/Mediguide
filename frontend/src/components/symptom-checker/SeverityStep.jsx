import React, { memo } from 'react';
import { Check, ArrowLeft, Sparkles } from 'lucide-react';
import { SEVERITY_LEVELS } from './constants.js';

export const SeverityStep = memo(({
  severity,
  onSelectSeverity,
  isAnalyzing,
  onBack,
  onAnalyze,
}) => {
  return (
    <div className="clinic-card p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Symptom Intensity & Daily Acuity</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select the degree of impairment to establish urgent vs routine outpatient clinical handling.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {SEVERITY_LEVELS.map(item => {
          const isSelected = severity === item.level;

          return (
            <button
              key={item.level}
              onClick={() => onSelectSeverity(item.level)}
              className={`p-4 rounded-2xl border-2 text-left transition-all space-y-2.5 ${
                isSelected
                  ? item.accent + ' shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-current">
                  {item.badge}
                </span>
                {isSelected && <Check className="w-4 h-4 shrink-0" />}
              </div>
              <div>
                <h3 className="text-sm font-bold">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Evaluating Clinical Presentation...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Compute Department Recommendation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
});

SeverityStep.displayName = 'SeverityStep';
