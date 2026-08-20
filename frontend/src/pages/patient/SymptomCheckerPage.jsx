import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { AiDisclaimerBanner } from '../../components/common/AiDisclaimerBanner.jsx';
import { Stethoscope, Sparkles, ArrowRight, Calendar, Plus, X, } from 'lucide-react';
const COMMON_SYMPTOM_PRESETS = [
    'Headache',
    'Fever & Chills',
    'Persistent Cough',
    'Chest Tightness',
    'Palpitations',
    'Skin Rash / Itching',
    'Knee Joint Pain',
    'Back Stiffness',
    'Nasal Congestion',
    'Dizziness / Vertigo',
    'Fatigue / Exhaustion',
    'Digestive Discomfort',
    'Sore Throat',
    'Eye Irritation',
];
const BODY_AREAS = [
    'Head & Neck',
    'Chest & Cardiovascular',
    'Skin & Dermatological',
    'Musculoskeletal & Joints',
    'Abdominal & Digestive',
    'Respiratory',
    'General / Systemic',
];
export const SymptomCheckerPage = () => {
    const { addToast } = useAppStore();
    const navigate = useNavigate();
    // Form State
    const [selectedSymptoms, setSelectedSymptoms] = useState(['Headache', 'Eye Irritation']);
    const [customSymptom, setCustomSymptom] = useState('');
    const [severity, setSeverity] = useState('Mild');
    const [duration, setDuration] = useState('2-3 days');
    const [bodyArea, setBodyArea] = useState('Head & Neck');
    const [additionalNotes, setAdditionalNotes] = useState('');
    // Execution State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [matchedDoctors, setMatchedDoctors] = useState([]);
    const handleAddCustomSymptom = (e) => {
        e.preventDefault();
        if (!customSymptom.trim())
            return;
        if (!selectedSymptoms.includes(customSymptom.trim())) {
            setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
        }
        setCustomSymptom('');
    };
    const togglePresetSymptom = (symptom) => {
        if (selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
        }
        else {
            setSelectedSymptoms([...selectedSymptoms, symptom]);
        }
    };
    const removeSymptom = (symptom) => {
        setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    };
    const handleAnalyze = async () => {
        if (selectedSymptoms.length === 0) {
            addToast({
                type: 'warning',
                title: 'No symptoms entered',
                message: 'Please select or add at least one symptom to analyze.',
            });
            return;
        }
        setIsAnalyzing(true);
        setResult(null);
        try {
            const res = await api.analyzeSymptoms(selectedSymptoms, severity, duration, bodyArea, additionalNotes);
            if (res.success && res.result) {
                setResult(res.result);
                // Fetch matched doctors
                const docRes = await api.getDoctors(res.result.recommendedDepartment);
                if (docRes.success) {
                    setMatchedDoctors(docRes.doctors);
                }
                addToast({
                    type: 'success',
                    title: 'Symptom Triage Complete',
                    message: `Recommended Department: ${res.result.recommendedDepartment}`,
                });
            }
        }
        catch (err) {
            addToast({
                type: 'error',
                title: 'Analysis failed',
                message: err.message || 'Could not complete symptom check.',
            });
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    const handleBookWithDoctor = (doc) => {
        navigate(`/appointments?doctor=${doc.id}&department=${encodeURIComponent(result?.recommendedDepartment || doc.department)}&reason=${encodeURIComponent(`Consultation regarding: ${selectedSymptoms.join(', ')} (${severity} severity)`)}`);
    };
    return (<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-health-700 via-health-600 to-health-800 text-white shadow-soft-lg space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-health-100 text-xs font-semibold backdrop-blur-sm">
          <Stethoscope className="w-3.5 h-3.5 text-health-200"/>
          <span>AI Clinical Triage Assistant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Symptom Checker</h1>
        <p className="text-xs sm:text-sm text-health-100 max-w-2xl leading-relaxed">
          Describe how you are feeling to receive structured preliminary guidance, urgency classification, and immediate medical department recommendations.
        </p>
      </div>

      <AiDisclaimerBanner />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Questionnaire Form */}
        <div className="lg:col-span-7 bg-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <h2 className="text-base font-bold text-ink-main">Step 1: What symptoms are you experiencing?</h2>
            <span className="text-xs font-bold text-health-700 bg-health-100 px-2.5 py-0.5 rounded-full">
              {selectedSymptoms.length} Selected
            </span>
          </div>

          {/* Selected Symptoms Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-ink-main">Your Selected Symptoms:</label>
            <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-2xl bg-surface-muted border border-surface-border">
              {selectedSymptoms.map((symptom) => (<span key={symptom} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-health-500 text-white text-xs font-bold shadow-sm">
                  <span>{symptom}</span>
                  <button type="button" onClick={() => removeSymptom(symptom)} className="hover:bg-health-600 rounded-full p-0.5">
                    <X className="w-3 h-3"/>
                  </button>
                </span>))}
              {selectedSymptoms.length === 0 && (<span className="text-xs text-ink-muted italic py-1">No symptoms selected yet. Tap preset tags below.</span>)}
            </div>
          </div>

          {/* Add Custom Symptom Input */}
          <form onSubmit={handleAddCustomSymptom} className="flex gap-2">
            <input type="text" value={customSymptom} onChange={(e) => setCustomSymptom(e.target.value)} placeholder="Type another symptom (e.g. sharp lower back pain)..." className="flex-1 px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            <button type="submit" className="px-4 py-2.5 bg-health-100 hover:bg-health-200 text-health-900 rounded-xl text-xs font-bold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5"/>
              <span>Add</span>
            </button>
          </form>

          {/* Preset Symptom Badges */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-ink-muted">Quick Add Common Symptoms:</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOM_PRESETS.map((preset) => {
            const isSelected = selectedSymptoms.includes(preset);
            return (<button key={preset} type="button" onClick={() => togglePresetSymptom(preset)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${isSelected
                    ? 'bg-health-50 border-health-400 text-health-900 font-bold'
                    : 'bg-surface text-ink-muted border-surface-border hover:bg-surface-muted'}`}>
                    {isSelected ? '✓ ' : '+ '} {preset}
                  </button>);
        })}
            </div>
          </div>

          {/* Step 2: Severity, Duration, Body Area */}
          <div className="pt-4 border-t border-surface-border space-y-4">
            <h3 className="text-sm font-bold text-ink-main">Step 2: Clinical Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Severity */}
              <div>
                <label className="block text-xs font-bold text-ink-main mb-1.5">Severity</label>
                <div className="grid grid-cols-3 gap-1">
                  {['Mild', 'Moderate', 'Severe'].map((sev) => (<button key={sev} type="button" onClick={() => setSeverity(sev)} className={`py-2 rounded-xl text-xs font-bold border text-center transition-all ${severity === sev
                ? 'bg-health-500 text-white border-health-600 shadow-sm'
                : 'bg-surface-muted text-ink-muted border-surface-border hover:bg-surface'}`}>
                      {sev}
                    </button>))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-ink-main mb-1.5">Duration</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-3 py-2 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400">
                  <option value="Today">Started Today</option>
                  <option value="2-3 days">2 - 3 Days</option>
                  <option value="1-2 weeks">1 - 2 Weeks</option>
                  <option value="Over a month">Over 1 Month</option>
                </select>
              </div>

              {/* Body Area */}
              <div>
                <label className="block text-xs font-bold text-ink-main mb-1.5">Primary Body Area</label>
                <select value={bodyArea} onChange={(e) => setBodyArea(e.target.value)} className="w-full px-3 py-2 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400">
                  {BODY_AREAS.map((area) => (<option key={area} value={area}>
                      {area}
                    </option>))}
                </select>
              </div>
            </div>

            {/* Additional Context */}
            <div>
              <label className="block text-xs font-bold text-ink-main mb-1.5">
                Additional Notes / Triggers (Optional)
              </label>
              <textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} placeholder="e.g. Symptoms worsen in morning; have history of mild asthma or seasonal pollen allergy..." rows={2} className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"/>
            </div>
          </div>

          {/* Analyze Button */}
          <button onClick={handleAnalyze} disabled={isAnalyzing || selectedSymptoms.length === 0} className="w-full py-3.5 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-xs shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {isAnalyzing ? (<>
                <Sparkles className="w-4 h-4 animate-spin"/>
                <span>MediGuide AI is analyzing symptoms & department protocols...</span>
              </>) : (<>
                <Sparkles className="w-4 h-4"/>
                <span>Analyze Symptoms & Recommend Department</span>
                <ArrowRight className="w-4 h-4"/>
              </>)}
          </button>
        </div>

        {/* Right Col: AI Analysis Results Card */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (<div className="bg-surface p-6 sm:p-7 rounded-3xl border border-health-300 shadow-soft-lg space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-health-100 text-health-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4"/>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-ink-main">Preliminary AI Assessment</h3>
                    <p className="text-[10px] text-ink-muted">Saved to your health profile</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${result.urgencyLevel.includes('High')
                ? 'bg-red-100 text-red-800'
                : result.urgencyLevel.includes('Moderate')
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'}`}>
                  {result.urgencyLevel}
                </span>
              </div>

              {/* Recommended Department Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-health-50 to-white border border-health-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-health-700 tracking-wider">
                  Recommended Medical Department
                </span>
                <div className="text-xl font-black text-health-900 flex items-center justify-between">
                  <span>{result.recommendedDepartment}</span>
                  <Stethoscope className="w-5 h-5 text-health-600"/>
                </div>
              </div>

              {/* Preliminary Guidance Box */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink-main uppercase tracking-wider">
                  Preliminary Clinical Guidance:
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed p-3.5 bg-surface-muted rounded-2xl border border-surface-border">
                  {result.preliminaryGuidance}
                </p>
              </div>

              {/* Possible Areas to Discuss */}
              {result.possibleConditions && result.possibleConditions.length > 0 && (<div className="space-y-2">
                  <h4 className="text-xs font-bold text-ink-main uppercase tracking-wider">
                    Topics to Discuss with Your Doctor:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.possibleConditions.map((cond, i) => (<span key={i} className="px-2.5 py-1 rounded-lg bg-health-100/80 text-health-900 text-[11px] font-semibold">
                        • {cond}
                      </span>))}
                  </div>
                </div>)}

              {/* Matching Doctors & 1-Click Booking */}
              <div className="space-y-3 pt-3 border-t border-surface-border">
                <h4 className="text-xs font-bold text-ink-main uppercase tracking-wider flex items-center justify-between">
                  <span>Available Specialists in {result.recommendedDepartment}</span>
                  <span className="text-[10px] text-health-600 font-semibold">{matchedDoctors.length} Doctors</span>
                </h4>

                <div className="space-y-2.5">
                  {matchedDoctors.map((doc) => (<div key={doc.id} className="p-3.5 rounded-2xl bg-surface-muted/60 border border-surface-border flex items-center justify-between hover:bg-health-50/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={doc.avatar} alt={doc.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-health-200"/>
                        <div>
                          <div className="text-xs font-bold text-ink-main">{doc.name}</div>
                          <div className="text-[10px] text-ink-muted">{doc.qualification}</div>
                          <div className="text-[10px] text-health-700 font-semibold">
                            ⭐ {doc.rating} ({doc.reviewCount} reviews) • ${doc.consultationFee}
                          </div>
                        </div>
                      </div>

                      <button onClick={() => handleBookWithDoctor(doc)} className="px-3 py-2 bg-health-500 hover:bg-health-600 text-white rounded-xl text-xs font-bold shadow-soft transition-all flex items-center gap-1">
                        <Calendar className="w-3 h-3"/>
                        <span>Book</span>
                      </button>
                    </div>))}
                </div>
              </div>
            </div>) : (<div className="bg-surface p-8 rounded-3xl border border-surface-border shadow-soft text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-health-50 text-health-600 flex items-center justify-center mx-auto">
                <Stethoscope className="w-8 h-8"/>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-ink-main">Ready for AI Analysis</h3>
                <p className="text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
                  Select your symptoms on the left and tap 'Analyze Symptoms' to view medical guidance and matched doctors.
                </p>
              </div>
            </div>)}
        </div>
      </div>
    </div>);
};
