import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAppStore } from '../../store/appStore.js';
import { AiDisclaimerBanner } from '../../components/common/AiDisclaimerBanner.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Bot, User, Send, Sparkles, History, Copy, Check, Plus, MessageSquare, Key, ExternalLink, } from 'lucide-react';
export const AiAssistantPage = () => {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('query');
    const { addToast } = useAppStore();
    const [messages, setMessages] = useState([
        {
            id: 'welcome-msg',
            sender: 'assistant',
            text: "### Welcome to MediGuide AI Healthcare Assistant 👋\n\nI am connected to your clinical health records. You can ask me to explain medical terminology, provide preliminary symptom clarity, or advise on lifestyle and medication schedules.\n\n*How can I assist you with your health today?*",
            timestamp: new Date().toISOString(),
            suggestions: [
                'Explain high blood pressure benchmarks',
                'Difference between Cold and Flu',
                'How to relieve morning joint stiffness?',
                'Healthy dietary changes to lower cholesterol',
            ],
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(undefined);
    const [chatHistories, setChatHistories] = useState([]);
    const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    // AI Configuration State
    const [aiConfig, setAiConfig] = useState({
        hasKey: false,
        activeModel: 'Google Gemini 1.5 Flash',
        provider: 'Google AI Studio',
    });
    const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
    const [geminiApiKeyInput, setGeminiApiKeyInput] = useState('');
    const [isSavingKey, setIsSavingKey] = useState(false);
    const chatEndRef = useRef(null);
    useEffect(() => {
        loadChatHistories();
        loadAiConfig();
    }, []);
    useEffect(() => {
        if (initialQuery) {
            sendMessage(initialQuery);
        }
    }, [initialQuery]);
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);
    const loadAiConfig = async () => {
        try {
            const res = await api.getAiConfig();
            if (res.success) {
                setAiConfig(res.config);
            }
        }
        catch {
            // Ignore
        }
    };
    const loadChatHistories = async () => {
        try {
            const res = await api.getChatHistories();
            if (res.success) {
                setChatHistories(res.histories);
            }
        }
        catch (err) {
            console.error('Failed to load chat history:', err);
        }
    };
    const sendMessage = async (textToSend) => {
        const text = textToSend || input;
        if (!text.trim() || isLoading)
            return;
        const userMsg = {
            id: `msg-${Date.now()}-u`,
            sender: 'user',
            text,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        try {
            const formattedHistory = messages
                .filter((m) => m.id !== 'welcome-msg')
                .map((m) => ({ sender: m.sender, text: m.text }));
            const res = await api.sendChatMessage(text, conversationId, formattedHistory);
            if (res.success) {
                const assistantMsg = {
                    id: `msg-${Date.now()}-a`,
                    sender: 'assistant',
                    text: res.text,
                    timestamp: new Date().toISOString(),
                    suggestions: res.suggestions,
                };
                setMessages((prev) => [...prev, assistantMsg]);
                if (res.conversationId)
                    setConversationId(res.conversationId);
                loadChatHistories();
            }
        }
        catch (err) {
            addToast({
                type: 'error',
                title: 'Chat error',
                message: err.message || 'Failed to receive AI response.',
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSaveApiKey = async (e) => {
        e.preventDefault();
        if (!geminiApiKeyInput.trim())
            return;
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
        }
        catch (err) {
            addToast({
                type: 'error',
                title: 'Key setup failed',
                message: err.message || 'Could not configure API key.',
            });
        }
        finally {
            setIsSavingKey(false);
        }
    };
    const handleStartNewChat = () => {
        setConversationId(undefined);
        setMessages([
            {
                id: `welcome-${Date.now()}`,
                sender: 'assistant',
                text: "### New Conversation Started ✨\n\nI am ready for your next healthcare query. Ask me about symptoms, medications, or preventive health tips.",
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
    const handleSelectHistory = (history) => {
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
    // Simple Markdown Renderer
    const renderMarkdown = (text) => {
        const lines = text.split('\n');
        return lines.map((line, idx) => {
            if (line.startsWith('### ')) {
                return <h3 key={idx} className="text-base font-bold text-ink-main mt-2 mb-1">{line.replace('### ', '')}</h3>;
            }
            if (line.startsWith('#### ')) {
                return <h4 key={idx} className="text-sm font-bold text-ink-main mt-2 mb-1">{line.replace('#### ', '')}</h4>;
            }
            if (line.startsWith('- ')) {
                return (<li key={idx} className="ml-4 list-disc text-xs text-ink-main leading-relaxed">
            {formatBoldText(line.replace('- ', ''))}
          </li>);
            }
            if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                return (<div key={idx} className="ml-2 text-xs text-ink-main leading-relaxed my-0.5">
            {formatBoldText(line)}
          </div>);
            }
            if (line.startsWith('> ')) {
                return (<div key={idx} className="my-2 p-2.5 rounded-xl bg-amber-50 border-l-4 border-amber-500 text-xs text-amber-900 font-medium">
            {formatBoldText(line.replace('> ', ''))}
          </div>);
            }
            if (line.trim() === '') {
                return <div key={idx} className="h-1.5"/>;
            }
            return <p key={idx} className="text-xs text-ink-main leading-relaxed">{formatBoldText(line)}</p>;
        });
    };
    const formatBoldText = (str) => {
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-ink-main">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };
    return (<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface p-4 rounded-3xl border border-surface-border shadow-soft gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-health-500 text-white flex items-center justify-center shadow-soft shrink-0">
            <Bot className="w-5 h-5"/>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-ink-main">MediGuide AI Healthcare Assistant</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-health-100 text-health-800 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-health-600"/>
                Live Gemini AI
              </span>
            </div>
            <p className="text-[11px] text-ink-muted">Evidence-informed preliminary health & symptom guidance</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* AI Key Config button */}
          <button onClick={() => setIsKeyModalOpen(true)} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${aiConfig.hasKey
            ? 'bg-green-50 text-green-900 border-green-300 hover:bg-green-100'
            : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'}`} title="Configure Google Gemini API Key">
            <Key className="w-3.5 h-3.5"/>
            <span>{aiConfig.hasKey ? 'Gemini API Active ⚡' : 'Connect Gemini Key'}</span>
          </button>

          <button onClick={handleStartNewChat} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-health-50 text-health-800 hover:bg-health-100 border border-health-200 transition-colors">
            <Plus className="w-4 h-4"/>
            <span className="hidden sm:inline">New Chat</span>
          </button>

          <button onClick={() => setShowHistoryDrawer(!showHistoryDrawer)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-surface hover:bg-surface-muted border border-surface-border text-ink-main transition-colors">
            <History className="w-4 h-4 text-ink-muted"/>
            <span className="hidden sm:inline">History ({chatHistories.length})</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-surface rounded-3xl border border-surface-border shadow-soft overflow-hidden flex flex-col relative">
        {/* History Drawer Overlay (if open) */}
        {showHistoryDrawer && (<div className="absolute inset-0 bg-surface/95 backdrop-blur-md z-20 p-6 overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-health-600"/>
                <h3 className="font-bold text-sm text-ink-main">Saved AI Conversations</h3>
              </div>
              <button onClick={() => setShowHistoryDrawer(false)} className="text-xs font-bold text-health-700 hover:underline">
                Close Drawer
              </button>
            </div>

            {chatHistories.length > 0 ? (<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {chatHistories.map((hist) => (<button key={hist.id} onClick={() => handleSelectHistory(hist)} className={`p-4 rounded-2xl border text-left transition-all ${conversationId === hist.id
                        ? 'bg-health-50 border-health-400 shadow-sm'
                        : 'bg-surface-muted/60 border-surface-border hover:bg-health-50/60'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-ink-main truncate max-w-[200px]">{hist.title}</span>
                      <MessageSquare className="w-3.5 h-3.5 text-health-600 shrink-0"/>
                    </div>
                    <p className="text-[10px] text-ink-muted">
                      {hist.messages.length} messages • {new Date(hist.lastUpdated).toLocaleDateString()}
                    </p>
                  </button>))}
              </div>) : (<p className="text-xs text-ink-muted text-center py-8">No saved chat histories yet.</p>)}
          </div>)}

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          <AiDisclaimerBanner compact className="mb-4"/>

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (<div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (<div className="w-8 h-8 rounded-xl bg-health-500 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4"/>
                  </div>)}

                <div className={`max-w-[85%] rounded-3xl p-4 space-y-2 relative group ${isUser
                    ? 'bg-health-500 text-white rounded-tr-none shadow-soft'
                    : 'bg-surface-muted/70 border border-surface-border text-ink-main rounded-tl-none'}`}>
                  {/* Message Content */}
                  <div>
                    {isUser ? (<p className="text-xs leading-relaxed font-medium">{msg.text}</p>) : (<div className="space-y-1">{renderMarkdown(msg.text)}</div>)}
                  </div>

                  {/* Suggestions Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (<div className="pt-2 border-t border-surface-border/60 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, i) => (<button key={i} onClick={() => sendMessage(sug)} className="px-2.5 py-1 rounded-xl bg-surface hover:bg-health-100 text-[11px] font-semibold text-health-900 border border-health-200 transition-colors">
                          "{sug}"
                        </button>))}
                    </div>)}

                  {/* Timestamp & Copy Button */}
                  <div className={`flex items-center justify-between text-[10px] pt-1 ${isUser ? 'text-health-100' : 'text-ink-muted'}`}>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {!isUser && (<button onClick={() => handleCopy(msg.id, msg.text)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface text-ink-muted hover:text-ink-main" title="Copy text">
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-status-success"/> : <Copy className="w-3 h-3"/>}
                      </button>)}
                  </div>
                </div>

                {isUser && (<div className="w-8 h-8 rounded-xl bg-health-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <User className="w-4 h-4"/>
                  </div>)}
              </div>);
        })}

          {isLoading && (<div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-health-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4"/>
              </div>
              <div className="p-4 rounded-3xl rounded-tl-none bg-surface-muted border border-surface-border flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-health-600 animate-spin-slow"/>
                <span className="text-xs text-ink-muted font-medium">MediGuide AI is generating live clinical response...</span>
              </div>
            </div>)}

          <div ref={chatEndRef}/>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-surface border-t border-surface-border">
          <form onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
        }} className="flex items-center gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything (e.g. 'Explain ECG abnormalities', 'How to manage sinus headache')..." disabled={isLoading} className="flex-1 px-4 py-3 text-xs bg-surface-muted rounded-2xl border border-surface-border focus:outline-none focus:border-health-400 transition-all"/>
            <button type="submit" disabled={!input.trim() || isLoading} className="px-5 py-3 rounded-2xl bg-health-500 hover:bg-health-600 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 disabled:opacity-50">
              <Send className="w-4 h-4"/>
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Gemini API Key Modal */}
      <Modal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} title="Google Gemini AI Engine Configuration" subtitle="Connect your Gemini API key to enable live generative AI healthcare reasoning.">
        <form onSubmit={handleSaveApiKey} className="space-y-4">
          <div className="p-4 rounded-2xl bg-health-50 border border-health-200 text-xs text-health-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-health-600"/>
              <span>Real Google Gemini AI Support</span>
            </div>
            <p className="text-ink-muted leading-relaxed">
              MediGuide runs Google Gemini 1.5 Flash natively for conversational chat and structured symptom triage analysis.
            </p>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-health-700 hover:text-health-800 underline">
              <span>Get a Free Gemini API Key from Google AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5"/>
            </a>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-main mb-1.5">Enter Gemini API Key</label>
            <input type="password" required value={geminiApiKeyInput} onChange={(e) => setGeminiApiKeyInput(e.target.value)} placeholder="AIzaSy..." className="w-full px-4 py-2.5 text-xs bg-surface-muted rounded-xl border border-surface-border focus:outline-none focus:border-health-400 font-mono"/>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsKeyModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-surface-border text-xs font-bold text-ink-muted hover:bg-surface-muted">
              Cancel
            </button>
            <button type="submit" disabled={isSavingKey || !geminiApiKeyInput.trim()} className="flex-1 py-2.5 rounded-xl bg-health-500 hover:bg-health-600 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-1.5 disabled:opacity-50">
              <span>{isSavingKey ? 'Saving...' : 'Connect Gemini AI'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>);
};
