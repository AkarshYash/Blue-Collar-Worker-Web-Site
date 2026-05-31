import clsx from 'clsx';
import { AlertOctagon, Ban, CheckCircle, Eye, Shield, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const ALERTS = [
  { id: 'FR-001', entity: 'W-44512', type: 'worker', risk: 'high',   pattern: 'Fake reviews — 5 five-star reviews in 10 minutes from same IP', action: 'auto_suspended', time: '2m ago' },
  { id: 'FR-002', entity: 'C-23451', type: 'customer', risk: 'high', pattern: '87% cancellation rate — 15 bookings, 13 cancelled', action: 'flagged', time: '15m ago' },
  { id: 'FR-003', entity: 'W-38901', type: 'worker', risk: 'medium', pattern: 'Location spoofing detected — GPS coordinates inconsistent', action: 'under_review', time: '32m ago' },
  { id: 'FR-004', entity: 'C-19234', type: 'customer', risk: 'medium', pattern: 'Multiple accounts from same device (3 accounts)', action: 'flagged', time: '1h ago' },
  { id: 'FR-005', entity: 'W-55123', type: 'worker', risk: 'low',    pattern: 'Unusual login pattern — 4 different cities in 2 hours', action: 'monitoring', time: '2h ago' },
  { id: 'FR-006', entity: 'C-67890', type: 'customer', risk: 'low',  pattern: 'Payment method flagged by bank — 2 failed transactions', action: 'monitoring', time: '3h ago' },
  { id: 'FR-007', entity: 'W-12345', type: 'worker', risk: 'high',   pattern: 'Impersonation — using another worker\'s photos', action: 'auto_suspended', time: '4h ago' },
];

const RISK_COLORS = {
  high:   { badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
  medium: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  low:    { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-blue-500' },
};

const ACTION_COLORS = {
  auto_suspended: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  flagged:        'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  under_review:   'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  monitoring:     'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

export default function FraudPage() {
  const [alerts, setAlerts] = useState(ALERTS);
  const [filter, setFilter] = useState('all');

  const resolve = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast.success('Alert resolved');
  };

  const suspend = (id, entity) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, action: 'auto_suspended' } : a));
    toast.error(`${entity} suspended`);
  };

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.risk === filter || a.type === filter);

  const counts = {
    high:   alerts.filter(a => a.risk === 'high').length,
    medium: alerts.filter(a => a.risk === 'medium').length,
    low:    alerts.filter(a => a.risk === 'low').length,
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Shield size={18} className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fraud Detection</h2>
          <p className="text-sm text-gray-500 mt-0.5">AI-powered fraud & abuse monitoring</p>
        </div>
      </div>

      {/* Risk summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'High Risk',   count: counts.high,   color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20',    icon: AlertOctagon },
          { label: 'Medium Risk', count: counts.medium, color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20', icon: TrendingDown },
          { label: 'Low Risk',    count: counts.low,    color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: Eye },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <div key={label} className={clsx('card p-4 flex items-center gap-3', bg)}>
            <Icon size={20} className={color} />
            <div>
              <p className={clsx('text-2xl font-bold', color)}>{count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'high', 'medium', 'low', 'worker', 'customer'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={clsx('text-xs px-3 py-1.5 rounded-lg font-medium transition-colors capitalize',
              filter === f
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300',
            )}>
            {f}
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {filtered.map(a => (
          <div key={a.id} className="card p-5">
            <div className="flex items-start gap-3">
              <div className={clsx('w-2 h-2 rounded-full mt-2 flex-shrink-0', RISK_COLORS[a.risk].dot)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{a.entity}</span>
                  <span className="text-xs text-gray-400 capitalize">{a.type}</span>
                  <span className={clsx('badge', RISK_COLORS[a.risk].badge)}>{a.risk} risk</span>
                  <span className={clsx('badge', ACTION_COLORS[a.action])}>{a.action.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{a.pattern}</p>
                <p className="text-xs text-gray-400 mt-1">{a.time}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => suspend(a.id, a.entity)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white
                             hover:bg-red-700 transition-colors font-medium"
                >
                  <Ban size={11} /> Suspend
                </button>
                <button
                  onClick={() => resolve(a.id)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white
                             hover:bg-emerald-700 transition-colors font-medium"
                >
                  <CheckCircle size={11} /> Resolve
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card p-12 text-center text-gray-400">
            <Shield size={32} className="mx-auto mb-3 text-emerald-400" />
            <p className="font-medium">No fraud alerts in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
