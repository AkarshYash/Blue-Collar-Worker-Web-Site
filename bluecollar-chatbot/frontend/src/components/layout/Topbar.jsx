import {
    Bell, LogOut, Moon, Search, Sun, User,
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function Topbar({ title }) {
  const { theme, toggleTheme, user, logout, notifications, unreadCount, markRead } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser]     = useState(false);

  const toggleNotifs = () => {
    setShowNotifs(v => !v);
    if (!showNotifs) markRead();
    setShowUser(false);
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-gray-900
                       border-b border-gray-100 dark:border-gray-800 flex-shrink-0 z-20">
      {/* Title */}
      <h1 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h1>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-gray-800
                        border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 w-52">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400
                       text-gray-700 dark:text-gray-300"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun size={16} className="text-amber-400" />
            : <Moon size={16} className="text-gray-500" />
          }
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={toggleNotifs}
            className="w-9 h-9 rounded-xl flex items-center justify-center
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
          >
            <Bell size={16} className="text-gray-500 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-11 w-80 card shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-sm font-semibold">Notifications</span>
                <span className="text-xs text-gray-400">{notifications.length} total</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
                ) : notifications.map(n => (
                  <div key={n.id} className="px-4 py-3 border-b border-gray-50 dark:border-gray-700/50
                                              hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(v => !v); setShowNotifs(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-600
                            flex items-center justify-center">
              <User size={13} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
              {user?.name || 'Admin'}
            </span>
          </button>

          {showUser && (
            <div className="absolute right-0 top-11 w-48 card shadow-xl z-50 overflow-hidden py-1">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-400">{user?.email || 'admin@bluecollar.in'}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600
                           hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
