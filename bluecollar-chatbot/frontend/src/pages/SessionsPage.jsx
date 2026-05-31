import clsx from 'clsx';
import { Eye, Filter, MessageSquare, RefreshCw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const STATUSES = ['all', 'active', 'escalated', 'resolved'];
const TYPES    = ['all', 'customer', 'worker', 'admin'];

function generateSessions(n = 40) {
  const names = ['Anjali Sharma', 'Rajesh Kumar', 'Priya Singh', 'Suresh Mehta', 'Kavita Patel',
    'Amit Verma', 'Sunita Rao', 'Deepak Joshi', 'Meena Gupta', 'Ravi Nair'];
  const intents = ['search_workers', 'book_worker', 'earnings_query', 'payment_query',
    'dispute', 'worker_onboarding', 'platform_analytics', 'find_jobs_worker'];
  const langs = ['en', 'hi', 'ta', 'te', 'mr', 'bn'];
  const statuses = ['active', 'active', 'active', 'escalated', 'resolved', 'resolved'];
  const types = ['customer', 'customer', 'worker', 'admin'];
  const channels = ['web', 'whatsapp', 'telegram', 'sms'];

  return Array.from({ length: n }, (_, i) => ({
    id: `S-${String(i + 1).padStart(4, '0')}`,
    user: names[i % names.length],
    type: types[i % types.length],
    intent: intents[i % intents.length],
    status: statuses[i % statuses.length],
    lang: langs[i % langs.length],
    messages: Math.floor(Math.random() * 20 + 2),
    channel: channels[i % channels.length],
    time: `${Math.floor(Math.random() * 59 + 1)}m ago`,
    responseMs: Math.floor(Math.random() * 1500 + 400),
  }));
}

const STATUS_COLORS = {
  active:    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  escalated: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  resolved:  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};
const TYPE_COLORS = {
  customer: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  worker:   'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  admin:    'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState(() => generateSessions());
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('all');
  const [type, setType]         = useState('all');
  const [page, setPage]         = useState(1);
  const PER_PAGE = 12;

  // Simulate live updates
  useEffect(() => {
    const t = setInterval(() => {
      setSessions(prev => prev.map(s =>
        s.status === 'active' && Math.random() > 0.7
          ? { ...s, messages: s.messages + 1, time: 'just now' }
          : s
      ));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const filtered = sessions.filter(s => {
    const matchStatus = status === 'all' || s.status === status;
    const matchType   = type === 'all' || s.type === type;
    const matchSearch = !search ||
      s.user.toLowerCase().includes(search.toLowerCase()) ||
      s.intent.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sessions</h2>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} sessions found</p>
        </div>
        <button
          onClick={() => setSessions(generateSessions())}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200
                        dark:border-gray-700 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search user, intent, session ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400
                       text-gray-700 dark:text-gray-300"
          />
        </div>

        <div className="flex items-center gap-1">
          <Filter size={13} className="text-gray-400 mr-1" />
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={clsx('text-xs px-3 py-1.5 rounded-lg font-medium transition-colors capitalize',
                status === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
              )}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {TYPES.map(t => (
            <button key={t} onClick={() => { setType(t); setPage(1); }}
              className={clsx('text-xs px-3 py-1.5 rounded-lg font-medium transition-colors capitalize',
                type === t
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
              )}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                {['Session', 'User', 'Type', 'Intent', 'Channel', 'Lang', 'Msgs', 'Resp', 'Status', 'Time', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(s => (
                <tr key={s.id}
                  className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{s.id}</td>
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{s.user}</td>
                  <td className="py-3 px-4">
                    <span className={clsx('badge', TYPE_COLORS[s.type])}>{s.type}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                    {s.intent.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs capitalize">{s.channel}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs uppercase">{s.lang}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <MessageSquare size={11} />
                      <span className="text-xs">{s.messages}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">{s.responseMs}ms</td>
                  <td className="py-3 px-4">
                    <span className={clsx('badge', STATUS_COLORS[s.status])}>{s.status}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">{s.time}</td>
                  <td className="py-3 px-4">
                    <button className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400
                                       hover:underline font-medium">
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600
                           dark:text-gray-300 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={clsx('text-xs w-7 h-7 rounded-lg font-medium transition-colors',
                    page === p
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200',
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600
                           dark:text-gray-300 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
