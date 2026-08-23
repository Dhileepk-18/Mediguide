import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { AiDisclaimerBanner } from '../../components/common/AiDisclaimerBanner.jsx';
import {
    Stethoscope,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    Calendar,
    Plus,
    X,
    AlertTriangle,
    ShieldAlert,
    PhoneCall,
    CheckCircle2,
    Activity,
    Clock,
    UserCheck,
    Check,
    ChevronRight,
    AlertCircle,
    RotateCcw,
} from 'lucide-react';

const COMMON_SYMPTOM_PRESETS = [
    'Headache & Migraine',
    'Fever & Body Chills',
    'Persistent Cough',
    'Chest Tightness / Pain',
    'Skin Rash & Itching',
    'Knee / Joint Pain',
    'Lower Back Pain',
    'Nasal Congestion & Sneezing',
    'Dizziness & Vertigo',
    'Digestive Acidity / Gastric',
    'Sore Throat & Hoarseness',
    'Eye Irritation & Redness',
];

const BODY_AREAS = [
    { id: 'Head & Neck', name: 'Head & Neck', desc: 'Brain, eyes, ears, sinuses, throat' },
    { id: 'Chest & Heart', name: 'Chest & Cardiovascular', desc: 'Heart, lungs, sternum, ribcage' },
    { id: 'Abdominal & Gut', name: 'Abdominal & Digestive', desc: 'Stomach, bowels, liver, gallbladder' },
    { id: 'Musculoskeletal', name: 'Musculoskeletal & Joints', desc: 'Spine, knees, hips, shoulders, muscles' },
    { id: 'Skin & Surface', name: 'Skin & Dermatological', desc: 'Rashes, lesions, scalp, nails' },
    { id: 'General Systemic', name: 'General / Whole Body', desc: 'Fatigue, chills, generalized weakness' },
];

