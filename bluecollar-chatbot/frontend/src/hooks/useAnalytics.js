import { useCallback, useEffect, useState } from 'react';

const POLL_INTERVAL = 15_000; // 15 seconds

// Generates realistic mock analytics data
function generateAnalytics() {
  const now = Date.now();
  const hourlyMessages = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    messages: Math.floor(Math.random() * 800 + 200),
    resolved: Math.floor(Math.random() * 600 + 100),
  }));

  const intentDistribution = [
    { name: 'Search Workers', value: 28, color: '#4f46e5' },
    { name: 'Book Worker',    value: 22, color: '#7c3aed' },
    { name: 'Earnings',       value: 15, color: '#059669' },
    { name: 'Payment',        value: 12, color: '#d97706' },
    { name: 'Dispute',        value: 8,  color: '#dc2626' },
    { name: 'Onboarding',     value: 7,  color: '#0891b2' },
    { name: 'Other',          value: 8,  color: '#6b7280' },
  ];

  const weeklyGMV = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 86400000);
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      gmv: Math.floor(Math.random() * 500000 + 200000),
      jobs: Math.floor(Math.random() * 2000 + 500),
    };
  });

  const channelBreakdown = [
    { channel: 'Web',       sessions: 12450, pct: 52 },
    { channel: 'WhatsApp',  sessions: 5820,  pct: 24 },
    { channel: 'Telegram',  sessions: 2890,  pct: 12 },
    { channel: 'SMS',       sessions: 1680,  pct: 7  },
    { channel: 'Voice IVR', sessions: 1200,  pct: 5  },
  ];

  const languageBreakdown = [
    { lang: 'Hindi',   pct: 38, color: '#4f46e5' },
    { lang: 'English', pct: 28, color: '#7c3aed' },
    { lang: 'Tamil',   pct: 10, color: '#059669' },
    { lang: 'Telugu',  pct: 8,  color: '#d97706' },
    { lang: 'Marathi', pct: 7,  color: '#0891b2' },
    { lang: 'Others',  pct: 9,  color: '#6b7280' },
  ];

  return {
    kpis: {
      activeSessions:   Math.floor(Math.random() * 50 + 200),
      totalMsgsToday:   Math.floor(Math.random() * 5000 + 40000),
      avgResponseMs:    Math.floor(Math.random() * 300 + 900),
      escalations:      Math.floor(Math.random() * 5 + 10),
      csatScore:        (4.4 + Math.random() * 0.4).toFixed(1),
      resolutionRate:   Math.floor(Math.random() * 5 + 84),
      newUsersToday:    Math.floor(Math.random() * 200 + 800),
      gmvToday:         Math.floor(Math.random() * 500000 + 2000000),
    },
    hourlyMessages,
    intentDistribution,
    weeklyGMV,
    channelBreakdown,
    languageBreakdown,
    recentAlerts: [
      { id: 1, type: 'fraud',   msg: 'Worker W-44512 — fake reviews detected', time: '2m ago',  severity: 'high' },
      { id: 2, type: 'dispute', msg: 'DSP-089 escalated — payment dispute ₹1,200', time: '8m ago',  severity: 'medium' },
      { id: 3, type: 'system',  msg: 'Response time spike: 2.1s avg (last 5 min)', time: '15m ago', severity: 'low' },
      { id: 4, type: 'fraud',   msg: 'Customer C-23451 — 87% cancellation rate', time: '22m ago', severity: 'high' },
    ],
    topCities: [
      { city: 'Mumbai',    gmv: 4500000, jobs: 8920 },
      { city: 'Delhi',     gmv: 3800000, jobs: 7650 },
      { city: 'Bangalore', gmv: 3200000, jobs: 6430 },
      { city: 'Hyderabad', gmv: 2100000, jobs: 4210 },
      { city: 'Chennai',   gmv: 1800000, jobs: 3600 },
    ],
  };
}

export function useAnalytics() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    // In production: fetch('/api/analytics/dashboard')
    setData(generateAnalytics());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  return { data, loading, refresh };
}
