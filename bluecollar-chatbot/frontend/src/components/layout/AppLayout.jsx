import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const PAGE_TITLES = {
  '/':          'Dashboard',
  '/chat':      'Live Chat',
  '/analytics': 'Analytics',
  '/sessions':  'Sessions',
  '/disputes':  'Disputes',
  '/fraud':     'Fraud Alerts',
  '/workers':   'Workers',
  '/settings':  'Settings',
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'Sahayak';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
