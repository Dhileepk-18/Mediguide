import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { AiDisclaimerBanner } from '../../components/common/AiDisclaimerBanner.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { EmergencyModal } from '../../components/common/EmergencyModal.jsx';
import {
  Bot,
  Send,
  Sparkles,
  History,
  Copy,
  Check,
  Plus,
  MessageSquare,
  Key,
  ExternalLink,
  Zap,
  Mic,
  MicOff,
  AlertTriangle,
  Calendar,
  Stethoscope,
  ArrowUpRight,
} from 'lucide-react';

export const AiAssistantPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('query');
  const { addToast } = useAppStore();

  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: '### Welcome to MediGuide AI Assistant 👋\n\nI provide reassuring, evidence-informed preliminary health guidance structured for clarity.\n\n- **What it may mean:** Explain symptoms & clinical terms\n- **What you can do now:** Practical self-care & lifestyle guidance\n- **When to seek care:** Clinical red flags & specialist recommendations\n\n*How can I help you today?*',
      timestamp: new Date().toISOString(),
      suggestions: [
        'What questions should I prepare for my doctor appointment?',
        'How can I naturally reduce acute tension headaches?',
        'What lifestyle modifications help keep blood pressure steady?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(undefined);
  const [chatHistories, setChatHistories] = useState([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // Guard refs against duplicate sends and React StrictMode double-mounting
  const handledQueryRef = useRef(null);
  const isSendingRef = useRef(false);

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState({
    hasKey: false,
    activeModel: 'Google Gemini 2.0 Flash',
    provider: 'Google AI Studio',
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  const messagesContainerRef = useRef(null);

  useEffect(() => {
    loadChatHistories();
    loadAiConfig();

    // Initialize Speech Recognition if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = event => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (initialQuery && handledQueryRef.current !== initialQuery) {
      handledQueryRef.current = initialQuery;
      sendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      addToast({
        type: 'info',
        title: 'Speech Recognition',
        message: 'Voice recognition is not supported in this browser. You can type your question.',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        addToast({
          type: 'info',
          title: 'Listening...',
          message: 'Speak your health question clearly.',
        });
      } catch {
        setIsListening(false);
      }
    }
  };

  const loadAiConfig = async () => {
    try {
      const res = await api.getAiConfig();
      if (res.success) {
        setAiConfig(res.config);
      }
    } catch {
      // Ignore
    }
  };

  const loadChatHistories = async () => {
    try {
      const res = await api.getChatHistories();
      if (res.success) {
        setChatHistories(res.histories);
        const targetChatId = searchParams.get('chatId') || searchParams.get('conversationId');
        if (targetChatId && res.histories) {
          const matched = res.histories.find(h => h.id === targetChatId);
          if (matched) {
            setConversationId(matched.id);
            setMessages(matched.messages);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const sendMessage = async textToSend => {
    const text = (textToSend || input || '').trim();
    if (!text || isSendingRef.current) return;

    isSendingRef.current = true;
    setIsLoading(true);

    const userMsg = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const formattedHistory = messages
        .filter(m => m.id !== 'welcome-msg')
        .map(m => ({ sender: m.sender, text: m.text }));

      const res = await api.sendChatMessage(text, conversationId, formattedHistory);

      if (res.success) {
        const assistantMsg = {
          id: `msg-${Date.now()}-a`,
          sender: 'assistant',
          text: res.text,
          timestamp: new Date().toISOString(),
          suggestions: res.suggestions,
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (res.conversationId) setConversationId(res.conversationId);
        loadChatHistories();
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Chat error',
        message: err.message || 'Failed to receive AI response.',
      });
    } finally {
      isSendingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = async e => {
    e.preventDefault();
    if (!geminiApiKeyInput.trim()) return;

    setIsSavingKey(true);
    try {
      const res = await api.setAiApiKey(geminiApiKeyInput.trim());
      if (res.success) {
        setAiConfig(res.config);
        addToast({
          type: 'success',
          title: 'Live Gemini AI Connected! ⚡',
          message: 'Google Gemini API key has been registered and verified.',
        });
        setIsKeyModalOpen(false);
        setGeminiApiKeyInput('');
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Key setup failed',
        message: err.message || 'Could not configure API key.',
      });
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleStartNewChat = () => {
    setConversationId(undefined);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: '### New Conversation Started ✨\n\nI am ready for your next healthcare query. Ask me about symptoms, medications, or preventive health tips.',
        timestamp: new Date().toISOString(),
        suggestions: [
          'What are common migraine triggers?',
          'How to optimize sleep hygiene?',
          'When should I see a cardiologist?',
        ],
      },
    ]);
    setShowHistoryDrawer(false);
  };

  const handleSelectHistory = history => {
    setConversationId(history.id);
    setMessages(history.messages);
    setShowHistoryDrawer(false);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast({
      type: 'info',
      title: 'Copied',
      message: 'Message copied to clipboard.',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Extract recommended department for 1-click action buttons
  const extractDepartment = text => {
    const match = text.match(/Recommended (?:Specialist|Department):\s*\*\*([^*]+)\*\*/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    return null;
  };

  // Clean Markdown Renderer
  const renderMarkdown = text => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm font-bold text-ink-main mt-1.5 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-xs font-bold text-ink-main mt-1 mb-0.5">
            {line.replace('#### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-3.5 list-disc text-xs text-ink-main leading-relaxed">
            {formatBoldText(line.replace('- ', ''))}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="ml-1 text-xs text-ink-main leading-relaxed my-0.5">
            {formatBoldText(line)}
          </div>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <div
            key={idx}
            className="my-1.5 p-2.5 rounded-xl bg-amber-50 border-l-4 border-amber-500 text-xs text-amber-900 font-medium"
          >
            {formatBoldText(line.replace('> ', ''))}
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1" />;
      }
      return (
        <p key={idx} className="text-xs text-ink-main leading-relaxed">
          {formatBoldText(line)}
        </p>
      );
    });
  };

  const formatBoldText = str => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-ink-main">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="w-full h-full flex flex-col p-3 sm:p-5 gap-3 max-w-6xl mx-auto overflow-hidden">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface p-3 sm:p-4 rounded-2xl border border-surface-border shadow-soft gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-health-700 text-white flex items-center justify-center shadow-soft shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-ink-main font-display">
                MediGuide AI Assistant
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-health-50 text-health-700 rounded-full flex items-center gap-1 border border-health-200/60">
                <Zap className="w-3 h-3 text-accent fill-accent" />
                Clinical AI Companion
              </span>
            </div>
            <p className="text-[11px] text-ink-muted">
              Evidence-informed concise health insights & guidance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Persistent Need Urgent Help Affordance (Alert Token per Section 7.3) */}
          <Link
            to="/emergency"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#B83A3A] text-white hover:bg-[#a63333] transition-colors"
            title="Emergency Guidance Protocol"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Need urgent help?</span>
          </Link>

          {/* AI Key Config button */}
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              aiConfig.hasKey
                ? 'bg-health-50 text-health-700 border-health-300 hover:bg-health-100'
                : 'bg-accent-light text-accent-dark border-accent/40 hover:bg-accent-light/80'
            }`}
            title="Configure Google Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{aiConfig.hasKey ? 'Gemini 2.0 Active ⚡' : 'Connect Key'}</span>
          </button>

          <button
            onClick={handleStartNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-surface hover:bg-surface-muted border border-surface-border text-ink-main transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-surface hover:bg-surface-muted border border-surface-border text-ink-main transition-colors"
          >
            <History className="w-4 h-4 text-ink-muted" />
            <span className="hidden sm:inline">History ({chatHistories.length})</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 min-h-0 bg-surface rounded-2xl sm:rounded-3xl border border-surface-border shadow-soft overflow-hidden flex flex-col relative">
        {/* History Drawer Overlay (if open) */}
        {showHistoryDrawer && (
          <div className="absolute inset-0 bg-surface/98 backdrop-blur-md z-20 p-5 overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-health-700" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-ink-main">
                  Saved AI Conversations
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="text-xs font-bold text-health-700 hover:underline"
              >
                Close
              </button>
            </div>

            {chatHistories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {chatHistories.map(hist => (
                  <button
                    key={hist.id}
                    onClick={() => handleSelectHistory(hist)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      conversationId === hist.id
                        ? 'bg-health-50 border-health-400 shadow-sm'
                        : 'bg-surface-muted/60 border-surface-border hover:bg-health-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-ink-main truncate max-w-[200px]">
                        {hist.title}
                      </span>
                      <MessageSquare className="w-3.5 h-3.5 text-health-700 shrink-0" />
                    </div>
                    <p className="text-[10px] text-ink-muted">
                      {hist.messages.length} messages &bull;{' '}
                      {new Date(hist.lastUpdated).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink-muted text-center py-8">
                No saved chat histories yet.
              </p>
            )}
          </div>
        )}

        {/* Messages Scroll Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 min-h-0 p-3.5 sm:p-5 overflow-y-auto space-y-3.5"
        >
          <AiDisclaimerBanner compact className="mb-2" />

          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            const dept = !isUser ? extractDepartment(msg.text) : null;
            return (
              <div key={msg.id} className="w-full">
                {isUser ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl rounded-tr-none bg-[#0B3441] text-white text-xs sm:text-sm leading-relaxed shadow-sm space-y-1">
                      <p className="font-normal">{msg.text}</p>
                      <div className="text-[10px] text-[#9EBAD1] text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Assistant messages unbubbled per Section 7.3 */
                  <div className="py-3 space-y-2 border-b border-[rgba(6,16,23,0.06)] last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#0B3441] text-white flex items-center justify-center shrink-0">
                          <Bot className="w-3.5 h-3.5 text-[#9EBAD1]" />
                        </div>
                        <span className="text-xs font-semibold text-[#061017]">MediGuide AI</span>
                        {/* Quiet inline source attribution chip per Section 7.3 */}
                        <span className="px-2 py-0.5 rounded-full bg-[#FAFBFB] border border-[rgba(6,16,23,0.10)] text-[10px] text-[#5A6C77]">
                          Clinical Knowledge Base
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#5A6C77]">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="p-1 rounded hover:bg-[#FAFBFB] text-[#5A6C77]"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-[#2A7A5B]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Unbubbled text content */}
                    <div className="pl-8 text-xs sm:text-sm text-[#061017] leading-relaxed space-y-2">
                      {renderMarkdown(msg.text)}
                    </div>

                    {/* 1-Click Specialist Action Link (if department detected) */}
                    {dept && (
                      <div className="pl-8 pt-2 flex items-center gap-2">
                        <Link
                          to={`/doctors?department=${encodeURIComponent(dept)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B3441] hover:bg-[#08252E] text-white text-[11px] font-semibold transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book {dept} Specialist</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                        <Link
                          to="/symptom-checker"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FAFBFB] border border-[rgba(6,16,23,0.12)] hover:bg-white text-[11px] font-medium text-[#061017] transition-colors"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Triage Check</span>
                        </Link>
                      </div>
                    )}

                    {/* Suggestions Chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="pl-8 pt-2 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => sendMessage(sug)}
                            className="px-3 py-1.5 rounded-xl bg-[#FAFBFB] hover:bg-white text-xs text-[#061017] border border-[rgba(6,16,23,0.12)] transition-colors cursor-pointer text-left"
                          >
                            "{sug}"
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-xl bg-health-700 text-white flex items-center justify-center shrink-0 shadow-soft">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 rounded-2xl rounded-tl-none bg-surface-muted border border-surface-border flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-health-600 animate-spin" />
                <span className="text-xs text-ink-muted font-medium">
                  MediGuide AI is generating response...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar with Voice Recognition Button */}
        <div className="p-3 sm:p-4 bg-surface border-t border-surface-border shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Microphone Toggle Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                isListening
                  ? 'bg-red-50 text-status-danger border-red-300 animate-pulse'
                  : 'bg-surface-muted text-ink-muted border-surface-border hover:bg-health-50 hover:text-health-700'
              }`}
              title={isListening ? 'Stop listening' : 'Speak to AI'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-red-600" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening... speak now'
                  : "Ask anything (e.g. 'Explain high blood pressure', 'How to relieve sinus headache')..."
              }
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400 transition-all text-ink-main placeholder:text-ink-muted"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Gemini API Key Modal */}
      <Modal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        title="Google Gemini AI Configuration"
        subtitle="Connect your Gemini API key to enable live generative AI healthcare reasoning."
      >
        <form onSubmit={handleSaveApiKey} className="space-y-4">
          <div className="p-4 rounded-2xl bg-health-50 border border-health-200 text-xs text-health-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-health-600" />
              <span>Real Google Gemini AI Support</span>
            </div>
            <p className="text-ink-muted leading-relaxed">
              MediGuide runs Google Gemini 2.0 / 1.5 Flash natively for ultra-fast conversational
              responses and structured symptom triage analysis.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-health-700 hover:text-health-800 underline"
            >
              <span>Get a Free Gemini API Key from Google AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-main mb-1.5">
              Enter Gemini API Key
            </label>
            <input
              type="password"
              required
              value={geminiApiKeyInput}
              onChange={e => setGeminiApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400 font-mono"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsKeyModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-ink-muted hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingKey || !geminiApiKeyInput.trim()}
              className="flex-1 py-2.5 rounded-xl bg-health-700 hover:bg-health-800 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{isSavingKey ? 'Saving...' : 'Connect Gemini AI'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Emergency Helplines SOS Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </div>
  );
};
