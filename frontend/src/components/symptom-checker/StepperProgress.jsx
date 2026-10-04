import React, { memo } from 'react';
import { Check } from 'lucide-react';
import { STEPS } from './constants.js';

export const StepperProgress = memo(({ currentStep }) => {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {STEPS.map(step => {
        const isDone = currentStep > step.num;
        const isCurrent = currentStep === step.num;

        return (
          <div
            key={step.num}
            className={`p-3 rounded-xl border transition-all ${
              isCurrent
                ? 'bg-blue-50/70 border-blue-200 shadow-xs'
                : isDone
                  ? 'bg-white border-slate-200/80'
                  : 'bg-slate-50/60 border-slate-200/50 opacity-60'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : step.num}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold truncate ${
                    isCurrent ? 'text-blue-900' : isDone ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-400 truncate hidden sm:block">
                  {step.desc}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

StepperProgress.displayName = 'StepperProgress';
