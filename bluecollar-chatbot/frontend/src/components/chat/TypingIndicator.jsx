export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3 msg-enter">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-600
                      flex items-center justify-center flex-shrink-0 text-xs">
        🤖
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700
                      rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
