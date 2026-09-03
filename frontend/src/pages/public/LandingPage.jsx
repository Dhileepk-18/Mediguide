import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import {
  Sparkles,
  Bot,
  Stethoscope,
  Calendar,
  Pill,
  FileText,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  HeartPulse,
  UserCheck,
  Shield,
  ChevronRight,
  AlertCircle,
  Check,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuthStore();

  // Tabbed Interactive Showcase State
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'symptom' | 'meds'

  // Interactive AI Assistant Demo State
  const [demoInput, setDemoInput] = useState('');
  const [demoChat, setDemoChat] = useState([
    {
      sender: 'user',
      text: "I've been experiencing tension headaches and eye strain after long screen hours. What should I do?",
    },
    {
      sender: 'assistant',
      text: 'This pattern strongly aligns with digital eye strain and tension-type headache. I recommend applying the 20-20-20 rule (looking 20 feet away every 20 minutes), staying well-hydrated, and adjusting monitor contrast. If you develop dizziness or visual aura, we suggest scheduling a consultation with our Neurology department.',
    },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Preset quick questions for the AI demo
  const samplePrompts = [
    'Tips for managing seasonal allergies',
    'When should I consult a cardiologist for palpitations?',
    'Healthy dietary habits for mild hypertension',
  ];

  // Interactive Symptom Checker Demo State
  const [selectedSymptomTags, setSelectedSymptomTags] = useState([
    'Morning Sneezing',
    'Mild Cough',
  ]);
  const [symptomSeverity, setSymptomSeverity] = useState('Mild');

  // Interactive Medicine Adherence Demo State
  const [adherenceMeds, setAdherenceMeds] = useState([
    { id: 1, name: 'Cetirizine 10mg', time: '08:00 AM', taken: true, note: 'After breakfast' },
    { id: 2, name: 'Vitamin D3 1000IU', time: '01:00 PM', taken: true, note: 'With lunch' },
    { id: 3, name: 'Omega-3 Fish Oil', time: '08:30 PM', taken: false, note: 'Before bed' },
  ]);

  const handleSendDemoChat = e => {
    e?.preventDefault();
    if (!demoInput.trim()) return;

    const userText = demoInput.trim();
    setDemoInput('');
    setDemoChat(prev => [...prev, { sender: 'user', text: userText }]);
    setIsAiTyping(true);

    setTimeout(() => {
      let reply =
        'MediGuide AI has analyzed your inquiry. Based on clinical guidelines, maintaining proper hydration and rest is advised. For structured evaluation, explore our symptom triage or book a specialist appointment.';
      const lower = userText.toLowerCase();

      if (lower.includes('chest') || lower.includes('heart') || lower.includes('palpitation')) {
        reply =
          'For cardiovascular or chest-related symptoms, we advise consulting our **Cardiology** department. Monitor your resting heart rate, avoid strenuous exertion, and seek urgent care if you experience severe shortness of breath or radiating pain.';
      } else if (lower.includes('skin') || lower.includes('rash') || lower.includes('itch')) {
        reply =
          'Skin dermatoses and rash patterns are best assessed under our **Dermatology** specialty for targeted topical care and allergen assessment.';
      } else if (lower.includes('allerg') || lower.includes('sneeze') || lower.includes('cough')) {
        reply =
          'Allergic rhinitis and mild respiratory symptoms generally benefit from reducing ambient dust exposure, steam inhalation, and hydration. If symptoms persist beyond 5 days, consult **General Medicine**.';
      } else if (lower.includes('headache') || lower.includes('migraine')) {
        reply =
          'Tension headaches often respond well to dim lighting, screen breaks, and hydration. For persistent or unilateral throbbing headaches with photophobia, a **Neurology** consultation is recommended.';
      }

      setDemoChat(prev => [...prev, { sender: 'assistant', text: reply }]);
      setIsAiTyping(false);
    }, 700);
  };

  const handleSelectPreset = promptText => {
    setDemoInput(promptText);
  };

  const toggleSymptomTag = tag => {
    if (selectedSymptomTags.includes(tag)) {
      setSelectedSymptomTags(selectedSymptomTags.filter(t => t !== tag));
    } else {
      setSelectedSymptomTags([...selectedSymptomTags, tag]);
    }
  };

  const toggleMedAdherence = id => {
    setAdherenceMeds(prev =>
      prev.map(med => (med.id === id ? { ...med, taken: !med.taken } : med))
    );
  };

  const getRecommendedDepartment = () => {
    if (selectedSymptomTags.some(s => s.includes('Palpitations') || s.includes('Chest'))) {
      return { name: 'Cardiology', color: 'text-red-700 bg-red-50 border-red-200' };
    }
    if (selectedSymptomTags.some(s => s.includes('Skin') || s.includes('Rash'))) {
      return { name: 'Dermatology', color: 'text-pink-700 bg-pink-50 border-pink-200' };
    }
    if (selectedSymptomTags.some(s => s.includes('Headache') || s.includes('Migraine'))) {
      return { name: 'Neurology', color: 'text-purple-700 bg-purple-50 border-purple-200' };
    }
    if (
      selectedSymptomTags.some(s => s.includes('Joint') || s.includes('Knee') || s.includes('Back'))
    ) {
      return { name: 'Orthopedics', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
    if (selectedSymptomTags.some(s => s.includes('Child') || s.includes('Infant'))) {
      return { name: 'Pediatrics', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    }
    return { name: 'General Medicine', color: 'text-health-700 bg-health-50 border-health-200' };
  };

  const recommendedDept = getRecommendedDepartment();

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/dashboard';
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-10 sm:pt-16 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Subtle background glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-4/5 max-w-3xl h-80 bg-health-200/50 blur-[110px] -z-10 pointer-events-none rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-health-100/90 border border-health-200 text-xs font-bold text-health-800 shadow-sm">
              <Sparkles className="w-4 h-4 text-health-600 animate-pulse" />
              <span>AI-Powered Healthcare Support Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink-main leading-[1.15]">
              Your Health, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-health-600 via-health-500 to-health-700">
                Smarter & Simpler.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Preliminary AI symptom guidance, medical department recommendations, doctor
              appointment booking, medicine reminders, and secure health records — unified into one
              platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {isAuthenticated ? (
                <Link
                  to={getDashboardLink()}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-sm shadow-soft hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-health-500 hover:bg-health-600 text-white font-bold text-sm shadow-soft hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="#features"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-surface hover:bg-health-50 text-ink-main font-bold text-sm border border-surface-border transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Explore Features</span>
                  </a>
                </>
              )}
            </div>

            {/* Trust & Safety Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-ink-muted">
              <div className="flex items-center gap-2 bg-surface/80 px-3 py-1.5 rounded-xl border border-surface-border shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-health-600" />
                <span>Preliminary AI Guidance</span>
              </div>
              <div className="flex items-center gap-2 bg-surface/80 px-3 py-1.5 rounded-xl border border-surface-border shadow-xs">
                <ShieldCheck className="w-4 h-4 text-health-600" />
                <span>Role-Based Data Privacy</span>
              </div>
              <div className="flex items-center gap-2 bg-surface/80 px-3 py-1.5 rounded-xl border border-surface-border shadow-xs">
                <Clock className="w-4 h-4 text-health-600" />
                <span>24/7 AI Availability</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Product Console Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-surface rounded-3xl p-5 sm:p-6 shadow-xl border border-surface-border space-y-4 transition-all duration-300">
              {/* Header inside Mockup */}
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-ink-main">MediGuide Health Console</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-health-100 text-health-800 border border-health-200">
                  Live Hub
                </span>
              </div>

              {/* Console Item 1: AI Symptom Triage */}
              <div className="p-3.5 rounded-2xl bg-health-50/80 border border-health-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-health-600" />
                    <span className="text-xs font-bold text-health-900">AI Symptom Guidance</span>
                  </div>
                  <span className="text-[10px] font-bold text-health-800 bg-health-200/70 px-2 py-0.5 rounded-md">
                    Dept: Cardiology
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  "Symptoms suggest mild sinus tachycardia. Rest and hydration recommended. Routine
                  cardiology evaluation suggested."
                </p>
              </div>

              {/* Console Item 2: Doctor Appointment */}
              <div className="p-3.5 rounded-2xl bg-surface border border-surface-border shadow-soft flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-health-100 text-health-700 flex items-center justify-center font-bold text-xs">
                    Dr
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink-main">Dr. Sarah Jenkins, MD</div>
                    <div className="text-[11px] text-ink-muted">
                      Cardiology • Tomorrow at 10:30 AM
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Confirmed
                </span>
              </div>

              {/* Console Item 3: Medicine Adherence Pill */}
              <div className="p-3.5 rounded-2xl bg-surface border border-surface-border shadow-soft flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-mint-light text-health-800 flex items-center justify-center">
                    <Pill className="w-4 h-4 text-health-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink-main">Cetirizine 10 mg</div>
                    <div className="text-[11px] text-ink-muted">Reminder: 08:00 AM • Daily</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Taken
                </span>
              </div>

              {/* Quick Action Footer */}
              <div className="pt-1">
                <Link
                  to={isAuthenticated ? getDashboardLink() : '/register'}
                  className="w-full block py-2.5 rounded-xl bg-health-500 hover:bg-health-600 text-white text-xs font-bold transition-all text-center shadow-soft"
                >
                  {isAuthenticated ? 'Open Health Portal' : 'Create Free Patient Account'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Features Section (PRD Section 5) */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 bg-health-100 text-health-800 rounded-full border border-health-200">
            PRD Core Modules
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-main tracking-tight">
            Everything You Need for Smarter Healthcare
          </h2>
          <p className="text-sm sm:text-base text-ink-muted">
            Engineered with modern AI assistance, clinical department triage, and streamlined health
            management for patients and practitioners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: AI Healthcare Assistant */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft hover:shadow-md hover:border-health-300 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-ink-main">AI Healthcare Assistant</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Ask general health-related questions in natural language. Powered by Gemini AI with
                built-in medical safety boundaries and preliminary clarity.
              </p>
            </div>
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-health-600 hover:text-health-700 pt-1"
            >
              <span>Consult AI Chatbot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Symptom Checker & Department Recommendations */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft hover:shadow-md hover:border-health-300 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-ink-main">AI Symptom Checker & Triage</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Input your symptoms, duration, and severity to receive structured preliminary
                guidance and automatic medical department recommendations.
              </p>
            </div>
            <Link
              to="/symptom-checker"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-health-600 hover:text-health-700 pt-1"
            >
              <span>Check Symptoms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Doctor Appointments */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft hover:shadow-md hover:border-health-300 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-ink-main">Doctor Appointment Booking</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Search verified doctors across Cardiology, Neurology, Dermatology, Orthopedics, and
                General Medicine with seamless slot scheduling.
              </p>
            </div>
            <Link
              to="/appointments"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-health-600 hover:text-health-700 pt-1"
            >
              <span>Find Specialists</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Medicine Reminders */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft hover:shadow-md hover:border-health-300 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Pill className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-ink-main">Medicine Reminders</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Maintain medicine names, dosages, reminder times, and food instructions to organize
                your daily medication schedule without missing doses.
              </p>
            </div>
            <Link
              to="/medicines"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-health-600 hover:text-health-700 pt-1"
            >
              <span>Manage Reminders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 5: Secure Health Records */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft hover:shadow-md hover:border-health-300 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-ink-main">Health Record Vault</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Securely upload and access personal lab reports, imaging files, vaccination records,
                and historical clinical documents anytime.
              </p>
            </div>
            <Link
              to="/health-records"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-health-600 hover:text-health-700 pt-1"
            >
              <span>Open Health Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 6: Digital Prescriptions */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft hover:shadow-md hover:border-health-300 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-ink-main">Digital Prescriptions</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Doctors issue electronic prescriptions with exact medication instructions. Patients
                can view, save, and sync medicines directly to reminders.
              </p>
            </div>
            <Link
              to="/prescriptions"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-health-600 hover:text-health-700 pt-1"
            >
              <span>View Prescriptions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Streamlined Interactive AI & Clinical Suite Showcase */}
      <section id="preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-surface border border-surface-border shadow-soft-lg space-y-8">
          {/* Section Header with Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-surface-border">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-health-800 bg-health-100 px-3.5 py-1 rounded-full border border-health-200">
                Interactive Product Preview
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-main mt-2 tracking-tight">
                Experience MediGuide in Action
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted">
                Test the key capabilities that streamline the patient journey from AI triage to
                clinical care.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="inline-flex p-1.5 rounded-2xl bg-surface-muted border border-surface-border gap-1 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-surface text-health-700 shadow-sm border border-surface-border'
                    : 'text-ink-muted hover:text-ink-main'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI Health Assistant</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('symptom')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'symptom'
                    ? 'bg-surface text-health-700 shadow-sm border border-surface-border'
                    : 'text-ink-muted hover:text-ink-main'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Symptom Triage</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('meds')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'meds'
                    ? 'bg-surface text-health-700 shadow-sm border border-surface-border'
                    : 'text-ink-muted hover:text-ink-main'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Medicine & Records</span>
              </button>
            </div>
          </div>

          {/* TAB 1: AI Healthcare Assistant */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-xl font-bold text-ink-main">
                  Natural Language Healthcare Inquiries
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  MediGuide AI assists patients in understanding wellness topics, first-aid
                  principles, lifestyle modifications, and when to seek specialized medical
                  attention.
                </p>

                {/* Safety Notice */}
                <div className="p-4 rounded-2xl bg-health-50/80 border border-health-200 space-y-1.5 text-xs text-health-900">
                  <div className="font-bold flex items-center gap-1.5 text-health-800">
                    <ShieldCheck className="w-4 h-4 text-health-600" />
                    <span>Clinical Safety Disclaimer</span>
                  </div>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    AI responses provide preliminary educational guidance only and do not replace
                    professional diagnosis by licensed physicians.
                  </p>
                </div>

                {/* Preset Prompts */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    Quick Sample Questions:
                  </span>
                  <div className="space-y-1.5">
                    {samplePrompts.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(q)}
                        className="w-full text-left p-2.5 rounded-xl bg-surface-muted hover:bg-health-50 text-xs text-ink-main border border-surface-border transition-colors flex items-center justify-between group"
                      >
                        <span className="truncate">{q}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-health-600 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Chat Window */}
              <div className="lg:col-span-7 bg-surface-muted/60 rounded-2xl border border-surface-border overflow-hidden flex flex-col h-[380px]">
                <div className="px-4 py-3 bg-surface border-b border-surface-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-health-500 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ink-main">MediGuide AI Assistant</div>
                      <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Online & Ready
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/ai-assistant"
                    className="text-[11px] font-bold text-health-600 hover:text-health-700 flex items-center gap-1"
                  >
                    <span>Open Full Page</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Chat Message Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {demoChat.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-health-500 text-white rounded-tr-none'
                            : 'bg-surface border border-surface-border text-ink-main rounded-tl-none shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {isAiTyping && (
                    <div className="flex justify-start">
                      <div className="p-2.5 bg-surface rounded-2xl rounded-tl-none border border-surface-border flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-health-500 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-health-500 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-health-500 animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input Form */}
                <form
                  onSubmit={handleSendDemoChat}
                  className="p-3 border-t border-surface-border bg-surface flex gap-2"
                >
                  <input
                    type="text"
                    value={demoInput}
                    onChange={e => setDemoInput(e.target.value)}
                    placeholder="Type or click a sample question above..."
                    className="flex-1 px-3.5 py-2 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-health-500 hover:bg-health-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: Symptom Checker & Department Routing */}
          {activeTab === 'symptom' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <label className="text-xs font-bold text-ink-main block mb-2">
                    1. Select Active Symptoms:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Morning Sneezing',
                      'Mild Cough',
                      'Palpitations & Fluttering',
                      'Skin Rash & Irritation',
                      'Tension Headache',
                      'Knee Joint Pain',
                      'Fever & Chills',
                      'Digestive Discomfort',
                    ].map(tag => {
                      const isSelected = selectedSymptomTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleSymptomTag(tag)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                            isSelected
                              ? 'bg-health-500 text-white border-health-600 shadow-xs'
                              : 'bg-surface-muted text-ink-muted border-surface-border hover:bg-health-50 hover:text-ink-main'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-ink-main block mb-2">
                    2. Perceived Severity:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Mild', 'Moderate', 'Severe'].map(sev => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSymptomSeverity(sev)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          symptomSeverity === sev
                            ? 'bg-health-100 border-health-400 text-health-900 shadow-xs'
                            : 'bg-surface-muted border-surface-border text-ink-muted hover:bg-surface'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-muted border border-surface-border text-[11px] text-ink-muted flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-health-600 shrink-0 mt-0.5" />
                  <span>
                    The AI symptom checker correlates selected symptom clusters with clinical
                    departments (e.g. Cardiology, Neurology, Dermatology, Orthopedics, General
                    Medicine).
                  </span>
                </div>
              </div>

              {/* Triage Output Card */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-health-50/70 border border-health-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-health-800 tracking-wider">
                    Preliminary Triage
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-health-200 text-health-900">
                    {symptomSeverity} Severity
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-ink-muted font-medium">
                    Recommended Specialty Department:
                  </div>
                  <div className="text-xl font-extrabold text-health-900 flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg border text-sm font-bold ${recommendedDept.color}`}
                    >
                      {recommendedDept.name}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-ink-muted leading-relaxed">
                  Based on selected indicators (
                  {selectedSymptomTags.length > 0 ? selectedSymptomTags.join(', ') : 'None'}), our
                  clinical system recommends consultation with {recommendedDept.name} practitioners.
                </p>

                <div className="pt-2">
                  <Link
                    to="/appointments"
                    className="w-full py-2.5 rounded-xl bg-health-500 hover:bg-health-600 text-white font-bold text-xs shadow-soft transition-all flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book {recommendedDept.name} Doctor</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Medicine Adherence & Health Records */}
          {activeTab === 'meds' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Medicine Adherence Schedule */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-ink-main flex items-center gap-2">
                    <Pill className="w-4 h-4 text-health-600" />
                    <span>Today's Medicine Schedule</span>
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {adherenceMeds.filter(m => m.taken).length} of {adherenceMeds.length} Taken
                  </span>
                </div>

                <div className="space-y-2.5">
                  {adherenceMeds.map(med => (
                    <div
                      key={med.id}
                      onClick={() => toggleMedAdherence(med.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        med.taken
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-surface border-surface-border hover:border-health-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                            med.taken
                              ? 'bg-emerald-500 text-white'
                              : 'border-2 border-surface-border text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div
                            className={`text-xs font-bold ${med.taken ? 'line-through text-ink-muted' : 'text-ink-main'}`}
                          >
                            {med.name}
                          </div>
                          <div className="text-[10px] text-ink-muted">
                            {med.time} • {med.note}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-ink-muted">
                        {med.taken ? 'Completed' : 'Tap to mark taken'}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/medicines"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-health-600 hover:text-health-700"
                >
                  <span>Open Full Medicine Tracker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Right: Health Records Vault Preview */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-ink-main flex items-center gap-2">
                    <FileText className="w-4 h-4 text-health-600" />
                    <span>Personal Health Records Vault</span>
                  </h4>
                  <span className="text-[11px] font-bold text-health-700 bg-health-100 px-2 py-0.5 rounded-md">
                    Encrypted
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-surface border border-surface-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        LAB
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink-main">
                          Comprehensive Metabolic Panel
                        </div>
                        <div className="text-[10px] text-ink-muted">
                          PDF • Uploaded 3 days ago • Lab Report
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-surface-muted text-ink-muted border border-surface-border">
                      Verified
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface border border-surface-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                        RX
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink-main">
                          Digital Prescription — Dr. Sarah Jenkins
                        </div>
                        <div className="text-[10px] text-ink-muted">
                          Cardiology • Signed Electronic Rx
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                </div>

                <Link
                  to="/health-records"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-health-600 hover:text-health-700"
                >
                  <span>Access Health Records Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Multi-Role Ecosystem (PRD Section 4: Target Users) */}
      <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 bg-health-100 text-health-800 rounded-full border border-health-200">
            PRD User Roles
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-main tracking-tight">
            Designed for the Entire Healthcare Journey
          </h2>
          <p className="text-sm sm:text-base text-ink-muted">
            Role-based access control and dedicated dashboards tailored to each stakeholder.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient Role Card */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-health-700">
                  Primary Users
                </span>
                <h3 className="text-lg font-bold text-ink-main">For Patients</h3>
              </div>
              <ul className="space-y-2 text-xs text-ink-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-health-600 shrink-0" />
                  <span>24/7 AI chatbot & preliminary symptom triage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-health-600 shrink-0" />
                  <span>Doctor search and instant appointment booking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-health-600 shrink-0" />
                  <span>Medication adherence reminders & health vault</span>
                </li>
              </ul>
            </div>
            <Link
              to="/register"
              className="w-full py-2.5 rounded-xl bg-health-50 hover:bg-health-100 text-health-800 text-xs font-bold text-center border border-health-200 transition-colors"
            >
              Sign Up as Patient
            </Link>
          </div>

          {/* Doctor Role Card */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-health-700">
                  Healthcare Providers
                </span>
                <h3 className="text-lg font-bold text-ink-main">For Doctors</h3>
              </div>
              <ul className="space-y-2 text-xs text-ink-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-health-600 shrink-0" />
                  <span>Manage assigned appointments and consultations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-health-600 shrink-0" />
                  <span>Generate signed digital prescriptions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-health-600 shrink-0" />
                  <span>Access relevant patient medical history securely</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 rounded-xl bg-health-50 hover:bg-health-100 text-health-800 text-xs font-bold text-center border border-health-200 transition-colors"
            >
              Doctor Clinical Portal
            </Link>
          </div>

          {/* Admin Role Card */}
          <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-soft space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-health-100 text-health-700 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-health-700">
                  System Management
                </span>
                <h3 className="text-lg font-bold text-ink-main">For Administrators</h3>
              </div>
              <ul className="space-y-2 text-xs text-ink-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-health-600 shrink-0" />
                  <span>Centralized user and doctor account management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-health-600 shrink-0" />
                  <span>Enforce role-based security & verify physicians</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-health-600 shrink-0" />
                  <span>Monitor system health & appointment statistics</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 rounded-xl bg-health-50 hover:bg-health-100 text-health-800 text-xs font-bold text-center border border-health-200 transition-colors"
            >
              Admin Management Console
            </Link>
          </div>
        </div>
      </section>

      {/* 5. How It Works (PRD Section 8) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-health-50/60 via-surface to-health-50/60 border border-health-200 shadow-soft">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-health-800">
              4 Simple Steps
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-main">
              How MediGuide Works
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted">
              A structured workflow connecting preliminary AI guidance with licensed clinical
              practitioners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-soft space-y-3 relative">
              <span className="text-2xl font-black text-health-300">01</span>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-health-600" />
                <h4 className="font-bold text-sm text-ink-main">Create Account</h4>
              </div>
              <p className="text-xs text-ink-muted">
                Register as a patient or doctor with role-based access security.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-soft space-y-3 relative">
              <span className="text-2xl font-black text-health-300">02</span>
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-health-600" />
                <h4 className="font-bold text-sm text-ink-main">Get AI Guidance</h4>
              </div>
              <p className="text-xs text-ink-muted">
                Consult the AI assistant or input symptoms for instant department triage.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-soft space-y-3 relative">
              <span className="text-2xl font-black text-health-300">03</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-health-600" />
                <h4 className="font-bold text-sm text-ink-main">Book Specialists</h4>
              </div>
              <p className="text-xs text-ink-muted">
                Choose qualified doctors across departments and select convenient slots.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-soft space-y-3 relative">
              <span className="text-2xl font-black text-health-300">04</span>
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-health-600" />
                <h4 className="font-bold text-sm text-ink-main">Manage Care</h4>
              </div>
              <p className="text-xs text-ink-muted">
                Track daily medication reminders, view digital prescriptions, and store records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. AI Safety & Clinical Ethics Banner (PRD Section 5.3 & 12) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-health-50/70 border border-health-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-health-800 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-health-600" />
              <span>Responsible AI Healthcare Commitment</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              MediGuide adheres to ethical AI standards. AI guidance is explicitly preliminary and
              educational. It never provides definitive medical diagnoses or replaces the
              professional judgment of licensed clinical doctors.
            </p>
          </div>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl bg-health-500 hover:bg-health-600 text-white text-xs font-bold shrink-0 shadow-soft transition-all"
          >
            Join MediGuide
          </Link>
        </div>
      </section>

      {/* 7. Bottom High-Conversion CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-health-900 via-health-800 to-health-950 text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-health-400/10 rounded-full blur-3xl -z-0" />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-white/10 text-health-200 border border-white/10">
              Get Started In Seconds
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready for Smarter, Simpler Healthcare?
            </h2>
            <p className="text-sm sm:text-base text-health-100/80 leading-relaxed">
              Join patients and doctors experiencing AI healthcare assistance, instant appointment
              scheduling, and organized medical records.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-health-900 hover:bg-health-50 font-bold text-sm shadow-lg transition-all"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-health-700/60 hover:bg-health-700 text-white border border-white/20 font-bold text-sm transition-all text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
