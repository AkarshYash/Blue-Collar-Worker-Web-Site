import clsx from 'clsx';
import { Mic, MicOff, Send, Smile } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const QUICK_STARTERS = [
  'Find a plumber near me',
  'Check my bookings',
  'Payment help',
  'Show available jobs',
  'My earnings today',
  'Platform analytics',
];

export default function ChatInput({ onSend, disabled, userType = 'customer' }) {
  const [text, setText]           = useState('');
  const [listening, setListening] = useState(false);
  const [showStarters, setShowStarters] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [text]);

  // Speech recognition
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      setText(e.results[0][0].transcript);
      setListening(false);
    };
    rec.onerror = rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    setShowStarters(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      recognitionRef.current?.start();
      setListening(true);
    }
  };

  const starters = userType === 'worker'
    ? ['Show available jobs', 'My earnings today', 'Set availability', 'My rating']
    : userType === 'admin'
      ? ['Platform analytics', 'Pending disputes', 'Fraud alerts', 'Verify workers']
      : QUICK_STARTERS;

  return (
    <div className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
      {/* Quick starters */}
      {showStarters && (
        <div className="flex flex-wrap gap-1.5 mb-2 animate-fade-in">
          {starters.map(s => (
            <button
              key={s}
              onClick={() => { onSend(s); setShowStarters(false); }}
              className="text-xs px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30
                         text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700
                         hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors font-medium"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Suggestions toggle */}
        <button
          onClick={() => setShowStarters(v => !v)}
          className={clsx(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
            showStarters
              ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600',
          )}
          title="Quick suggestions"
        >
          <Smile size={16} />
        </button>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder={listening ? '🎙️ Listening...' : 'Type a message... (Enter to send)'}
            rows={1}
            disabled={disabled}
            className="w-full resize-none bg-gray-50 dark:bg-gray-800 border border-gray-200
                       dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none
                       focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500
                       transition-all placeholder:text-gray-400 text-gray-800 dark:text-gray-200
                       disabled:opacity-50 leading-relaxed"
            style={{ minHeight: 40, maxHeight: 120 }}
          />
        </div>

        {/* Voice */}
        <button
          onClick={toggleVoice}
          className={clsx(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
            listening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600',
          )}
          title={listening ? 'Stop recording' : 'Voice input'}
        >
          {listening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className={clsx(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
            text.trim() && !disabled
              ? 'bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-md hover:shadow-lg active:scale-95'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed',
          )}
          title="Send message"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
