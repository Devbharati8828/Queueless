import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Zap, Bell, MapPin, ArrowLeft, X, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import { formatTime, getStatusInfo } from '../utils/helpers';
import { io } from 'socket.io-client';

export default function QueueStatus() {
  const { activeTicket, leaveQueue, setActiveTicket } = useQueue();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ averageServiceSeconds: 900, confidence: 'none' });
  
  // Timer States
  const [turnAlert, setTurnAlert] = useState({ active: false, ticketId: null, position: null, expiresAt: null });
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [spotReleased, setSpotReleased] = useState(false);
  
  const socketRef = useRef(null);

  // Fetch tickets function
  const fetchTickets = async () => {
    if (!activeTicket) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/queue/${activeTicket.queueId}/tickets?ticketId=${activeTicket.id}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    }
  };

  const fetchStats = async () => {
    if (!activeTicket) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/queue/${activeTicket.queueId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Socket and initial fetch
  useEffect(() => {
    if (!activeTicket) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socketRef.current = io(apiUrl);
    const socket = socketRef.current;

    socket.emit('joinQueueRoom', activeTicket.queueId);
    
    if (user?.id) {
      socket.emit('joinUserRoom', user.id);
    }

    // Initial fetch
    fetchTickets();
    fetchStats();

    // Listen for events
    socket.on('queue:updated', (data) => {
      fetchTickets();
      if (data && data.averageServiceSeconds !== undefined) {
        fetchStats();
      }
    });
    
    socket.on('ticket:called', (data) => {
      fetchTickets();
    });

    socket.on('your_turn_soon', (data) => {
      if (String(data.ticketId) === String(activeTicket.id)) {
        setTurnAlert({
          active: true,
          ticketId: data.ticketId,
          position: data.position,
          expiresAt: Date.now() + data.minutesRemaining * 60 * 1000
        });
      }
    });

    socket.on('spot_released', (data) => {
      if (String(data.ticketId) === String(activeTicket.id)) {
        setTurnAlert(prev => ({ ...prev, active: false }));
        setSpotReleased(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeTicket, user]);

  // Countdown Timer
  useEffect(() => {
    let interval;
    if (turnAlert.active && turnAlert.expiresAt) {
      interval = setInterval(() => {
        const remaining = Math.max(0, turnAlert.expiresAt - Date.now());
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [turnAlert]);

  const confirmPresence = () => {
    if (socketRef.current) {
      socketRef.current.emit('confirm_presence', turnAlert.ticketId);
    }
    setTurnAlert(prev => ({ ...prev, active: false }));
  };

  const formatCountdown = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

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

  const { position, tokenNumber, queueName, provider, status, icon, currentServing } = activeTicket;
  
  // Calculate people ahead based on real tickets if available, otherwise fallback to context position
  const peopleAhead = tickets.length > 0 
    ? tickets.filter(t => t.status === 'waiting' && t.position < position).length
    : Math.max(0, position - 1);

  const estimatedWaitMinutes = Math.ceil((peopleAhead * stats.averageServiceSeconds) / 60);

  const statusInfo = getStatusInfo(status);
  const progress = position <= 1 ? 95 : Math.max(5, Math.min(90, 100 - (position / (position + currentServing)) * 100));

  const handleLeave = () => {
    leaveQueue();
    navigate('/join');
  };

  // Render Visual Queue Grid
  const renderVisualGrid = () => {
    if (tickets.length === 0) return null;

    const maxVisible = 20;
    const visibleTickets = tickets.slice(0, maxVisible);
    const hiddenCount = Math.max(0, tickets.length - maxVisible);

    return (
      <div className="mt-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 px-2 snap-x hide-scrollbar">
          <AnimatePresence>
            {visibleTickets.map((t, index) => {
              const isServed = t.status === 'served';
              const isYou = t.isCurrentUser;
              const isAhead = t.status === 'waiting' && t.position < position;
              const isNext = t.status === 'next';
              
              let bgColor = "bg-dark-600"; // Behind (default)
              let textColor = "text-dark-300";
              let borderClass = "border border-dark-500";
              
              if (isServed) {
                bgColor = "bg-emerald-500";
                textColor = "text-white";
                borderClass = "border border-emerald-400";
              } else if (isYou) {
                bgColor = "bg-cyan-500/20";
                textColor = "text-cyan-400";
                borderClass = "border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]";
              } else if (isNext) {
                bgColor = "bg-primary-500/80";
                textColor = "text-white";
                borderClass = "border border-primary-400";
              } else if (isAhead) {
                bgColor = "bg-dark-500";
                textColor = "text-dark-200";
                borderClass = "border border-dark-400";
              }

              return (
                <motion.div
                  key={t.position + '-' + index}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center snap-center relative transition-all duration-300 ${bgColor} ${borderClass} ${isYou ? 'animate-pulse' : ''}`}
                >
                  {isServed ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span className={`font-semibold text-sm ${textColor}`}>
                      {t.position}
                    </span>
                  )}
                  {isYou && (
                    <div className="absolute -top-6 whitespace-nowrap text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded backdrop-blur-sm">
                      YOU
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {hiddenCount > 0 && (
            <div className="flex-shrink-0 flex items-center justify-center h-12 px-3 text-dark-400 text-sm font-medium">
              ...and {hiddenCount} more
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden w-full">
      <div className="bg-orb bg-orb-blue w-[500px] h-[500px] top-20 -right-40" />
      <div className="bg-orb bg-orb-cyan w-[400px] h-[400px] bottom-0 -left-40" />

      {/* Turn Alert Banner */}
      <AnimatePresence>
        {turnAlert.active && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 bg-rose-500/90 backdrop-blur-md border-b border-rose-400 p-4 shadow-lg shadow-rose-500/20"
          >
            <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-white animate-bounce" />
                <div className="text-white">
                  <h3 className="font-bold text-lg leading-tight">🔔 You're almost up! Position {turnAlert.position}</h3>
                  <p className="text-sm text-rose-100">Please return to the queue now</p>
                  <p className="text-sm font-semibold mt-1">Your spot expires in: {formatCountdown(timeRemaining)}</p>
                </div>
              </div>
              <button 
                onClick={confirmPresence}
                className="w-full sm:w-auto px-6 py-2.5 bg-white text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-colors shadow-sm"
              >
                ✓ I'm Here
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 md:py-16 relative z-10">
        
        {/* Spot Released Modal */}
        <AnimatePresence>
          {spotReleased && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 glass rounded-2xl p-6 border-rose-500/30 bg-rose-500/10 text-center"
            >
              <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-dark-100 mb-2">Your spot was released</h3>
              <p className="text-dark-400 text-sm mb-6">You didn't confirm your presence in time and your spot expired.</p>
              <button onClick={() => { handleLeave(); navigate('/join'); }} className="btn-primary w-full py-3">
                Rejoin Queue
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
          <div className="p-8 text-center pb-2">
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
            
            {/* Visual Queue Grid */}
            {renderVisualGrid()}
          </div>

          {/* Dynamic Wait Time Box */}
          <div className="px-8 pb-4">
            <div className="glass-light rounded-2xl p-5 border border-primary-500/20 bg-primary-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center gap-2 text-primary-400 mb-2">
                <Clock className="w-5 h-5" />
                <h3 className="font-bold text-dark-100">Estimated Wait</h3>
              </div>
              
              {stats.confidence === 'none' ? (
                <div className="mt-3 text-dark-300 text-sm animate-pulse">
                  Calculating... (not enough data yet)
                </div>
              ) : (
                <>
                  <div className="text-3xl font-display font-bold gradient-text my-2">
                    ~{estimatedWaitMinutes} minutes
                  </div>
                  <div className="text-xs text-dark-400 font-medium">
                    Based on avg {(stats.averageServiceSeconds / 60).toFixed(1)} min/person 
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full ${stats.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      ({stats.confidence} confidence)
                    </span>
                  </div>
                </>
              )}
            </div>
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
          <div className="grid grid-cols-2 gap-4 px-8 pb-8">
            <div className="glass-light rounded-xl p-4 text-center">
              <Users className="w-5 h-5 text-primary-400 mx-auto mb-2" />
              <p className="text-xs text-dark-400">Ahead</p>
              <p className="text-lg font-bold text-dark-100">{peopleAhead}</p>
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
              Live updates active via Socket.IO
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
