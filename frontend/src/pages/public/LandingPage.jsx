import React from 'react';
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
  HeartPulse,
  UserCheck,
  Check,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuthStore();

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

      {/* 3. How It Works (PRD Section 8) */}
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
