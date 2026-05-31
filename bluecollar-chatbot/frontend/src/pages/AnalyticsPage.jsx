import { RefreshCw } from 'lucide-react';
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
    Legend, Pie, PieChart, RadialBar, RadialBarChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';

const COLORS = ['#4f46e5', '#7c3aed', '#059669', '#d97706', '#0891b2', '#6b7280'];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700
                    rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { data, loading, refresh } = useAnalytics();

  if (loading || !data) {
    return (
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 h-64 animate-pulse bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  const { hourlyMessages, intentDistribution, weeklyGMV, channelBreakdown, languageBreakdown } = data;

  // Radial data for resolution rate
  const radialData = [
    { name: 'Resolved', value: data.kpis.resolutionRate, fill: '#4f46e5' },
    { name: 'Escalated', value: 100 - data.kpis.resolutionRate, fill: '#e5e7eb' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Deep-dive into platform performance</p>
        </div>
        <button onClick={refresh} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hourly messages */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Messages vs Resolved (24h)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={hourlyMessages} margin={{ left: -20, right: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="messages" name="Total" stroke="#4f46e5"
                fill="url(#g1)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#059669"
                fill="url(#g2)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly GMV */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Weekly GMV (₹)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyGMV} margin={{ left: -10, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="gmv" name="GMV (₹)" fill="#4f46e5" radius={[6, 6, 0, 0]}>
                {weeklyGMV.map((_, i) => (
                  <Cell key={i} fill={i === weeklyGMV.length - 1 ? '#7c3aed' : '#4f46e5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Intent pie */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Intent Distribution
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={intentDistribution} cx="50%" cy="50%"
                innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {intentDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            {intentDistribution.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-gray-600 dark:text-gray-400 truncate">{d.name}</span>
                <span className="ml-auto font-semibold text-gray-700 dark:text-gray-300">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Language breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Language Breakdown
          </h3>
          <div className="space-y-3">
            {languageBreakdown.map(l => (
              <div key={l.lang}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{l.lang}</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{l.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${l.pct}%`, background: l.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution radial */}
        <div className="card p-5 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 self-start">
            Resolution Rate
          </h3>
          <div className="relative">
            <ResponsiveContainer width={160} height={160}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                {data.kpis.resolutionRate}%
              </span>
              <span className="text-xs text-gray-400">resolved</span>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              CSAT: <span className="font-bold text-gray-700 dark:text-gray-300">{data.kpis.csatScore}/5 ⭐</span>
            </p>
          </div>
        </div>
      </div>

      {/* Channel table */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Channel Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                {['Channel', 'Sessions', 'Share', 'Trend'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {channelBreakdown.map((c, i) => (
                <tr key={c.channel} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-3 font-medium text-gray-700 dark:text-gray-300">{c.channel}</td>
                  <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{c.sessions.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden w-20">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${c.pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{c.pct}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      +{Math.floor(Math.random() * 15 + 3)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
