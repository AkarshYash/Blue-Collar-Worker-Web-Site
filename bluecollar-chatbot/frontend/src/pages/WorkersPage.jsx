import clsx from 'clsx';
import { CheckCircle, Search, Star, XCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const WORKERS = [
  { id: 'W-45001', name: 'Rajesh Kumar',  skill: 'Plumber',      rating: 4.8, jobs: 234, earnings: 45600, level: 3, status: 'active',   city: 'Delhi',     verified: true  },
  { id: 'W-45002', name: 'Suresh Mehta',  skill: 'Electrician',  rating: 4.9, jobs: 312, earnings: 62400, level: 4, status: 'active',   city: 'Mumbai',    verified: true  },
  { id: 'W-45003', name: 'Amit Singh',    skill: 'Carpenter',    rating: 4.7, jobs: 189, earnings: 37800, level: 2, status: 'active',   city: 'Bangalore', verified: true  },
  { id: 'W-45004', name: 'Deepak Joshi',  skill: 'Painter',      rating: 4.5, jobs: 145, earnings: 29000, level: 2, status: 'pending',  city: 'Hyderabad', verified: false },
  { id: 'W-45005', name: 'Ravi Nair',     skill: 'Cleaner',      rating: 4.6, jobs: 267, earnings: 53400, level: 3, status: 'active',   city: 'Chennai',   verified: true  },
  { id: 'W-45006', name: 'Sunita Rao',    skill: 'Cook',         rating: 4.3, jobs: 98,  earnings: 19600, level: 1, status: 'pending',  city: 'Pune',      verified: false },
  { id: 'W-45007', name: 'Kavita Patel',  skill: 'Gardener',     rating: 4.7, jobs: 156, earnings: 31200, level: 2, status: 'active',   city: 'Ahmedabad', verified: true  },
  { id: 'W-45008', name: 'Mohan Das',     skill: 'Mechanic',     rating: 4.4, jobs: 203, earnings: 40600, level: 3, status: 'suspended',city: 'Kolkata',   verified: false },
];

const LEVEL_LABELS = { 1: 'Basic', 2: 'ID Verified', 3: 'Skill Tested', 4: 'Background' };
const LEVEL_COLORS = {
  1: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  2: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  3: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  4: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const STATUS_COLORS = {
  active:    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending:   'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  suspended: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function WorkersPage() {
  const [workers, setWorkers] = useState(WORKERS);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');

  const approve = (id) => {
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, status: 'active', verified: true } : w));
    toast.success('Worker approved & verified');
  };

  const suspend = (id) => {
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, status: 'suspended' } : w));
    toast.error('Worker suspended');
  };

  const filtered = workers.filter(w => {
    const matchFilter = filter === 'all' || w.status === filter;
    const matchSearch = !search ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.skill.toLowerCase().includes(search.toLowerCase()) ||
      w.city.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Workers</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage worker profiles & verification</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Workers', value: workers.length,                                  color: 'text-brand-600' },
          { label: 'Active',        value: workers.filter(w => w.status === 'active').length,   color: 'text-emerald-600' },
          { label: 'Pending',       value: workers.filter(w => w.status === 'pending').length,  color: 'text-amber-600' },
          { label: 'Suspended',     value: workers.filter(w => w.status === 'suspended').length,color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className={clsx('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200
                        dark:border-gray-700 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={14} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search name, skill, city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400
                       text-gray-700 dark:text-gray-300"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'active', 'pending', 'suspended'].map(f => (
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
      </div>

      {/* Worker cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(w => (
          <div key={w.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-accent-500
                                flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {w.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{w.name}</p>
                  <p className="text-xs text-gray-500">{w.skill} · {w.city}</p>
                </div>
              </div>
              <span className={clsx('badge', STATUS_COLORS[w.status])}>{w.status}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-center gap-0.5">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  {w.rating}
                </p>
                <p className="text-xs text-gray-400">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{w.jobs}</p>
                <p className="text-xs text-gray-400">Jobs</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">₹{(w.earnings/1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-400">Earned</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className={clsx('badge text-xs', LEVEL_COLORS[w.level])}>
                L{w.level} · {LEVEL_LABELS[w.level]}
              </span>
              {w.verified && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle size={11} /> Verified
                </span>
              )}
            </div>

            {w.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => approve(w.id)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-xl
                             bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium"
                >
                  <CheckCircle size={12} /> Approve
                </button>
                <button
                  onClick={() => suspend(w.id)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-xl
                             bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                >
                  <XCircle size={12} /> Reject
                </button>
              </div>
            )}
            {w.status === 'active' && (
              <button
                onClick={() => suspend(w.id)}
                className="w-full text-xs py-2 rounded-xl border border-red-200 dark:border-red-800
                           text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                           transition-colors font-medium"
              >
                Suspend Worker
              </button>
            )}
            {w.status === 'suspended' && (
              <button
                onClick={() => approve(w.id)}
                className="w-full text-xs py-2 rounded-xl border border-emerald-200 dark:border-emerald-800
                           text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                           transition-colors font-medium"
              >
                Reinstate Worker
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
