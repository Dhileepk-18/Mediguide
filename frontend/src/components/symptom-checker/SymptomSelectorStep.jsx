import React, { memo, useState, useMemo } from 'react';
import { Search, Check, ArrowRight } from 'lucide-react';
import { ALL_SYMPTOMS, CATEGORIZED_SYMPTOMS, RED_FLAG_SYMPTOMS } from './constants.js';

export const SymptomSelectorStep = memo(({
  selectedSymptoms,
  onToggleSymptom,
  onAddCustomSymptom,
  onClearAll,
  onContinue,
}) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');

  const handleAddCustom = e => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onAddCustomSymptom(customInput.trim());
    setCustomInput('');
  };

  const filteredSymptoms = useMemo(() => {
    let list = ALL_SYMPTOMS;
    if (activeCategory !== 'All') {
      const group = CATEGORIZED_SYMPTOMS.find(c => c.category === activeCategory);
      list = group ? group.items : ALL_SYMPTOMS;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => item.toLowerCase().includes(q));
    }
    return list;
  }, [activeCategory, searchQuery]);

  return (
    <div className="clinic-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">What symptoms are you experiencing?</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose from frequent clinical presentations or search specific symptoms below.
          </p>
        </div>
        {selectedSymptoms.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {selectedSymptoms.length} selected
            </span>
            <button
              onClick={onClearAll}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Search Bar & Custom Input */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search symptom keywords (e.g. fever, migraine, rash, wheeze)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
          />
        </div>
        <form onSubmit={handleAddCustom} className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder="Add custom symptom..."
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={!customInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            Add
          </button>
        </form>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['All', 'Respiratory', 'Cardiovascular', 'Neurology', 'Skin & Allergy', 'Digestive', 'Orthopedic'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Interactive Symptom Chips */}
      <div className="flex flex-wrap gap-2 pt-2">
        {filteredSymptoms.map(symptom => {
          const isSelected = selectedSymptoms.includes(symptom);
          const isRedFlag = RED_FLAG_SYMPTOMS.some(rf => symptom.toLowerCase().includes(rf));

          return (
            <button
              key={symptom}
              onClick={() => onToggleSymptom(symptom)}
              className={`group px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs scale-102 font-semibold'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <span>{symptom}</span>
              {isSelected ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : isRedFlag ? (
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 group-hover:bg-red-500" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <span className="text-xs text-slate-400 font-medium">
          Step 1 of 4: Symptom Capture
        </span>
        <button
          onClick={onContinue}
          disabled={selectedSymptoms.length === 0}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Continue to Clinical Context</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

SymptomSelectorStep.displayName = 'SymptomSelectorStep';
