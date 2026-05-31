import clsx from 'clsx';
import {
    AlertTriangle, BarChart3, Bot, ChevronLeft, ChevronRight,
    HelpCircle, LayoutDashboard, MessageSquare, Settings,
    Shield, Users, Zap,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/chat',      icon: MessageSquare,   label: 'Live Chat'    },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics'    },
  { to: '/sessions',  icon: Users,           label: 'Sessions'     },
  { to: '/disputes',  icon: AlertTriangle,   label: 'Disputes'     },
  { to: '/fraud',     icon: Shield,          label: 'Fraud Alerts' },
  { to: '/workers',   icon: Zap,             label: 'Workers'      },
  { to: '/settings',  icon: Settings,        label: 'Settings'     },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useApp();

  return (
    <aside className={clsx(
      'relative flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800',
      'transition-all duration-300 ease-in-out flex-shrink-0',
      sidebarOpen ? 'w-56' : 'w-16',
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-white" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">Sahayak</p>
            <p className="text-xs text-gray-400 mt-0.5">BlueCollar AI</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => clsx(
              'sidebar-link',
              isActive && 'active',
              !sidebarOpen && 'justify-center px-2',
            )}
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Help */}
      <div className="px-2 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
        <button className={clsx('sidebar-link w-full', !sidebarOpen && 'justify-center px-2')}>
          <HelpCircle size={18} className="flex-shrink-0" />
          {sidebarOpen && <span>Help & Docs</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-gray-800
                   border border-gray-200 dark:border-gray-700 flex items-center justify-center
                   shadow-sm hover:shadow-md transition-shadow z-10"
      >
        {sidebarOpen
          ? <ChevronLeft size={12} className="text-gray-500" />
          : <ChevronRight size={12} className="text-gray-500" />
        }
      </button>
    </aside>
  );
}
