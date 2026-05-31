/**
 * ChatbotWidget v2 — floating chat bubble with full feature set.
 * Uses Tailwind CSS, supports voice, markdown, quick replies, TTS, dark mode.
 */
import clsx from 'clsx';
import { MessageSquare, Minimize2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';
import ChatInput from './chat/ChatInput';
import MessageBubble from './chat/MessageBubble';
import TypingIndicator from './chat/TypingIndicator';

const LANGUAGES = [
  { code: 'en', label: 'EN' }, { code: 'hi', label: 'HI' },
  { code: 'ta', label: 'TA' }, { code: 'te', label: 'TE' },
  { code: 'mr', label: 'MR' }, { code: 'bn', label: 'BN' },
];

export function ChatbotWidget({
  userType     = 'customer',
  userId       = 'guest',
  userLanguage = 'en',
  position     = 'bottom-right', // bottom-right | bottom-left
}) {
  const [isOpen, setIsOpen]       = useState(false);
  const [isMin, setIsMin]         = useState(false);
  const [lang, setLang]           = useState(userLanguage);
  const [showLang, setShowLang]   = useState(false);
  const messagesEndRef = useRef(null);

  const { messages, isTyping, connected, unreadCount, sendMessage, submitFeedback, clearMessages } =
    useChat({ userId, userType, language: lang });

  // Auto-scroll
  useEffect(() => {
    if (isOpen && !isMin) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isMin]);

  const posClass = position === 'bottom-left'
    ? 'bottom-6 left-6'
    : 'bottom-6 right-6';

  return (
    <div className={clsx('fixed z-[9999]', posClass)}>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-brand-600 to-accent-600
                     text-white shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95
                     flex items-center justify-center glow"
          aria-label="Open Sahayak chat"
        >
          <MessageSquare size={22} />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-brand-500 opacity-30 pulse-ring" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className={clsx(
          'flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden',
          'border border-gray-100 dark:border-gray-700 transition-all duration-300',
          isMin ? 'w-72 h-14' : 'w-[380px] h-[600px]',
        )}
          role="dialog" aria-label="Sahayak chatbot"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-600 to-accent-600 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">
                  🤖
                </div>
                <div className={clsx(
                  'absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white',
                  connected ? 'bg-emerald-400' : 'bg-gray-400',
                )} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">Sahayak</p>
                <p className="text-xs text-white/70 mt-0.5">
                  {connected ? '● Online · 100+ languages' : '○ Reconnecting...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Language picker */}
              <div className="relative">
                <button
                  onClick={() => setShowLang(v => !v)}
                  className="text-xs text-white/80 hover:text-white px-2 py-1 rounded-lg
                             hover:bg-white/10 transition-colors font-medium"
                >
                  {lang.toUpperCase()}
                </button>
                {showLang && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl
                                  border border-gray-100 dark:border-gray-700 py-1 z-10 w-28">
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setShowLang(false); }}
                        className={clsx(
                          'w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                          lang === l.code ? 'text-brand-600 font-semibold' : 'text-gray-700 dark:text-gray-300',
                        )}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setIsMin(v => !v)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80
                           hover:text-white hover:bg-white/10 transition-colors">
                <Minimize2 size={13} />
              </button>
              <button onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80
                           hover:text-white hover:bg-white/10 transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMin && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <div className="text-4xl mb-3">👋</div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Hello! I'm Sahayak</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
                      Your AI assistant for BlueCollar platform
                    </p>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {['Find a Worker', 'My Bookings', 'Payment Help', 'Help'].map(t => (
                        <button key={t} onClick={() => sendMessage(t)}
                          className="text-xs px-3 py-1.5 rounded-full border border-brand-300 dark:border-brand-600
                                     text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/30
                                     transition-colors font-medium">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    onQuickReply={sendMessage}
                    onFeedback={submitFeedback}
                  />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <ChatInput onSend={sendMessage} userType={userType} />

              {/* Footer */}
              <p className="text-center text-xs text-gray-400 py-1.5 flex-shrink-0">
                🔒 Secure · Powered by Sahayak AI
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatbotWidget;
