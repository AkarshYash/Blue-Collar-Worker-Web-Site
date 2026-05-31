import clsx from 'clsx';
import {
    AlertTriangle, ArrowUpRight, BarChart3, Bot, CheckCircle,
    Clock, MessageSquare, RefreshCw, Shield, TrendingUp, Users, Zap,
} from 'lucide-react';
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid,
    Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, delta, icon: Icon, color, sub }) {
  const positive = delta?.startsWith('+') || delta?.startsWith('-0') === false;
  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          <Icon size={18} className="text-white" />
        </div>
        {delta && (
          <span className={clsx(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            positive
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
          )}>
            {delta}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Alert Row ─────────────────────────────────────────────────────────────────
function AlertRow({ alert }) {
  const colors = {
    high:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  const icons = { fraud: Shield, dispute: AlertTriangle, system: Zap };
  const Icon = icons[alert.type] || AlertTriangle;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
      <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', colors[alert.severity])}>
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{alert.msg}</p>
        <p className="text-xs text-gray-400 mt-0.5">{alert.time}</p>
      </div>
      <span className={clsx('badge flex-shrink-0', colors[alert.severity])}>{alert.severity}</span>
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700
                    rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data, loading, refresh } = useAnalytics();

  if (loading || !data) {
    return (
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card p-5 h-28 animate-pulse bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  const { kpis, hourlyMessages, intentDistribution, weeklyGMV, channelBreakdown, recentAlerts, topCities } = data;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Platform Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Live data · refreshes every 15s
          </p>
        </div>
        <button
          onClick={refresh}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Active Sessions"   value={kpis.activeSessions.toLocaleString()}
          delta="+12%" icon={MessageSquare} color="bg-brand-600" />
        <KpiCard label="Messages Today"    value={kpis.totalMsgsToday.toLocaleString()}
          delta="+8%"  icon={Bot}           color="bg-violet-600" />
        <KpiCard label="Avg Response"      value={`${(kpis.avgResponseMs/1000).toFixed(1)}s`}
          delta="-0.3s" icon={Clock}        color="bg-emerald-600" />
        <KpiCard label="Escalations"       value={kpis.escalations}
          delta="-3"   icon={AlertTriangle} color="bg-red-500" />
        <KpiCard label="CSAT Score"        value={`${kpis.csatScore}/5`}
          delta="+0.1" icon={TrendingUp}    color="bg-amber-500" />
        <KpiCard label="Resolution Rate"   value={`${kpis.resolutionRate}%`}
          delta="+2%"  icon={CheckCircle}   color="bg-teal-600" />
        <KpiCard label="New Users Today"   value={kpis.newUsersToday.toLocaleString()}
          delta="+15%" icon={Users}         color="bg-sky-600" />
        <KpiCard label="GMV Today"         value={`₹${(kpis.gmvToday/100000).toFixed(1)}L`}
          delta="+31%" icon={BarChart3}     color="bg-pink-600" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly messages */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Messages (24h)</h3>
            <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourlyMessages} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="messages" name="Messages" stroke="#4f46e5"
                fill="url(#msgGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#059669"
                fill="url(#resGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Intent distribution */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Intent Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={intentDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" paddingAngle={3}>
                {intentDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {intentDistribution.slice(0, 4).map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly GMV */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Weekly GMV & Jobs</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyGMV} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="gmv" name="GMV (₹)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Alerts</h3>
            <button className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline">
              View all
            </button>
          </div>
          <div>
            {recentAlerts.map(a => <AlertRow key={a.id} alert={a} />)}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Channel breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Channel Breakdown</h3>
          <div className="space-y-3">
            {channelBreakdown.map(c => (
              <div key={c.channel}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{c.channel}</span>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">
                    {c.sessions.toLocaleString()} sessions · {c.pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-700"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top cities */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Top Cities by GMV</h3>
          <div className="space-y-2">
            {topCities.map((c, i) => (
              <div key={c.city} className="flex items-center gap-3 py-1.5">
                <span className="w-5 h-5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700
                                 dark:text-brand-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{c.city}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      ₹{(c.gmv / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{c.jobs.toLocaleString()} jobs</p>
                </div>
                <ArrowUpRight size={14} className="text-emerald-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