export const SymptomCheckerPage = () => {
    const { addToast } = useAppStore();
    const navigate = useNavigate();

    // Multi-Step State (1 to 5)
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1: Symptoms Selection
    const [selectedSymptoms, setSelectedSymptoms] = useState(['Headache & Migraine', 'Nasal Congestion & Sneezing']);
    const [customSymptom, setCustomSymptom] = useState('');

    // Step 2: Duration & Onset Timing
    const [duration, setDuration] = useState('2-3 days');
    const [onsetSpeed, setOnsetSpeed] = useState('Gradual (over days)');

    // Step 3: Severity Selector
    const [severity, setSeverity] = useState('Moderate');

    // Step 4: Body Area & Clinical Notes
    const [bodyArea, setBodyArea] = useState('Head & Neck');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [hasRedFlags, setHasRedFlags] = useState(false);

    // Step 5: Results & Execution State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [matchedDoctors, setMatchedDoctors] = useState([]);

    const handleAddCustomSymptom = (e) => {
        e.preventDefault();
        if (!customSymptom.trim()) return;
        if (!selectedSymptoms.includes(customSymptom.trim())) {
            setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
        }
        setCustomSymptom('');
    };

    const togglePresetSymptom = (symptom) => {
        if (selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
        } else {
            setSelectedSymptoms([...selectedSymptoms, symptom]);
        }
    };

    const removeSymptom = (symptom) => {
        setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    };

    const isUrgentCondition = hasRedFlags || severity === 'Severe' || selectedSymptoms.some(s => s.toLowerCase().includes('chest tightness') || s.toLowerCase().includes('chest pain'));

    const handleStartAnalysis = async () => {
        setCurrentStep(5);
        setIsAnalyzing(true);
        setResult(null);

        try {
            const combinedNotes = `${additionalNotes} [Onset: ${onsetSpeed}] ${hasRedFlags ? ' [PATIENT REPORTED RED-FLAG SYMPTOM]' : ''}`;
            const res = await api.analyzeSymptoms(
                selectedSymptoms,
                severity,
                duration,
                bodyArea,
                combinedNotes
            );

            if (res.success && res.result) {
                setResult(res.result);
                const docRes = await api.getDoctors({ department: res.result.recommendedDepartment });
                if (docRes.success) {
                    setMatchedDoctors(docRes.doctors || []);
                }
            }
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Analysis failed',
                message: err.message || 'Could not complete clinical triage check.',
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setCurrentStep(1);
        setResult(null);
        setMatchedDoctors([]);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="p-6 sm:p-8 rounded-3xl bg-health-700 text-white shadow-luxury relative overflow-hidden border border-health-600">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-health-100 text-xs font-semibold backdrop-blur-md">
                            <Stethoscope className="w-3.5 h-3.5 text-accent" />
                            <span>AI Clinical Triage Assistant</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
                            Symptom Checker & Triage
                        </h1>
                        <p className="text-xs text-health-100/90 max-w-xl leading-relaxed">
                            A guided 5-step clinical assessment to help identify potential indicators and connect with the right medical department.
                        </p>
                    </div>

                    {/* Step Indicator Badge */}
                    <div className="self-start sm:self-center px-4 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-accent">Stage</div>
                        <div className="text-lg font-black font-mono">0{currentStep} / 05</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-6 overflow-hidden">
                    <div
                        className="bg-accent h-full transition-all duration-300 rounded-full"
                        style={{ width: `${(currentStep / 5) * 100}%` }}
                    />
                </div>
            </div>

            <AiDisclaimerBanner compact />

            {/* Red Flag Alert Notice if triggered */}
            {isUrgentCondition && currentStep < 5 && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-status-danger flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-1">
                        <div className="text-xs font-extrabold uppercase tracking-wide">Emergency Precaution</div>
                        <p className="text-xs text-red-900 leading-relaxed">
                            You have indicated severe or chest-related symptoms. If you are experiencing crushing chest pressure, shortness of breath, or sudden weakness, call emergency services (112 / 108) immediately.
                        </p>
                    </div>
                </div>
            )}

            {/* Main Multi-Step Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-surface-border shadow-soft">
                {/* STEP 1: Symptoms Selection */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
                            <h2 className="text-lg font-bold text-ink-main font-display">Step 1: What symptoms are you experiencing?</h2>
                            <p className="text-xs text-ink-muted mt-1">Select from common health patterns or type your own symptoms below.</p>
                        </div>

                        {/* Selected Symptoms Chips */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-ink-main">Selected Symptoms ({selectedSymptoms.length})</label>
                            {selectedSymptoms.length > 0 ? (
                                <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-surface-muted border border-surface-border min-h-[50px]">
                                    {selectedSymptoms.map((sym) => (
                                        <span
                                            key={sym}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-health-700 text-white text-xs font-bold shadow-soft animate-scaleIn"
                                        >
                                            <span>{sym}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSymptom(sym)}
                                                className="p-0.5 rounded-full hover:bg-white/20"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center rounded-2xl bg-surface-muted/60 text-xs text-ink-muted">
                                    No symptoms selected yet. Click any chip below or type one.
                                </div>
                            )}
                        </div>

                        {/* Custom Symptom Add */}
                        <form onSubmit={handleAddCustomSymptom} className="flex gap-2">
                            <input
                                type="text"
                                value={customSymptom}
                                onChange={(e) => setCustomSymptom(e.target.value)}
                                placeholder="Type a symptom (e.g., 'Throbbing temple pain', 'Stomach cramps')..."
                                className="flex-1 px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
                            />
                            <button
                                type="submit"
                                disabled={!customSymptom.trim()}
                                className="px-4 py-2.5 rounded-xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft disabled:opacity-50 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add</span>
                            </button>
                        </form>

                        {/* Common Preset Chips */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-ink-main">Common Symptoms</label>
                            <div className="flex flex-wrap gap-2">
                                {COMMON_SYMPTOM_PRESETS.map((sym) => {
                                    const isSelected = selectedSymptoms.includes(sym);
                                    return (
                                        <button
                                            key={sym}
                                            type="button"
                                            onClick={() => togglePresetSymptom(sym)}
                                            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left flex items-center gap-1.5 ${
                                                isSelected
                                                    ? 'bg-health-50 text-health-700 border-2 border-health-600 font-bold'
                                                    : 'bg-surface-muted hover:bg-health-50 border border-surface-border text-ink-main'
                                            }`}
                                        >
                                            {isSelected && <Check className="w-3.5 h-3.5 text-health-700 shrink-0" />}
                                            <span>{sym}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Next Action */}
                        <div className="pt-4 border-t border-surface-border flex justify-end">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(2)}
                                disabled={selectedSymptoms.length === 0}
                                className="px-6 py-3 rounded-2xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <span>Next: Duration & Timing</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Duration & Onset Timing */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
                            <h2 className="text-lg font-bold text-ink-main font-display">Step 2: How long have you had these symptoms?</h2>
                            <p className="text-xs text-ink-muted mt-1">Timeline helps determine whether this is an acute episode or ongoing condition.</p>
                        </div>

                        {/* Duration Options */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-ink-main">Duration</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Just started (Today)', val: 'Today (< 24 hours)' },
                                    { label: '2 to 3 days', val: '2-3 days' },
                                    { label: '1 to 2 weeks', val: '1-2 weeks' },
                                    { label: 'Over a month', val: 'Chronic (> 1 month)' },
                                ].map((d) => (
                                    <button
                                        key={d.val}
                                        type="button"
                                        onClick={() => setDuration(d.val)}
                                        className={`p-4 rounded-2xl border text-left transition-all ${
                                            duration === d.val
                                                ? 'bg-health-50 border-health-600 text-health-800 font-bold shadow-soft'
                                                : 'bg-surface-muted border-surface-border text-ink-main hover:bg-health-50/50'
                                        }`}
                                    >
                                        <div className="text-xs font-bold">{d.label}</div>
                                        <div className="text-[10px] text-ink-muted mt-0.5">{d.val}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Onset Speed */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-ink-main">Onset Pattern</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { label: 'Sudden', desc: 'Started abruptly in minutes', val: 'Sudden (minutes)' },
                                    { label: 'Gradual', desc: 'Developed slowly over days', val: 'Gradual (over days)' },
                                    { label: 'Intermittent', desc: 'Comes and goes in waves', val: 'Intermittent (in waves)' },
                                ].map((o) => (
                                    <button
                                        key={o.val}
                                        type="button"
                                        onClick={() => setOnsetSpeed(o.val)}
                                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                                            onsetSpeed === o.val
                                                ? 'bg-health-50 border-health-600 text-health-800 font-bold shadow-soft'
                                                : 'bg-surface-muted border-surface-border text-ink-main hover:bg-health-50/50'
                                        }`}
                                    >
                                        <div className="text-xs font-bold">{o.label}</div>
                                        <div className="text-[10px] text-ink-muted">{o.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className="px-4 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-ink-muted hover:bg-surface-muted flex items-center gap-1.5"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentStep(3)}
                                className="px-6 py-3 rounded-2xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft flex items-center gap-2"
                            >
                                <span>Next: Severity Level</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Tactile Severity Selector */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
                            <h2 className="text-lg font-bold text-ink-main font-display">Step 3: What is the severity of your discomfort?</h2>
                            <p className="text-xs text-ink-muted mt-1">Select the level that best reflects how this impacts your daily routine.</p>
                        </div>

                        {/* 3-Tier Tactile Segmented Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                {
                                    level: 'Mild',
                                    badge: 'Level 1-3',
                                    title: 'Mild / Manageable',
                                    desc: 'Noticeable but does not disrupt work or sleep. Manageable with light rest.',
                                    color: 'text-status-success',
                                    border: 'border-status-success',
                                    bg: 'bg-green-50',
                                },
                                {
                                    level: 'Moderate',
                                    badge: 'Level 4-6',
                                    title: 'Moderate / Discomfort',
                                    desc: 'Interferes with focus, movement, or rest. Requires attention or medication.',
                                    color: 'text-accent-dark',
                                    border: 'border-accent',
                                    bg: 'bg-accent-light',
                                },
                                {
                                    level: 'Severe',
                                    badge: 'Level 7-10',
                                    title: 'Severe / Urgent',
                                    desc: 'Intense pain or distress. Prevents normal activity. Requires prompt clinical care.',
                                    color: 'text-status-danger',
                                    border: 'border-status-danger',
                                    bg: 'bg-red-50',
                                },
                            ].map((sev) => {
                                const isSelected = severity === sev.level;
                                return (
                                    <button
                                        key={sev.level}
                                        type="button"
                                        onClick={() => setSeverity(sev.level)}
                                        className={`p-5 rounded-3xl border-2 text-left transition-all ${
                                            isSelected
                                                ? `${sev.bg} ${sev.border} shadow-soft`
                                                : 'bg-surface-muted border-surface-border text-ink-main hover:bg-surface-muted/80'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-xs font-extrabold ${sev.color}`}>{sev.title}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-surface-border">
                                                {sev.badge}
                                            </span>
                                        </div>
                                        <p className="text-xs text-ink-muted leading-relaxed">{sev.desc}</p>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navigation */}
                        <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(2)}
                                className="px-4 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-ink-muted hover:bg-surface-muted flex items-center gap-1.5"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentStep(4)}
                                className="px-6 py-3 rounded-2xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft flex items-center gap-2"
                            >
                                <span>Next: Body Area & Notes</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Body Area & Context Notes */}
                {currentStep === 4 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
                            <h2 className="text-lg font-bold text-ink-main font-display">Step 4: Primary body area & notes</h2>
                            <p className="text-xs text-ink-muted mt-1">Specify where symptoms are concentrated to help route the right medical specialty.</p>
                        </div>

                        {/* Body Area Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {BODY_AREAS.map((b) => (
                                <button
                                    key={b.id}
                                    type="button"
                                    onClick={() => setBodyArea(b.id)}
                                    className={`p-4 rounded-2xl border text-left transition-all ${
                                        bodyArea === b.id
                                            ? 'bg-health-50 border-health-600 text-health-800 font-bold shadow-soft'
                                            : 'bg-surface-muted border-surface-border text-ink-main hover:bg-health-50/50'
                                    }`}
                                >
                                    <div className="text-xs font-bold">{b.name}</div>
                                    <div className="text-[10px] text-ink-muted mt-0.5">{b.desc}</div>
                                </button>
                            ))}
                        </div>

                        {/* Additional Notes & Red Flag Check */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-ink-main">Additional Details (Optional)</label>
                            <textarea
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                rows={3}
                                placeholder="Mention triggers, fever temperature, or relevant medications you recently took..."
                                className="w-full p-3 text-xs bg-surface-muted rounded-2xl border border-surface-border focus:outline-none focus:border-health-400"
                            />
                        </div>

                        {/* Emergency Checklist */}
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                <span>Do you have any sudden emergency red-flags?</span>
                            </div>
                            <label className="flex items-center gap-2 text-xs text-amber-900 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hasRedFlags}
                                    onChange={(e) => setHasRedFlags(e.target.checked)}
                                    className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                                />
                                <span>I am experiencing acute chest pressure, sudden vision loss, or speech difficulty</span>
                            </label>
                        </div>

                        {/* Navigation */}
                        <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(3)}
                                className="px-4 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-ink-muted hover:bg-surface-muted flex items-center gap-1.5"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleStartAnalysis}
                                className="px-6 py-3 rounded-2xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4 text-accent" />
                                <span>Run AI Clinical Triage</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5: Tiered Guidance Result Card */}
                {currentStep === 5 && (
                    <div className="space-y-6 animate-fadeIn">
                        {isAnalyzing ? (
                            <div className="py-16 text-center space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center mx-auto animate-bounce">
                                    <Sparkles className="w-6 h-6 text-health-700" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-ink-main">Analyzing Symptoms with Gemini AI...</h3>
                                    <p className="text-xs text-ink-muted">Matching clinical indicators and consulting medical department rules.</p>
                                </div>
                            </div>
                        ) : result ? (
                            <div className="space-y-6">
                                {/* Result Header with Tier */}
                                <div className="p-6 rounded-3xl bg-health-50 border border-health-200 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white text-health-800 border border-health-200">
                                            Preliminary Guidance Tier
                                        </span>
                                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-health-700 text-white">
                                            {result.urgencyLevel || 'Moderate / Consult Soon'}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-ink-main">
                                            Recommended Specialty: <span className="text-health-700">{result.recommendedDepartment}</span>
                                        </h3>
                                        <p className="text-xs text-ink-muted leading-relaxed mt-1">
                                            {result.preliminaryGuidance}
                                        </p>
                                    </div>
                                </div>

                                {/* Possible Conditions / Indicators */}
                                {result.possibleConditions && result.possibleConditions.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-ink-main uppercase tracking-wider">Relevant Clinical Patterns:</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {result.possibleConditions.map((cond, i) => (
                                                <div key={i} className="p-3 rounded-xl bg-surface-muted border border-surface-border text-xs font-semibold text-ink-main flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-health-600 shrink-0" />
                                                    <span>{cond}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Matched Available Specialist Doctors */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-ink-main uppercase tracking-wider">
                                            Available {result.recommendedDepartment} Specialists:
                                        </h4>
                                        <Link to={`/doctors?department=${encodeURIComponent(result.recommendedDepartment)}`} className="text-xs font-bold text-health-700 hover:underline flex items-center gap-1">
                                            <span>View All</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>

                                    {matchedDoctors.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {matchedDoctors.slice(0, 2).map((doc) => (
                                                <div key={doc.id} className="p-4 rounded-2xl bg-surface-muted border border-surface-border flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <img
                                                            src={doc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`}
                                                            alt={doc.name}
                                                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-health-200 shrink-0"
                                                        />
                                                        <div className="min-w-0">
                                                            <div className="text-xs font-bold text-ink-main truncate">{doc.name}</div>
                                                            <div className="text-[10px] text-ink-muted">{doc.hospital || 'Apollo Hospital'}</div>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        to={`/appointments?doctor=${doc.id}&department=${encodeURIComponent(result.recommendedDepartment)}`}
                                                        className="px-3 py-1.5 rounded-xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft transition-all shrink-0"
                                                    >
                                                        Book
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-2xl bg-surface-muted text-center text-xs text-ink-muted">
                                            <Link to={`/doctors?department=${encodeURIComponent(result.recommendedDepartment)}`} className="text-health-700 font-bold underline">
                                                Browse all available {result.recommendedDepartment} doctors
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Reset or Ask AI */}
                                <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="px-4 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-ink-muted hover:bg-surface-muted flex items-center gap-1.5"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        <span>Check Other Symptoms</span>
                                    </button>
                                    <Link
                                        to={`/ai-assistant?query=${encodeURIComponent(`Explain preliminary considerations for ${selectedSymptoms.join(', ')} in ${result.recommendedDepartment}`)}`}
                                        className="px-5 py-2.5 rounded-xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft flex items-center gap-1.5"
                                    >
                                        <span>Ask MediGuide AI</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};
