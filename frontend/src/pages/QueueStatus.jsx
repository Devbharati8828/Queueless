import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, Zap, Bell, MapPin, ArrowLeft, X, RefreshCw } from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { formatTime, getStatusInfo } from '../utils/helpers';

export default function QueueStatus() {
  const { activeTicket, leaveQueue, setActiveTicket } = useQueue();
  const navigate = useNavigate();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Simulate live position decrease
  useEffect(() => {
    if (!activeTicket) return;
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
      // Every 45 seconds, move the queue forward by 1
      if (elapsed > 0 && elapsed % 45 === 0) {
        setActiveTicket(prev => {
          if (!prev || prev.position <= 1) return prev ? { ...prev, status: 'next' } : prev;
          return {
            ...prev,
            position: prev.position - 1,
            currentServing: prev.currentServing + 1,
            estimatedWaitMinutes: Math.max(0, prev.estimatedWaitMinutes - 15),
            status: prev.position - 1 <= 1 ? 'next' : 'waiting',
          };
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTicket, elapsed, setActiveTicket]);

  if (!activeTicket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-dark-500" />
          </div>
          <h2 className="text-2xl font-bold text-dark-200 mb-2">No Active Queue</h2>
          <p className="text-dark-400 mb-6">You haven't joined any queue yet.</p>
          <Link to="/join" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
            Join a Queue <Zap className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const { position, tokenNumber, estimatedWaitMinutes, queueName, provider, status, icon, currentServing } = activeTicket;
  const statusInfo = getStatusInfo(status);
  const progress = position <= 1 ? 95 : Math.max(5, Math.min(90, 100 - (position / (position + currentServing)) * 100));

  const handleLeave = () => {
    leaveQueue();
    navigate('/join');
  };

  return (
    <div className="relative min-h-screen overflow-hidden w-full">
      <div className="bg-orb bg-orb-blue w-[500px] h-[500px] top-20 -right-40" />
      <div className="bg-orb bg-orb-cyan w-[400px] h-[400px] bottom-0 -left-40" />

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 md:py-16 relative z-10">
        {/* Back */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Link to="/join" className="flex items-center gap-2 text-dark-400 hover:text-dark-200 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Queues
          </Link>
        </motion.div>

        {/* Status Card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="glass rounded-3xl overflow-hidden glow-blue">

          {/* Header */}
          <div className="gradient-primary p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, white 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <span className="text-4xl mb-3 block">{icon}</span>
              <h2 className="text-xl font-bold text-white">{queueName}</h2>
              <p className="text-white/70 text-sm mt-1">{provider}</p>
              <span className={`badge mt-3 ${statusInfo.className}`}>{statusInfo.label}</span>
            </div>
          </div>

          {/* Position Display */}
          <div className="p-8 text-center">
            <p className="text-dark-400 text-sm mb-1">Your Position</p>
            <motion.p
              key={position}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="counter-large gradient-text"
            >
              {String(position).padStart(2, '0')}
            </motion.p>

            {status === 'next' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 mb-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                  <Bell className="w-4 h-4 text-emerald-400 animate-bounce" />
                  <span className="text-emerald-400 font-semibold text-sm">Your turn is next!</span>
                </div>
              </motion.div>
            )}

            <p className="text-dark-400 text-sm mt-2">Token #{tokenNumber}</p>
          </div>

          {/* Progress Bar */}
          <div className="px-8 pb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-dark-400">Queue Progress</span>
              <span className="text-primary-400 font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full gradient-primary progress-glow"
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 px-8 pb-8">
            <div className="glass-light rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-dark-400">Est. Wait</p>
              <p className="text-lg font-bold text-dark-100">{formatTime(estimatedWaitMinutes)}</p>
            </div>
            <div className="glass-light rounded-xl p-4 text-center">
              <Users className="w-5 h-5 text-primary-400 mx-auto mb-2" />
              <p className="text-xs text-dark-400">Ahead</p>
              <p className="text-lg font-bold text-dark-100">{Math.max(0, position - 1)}</p>
            </div>
            <div className="glass-light rounded-xl p-4 text-center">
              <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-dark-400">Serving</p>
              <p className="text-lg font-bold text-dark-100">#{currentServing}</p>
            </div>
          </div>

          {/* Live indicator */}
          <div className="px-8 pb-6">
            <div className="flex items-center justify-center gap-2 text-xs text-dark-500">
              <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
              Live updates active
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 pb-8">
            <button onClick={() => setShowLeaveModal(true)} className="btn-secondary w-full py-3 text-sm text-rose-400 border-rose-500/20 hover:bg-rose-500/10">
              Leave Queue
            </button>
          </div>
        </motion.div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark-100">Leave Queue?</h3>
              <button onClick={() => setShowLeaveModal(false)} className="p-1 rounded-lg hover:bg-dark-700/50"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-dark-400 text-sm mb-6">You'll lose your position and need to rejoin from the end.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLeaveModal(false)} className="btn-secondary flex-1 py-2.5 text-sm">Stay</button>
              <button onClick={handleLeave} className="flex-1 py-2.5 text-sm rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition-colors font-semibold cursor-pointer">Leave</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
