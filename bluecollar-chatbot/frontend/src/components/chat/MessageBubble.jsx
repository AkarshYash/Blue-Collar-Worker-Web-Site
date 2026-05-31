import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { Check, ThumbsDown, ThumbsUp, Zap } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MessageBubble({ msg, onQuickReply, onFeedback }) {
  const isUser = msg.role === 'user';
  const [feedback, setFeedback] = useState(null); // 'up' | 'down'

  const handleFeedback = (type) => {
    setFeedback(type);
    onFeedback?.(msg.id, type === 'up', null, null);
  };

  const timeAgo = msg.timestamp
    ? formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })
    : '';

  return (
    <div className={clsx('flex msg-enter', isUser ? 'justify-end' : 'justify-start', 'mb-3')}>
      {/* Bot avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-600
                        flex items-center justify-center flex-shrink-0 mr-2 mt-1 text-xs">
          🤖
        </div>
      )}

      <div className={clsx('max-w-[78%] flex flex-col', isUser ? 'items-end' : 'items-start')}>
        {/* Bubble */}
        <div className={clsx(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-gradient-to-br from-brand-600 to-accent-600 text-white rounded-br-sm'
            : msg.isError
              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-bl-sm'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-sm',
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none
                            prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Quick replies */}
          {!isUser && msg.quick_replies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {msg.quick_replies.map((qr, i) => (
                <button
                  key={i}
                  onClick={() => onQuickReply?.(qr.payload || qr.title)}
                  className="text-xs px-3 py-1.5 rounded-full border border-brand-300 dark:border-brand-600
                             text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/30
                             transition-colors font-medium"
                >
                  {qr.title}
                </button>
              ))}
            </div>
          )}

          {/* Suggested actions */}
          {!isUser && msg.suggested_actions?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {msg.suggested_actions.map((a, i) => (
                <button
                  key={i}
                  onClick={() => onQuickReply?.(a)}
                  className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700
                             text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600
                             transition-colors font-medium flex items-center gap-1"
                >
                  <Zap size={10} />
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className={clsx('flex items-center gap-2 mt-1 px-1', isUser ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-xs text-gray-400">{timeAgo}</span>

          {/* Intent badge */}
          {!isUser && msg.intent && msg.intent !== 'general_chat' && (
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-md">
              {msg.intent.replace(/_/g, ' ')}
            </span>
          )}

          {/* Response time */}
          {!isUser && msg.response_time_ms && (
            <span className="text-xs text-gray-400">{msg.response_time_ms}ms</span>
          )}

          {/* Feedback */}
          {!isUser && !msg.isError && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleFeedback('up')}
                className={clsx(
                  'p-1 rounded-md transition-colors',
                  feedback === 'up'
                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
                    : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                )}
              >
                <ThumbsUp size={11} />
              </button>
              <button
                onClick={() => handleFeedback('down')}
                className={clsx(
                  'p-1 rounded-md transition-colors',
                  feedback === 'down'
                    ? 'text-red-600 bg-red-50 dark:bg-red-900/30'
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
                )}
              >
                <ThumbsDown size={11} />
              </button>
            </div>
          )}

          {/* Read receipt for user */}
          {isUser && <Check size={12} className="text-brand-300" />}
        </div>
      </div>
    </div>
  );
}
