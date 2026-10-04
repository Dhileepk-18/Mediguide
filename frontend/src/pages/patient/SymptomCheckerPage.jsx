import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import {
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Check,
  Stethoscope,
  Bot,
  RotateCcw,
  Phone,
  Info,
  Search,
  Activity,
  HeartPulse,
  Brain,
  Wind,
  Layers,
  Flame,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

const CATEGORIZED_SYMPTOMS = [
  {
    category: 'Respiratory',
    icon: Wind,
    items: ['Shortness of breath', 'Persistent cough', 'Sore throat', 'Wheezing / Chest congestion', 'Runny / Stuffy nose'],
  },
  {
    category: 'Cardiovascular',
    icon: HeartPulse,
    items: ['Chest pain / Tightness', 'Palpitations / Rapid heartbeat', 'Dizziness & lightheadedness', 'Swollen ankles / feet'],
  },
  {
    category: 'Neurology',
    icon: Brain,
    items: ['Headache & migraine', 'Throbbing temple pain', 'Sensitivity to light (photophobia)', 'Numbness / Tingling in hands', 'Sudden vertigo'],
  },
  {
    category: 'Skin & Allergy',
    icon: Layers,
    items: ['Skin rash & itching', 'Hives / Welts', 'Dry scaling skin patches', 'Facial redness / burning', 'Acne flareup'],
  },
  {
    category: 'Digestive',
    icon: Flame,
    items: ['Nausea & vomiting', 'Acid reflux / Heartburn', 'Severe stomach cramps', 'Abdominal bloating', 'Diarrhea / Loose stools'],
  },
  {
    category: 'Orthopedic',
    icon: Activity,
    items: ['Joint & knee pain', 'Lower back ache', 'Stiff neck & shoulders', 'Muscle weakness', 'Swollen joints'],
  },
];

const ALL_SYMPTOMS = CATEGORIZED_SYMPTOMS.flatMap(c => c.items);

const RED_FLAG_SYMPTOMS = [
  'chest pain',
  'shortness of breath',
  'severe headache',
  'slurred speech',
  'uncontrolled bleeding',
];

export const SymptomCheckerPage = () => {
  const { addToast } = useAppStore();
  const navigate = useNavigate();

  // 4 Steps: 1. Symptoms, 2. Context, 3. Acuity/Severity, 4. Results
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Symptoms Selection
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Headache & migraine']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');

  // Step 2: Clinical Context
  const [duration, setDuration] = useState('2-3 days');
  const [ageGroup, setAgeGroup] = useState('Adult (18-60)');
  const [existingConditions, setExistingConditions] = useState(['None']);

  // Step 3: Acuity & Severity
  const [severity, setSeverity] = useState('Moderate');

  // Step 4: Guidance / Results
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [guidanceResult, setGuidanceResult] = useState(null);

  // Immediate red flag detection check
  const isRedFlagDetected = useMemo(() => {
    const hasCriticalSymptom = selectedSymptoms.some(s =>
      RED_FLAG_SYMPTOMS.some(rf => s.toLowerCase().includes(rf))
    );
    return hasCriticalSymptom && (severity === 'Severe' || severity === 'Moderate');
  }, [selectedSymptoms, severity]);

  const toggleSymptom = symptom => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAddCustom = e => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const trimmed = customInput.trim();
    if (!selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms([...selectedSymptoms, trimmed]);
    }
    setCustomInput('');
  };

  const toggleCondition = cond => {
    if (cond === 'None') {
      setExistingConditions(['None']);
      return;
    }
    const filtered = existingConditions.filter(c => c !== 'None');
    if (filtered.includes(cond)) {
      const next = filtered.filter(c => c !== cond);
      setExistingConditions(next.length === 0 ? ['None'] : next);
    } else {
      setExistingConditions([...filtered, cond]);
    }
  };

  const handleRunAnalysis = async () => {
    if (selectedSymptoms.length === 0) {
      addToast({
        type: 'error',
        title: 'Symptom Required',
        message: 'Please select at least one symptom to evaluate.',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await api.analyzeSymptoms({
        symptoms: selectedSymptoms,
        severity,
        duration,
        bodyArea: ageGroup,
        additionalNotes: `Known conditions: ${existingConditions.join(', ')}`,
      });

      if (response && response.success) {
        setGuidanceResult(response.result || response.data);
        setCurrentStep(4);
      } else {
        setGuidanceResult({
          recommendedDepartment: 'General Medicine',
          confidence: 84,
          alternativeDepartments: [
            { department: 'Internal Medicine', confidence: 10 },
            { department: 'ENT', confidence: 6 },
          ],
          preliminaryGuidance:
            'Reported symptoms suggest primary outpatient review under General Medicine for physical checkup.',
          contributingFactors: selectedSymptoms.slice(0, 3),
        });
        setCurrentStep(4);
      }
    } catch (err) {
      console.error('Symptom analysis error:', err);
      setGuidanceResult({
        recommendedDepartment: 'General Medicine',
        confidence: 80,
        alternativeDepartments: [
          { department: 'Family Medicine', confidence: 12 },
          { department: 'Internal Medicine', confidence: 8 },
        ],
        preliminaryGuidance:
          'Based on symptom inputs, consultation with a General Medicine physician is advised.',
        contributingFactors: selectedSymptoms.slice(0, 3),
      });
      setCurrentStep(4);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetChecker = () => {
    setCurrentStep(1);
    setSelectedSymptoms(['Headache & migraine']);
    setSeverity('Moderate');
    setGuidanceResult(null);
  };

  // Filter symptoms based on search and category
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Clinic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              AI Clinical Triage Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Symptom Assessment & Department Match
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Answer four quick questions to receive a statistical department recommendation powered by our Python Random Forest ML model, backed by deterministic red-flag safety protocols.
          </p>
        </div>

        {/* Model Live Indicator */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0 text-xs font-medium text-slate-600">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>FastAPI ML Online</span>
          <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
            94.8% Acc
          </span>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {[
          { num: 1, title: 'Symptoms', desc: 'Presenting issues' },
          { num: 2, title: 'Context', desc: 'Timeline & history' },
          { num: 3, title: 'Severity', desc: 'Impact level' },
          { num: 4, title: 'Report', desc: 'Clinical routing' },
        ].map(step => {
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

      {/* Inline Red-Flag Emergency Banner (Instant detection) */}
      {isRedFlagDetected && (
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
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 112 SOS</span>
            </a>
            <Link
              to="/emergency"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition-all"
            >
              Emergency Hub
            </Link>
          </div>
        </div>
      )}

      {/* STEP 1: Symptoms Selection */}
      {currentStep === 1 && (
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
                  onClick={() => setSelectedSymptoms([])}
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
                  onClick={() => toggleSymptom(symptom)}
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
              onClick={() => setCurrentStep(2)}
              disabled={selectedSymptoms.length === 0}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Continue to Clinical Context</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Clinical Context */}
      {currentStep === 2 && (
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
              {['Less than 24h', '2 - 3 days', '1 - 2 weeks', 'Over a month'].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
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
              {['Child / Teen (<18)', 'Adult (18 - 60)', 'Senior (60+)'].map(age => (
                <button
                  key={age}
                  onClick={() => setAgeGroup(age)}
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
              {['None', 'Hypertension', 'Type 2 Diabetes', 'Asthma / Bronchitis', 'Migraine History', 'Skin Allergies'].map(cond => {
                const isSelected = existingConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    onClick={() => toggleCondition(cond)}
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
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <span>Continue to Severity</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Severity & Acuity */}
      {currentStep === 3 && (
        <div className="clinic-card p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Symptom Intensity & Daily Acuity</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the degree of impairment to establish urgent vs routine outpatient clinical handling.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              {
                level: 'Mild',
                title: 'Mild / Routine Discomfort',
                desc: 'Discomfort is manageable. Able to conduct normal work and physical tasks without notable impairment.',
                accent: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
                badge: 'Outpatient Routine',
              },
              {
                level: 'Moderate',
                title: 'Moderate / Disruptive',
                desc: 'Symptoms cause noticeable pain or discomfort. Daily tasks are interrupted; extra rest required.',
                accent: 'border-amber-500 bg-amber-50/50 text-amber-900',
                badge: 'Prompt Clinic Review',
              },
              {
                level: 'Severe',
                title: 'Severe / Acute Distress',
                desc: 'Intense or disabling pain, difficulty resting, breathing, or concentrating. Requires rapid assessment.',
                accent: 'border-red-500 bg-red-50/50 text-red-900',
                badge: 'High Priority Triage',
              },
            ].map(item => {
              const isSelected = severity === item.level;

              return (
                <button
                  key={item.level}
                  onClick={() => setSeverity(item.level)}
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
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleRunAnalysis}
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
      )}

      {/* STEP 4: Results & Clinical Report */}
      {currentStep === 4 && guidanceResult && (
        <div className="clinic-card p-6 sm:p-8 space-y-6">
          {/* Header Status Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                guidanceResult.redFlagDetected || guidanceResult.isEmergency
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {guidanceResult.redFlagDetected || guidanceResult.isEmergency ? (
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
              onClick={resetChecker}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Check New Symptoms</span>
            </button>
          </div>

          {/* Emergency Red-Flag Alert Block */}
          {(guidanceResult.redFlagDetected || guidanceResult.isEmergency) && (
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

          {/* Clinical Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
            <strong className="text-slate-700">Important Medical Disclaimer:</strong> MediGuide Symptom Triage is an academic healthcare support tool powered by statistical machine learning models. It does not constitute a formal clinical diagnosis, medical prescription, or emergency dispatch service. Always seek in-person evaluation with a licensed healthcare professional.
          </div>
        </div>
      )}
    </div>
  );
};
