import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Bot, Stethoscope, ArrowRight } from 'lucide-react';
export const ChatHistoryPage = () => {
  const [chatHistories, setChatHistories] = useState([]);
  const [symptomHistories, setSymptomHistories] = useState([]);
  const [activeTab, setActiveTab] = useState('chats');
  useEffect(() => {
    loadHistories();
  }, []);
  const loadHistories = async () => {
    try {
      const [chatRes, symRes] = await Promise.all([
        api.getChatHistories(),
        api.getSymptomHistories(),
      ]);
      if (chatRes.success) setChatHistories(chatRes.histories);
      if (symRes.success) setSymptomHistories(symRes.records);
    } catch (err) {
      console.error('Failed to load histories:', err);
    }
  };
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-main">
            Health Interaction Logs
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Review past conversations with MediGuide AI and historical symptom triage results.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1.5 bg-surface rounded-2xl border border-surface-border self-start md:self-auto shadow-sm">
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chats'
                ? 'bg-health-500 text-white shadow-soft'
                : 'text-ink-muted hover:text-ink-main'
            }`}
          >
            AI Chat History ({chatHistories.length})
          </button>
          <button
            onClick={() => setActiveTab('symptoms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'symptoms'
                ? 'bg-health-500 text-white shadow-soft'
                : 'text-ink-muted hover:text-ink-main'
            }`}
          >
            Symptom Checks ({symptomHistories.length})
          </button>
        </div>
      </div>

      {activeTab === 'chats' ? (
        <div className="space-y-4">
          {chatHistories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {chatHistories.map(chat => (
                <div
                  key={chat.id}
                  className="bg-surface p-6 rounded-3xl border border-surface-border shadow-soft space-y-4 hover:border-health-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-health-100 text-health-700 flex items-center justify-center">
                          <Bot className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-ink-main truncate max-w-[200px]">
                          {chat.title}
                        </h3>
                      </div>
                      <span className="text-[10px] text-ink-muted">
                        {new Date(chat.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-ink-muted line-clamp-2">
                      {chat.messages[1]?.text || chat.messages[0]?.text}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-surface-border flex items-center justify-between">
                    <span className="text-[11px] text-ink-muted">
                      {chat.messages.length} messages
                    </span>
                    <Link
                      to={`/ai-assistant?chatId=${chat.id}`}
                      className="text-xs font-bold text-health-600 hover:text-health-700 flex items-center gap-1"
                    >
                      <span>Resume Chat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-surface rounded-3xl border border-surface-border text-center space-y-3">
              <Bot className="w-10 h-10 text-health-500 mx-auto" />
              <h3 className="font-bold text-sm text-ink-main">No saved chat sessions</h3>
              <p className="text-xs text-ink-muted">
                Start an AI consultation to get guidance on your questions.
              </p>
              <Link
                to="/ai-assistant"
                className="inline-block px-4 py-2 bg-health-500 text-white rounded-xl text-xs font-bold"
              >
                Open AI Assistant
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {symptomHistories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {symptomHistories.map(sym => (
                <div
                  key={sym.id}
                  className="bg-surface p-6 rounded-3xl border border-surface-border shadow-soft space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-health-100 text-health-700 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-health-800 uppercase tracking-wider block">
                          Department
                        </span>
                        <h3 className="font-bold text-sm text-ink-main">
                          {sym.recommendedDepartment}
                        </h3>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        sym.urgencyLevel.includes('High')
                          ? 'bg-red-100 text-red-800'
                          : sym.urgencyLevel.includes('Moderate')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {sym.severity} Severity
                    </span>
                  </div>

                  <div className="p-3 bg-surface-muted rounded-2xl space-y-1.5 text-xs text-ink-muted">
                    <div>
                      <strong>Symptoms:</strong> {sym.symptoms.join(', ')}
                    </div>
                    <p className="line-clamp-2">{sym.preliminaryGuidance}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-ink-muted pt-2 border-t border-surface-border">
                    <span>{new Date(sym.createdAt).toLocaleDateString()}</span>
                    <Link
                      to={`/appointments?department=${encodeURIComponent(sym.recommendedDepartment)}`}
                      className="font-bold text-health-600 hover:text-health-700 flex items-center gap-1"
                    >
                      <span>Book Department Doctor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-surface rounded-3xl border border-surface-border text-center space-y-3">
              <Stethoscope className="w-10 h-10 text-health-500 mx-auto" />
              <h3 className="font-bold text-sm text-ink-main">No symptom checks logged yet</h3>
              <p className="text-xs text-ink-muted">
                Run our intelligent symptom checker for clinical department guidance.
              </p>
              <Link
                to="/symptom-checker"
                className="inline-block px-4 py-2 bg-health-500 text-white rounded-xl text-xs font-bold"
              >
                Check Symptoms
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
