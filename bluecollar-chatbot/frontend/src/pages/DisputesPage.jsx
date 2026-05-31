import clsx from 'clsx';
import { AlertTriangle, CheckCircle, Clock, Eye, MessageSquare, XCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const DISPUTES = [
  { id: 'DSP-001', customer: 'Anjali Sharma', worker: 'Rajesh Kumar', amount: 500,  issue: 'Poor quality work — pipe still leaking', status: 'pending',     priority: 'high',   age: '2h',  evidence: 3 },
  { id: 'DSP-002', customer: 'Priya Singh',   worker: 'Suresh Mehta',  amount: 1200, issue: 'Worker did not complete bathroom tiling', status: 'in_review',  priority: 'high',   age: '5h',  evidence: 5 },
  { id: 'DSP-003', customer: 'Ravi Nair',     worker: 'Amit Singh',    amount: 300,  issue: 'Overcharged for fan installation',        status: 'pending',     priority: 'medium', age: '8h',  evidence: 1 },
  { id: 'DSP-004', customer: 'Meena Gupta',   worker: 'Deepak Joshi',  amount: 800,  issue: 'Worker arrived 3 hours late',             status: 'resolved',    priority: 'low',    age: '1d',  evidence: 2 },
  { id: 'DSP-005', customer: 'Kavita Patel',  worker: 'Sunita Rao',    amount: 650,  issue: 'Safety concern — worker was rude',        status: 'escalated',   priority: 'urgent', age: '30m', evidence: 4 },
  { id: 'DSP-006', customer: 'Amit Verma',    worker: 'Ravi Kumar',    amount: 400,  issue: 'Payment deducted but booking cancelled',  status: 'in_review',   priority: 'medium', age: '3h',  evidence: 0 },
];

const PRIORITY_COLORS = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low:    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};
const STATUS_COLORS = {
  pending:    'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  in_review:  'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  escalated:  'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  resolved:   'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

function DisputeCard({ d, onAction }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={clsx('card p-5 transition-all', d.priority === 'urgent' && 'ring-2 ring-red-400 dark:ring-red-600')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', PRIORITY_COLORS[d.priority])}>
            <AlertTriangle size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 dark:text-white text-sm">{d.id}</span>
              <span className={clsx('badge', PRIORITY_COLORS[d.priority])}>{d.priority}</span>
              <span className={clsx('badge', STATUS_COLORS[d.status])}>{d.status.replace('_', ' ')}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{d.issue}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span>👤 {d.customer}</span>
              <span>🔧 {d.worker}</span>
              <span>💰 ₹{d.amount}</span>
              <span className="flex items-center gap-1"><Clock size={10} /> {d.age}</span>
              {d.evidence > 0 && <span>📸 {d.evidence} photos</span>}
            </div>
          </div>
        </div>
        <button onClick={() => setExpanded(v => !v)} className="btn-ghost p-1.5 flex-shrink-0">
          <Eye size={14} />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <strong>Issue:</strong> {d.issue}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { onAction(d.id, 'release'); toast.success(`Payment released for ${d.id}`); }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-emerald-600 text-white
                         hover:bg-emerald-700 transition-colors font-medium"
            >
              <CheckCircle size={12} /> Release Payment
            </button>
            <button
              onClick={() => { onAction(d.id, 'refund'); toast.success(`Full refund initiated for ${d.id}`); }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-brand-600 text-white
                         hover:bg-brand-700 transition-colors font-medium"
            >
              <MessageSquare size={12} /> Full Refund
            </button>
            <button
              onClick={() => { onAction(d.id, 'partial'); toast.success(`Partial refund initiated for ${d.id}`); }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-amber-500 text-white
                         hover:bg-amber-600 transition-colors font-medium"
            >
              Partial Refund
            </button>
            <button
              onClick={() => { onAction(d.id, 'reject'); toast.error(`Dispute ${d.id} rejected`); }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-red-600 text-white
                         hover:bg-red-700 transition-colors font-medium"
            >
              <XCircle size={12} /> Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState(DISPUTES);
  const [filter, setFilter]     = useState('all');

  const handleAction = (id, action) => {
    setDisputes(prev => prev.map(d =>
      d.id === id ? { ...d, status: action === 'reject' ? 'resolved' : 'resolved' } : d
    ));
  };

  const filtered = filter === 'all' ? disputes : disputes.filter(d => d.status === filter || d.priority === filter);

  const counts = {
    pending:   disputes.filter(d => d.status === 'pending').length,
    in_review: disputes.filter(d => d.status === 'in_review').length,
    escalated: disputes.filter(d => d.status === 'escalated').length,
    resolved:  disputes.filter(d => d.status === 'resolved').length,
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Disputes</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage customer & worker disputes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pending',   count: counts.pending,   color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'In Review', count: counts.in_review, color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Escalated', count: counts.escalated, color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Resolved',  count: counts.resolved,  color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(s => (
          <div key={s.label} className={clsx('card p-4 flex items-center gap-3', s.bg)}>
            <span className={clsx('text-2xl font-bold', s.color)}>{s.count}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'in_review', 'escalated', 'resolved', 'urgent'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={clsx('text-xs px-3 py-1.5 rounded-lg font-medium transition-colors capitalize',
              filter === f
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300',
            )}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map(d => (
          <DisputeCard key={d.id} d={d} onAction={handleAction} />
        ))}
        {filtered.length === 0 && (
          <div className="card p-12 text-center text-gray-400">
            <CheckCircle size={32} className="mx-auto mb-3 text-emerald-400" />
            <p className="font-medium">No disputes in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
