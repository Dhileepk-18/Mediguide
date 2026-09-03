import React from 'react';
import { Activity, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-surface-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-health-500 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-ink-main">
                Medi<span className="text-health-500">Guide</span>
              </span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Empowering proactive wellness through AI assistance, real-time medical department
              triage, appointment booking, and medication adherence.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-health-700 font-medium bg-health-50 px-3 py-1.5 rounded-xl border border-health-200 inline-flex">
              <ShieldCheck className="w-3.5 h-3.5" />
              Encrypted & Privacy First
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-main">
              AI Healthcare
            </h4>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <Link to="/ai-assistant" className="hover:text-health-600 transition-colors">
                  AI Health Assistant
                </Link>
              </li>
              <li>
                <Link to="/symptom-checker" className="hover:text-health-600 transition-colors">
                  Symptom Checker & Triage
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="hover:text-health-600 transition-colors">
                  Department Recommendation
                </Link>
              </li>
              <li>
                <Link to="/medicines" className="hover:text-health-600 transition-colors">
                  Medication Adherence
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-main">
              Portals & Roles
            </h4>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <Link to="/dashboard" className="hover:text-health-600 transition-colors">
                  Patient Health Hub
                </Link>
              </li>
              <li>
                <Link to="/doctor/dashboard" className="hover:text-health-600 transition-colors">
                  Doctor Clinical Console
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-health-600 transition-colors">
                  Hospital Administration
                </Link>
              </li>
              <li>
                <Link to="/health-records" className="hover:text-health-600 transition-colors">
                  Digital Health Vault
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-main">
              Clinical Disclaimer
            </h4>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              MediGuide provides preliminary health information and department triage for
              educational guidance. It is not an emergency response system or a replacement for
              clinical diagnosis by licensed medical professionals.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-health-800 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-health-500" />
              Powered by Google Gemini AI
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-4">
          <div>© {new Date().getFullYear()} MediGuide AI Health System. All rights reserved.</div>
          <div className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 mx-1" /> for modern
            patient care.
          </div>
        </div>
      </div>
    </footer>
  );
};
