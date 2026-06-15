import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  LayoutDashboard, Plus, Clock, Zap, TrendingUp,
  ChevronRight, Pause, SkipForward, QrCode, EyeOff,
  BarChart3, UserCheck
} from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import { formatTime, getStatusInfo, getGreeting } from '../utils/helpers';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } })
};

export default function ProviderDashboard() {
  const { providerQueues, stats, callNext } = useQueue();
  const { user } = useAuth();
  const [selectedQueue, setSelectedQueue] = useState(providerQueues[0]?.id || null);
  const [showQR, setShowQR] = useState({});

  const activeQueue = providerQueues.find(q => q.id === selectedQueue);

  const statCards = [
    { label: 'Total Served Today', value: stats.todayServed, icon: UserCheck, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-cyan-500/20' },
    { label: 'Avg Wait Time', value: `${stats.averageWaitTime}m`, icon: Clock, color: 'text-amber-400', bg: 'from-amber-500/20 to-rose-500/20' },
    { label: 'Active Queues', value: providerQueues.filter(q => q.status === 'active').length, icon: Zap, color: 'text-primary-400', bg: 'from-primary-500/20 to-cyan-500/20' },
    { label: 'Weekly Growth', value: `+${stats.weeklyGrowth}%`, icon: TrendingUp, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-primary-500/20' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden w-full">
      <div className="bg-orb bg-orb-blue w-[500px] h-[500px] -top-40 -right-40" />
      <div className="bg-orb bg-orb-purple w-[400px] h-[400px] bottom-40 -left-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
                className="glass rounded-2xl p-5">
                <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${s.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-xs text-dark-400 mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-dark-100 font-display">{s.value}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Queue Selector */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="lg:col-span-1">
            <div className="glass rounded-2xl p-5">
              <h2 className="text-lg font-bold text-dark-100 mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary-400" /> Your Queues
              </h2>
              <div className="space-y-2">
                {providerQueues.map(q => {
                  const si = getStatusInfo(q.status);
                  const isSelected = q.id === selectedQueue;
                  return (
                    <button key={q.id} onClick={() => setSelectedQueue(q.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                        isSelected ? 'bg-primary-500/10 border border-primary-500/30' : 'glass-light hover:bg-dark-700/50'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-dark-100 text-sm">{q.name}</p>
                          <p className="text-xs text-dark-400 mt-1">{q.totalInQueue - q.currentServing} waiting · #{q.currentServing} serving</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge text-[10px] ${si.className}`}>{si.label}</span>
                          <ChevronRight className={`w-4 h-4 text-dark-500 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Queue Management */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="lg:col-span-2">
            {activeQueue ? (
              <div className="glass rounded-2xl overflow-hidden">
                {/* Queue Header */}
                <div className="p-6 border-b border-dark-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-dark-100">{activeQueue.name}</h2>
                      <p className="text-sm text-dark-400 mt-1">
                        Created {new Date(activeQueue.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowQR(prev => ({ ...prev, [activeQueue.id]: !prev[activeQueue.id] }))}
                        className="btn-secondary px-3 py-2 text-sm flex items-center gap-1.5"
                      >
                        {showQR[activeQueue.id] ? <EyeOff className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                        QR
                      </button>
                    </div>
                  </div>

                  {/* QR Code */}
                  {showQR[activeQueue.id] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      className="mb-4 flex justify-center">
                      <div className="bg-white rounded-2xl p-4 inline-block">
                        <QRCodeSVG value={`https://queueless.app/join/${activeQueue.id}`} size={160} level="H"
                          fgColor="#0f172a" includeMargin={false} />
                        <p className="text-center text-dark-900 text-xs font-bold mt-2">Scan to Join</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Controls */}
                  <div className="flex gap-3">
                    <button onClick={() => callNext(activeQueue.id)}
                      className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 text-sm">
                      <SkipForward className="w-4 h-4" /> Call Next
                    </button>
                    <button className="btn-secondary px-4 py-3">
                      <Pause className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Queue Stats Mini */}
                <div className="grid grid-cols-3 gap-4 p-6 border-b border-dark-700/30">
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-text font-display">
                      {activeQueue.customers.filter(c => c.status === 'waiting').length}
                    </p>
                    <p className="text-xs text-dark-400 mt-1">Waiting</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-text-green font-display">
                      {activeQueue.totalServed}
                    </p>
                    <p className="text-xs text-dark-400 mt-1">Served</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-text-warm font-display">
                      {formatTime(activeQueue.avgWaitTime)}
                    </p>
                    <p className="text-xs text-dark-400 mt-1">Avg Wait</p>
                  </div>
                </div>

                {/* Customer List */}
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">Queue List</h3>
                  <div className="space-y-2">
                    {activeQueue.customers.map(customer => {
                      const si = getStatusInfo(customer.status);
                      return (
                        <div key={customer.id}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                            customer.status === 'serving' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                            customer.status === 'next' ? 'bg-amber-500/10 border border-amber-500/20' : 'glass-light'
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-sm font-bold text-dark-200">
                              {customer.token}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-dark-100">{customer.name}</p>
                              <p className="text-xs text-dark-500">Token #{customer.token}</p>
                            </div>
                          </div>
                          <span className={`badge text-[10px] ${si.className}`}>{si.label}</span>
                        </div>
                      );
                    })}
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
      </div>
    </div>
  );
}
