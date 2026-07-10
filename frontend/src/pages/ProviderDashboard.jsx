import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  LayoutDashboard, Plus, Clock, Zap, TrendingUp,
  ChevronRight, Pause, Play, SkipForward, QrCode, EyeOff,
  BarChart3, UserCheck, Users, Star, AlertTriangle,
  Activity, MonitorPlay, RefreshCw, CheckCircle2
} from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import { formatTime, getStatusInfo, getGreeting } from '../utils/helpers';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getToken = () => localStorage.getItem('queueless_token');

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } })
};

const CATEGORY_COLORS = {
  Healthcare: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Banking:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Government: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Retail:     'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Education:  'text-rose-400 bg-rose-500/10 border-rose-500/20',
  General:    'text-dark-400 bg-dark-500/10 border-dark-500/20',
};

// Custom Recharts tooltip
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs shadow-xl border border-dark-600/50">
        <p className="text-dark-300 font-medium">{label}</p>
        <p className="text-primary-400 font-bold">{payload[0].value} served</p>
      </div>
    );
  }
  return null;
};

export default function ProviderDashboard() {
  const { callNext } = useQueue();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('queues');       // 'queues' | 'analytics'
  const [providerQueues, setProviderQueues] = useState([]);
  const [loadingQueues, setLoadingQueues] = useState(true);
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [showQR, setShowQR] = useState({});
  const [pauseLoading, setPauseLoading] = useState({});
  const [liveTickets, setLiveTickets] = useState([]);
  const [liveStats, setLiveStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const socketRef = useRef(null);

  // ─── Fetch provider queues from API ───────────────────────────────────────
  const fetchProviderQueues = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/queue/provider`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProviderQueues(data);
        if (!selectedQueueId && data.length > 0) setSelectedQueueId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch provider queues:', err);
    } finally {
      setLoadingQueues(false);
    }
  }, [selectedQueueId]);

  useEffect(() => { fetchProviderQueues(); }, []);

  // ─── Fetch live ticket + stats for selected queue ─────────────────────────
  const fetchLiveData = useCallback(async (queueId) => {
    if (!queueId) return;
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/queue/${queueId}/tickets`),
        fetch(`${API_URL}/api/queue/${queueId}/stats`)
      ]);
      if (ticketsRes.ok) setLiveTickets(await ticketsRes.json());
      if (statsRes.ok) setLiveStats(await statsRes.json());
    } catch (err) {
      console.error('Failed to fetch live data:', err);
    }
  }, []);

  // ─── Fetch analytics for selected queue ───────────────────────────────────
  const fetchAnalytics = useCallback(async (queueId) => {
    const token = getToken();
    if (!queueId || !token) return;
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/queue/${queueId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAnalytics(await res.json());
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // ─── Socket.IO: join queue rooms + user room ───────────────────────────────
  useEffect(() => {
    if (!selectedQueueId || !user?.id) return;
    fetchLiveData(selectedQueueId);
    if (activeTab === 'analytics') fetchAnalytics(selectedQueueId);

    const socket = io(API_URL);
    socketRef.current = socket;

    // Join queue room for live ticket updates
    socket.emit('joinQueueRoom', selectedQueueId);
    socket.on('queue:updated', () => {
      fetchLiveData(selectedQueueId);
      fetchProviderQueues();
    });
    socket.on('queue:paused', ({ queueId }) => {
      setProviderQueues(prev => prev.map(q =>
        q.id === queueId ? { ...q, is_paused: 1 } : q
      ));
    });
    socket.on('queue:resumed', ({ queueId }) => {
      setProviderQueues(prev => prev.map(q =>
        q.id === queueId ? { ...q, is_paused: 0 } : q
      ));
    });

    // Join provider's personal room for analytics push
    if (user?.id) {
      socket.emit('joinUserRoom', user.id);
      socket.on('analytics:updated', (data) => {
        if (data.queueId === selectedQueueId) setAnalytics(data);
      });
    }

    return () => socket.disconnect();
  }, [selectedQueueId, user?.id]);

  // Refresh analytics on tab switch
  useEffect(() => {
    if (activeTab === 'analytics' && selectedQueueId) {
      fetchAnalytics(selectedQueueId);
    }
  }, [activeTab, selectedQueueId]);

  // ─── Actions ───────────────────────────────────────────────────────────────
  const handleCallNext = async (queueId) => {
    await callNext(queueId);
    setTimeout(() => fetchLiveData(queueId), 300);
  };

  const handleTogglePause = async (queueId) => {
    const token = getToken();
    if (!token) return;
    setPauseLoading(p => ({ ...p, [queueId]: true }));
    try {
      const res = await fetch(`${API_URL}/api/queue/${queueId}/toggle-pause`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProviderQueues(prev => prev.map(q =>
          q.id === queueId ? { ...q, is_paused: data.is_paused } : q
        ));
      }
    } catch (err) {
      console.error('Toggle pause failed:', err);
    } finally {
      setPauseLoading(p => ({ ...p, [queueId]: false }));
    }
  };

  const activeQueue = providerQueues.find(q => q.id === selectedQueueId);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-hidden w-full">
      <div className="bg-orb bg-orb-blue w-[500px] h-[500px] -top-40 -right-40" />
      <div className="bg-orb bg-orb-purple w-[400px] h-[400px] bottom-40 -left-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">

        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-dark-400 text-sm">{getGreeting()}</p>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              <span className="gradient-text">{user?.name || 'Provider'}</span> Dashboard
            </h1>
          </div>
          <Link to="/create-queue" className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm self-start">
            <Plus className="w-4 h-4" /> New Queue
          </Link>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="mb-8">
          <div className="inline-flex glass rounded-2xl p-1 gap-1">
            <button
              onClick={() => setActiveTab('queues')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'queues'
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
              id="tab-queues"
            >
              <LayoutDashboard className="w-4 h-4" /> Queue Manager
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
              id="tab-analytics"
            >
              <BarChart3 className="w-4 h-4" /> Analytics
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════════════════════════════════════
              TAB: QUEUE MANAGER
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'queues' && (
            <motion.div key="queues"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>

              {loadingQueues ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="w-8 h-8 text-primary-400 animate-spin" />
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Queue Selector */}
                  <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="lg:col-span-1">
                    <div className="glass rounded-2xl p-5">
                      <h2 className="text-lg font-bold text-dark-100 mb-4 flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-primary-400" /> Your Queues
                      </h2>
                      <div className="space-y-2">
                        {providerQueues.map(q => {
                          const catClass = CATEGORY_COLORS[q.category] || CATEGORY_COLORS.General;
                          const isSelected = q.id === selectedQueueId;
                          const isPaused = !!q.is_paused;
                          return (
                            <button key={q.id} onClick={() => setSelectedQueueId(q.id)}
                              className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                                isSelected ? 'bg-primary-500/10 border border-primary-500/30' : 'glass-light hover:bg-dark-700/50'
                              }`}>
                              <div className="flex items-center justify-between mb-1.5">
                                <p className="font-semibold text-dark-100 text-sm truncate pr-2">{q.name}</p>
                                <ChevronRight className={`w-4 h-4 text-dark-500 shrink-0 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catClass}`}>
                                  {q.category}
                                </span>
                                {isPaused && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-amber-400 bg-amber-500/10 border-amber-500/20">
                                    Paused
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-dark-400 mt-1.5">
                                {q.waitingCount ?? 0} waiting · #{q.currentlyServing || '—'} serving
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>

                  {/* Queue Detail Panel */}
                  <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="lg:col-span-2">
                    {activeQueue ? (
                      <div className="glass rounded-2xl overflow-hidden">

                        {/* Paused Banner */}
                        {!!activeQueue.is_paused && (
                          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <p className="text-sm text-amber-300 font-medium">This queue is currently paused. Users cannot join.</p>
                          </div>
                        )}

                        {/* Queue Header */}
                        <div className="p-6 border-b border-dark-700/30">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl font-bold text-dark-100">{activeQueue.name}</h2>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[activeQueue.category] || CATEGORY_COLORS.General}`}>
                                  {activeQueue.category}
                                </span>
                              </div>
                              <p className="text-sm text-dark-400">{activeQueue.queue_code} · {activeQueue.address || 'No address set'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setShowQR(prev => ({ ...prev, [activeQueue.id]: !prev[activeQueue.id] }))}
                                className="btn-secondary px-3 py-2 text-sm flex items-center gap-1.5"
                                title="Show QR Code"
                              >
                                {showQR[activeQueue.id] ? <EyeOff className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleTogglePause(activeQueue.id)}
                                disabled={!!pauseLoading[activeQueue.id]}
                                className={`px-3 py-2 text-sm flex items-center gap-1.5 rounded-xl border transition-all duration-200 font-medium ${
                                  activeQueue.is_paused
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                }`}
                                title={activeQueue.is_paused ? 'Resume Queue' : 'Pause Queue'}
                                id={`pause-btn-${activeQueue.id}`}
                              >
                                {pauseLoading[activeQueue.id]
                                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                                  : activeQueue.is_paused
                                    ? <><Play className="w-4 h-4" /> Resume</>
                                    : <><Pause className="w-4 h-4" /> Pause</>
                                }
                              </button>
                            </div>
                          </div>

                          {/* QR Code */}
                          {showQR[activeQueue.id] && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                              className="mb-4 flex justify-center">
                              <div className="bg-white rounded-2xl p-4 inline-block">
                                <QRCodeSVG value={`${window.location.origin}/join?q=${activeQueue.id}`} size={160} level="H"
                                  fgColor="#0f172a" includeMargin={false} />
                                <p className="text-center text-dark-900 text-xs font-bold mt-2">Scan to Join</p>
                              </div>
                            </motion.div>
                          )}

                          {/* Call Next */}
                          <button
                            onClick={() => handleCallNext(activeQueue.id)}
                            disabled={!!activeQueue.is_paused}
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            id={`call-next-${activeQueue.id}`}
                          >
                            <SkipForward className="w-4 h-4" /> Call Next
                          </button>
                        </div>

                        {/* Mini Stats */}
                        <div className="grid grid-cols-3 gap-4 p-6 border-b border-dark-700/30">
                          <div className="text-center">
                            <p className="text-2xl font-bold gradient-text font-display">
                              {liveTickets.filter(t => t.status === 'waiting').length || activeQueue.waitingCount || 0}
                            </p>
                            <p className="text-xs text-dark-400 mt-1">Waiting</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold gradient-text-green font-display">
                              {liveStats?.totalServedToday ?? activeQueue.servedToday ?? 0}
                            </p>
                            <p className="text-xs text-dark-400 mt-1">Served Today</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold gradient-text-warm font-display">
                              {liveStats ? `~${Math.round(liveStats.averageServiceSeconds / 60)}m`
                                : activeQueue.averageServiceSeconds
                                  ? `~${Math.round(activeQueue.averageServiceSeconds / 60)}m`
                                  : '—'}
                            </p>
                            <p className="text-xs text-dark-400 mt-1">Avg Service</p>
                          </div>
                        </div>

                        {/* Ticket List */}
                        <div className="p-6">
                          <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">Live Queue</h3>
                          <div className="space-y-2">
                            {liveTickets.length > 0 ? liveTickets.map((ticket, i) => {
                              const si = getStatusInfo(ticket.status);
                              return (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                                  ticket.status === 'next' ? 'bg-amber-500/10 border border-amber-500/20' : 'glass-light'
                                }`}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-sm font-bold text-dark-200">
                                      {ticket.position}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-dark-100">Position #{ticket.position}</p>
                                      <p className="text-xs text-dark-500 capitalize">{ticket.status}</p>
                                    </div>
                                  </div>
                                  <span className={`badge text-[10px] ${si.className}`}>{si.label}</span>
                                </div>
                              );
                            }) : (
                              <div className="text-center py-8">
                                <CheckCircle2 className="w-10 h-10 text-dark-700 mx-auto mb-2" />
                                <p className="text-dark-500 text-sm">Queue is empty</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="glass rounded-2xl p-12 text-center">
                        <BarChart3 className="w-16 h-16 text-dark-700 mx-auto mb-4" />
                        <p className="text-dark-400">Select a queue to manage</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: ANALYTICS
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>

              {/* Queue selector for analytics */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="text-sm text-dark-400 font-medium">Showing analytics for:</span>
                <div className="flex gap-2 flex-wrap">
                  {providerQueues.map(q => (
                    <button key={q.id}
                      onClick={() => setSelectedQueueId(q.id)}
                      className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                        q.id === selectedQueueId
                          ? 'bg-primary-500/20 border-primary-500/30 text-primary-300'
                          : 'glass-light border-dark-600/50 text-dark-400 hover:text-dark-200'
                      }`}>
                      {q.name}
                    </button>
                  ))}
                </div>
              </div>

              {analyticsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="w-8 h-8 text-primary-400 animate-spin" />
                </div>
              ) : analytics ? (
                <>
                  {/* 6 Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {[
                      {
                        label: 'Served Today',
                        value: analytics.servedToday ?? 0,
                        icon: UserCheck,
                        color: 'text-emerald-400',
                        bg: 'from-emerald-500/20 to-cyan-500/20',
                        id: 'stat-served-today'
                      },
                      {
                        label: 'Avg Wait Time',
                        value: analytics.avgWaitSeconds != null
                          ? `~${Math.round(analytics.avgWaitSeconds / 60)}m`
                          : 'N/A',
                        icon: Clock,
                        color: 'text-amber-400',
                        bg: 'from-amber-500/20 to-rose-500/20',
                        id: 'stat-avg-wait'
                      },
                      {
                        label: 'Peak Hour',
                        value: analytics.peakHour ?? 'N/A',
                        icon: TrendingUp,
                        color: 'text-primary-400',
                        bg: 'from-primary-500/20 to-cyan-500/20',
                        id: 'stat-peak-hour'
                      },
                      {
                        label: 'No-shows Today',
                        value: analytics.noShowsToday ?? 0,
                        icon: AlertTriangle,
                        color: 'text-rose-400',
                        bg: 'from-rose-500/20 to-orange-500/20',
                        id: 'stat-no-shows'
                      },
                      {
                        label: 'In Queue Now',
                        value: analytics.currentlyWaiting ?? 0,
                        icon: Users,
                        color: 'text-cyan-400',
                        bg: 'from-cyan-500/20 to-primary-500/20',
                        id: 'stat-in-queue'
                      },
                      {
                        label: 'Avg Mood Rating',
                        value: analytics.avgMoodRating != null
                          ? `${analytics.avgMoodRating} ★`
                          : 'N/A',
                        icon: Star,
                        color: 'text-yellow-400',
                        bg: 'from-yellow-500/20 to-amber-500/20',
                        id: 'stat-avg-rating'
                      },
                    ].map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <motion.div key={s.label}
                          initial="hidden" animate="visible" variants={fadeUp} custom={i}
                          className="glass rounded-2xl p-5" id={s.id}>
                          <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${s.bg} flex items-center justify-center mb-3`}>
                            <Icon className={`w-5 h-5 ${s.color}`} />
                          </div>
                          <p className="text-xs text-dark-400 mb-1">{s.label}</p>
                          <p className="text-2xl font-bold text-dark-100 font-display">{s.value}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Hourly Bar Chart */}
                  <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}
                    className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-dark-100 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-primary-400" /> Tickets Served — Today
                        </h2>
                        <p className="text-xs text-dark-400 mt-1">Hourly breakdown, updates live</p>
                      </div>
                    </div>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.hourlyBreakdown}
                          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis
                            dataKey="label"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                          <Bar
                            dataKey="count"
                            fill="url(#analyticsGradient)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={40}
                          />
                          <defs>
                            <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.6} />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </>
              ) : (
                <div className="glass rounded-2xl p-16 text-center">
                  <Activity className="w-16 h-16 text-dark-700 mx-auto mb-4" />
                  <p className="text-dark-400 text-lg">No analytics data yet</p>
                  <p className="text-dark-500 text-sm mt-1">Call Next a few times to start seeing data</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
