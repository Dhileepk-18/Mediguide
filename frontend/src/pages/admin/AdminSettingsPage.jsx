import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import {
    Settings,
    Bot,
    Key,
    PhoneCall,
    ShieldCheck,
    Save,
    CheckCircle2,
    Sparkles,
    AlertTriangle,
    Layers,
    Server,
} from 'lucide-react';

export const AdminSettingsPage = () => {
    const { addToast } = useAppStore();
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form fields
    const [aiProvider, setAiProvider] = useState('clinical_knowledge_base');
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [emergency112, setEmergency112] = useState('112');
    const [emergency108, setEmergency108] = useState('108');
    const [emergency102, setEmergency102] = useState('102');
    const [emergencyTeleManas, setEmergencyTeleManas] = useState('14416');
    const [dpdpConsentText, setDpdpConsentText] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const res = await api.getAdminSettings();
            if (res.success && res.settings) {
                const s = res.settings;
                setSettings(s);
                setAiProvider(s.aiProvider || 'clinical_knowledge_base');
                setGeminiApiKey(s.geminiApiKey || '');
                if (s.emergencyHelplines) {
                    setEmergency112(s.emergencyHelplines.nationalEmergency || '112');
                    setEmergency108(s.emergencyHelplines.ambulance || '108');
                    setEmergency102(s.emergencyHelplines.maternalAndChild || '102');
                    setEmergencyTeleManas(s.emergencyHelplines.teleManasMentalHealth || '14416');
                }
                setDpdpConsentText(s.dpdpConsentText || 'By using MediGuide, you acknowledge and consent to clinical data processing under India Digital Personal Data Protection Act, 2023.');
            }
        } catch (err) {
            console.error('Failed to load system settings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await api.updateAdminSettings({
                aiProvider,
                geminiApiKey,
                emergencyHelplines: {
                    nationalEmergency: emergency112,
                    ambulance: emergency108,
                    maternalAndChild: emergency102,
                    teleManasMentalHealth: emergencyTeleManas,
                },
                dpdpConsentText,
            });

            if (res.success) {
                addToast({
                    type: 'success',
                    title: 'System Settings Saved',
                    message: 'AI routing and emergency configurations updated.',
                });
            }
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Save Failed',
                message: err.message || 'Could not save settings.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-100 text-health-800 text-xs font-semibold mb-2">
                    <Settings className="w-3.5 h-3.5 text-health-600" />
                    <span>System Configuration & AI Safety Controls</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">System & AI Safety Settings</h1>
                <p className="text-xs sm:text-sm text-ink-muted">
                    Configure dual-engine AI routing, Google Gemini 1.5 Flash API credentials, emergency helpline routing, and DPDP consent notices.
                </p>
            </div>

            {isLoading ? (
                <div className="py-16 text-center">
                    <div className="w-10 h-10 border-4 border-health-200 border-t-health-600 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-ink-muted">Loading system configurations...</p>
                </div>
            ) : (
                <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-medium">
                    {/* AI Engine Provider Selection */}
                    <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft space-y-4">
                        <h3 className="text-sm font-bold text-ink-main uppercase tracking-wider flex items-center gap-2">
                            <Bot className="w-4 h-4 text-health-600" />
                            Dual-Engine AI Routing Configuration
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setAiProvider('clinical_knowledge_base')}
                                className={`p-4 rounded-2xl border text-left space-y-1.5 transition-all ${
                                    aiProvider === 'clinical_knowledge_base'
                                        ? 'bg-health-50 border-health-500 ring-2 ring-health-200 text-health-900'
                                        : 'border-surface-border text-ink-muted hover:bg-surface-muted'
                                }`}
                            >
                                <div className="font-bold flex items-center justify-between">
                                    <span>Built-in Clinical Knowledge Base</span>
                                    {aiProvider === 'clinical_knowledge_base' && <CheckCircle2 className="w-4 h-4 text-health-600" />}
                                </div>
                                <p className="text-[11px] text-ink-muted leading-relaxed">
                                    Deterministic clinical decision engine covering 35+ verified diseases, red-flag screening, and department routing. 100% offline & latency-free.
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setAiProvider('gemini')}
                                className={`p-4 rounded-2xl border text-left space-y-1.5 transition-all ${
                                    aiProvider === 'gemini'
                                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-200 text-sky-900'
                                        : 'border-surface-border text-ink-muted hover:bg-surface-muted'
                                }`}
                            >
                                <div className="font-bold flex items-center justify-between">
                                    <span>Google Gemini 1.5 Flash API</span>
                                    {aiProvider === 'gemini' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                                </div>
                                <p className="text-[11px] text-ink-muted leading-relaxed">
                                    Generative clinical AI with real-time natural language reasoning. Seamlessly falls back to Built-in Knowledge Base if network fails.
                                </p>
                            </button>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-ink-muted mb-1 flex items-center gap-1.5">
                                <Key className="w-3.5 h-3.5 text-health-600" />
                                Google Gemini API Key (Optional)
                            </label>
                            <input
                                type="password"
                                placeholder="AIzaSy..."
                                value={geminiApiKey}
                                onChange={(e) => setGeminiApiKey(e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-mono text-xs focus:outline-none focus:border-health-400"
                            />
                            <p className="text-[10px] text-ink-muted mt-1">
                                If empty, the system automatically uses the verified Built-in Clinical Medical Knowledge Base without interruption.
                            </p>
                        </div>
                    </div>

                    {/* India Emergency SOS Numbers */}
                    <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft space-y-4">
                        <h3 className="text-sm font-bold text-ink-main uppercase tracking-wider flex items-center gap-2">
                            <PhoneCall className="w-4 h-4 text-red-600" />
                            24x7 India Emergency Helplines (SOS Modal & Triage)
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted mb-1">National Emergency Number</label>
                                <input
                                    type="text"
                                    value={emergency112}
                                    onChange={(e) => setEmergency112(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-bold focus:outline-none focus:border-health-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted mb-1">Ambulance Service</label>
                                <input
                                    type="text"
                                    value={emergency108}
                                    onChange={(e) => setEmergency108(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-bold focus:outline-none focus:border-health-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted mb-1">Maternal & Child Helpline</label>
                                <input
                                    type="text"
                                    value={emergency102}
                                    onChange={(e) => setEmergency102(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-bold focus:outline-none focus:border-health-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted mb-1">Tele-MANAS Mental Health Support</label>
                                <input
                                    type="text"
                                    value={emergencyTeleManas}
                                    onChange={(e) => setEmergencyTeleManas(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-surface-border bg-surface-muted font-bold focus:outline-none focus:border-health-400"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* DPDP Act Notice */}
                    <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft space-y-4">
                        <h3 className="text-sm font-bold text-ink-main uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-health-600" />
                            DPDP Act 2023 Patient Consent Notice
                        </h3>
                        <textarea
                            rows="3"
                            value={dpdpConsentText}
                            onChange={(e) => setDpdpConsentText(e.target.value)}
                            className="w-full p-3 rounded-xl border border-surface-border bg-surface-muted font-medium focus:outline-none focus:border-health-400 leading-relaxed"
                            required
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-8 py-3.5 bg-health-500 hover:bg-health-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-soft transition-all flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? 'Saving Settings...' : 'Save System Settings'}</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
