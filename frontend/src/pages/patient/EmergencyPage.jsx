import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Navigation, ArrowLeft, ShieldAlert, HeartPulse } from 'lucide-react';

export const EmergencyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#061017] text-[#FAFBFB] px-4 py-8 sm:px-6 lg:px-8 flex flex-col justify-between select-none">
      {/* Top Bar / Calm way back */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[#9EBAD1] hover:text-white transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to safety</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B83A3A]/20 border border-[#B83A3A]/40 text-[#FAFBFB] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#B83A3A]" />
          <span>Priority Emergency Mode</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto w-full py-8 sm:py-12 space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-[#B83A3A]">
            <ShieldAlert className="w-7 h-7" />
            <span className="text-xs uppercase tracking-wider font-semibold text-[#9EBAD1]">
              Immediate Action Required
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold font-serif tracking-tight text-white leading-tight">
            If this is life-threatening, do not wait.
          </h1>
          <p className="text-base sm:text-lg text-[#9EBAD1] leading-relaxed max-w-2xl">
            You are reporting severe or acute symptoms. MediGuide is an informational tool and cannot treat emergencies. Contact Indian emergency responders or head to the nearest casualty department immediately.
          </p>
        </div>

        {/* Two High-Contrast Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <a
            href="tel:112"
            className="p-5 rounded-2xl bg-[#B83A3A] hover:bg-[#a63333] text-white flex items-center justify-between transition-colors shadow-lg"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">National Emergency</span>
              <div className="text-2xl font-bold">Call 112</div>
              <span className="text-xs text-white/90">All-in-one Emergency Helpline</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6 text-white" />
            </div>
          </a>

          <a
            href="tel:108"
            className="p-5 rounded-2xl bg-white text-[#061017] hover:bg-[#FAFBFB] flex items-center justify-between transition-colors shadow-lg"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6C77]">Ambulance Dispatch</span>
              <div className="text-2xl font-bold">Call 108</div>
              <span className="text-xs text-[#5A6C77]">Immediate Medical Emergency Response</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#061017]/10 flex items-center justify-center shrink-0">
              <HeartPulse className="w-6 h-6 text-[#061017]" />
            </div>
          </a>
        </div>

        {/* Find nearest Hospital / ER */}
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Find nearest Emergency Room (ER)</div>
            <div className="text-xs text-[#9EBAD1]">Open Google Maps to view hospitals and trauma centers within 5 km</div>
          </div>
          <a
            href="https://www.google.com/maps/search/hospitals+emergency+near+me"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
          >
            <Navigation className="w-4 h-4 text-[#9EBAD1]" />
            <span>Open ER Map</span>
          </a>
        </div>

        {/* Genuine 3-item numbered sequence: what to do while help arrives */}
        <div className="pt-4 border-t border-white/10 space-y-4">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-[#9EBAD1]">
            What to do while help is on the way
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-bold shrink-0">
                1
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-white">Stay calm and sit or lie down</div>
                <div className="text-xs text-[#9EBAD1] leading-relaxed">
                  Loosen tight clothing around the neck and chest. If experiencing chest pain, do not exert yourself or walk around.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-bold shrink-0">
                2
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-white">Alert someone nearby</div>
                <div className="text-xs text-[#9EBAD1] leading-relaxed">
                  Inform family members, neighbors, or colleagues immediately so someone is physically present with you.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-bold shrink-0">
                3
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-white">Keep doors unlocked and ID ready</div>
                <div className="text-xs text-[#9EBAD1] leading-relaxed">
                  Ensure first responders have clear physical access to enter. Have an ID card and list of current medications accessible.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer reassurance */}
      <div className="max-w-3xl mx-auto w-full pt-4 border-t border-white/10 text-center text-xs text-[#9EBAD1]/70">
        MediGuide India • Emergency Escalation Protocol • Free Public Health Service
      </div>
    </div>
  );
};
