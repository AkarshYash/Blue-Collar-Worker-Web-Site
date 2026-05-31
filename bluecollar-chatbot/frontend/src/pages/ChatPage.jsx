import clsx from 'clsx';
import {
    Download, Globe,
    Settings2, Trash2, Wifi, WifiOff
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import ChatInput from '../components/chat/ChatInput';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import { useChat } from '../hooks/useChat';

const USER_TYPES = ['customer', 'worker', 'admin'];
const LANGUAGES  = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'mr', label: 'Marathi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'pa', label: 'Punjabi' },
];

const WELCOME_MESSAGES = {
  customer: "👋 Hi! I'm **Sahayak**, your BlueCollar assistant.\n\nI can help you:\n- 🔍 Find skilled workers near you\n- 📅 Book & track services\n- 💳 Handle payments & refunds\n- ⚖️ Resolve disputes\n\nWhat do you need today?",
  worker:   "🔧 Welcome back! I'm **Sahayak**.\n\nI can help you:\n- 📍 Find jobs near you\n- 💰 Check earnings & withdraw\n- 📅 Manage your availability\n- 📊 View your performance\n\nWhat would you like to do?",
  admin:    "🛡️ Admin mode — **Sahayak** at your service.\n\nAvailable commands:\n- 📈 Platform metrics & analytics\n- ⚖️ Dispute management\n- 🆔 Worker verification queue\n- 🚨 Fraud detection alerts\n\nType a command or ask a question.",
};

export default function ChatPage() {
  const [userType, setUserType] = useState('customer');
  const [language, setLanguage] = useState('en');
  const [userId]                = useState(() => `demo-${Math.random().toString(36).slice(2, 8)}`);
  const [showSettings, setShowSettings] = useState(false);
  const [ttsEnabled, setTtsEnabled]     = useState(false);
  const messagesEndRef = useRef(null);

  const { messages, isTyping, connected, error, sessionId, sendMessage, submitFeedback, clearMessages } = useChat({
    userId, userType, language,
  });

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // TTS for bot messages
  useEffect(() => {
    if (!ttsEnabled || !messages.length) return;
    const last = messages[messages.length - 1];
    if (last.role !== 'assistant' || last.isError) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(last.content.replace(/[*_`#]/g, ''));
      utt.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utt.rate = 0.9;
      window.speechSynthesis.speak(utt);
    }
  }, [messages, ttsEnabled, language]);

  const handleSend = (text) => {
    sendMessage(text);
  };

  const handleClear = () => {
    clearMessages();
    toast.success('Conversation cleared');
  };

  const exportChat = () => {
    const text = messages.map(m =>
      `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role === 'user' ? 'You' : 'Sahayak'}: ${m.content}`
    ).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `chat-${sessionId || 'session'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat exported');
  };

  return (
    <div className="flex h-full">
      {/* Chat panel */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-3 bg-white dark:bg-gray-900
                        border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-600
                              flex items-center justify-center text-base">
                🤖
              </div>
              <div className={clsx(
                'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900',
                connected ? 'bg-emerald-500' : 'bg-gray-400',
              )} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Sahayak</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                {connected
                  ? <><Wifi size={10} className="text-emerald-500" /> Live · WebSocket</>
                  : <><WifiOff size={10} className="text-gray-400" /> Reconnecting...</>
                }
                {sessionId && <span className="ml-1 opacity-60">· {sessionId.slice(0, 8)}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={exportChat} className="btn-ghost p-2" title="Export chat">
              <Download size={15} />
            </button>
            <button onClick={handleClear} className="btn-ghost p-2" title="Clear chat">
              <Trash2 size={15} />
            </button>
            <button
              onClick={() => setShowSettings(v => !v)}
              className={clsx('btn-ghost p-2', showSettings && 'bg-brand-50 dark:bg-brand-900/30 text-brand-600')}
              title="Settings"
            >
              <Settings2 size={15} />
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100
                          dark:border-gray-700 flex flex-wrap items-center gap-4 animate-fade-in">
            {/* User type */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Role:</span>
              <div className="flex gap-1">
                {USER_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => { setUserType(t); clearMessages(); }}
                    className={clsx(
                      'text-xs px-3 py-1 rounded-lg font-medium transition-colors capitalize',
                      userType === t
                        ? 'bg-brand-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="flex items-center gap-2">
              <Globe size={13} className="text-gray-400" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                           rounded-lg px-2 py-1 outline-none text-gray-700 dark:text-gray-300"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* TTS toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setTtsEnabled(v => !v)}
                className={clsx(
                  'w-8 h-4 rounded-full transition-colors relative',
                  ttsEnabled ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600',
                )}
              >
                <div className={clsx(
                  'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform',
                  ttsEnabled ? 'translate-x-4' : 'translate-x-0.5',
                )} />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Voice responses</span>
            </label>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-0">
          {/* Welcome */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600
                              flex items-center justify-center text-3xl mb-4 shadow-lg">
                🤖
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Chat with Sahayak
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
                AI-powered assistant for the BlueCollar platform. Supports 100+ languages.
              </p>
              {/* Starter chips */}
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {(userType === 'worker'
                  ? ['Show available jobs', 'My earnings today', 'Set availability']
                  : userType === 'admin'
                    ? ['Platform analytics', 'Pending disputes', 'Fraud alerts']
                    : ['Find a plumber', 'Book a worker', 'Payment help']
                ).map(s => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-sm px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200
                               dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-400
                               hover:text-brand-700 dark:hover:text-brand-300 transition-colors shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              onQuickReply={handleSend}
              onFeedback={submitFeedback}
            />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={false} userType={userType} />
      </div>

      {/* Info sidebar */}
      <div className="hidden xl:flex flex-col w-64 border-l border-gray-100 dark:border-gray-800
                      bg-white dark:bg-gray-900 p-4 gap-4 flex-shrink-0">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Session Info
          </h4>
          <div className="space-y-2">
            {[
              { label: 'Role',     value: userType },
              { label: 'Language', value: LANGUAGES.find(l => l.code === language)?.label || language },
              { label: 'Messages', value: messages.length },
              { label: 'Session',  value: sessionId ? sessionId.slice(0, 12) + '…' : 'Not started' },
              { label: 'Status',   value: connected ? '🟢 Connected' : '🔴 Offline' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Quick Actions
          </h4>
          <div className="space-y-1">
            {(userType === 'admin'
              ? ['Platform analytics', 'Pending disputes', 'Fraud alerts', 'Verify workers']
              : userType === 'worker'
                ? ['Show available jobs', 'My earnings', 'Set availability', 'My rating']
                : ['Find a plumber', 'My bookings', 'Payment help', 'Raise dispute']
            ).map(a => (
              <button
                key={a}
                onClick={() => handleSend(a)}
                className="w-full text-left text-xs px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400
                           hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand-700 dark:hover:text-brand-300
                           transition-colors"
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Capabilities
          </h4>
          <div className="space-y-1.5">
            {[
              '🌐 100+ languages',
              '🎙️ Voice input',
              '⚡ Real-time WebSocket',
              '🧠 LLM + RAG',
              '🔒 Content moderation',
              '📱 WhatsApp / SMS',
            ].map(c => (
              <p key={c} className="text-xs text-gray-500 dark:text-gray-400">{c}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
