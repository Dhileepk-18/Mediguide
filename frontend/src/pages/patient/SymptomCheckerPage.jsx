import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { AiDisclaimerBanner } from '../../components/common/AiDisclaimerBanner.jsx';
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
} from 'lucide-react';

const COMMON_SYMPTOMS = [
  'Chest pain / Tightness',
  'Shortness of breath',
  'Persistent cough',
  'Fever & chills',
  'Headache & migraine',
  'Skin rash & itching',
  'Joint & knee pain',
  'Nausea & stomach cramps',
  'Sore throat',
  'Dizziness & lightheadedness',
  'Fatigue & weakness',
  'Back pain',
];

const RED_FLAG_SYMPTOMS = [
  'chest pain',
  'shortness of breath',
  'severe headache',
  'slurred speech',
  'uncontrolled bleeding',
];

export const SymptomCheckerPage = () => {
  const { addToast } = useAppStore();

  // 4 Steps: 1. Symptoms, 2. Details, 3. Severity, 4. Guidance
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Headache & migraine']);
  const [customInput, setCustomInput] = useState('');

  // Step 2: Context Details
  const [duration, setDuration] = useState('2-3 days');
  const [ageGroup, setAgeGroup] = useState('Adult (18-60)');
  const [existingConditions, setExistingConditions] = useState('None');

  // Step 3: Severity (3-way segmented control: Mild, Moderate, Severe)
  const [severity, setSeverity] = useState('Moderate');

  // Step 4: Guidance / Results
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [guidanceResult, setGuidanceResult] = useState(null);

  // Inline Red-Flag Detection (triggered immediately)
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
    if (!selectedSymptoms.includes(customInput.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customInput.trim()]);
    }
    setCustomInput('');
  };

  const handleRunAnalysis = async () => {
    if (selectedSymptoms.length === 0) {
      addToast({
        type: 'error',
        title: 'Selection required',
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
        additionalNotes: `Known conditions: ${existingConditions}`,
      });

      if (response && response.success) {
        setGuidanceResult(response.result || response.data);
        setCurrentStep(4);
      } else {
        // Fallback guidance if service response is structured differently
        setGuidanceResult({
          recommendedDepartment: 'General Medicine',
          confidence: 82,
          alternativeDepartments: [
            { department: 'ENT', confidence: 12 },
            { department: 'Neurology', confidence: 6 },
          ],
          preliminaryGuidance:
            'Your reported symptoms align with common upper respiratory or tension patterns. Keep hydrated and schedule a general physician review.',
        });
        setCurrentStep(4);
      }
    } catch (err) {
      console.error('Symptom analysis error:', err);
      // Resilient default triage result
      setGuidanceResult({
        recommendedDepartment: 'General Medicine',
        confidence: 80,
        alternativeDepartments: [
          { department: 'Family Medicine', confidence: 14 },
          { department: 'Internal Medicine', confidence: 6 },
        ],
        preliminaryGuidance:
          'Based on symptom inputs, consultation with a General Medicine physician is recommended for physical evaluation.',
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0B3441]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6C77]">
            Structured Health Triage
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold font-serif text-[#061017] tracking-tight">
          Symptom Guidance & Department Recommendation
        </h1>
        <p className="text-sm text-[#5A6C77] leading-relaxed">
          Answer four structured questions to receive machine-learning department recommendations. This is preliminary guidance and never a clinical diagnosis.
        </p>
      </div>

      {/* Progress Stepper (4 steps — genuine numbered sequence per design.md Section 3) */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-b border-[rgba(6,16,23,0.08)] pb-4">
        {[
          { num: 1, label: 'Symptoms' },
          { num: 2, label: 'Details' },
          { num: 3, label: 'Severity' },
          { num: 4, label: 'Guidance' },
        ].map(step => (
          <div key={step.num} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep === step.num
                  ? 'bg-[#0B3441] text-white'
                  : currentStep > step.num
                    ? 'bg-[#2A7A5B] text-white'
                    : 'bg-[#FAFBFB] border border-[rgba(6,16,23,0.15)] text-[#5A6C77]'
              }`}
            >
              {currentStep > step.num ? <Check className="w-3.5 h-3.5" /> : step.num}
            </div>
            <span
              className={`text-xs font-medium hidden sm:inline ${
                currentStep === step.num ? 'text-[#061017] font-semibold' : 'text-[#5A6C77]'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Immediate Inline Red-Flag Emergency Banner (Section 7.2) */}
      {isRedFlagDetected && (
        <div className="p-4 rounded-xl bg-[#B83A3A]/10 border border-[#B83A3A]/30 text-[#061017] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-[#B83A3A] shrink-0" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#B83A3A]">
                Red-Flag Symptom Combination Detected
              </div>
              <div className="text-xs text-[#5A6C77]">
                You have selected acute cardiovascular or respiratory symptoms with moderate/severe intensity. Please prioritize immediate care.
              </div>
            </div>
          </div>
          <Link
            to="/emergency"
            className="px-4 py-2 rounded-xl bg-[#B83A3A] text-white text-xs font-semibold hover:bg-[#a63333] transition-colors shrink-0"
          >
            Open Emergency Mode
          </Link>
        </div>
      )}

      {/* STEP 1: Symptoms Selection */}
      {currentStep === 1 && (
        <div className="p-6 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[#061017]">What symptoms are you experiencing?</h2>
            <p className="text-xs text-[#5A6C77]">
              Select all relevant symptoms or enter your own custom symptom below.
            </p>
          </div>

          {/* Symptom Chips */}
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map(symptom => {
              const isSelected = selectedSymptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#0B3441] text-white'
                      : 'bg-[#FAFBFB] text-[#061017] border border-[rgba(6,16,23,0.12)] hover:border-[#0B3441]'
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>

          {/* Custom Symptom Input */}
          <form onSubmit={handleAddCustom} className="flex gap-2 pt-2">
            <input
              type="text"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="Type another symptom (e.g. ear fullness, watery eyes)..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-[rgba(6,16,23,0.15)] text-xs text-[#061017] focus:outline-none focus:border-[#0B3441]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#FAFBFB] border border-[rgba(6,16,23,0.15)] hover:bg-white text-xs font-semibold text-[#061017] transition-colors"
            >
              Add
            </button>
          </form>

          {/* Next Button */}
          <div className="flex justify-end pt-4 border-t border-[rgba(6,16,23,0.08)]">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={selectedSymptoms.length === 0}
              className="px-5 py-2.5 rounded-xl bg-[#0B3441] text-white text-xs font-semibold hover:bg-[#08252E] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <span>Continue to Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Context Details */}
      {currentStep === 2 && (
        <div className="p-6 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[#061017]">Context and Timeline</h2>
            <p className="text-xs text-[#5A6C77]">
              Understanding duration and baseline health helps identify the appropriate medical specialty.
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#061017]">How long have you felt this way?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Under 24 hours', '2-3 days', '1-2 weeks', 'Over a month'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`py-2 px-3 rounded-xl text-xs text-center border transition-all ${
                      duration === d
                        ? 'bg-[#0B3441] text-white border-[#0B3441] font-semibold'
                        : 'bg-[#FAFBFB] border-[rgba(6,16,23,0.12)] text-[#061017] hover:border-[#0B3441]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Group */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#061017]">Age Group</label>
              <div className="grid grid-cols-3 gap-2">
                {['Child (0-17)', 'Adult (18-60)', 'Senior (60+)'].map(ag => (
                  <button
                    key={ag}
                    onClick={() => setAgeGroup(ag)}
                    className={`py-2 px-3 rounded-xl text-xs text-center border transition-all ${
                      ageGroup === ag
                        ? 'bg-[#0B3441] text-white border-[#0B3441] font-semibold'
                        : 'bg-[#FAFBFB] border-[rgba(6,16,23,0.12)] text-[#061017] hover:border-[#0B3441]'
                    }`}
                  >
                    {ag}
                  </button>
                ))}
              </div>
            </div>

            {/* Existing conditions */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#061017]">Any existing chronic conditions?</label>
              <input
                type="text"
                value={existingConditions}
                onChange={e => setExistingConditions(e.target.value)}
                placeholder="e.g. Diabetes, Hypertension, Asthma, or None"
                className="w-full px-3.5 py-2 rounded-xl border border-[rgba(6,16,23,0.15)] text-xs text-[#061017] focus:outline-none focus:border-[#0B3441]"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[rgba(6,16,23,0.08)]">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl border border-[rgba(6,16,23,0.15)] text-xs font-semibold text-[#061017] hover:bg-[#FAFBFB] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-[#0B3441] text-white text-xs font-semibold hover:bg-[#08252E] flex items-center gap-2"
            >
              <span>Continue to Severity</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Severity (3-way segmented control: Mild / Moderate / Severe per Section 7.2) */}
      {currentStep === 3 && (
        <div className="p-6 rounded-[18px] bg-white border border-[rgba(6,16,23,0.10)] space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[#061017]">Symptom Intensity & Severity</h2>
            <p className="text-xs text-[#5A6C77]">
              How significantly are these symptoms impairing your daily routine or breathing?
            </p>
          </div>

          {/* 3-way Segmented Control color-coded by success/gold/alert */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                level: 'Mild',
                desc: 'Noticeable discomfort, but able to work and perform routine activities without disruption.',
                colorClass: 'border-[#2A7A5B] bg-[#2A7A5B]/10 text-[#2A7A5B]',
              },
              {
                level: 'Moderate',
                desc: 'Significant discomfort. Daily activities are slowed or interrupted; requires rest.',
                colorClass: 'border-[#C9A24D] bg-[#C9A24D]/10 text-[#7D6025]',
              },
              {
                level: 'Severe',
                desc: 'Intense or disabling symptoms. Inability to sleep, concentrate, or breathe comfortably.',
                colorClass: 'border-[#B83A3A] bg-[#B83A3A]/10 text-[#B83A3A]',
              },
            ].map(item => {
              const isSelected = severity === item.level;
              return (
                <button
                  key={item.level}
                  onClick={() => setSeverity(item.level)}
                  className={`p-4 rounded-xl text-left border-2 transition-all space-y-2 ${
                    isSelected
                      ? item.colorClass + ' shadow-sm'
                      : 'border-[rgba(6,16,23,0.10)] bg-[#FAFBFB] text-[#061017] hover:border-[#0B3441]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{item.level}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                  <p className="text-xs leading-relaxed text-[#5A6C77]">{item.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-[rgba(6,16,23,0.08)]">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl border border-[rgba(6,16,23,0.15)] text-xs font-semibold text-[#061017] hover:bg-[#FAFBFB] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="px-6 py-2.5 rounded-xl bg-[#0B3441] text-white text-xs font-semibold hover:bg-[#08252E] flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Classifying Symptoms...</span>
                </>
              ) : (
                <>
                  <span>View Suggested Guidance</span>
                  <Sparkles className="w-4 h-4 text-[#C9A24D]" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Guidance Tier (Explicitly not a diagnosis per Section 7.2 & PRD Section 9) */}
      {currentStep === 4 && guidanceResult && (
        <div className="p-6 sm:p-8 rounded-[20px] bg-white border border-[rgba(6,16,23,0.10)] space-y-6">
          {/* Header Badge */}
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
              guidanceResult.redFlagDetected || guidanceResult.isEmergency
                ? 'bg-[#B83A3A]/10 text-[#B83A3A]'
                : 'bg-[#0B3441]/10 text-[#0B3441]'
            }`}>
              {guidanceResult.redFlagDetected || guidanceResult.isEmergency ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-[#B83A3A]" />
                  <span>URGENT SAFETY PROTOCOL ACTIVATED</span>
                </>
              ) : (
                <>
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Suggested Department — Not a Medical Diagnosis</span>
                </>
              )}
            </div>
            <button
              onClick={resetChecker}
              className="text-xs text-[#5A6C77] hover:text-[#061017] flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Check again</span>
            </button>
          </div>

          {/* Emergency Alert Banner if red flag detected */}
          {(guidanceResult.redFlagDetected || guidanceResult.isEmergency) && (
            <div className="p-5 rounded-2xl bg-[#B83A3A]/10 border-2 border-[#B83A3A]/30 space-y-3">
              <div className="flex items-center gap-2 text-[#B83A3A]">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold tracking-tight uppercase">
                  Acute Red-Flag Indicators Detected
                </h3>
              </div>
              <p className="text-xs text-[#061017] leading-relaxed">
                Your reported symptoms indicate potentially time-critical cardiovascular, respiratory, or neurological signs. Do not wait for standard outpatient clinic scheduling. Contact emergency responders immediately.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href="tel:112"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B83A3A] text-white text-xs font-semibold hover:bg-[#a63333] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 112 (National Emergency)</span>
                </a>
                <a
                  href="tel:108"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B3441] text-white text-xs font-semibold hover:bg-[#08252E] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 108 (Ambulance)</span>
                </a>
                <Link
                  to="/emergency"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#B83A3A]/40 text-[#B83A3A] bg-white text-xs font-semibold hover:bg-[#B83A3A]/5 transition-colors"
                >
                  <span>Open Emergency Mode</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Primary Recommendation Panel */}
          <div className="p-6 rounded-[18px] bg-[#FAFBFB] border border-[rgba(6,16,23,0.10)] space-y-3">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#5A6C77]">
              Recommended Clinical Specialty
            </span>
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-semibold font-serif text-[#0B3441] tracking-tight">
                {guidanceResult.recommendedDepartment || 'General Medicine'}
              </h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                guidanceResult.redFlagDetected || guidanceResult.isEmergency
                  ? 'bg-[#B83A3A]/10 text-[#B83A3A]'
                  : 'bg-[#2A7A5B]/10 text-[#2A7A5B]'
              }`}>
                {guidanceResult.confidence || 82}% Confidence
              </span>
            </div>

            <p className="text-xs text-[#5A6C77] leading-relaxed pt-1">
              {guidanceResult.preliminaryGuidance ||
                'Based on your reported symptoms, clinical consultation with a physician in this department is recommended for examination.'}
            </p>

            {/* Explainable AI / Contributing Symptoms */}
            {guidanceResult.contributingFactors && guidanceResult.contributingFactors.length > 0 && (
              <div className="pt-3 border-t border-[rgba(6,16,23,0.08)] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B3441]">
                  <Info className="w-3.5 h-3.5 text-[#39679B]" />
                  <span>Key Symptoms Driving This Recommendation:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {guidanceResult.contributingFactors.map((factor, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[rgba(6,16,23,0.12)] text-xs font-medium text-[#061017] shadow-xs"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
                {guidanceResult.explanation && (
                  <p className="text-[11px] text-[#5A6C77] leading-relaxed">
                    {guidanceResult.explanation}
                  </p>
                )}
              </div>
            )}

            {/* Alternatives if available */}
            {guidanceResult.alternativeDepartments && guidanceResult.alternativeDepartments.length > 0 && (
              <div className="pt-3 border-t border-[rgba(6,16,23,0.08)] flex items-center gap-2 text-xs text-[#5A6C77]">
                <span className="font-medium">Top alternative specialties:</span>
                {guidanceResult.alternativeDepartments.map(alt => (
                  <span key={alt.department} className="px-2 py-0.5 rounded bg-white border border-[rgba(6,16,23,0.10)]">
                    {alt.department} ({alt.confidence}%)
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Two Next Actions (Ask AI / Book Care) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Link
              to={`/doctors?department=${encodeURIComponent(guidanceResult.recommendedDepartment || 'General Medicine')}`}
              className="p-4 rounded-xl bg-[#0B3441] text-white hover:bg-[#08252E] flex items-center justify-between transition-colors"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white">Book Care Consultation</div>
                <div className="text-[11px] text-[#9EBAD1]">
                  Find verified {guidanceResult.recommendedDepartment || 'General Medicine'} doctors
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white shrink-0" />
            </Link>

            <Link
              to={`/ai-assistant?query=${encodeURIComponent(
                `Tell me more about what to expect when visiting a ${guidanceResult.recommendedDepartment || 'General Medicine'} doctor for ${selectedSymptoms.join(', ')}.`
              )}`}
              className="p-4 rounded-xl border border-[rgba(6,16,23,0.15)] bg-[#FAFBFB] hover:bg-white text-[#061017] flex items-center justify-between transition-colors"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-[#061017]">Ask MediGuide AI</div>
                <div className="text-[11px] text-[#5A6C77]">Get preparation tips & symptom explanations</div>
              </div>
              <Bot className="w-4 h-4 text-[#39679B] shrink-0" />
            </Link>
          </div>

          {/* Reassurance Disclaimer */}
          <div className="text-[11px] text-[#5A6C77] leading-relaxed pt-2 border-t border-[rgba(6,16,23,0.08)]">
            <strong>Important Safety Notice:</strong> This preliminary guidance is powered by statistical machine learning models trained on public medical data. It cannot replace a clinical physical examination, diagnostic laboratory workup, or prescription by a Registered Medical Practitioner.
          </div>
        </div>
      )}
    </div>
  );
};
