import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Inbox, CalendarClock, Loader2, Ticket, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getToken = () => localStorage.getItem('queueless_token');

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } })
};

const mockHistory = [
  { id: 1, name: 'City General Hospital - OPD', provider: 'City General Hospital', date: '2026-05-16', token: 28, waitTime: 45, icon: '🏥', status: 'completed' },
  { id: 2, name: 'State Bank - Account Services', provider: 'State Bank of India', date: '2026-05-15', token: 14, waitTime: 35, icon: '🏦', status: 'completed' },
  { id: 3, name: 'RTO - Driving License', provider: 'Regional Transport Office', date: '2026-05-14', token: 42, waitTime: 90, icon: '🚗', status: 'completed' },
  { id: 4, name: 'Dr. Sharma Dental Clinic', provider: 'Dr. Rajesh Sharma', date: '2026-05-12', token: 6, waitTime: 20, icon: '🦷', status: 'completed' },
  { id: 5, name: 'Passport Seva Kendra', provider: 'Ministry of External Affairs', date: '2026-05-10', token: 67, waitTime: 120, icon: '🏛️', status: 'cancelled' },
];

const CATEGORY_ICONS = {
  Healthcare: '🏥', Banking: '🏦', Government: '🏛️', Retail: '🛍️', Education: '🎓', General: '🏢'
};

const formatSlotTime = (dt) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

const minutesUntil = (dt) => {
  if (!dt) return Infinity;
  return Math.round((new Date(dt) - Date.now()) / 60000);
};

export default function History() {
  const [activeTab, setActiveTab] = useState('history');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const activationRef = useRef({});
  const { addToast } = useToast();

  // ─── Fetch upcoming bookings ─────────────────────────────────────────────
  const fetchBookings = async () => {
    const token = getToken();
    if (!token) return;
    setLoadingBookings(true);
    try {
      const res = await fetch(`${API_URL}/api/tickets/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setBookings(await res.json());
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') fetchBookings();
  }, [activeTab]);

  // ─── Auto-activate tickets every 60s when slot time arrives ─────────────
  useEffect(() => {
    if (activeTab !== 'bookings') return;

    const tryActivate = async () => {
      const token = getToken();
      if (!token) return;
      const now = Date.now();
      for (const b of bookings) {
        if (!b.slot_time) continue;
        const slotMs = new Date(b.slot_time).getTime();
        // Activate if slot time has arrived (within 5-min window) and not already activating
        if (slotMs <= now && !activationRef.current[b.id]) {
          activationRef.current[b.id] = true;
          try {
            const res = await fetch(`${API_URL}/api/tickets/${b.id}/activate`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              addToast(`Your slot is now live! Queue: ${b.queue_name}`, 'success');
              fetchBookings(); // Refresh list
            }
          } catch (err) {
            console.error('Auto-activate failed:', err);
            delete activationRef.current[b.id];
          }
        }
      }
    };

    tryActivate();
    const interval = setInterval(tryActivate, 60000);
    return () => clearInterval(interval);
  }, [bookings, activeTab]);

  // ─── Cancel booking ───────────────────────────────────────────────────────
  const handleCancel = async (booking) => {
    const token = getToken();
    if (!token) return;
    setCancellingId(booking.id);
    try {
      const res = await fetch(`${API_URL}/api/queue/${booking.queue_id}/book/${booking.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Booking cancelled', 'success');
        setBookings(prev => prev.filter(b => b.id !== booking.id));
      } else {
        const d = await res.json();
        addToast(d.message || 'Failed to cancel', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden w-full">
      <div className="bg-orb bg-orb-blue w-[500px] h-[500px] -top-40 right-0" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">

        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4">
            <Clock className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-dark-300 font-medium">Your activity</span>
          </div>
          <h1 className="text-3xl font-bold font-display">
            Queue <span className="gradient-text">History</span>
          </h1>
          <p className="text-dark-400 mt-2">Your past visits and upcoming slot bookings</p>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="mb-8">
          <div className="inline-flex glass rounded-2xl p-1 gap-1">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
              id="tab-history">
              <Clock className="w-4 h-4" /> History
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'bookings'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
              id="tab-bookings">
              <CalendarClock className="w-4 h-4" /> My Bookings
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ════ TAB: HISTORY ════ */}
          {activeTab === 'history' && (
            <motion.div key="history"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="glass rounded-2xl p-5 text-center">
                  <p className="text-2xl font-bold gradient-text font-display">5</p>
                  <p className="text-xs text-dark-400 mt-1">Total Visits</p>
                </div>
                <div className="glass rounded-2xl p-5 text-center">
                  <p className="text-2xl font-bold gradient-text-green font-display">62m</p>
                  <p className="text-xs text-dark-400 mt-1">Avg Wait</p>
                </div>
                <div className="glass rounded-2xl p-5 text-center">
                  <p className="text-2xl font-bold gradient-text-warm font-display">5.2h</p>
                  <p className="text-xs text-dark-400 mt-1">Total Saved</p>
                </div>
              </div>

              <div className="space-y-3">
                {mockHistory.map((item, i) => (
                  <motion.div key={item.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}
                    className="glass rounded-2xl p-5 hover:border-primary-500/20 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl shrink-0 mt-1">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-dark-100 text-sm">{item.name}</h3>
                            <p className="text-xs text-dark-400 mt-0.5">{item.provider}</p>
                          </div>
                          <span className={`badge text-[10px] shrink-0 ${item.status === 'completed' ? 'badge-active' : 'badge-closed'}`}>
                            {item.status === 'completed' ? 'Completed' : 'Cancelled'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-dark-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.waitTime} min wait
                          </span>
                          <span>Token #{item.token}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ════ TAB: MY BOOKINGS ════ */}
          {activeTab === 'bookings' && (
            <motion.div key="bookings"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>

              {loadingBookings ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                    <CalendarClock className="w-10 h-10 text-cyan-600" />
                  </div>
                  <p className="text-dark-400 text-lg font-semibold">No upcoming bookings</p>
                  <p className="text-dark-500 text-sm mt-1">Book a slot from the Join Queue page</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking, i) => {
                    const minsLeft = minutesUntil(booking.slot_time);
                    const isSoon = minsLeft <= 30 && minsLeft > 0;
                    const isNow = minsLeft <= 0;
                    const icon = CATEGORY_ICONS[booking.category] || '🏢';

                    return (
                      <motion.div key={booking.id} initial="hidden" animate="visible" variants={fadeUp} custom={i}
                        className={`glass rounded-2xl p-5 transition-all duration-300 ${
                          isNow ? 'border border-emerald-500/30' :
                          isSoon ? 'border border-amber-500/20' : ''
                        }`}
                        id={`booking-${booking.id}`}>

                        {isNow && (
                          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <p className="text-xs text-emerald-300 font-semibold">Your slot is active — being added to live queue…</p>
                          </div>
                        )}
                        {isSoon && !isNow && (
                          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <p className="text-xs text-amber-300 font-semibold">Slot in {minsLeft} min — head to the location!</p>
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <span className="text-2xl shrink-0 mt-1">{icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-dark-100 text-sm">{booking.queue_name}</h3>
                                <p className="text-xs text-dark-400 mt-0.5">{booking.queue_code}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xl font-bold gradient-text font-display">#{booking.token_number}</p>
                                <p className="text-xs text-dark-500">Token</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-3">
                              <span className="flex items-center gap-1 text-xs text-cyan-400 font-semibold">
                                <CalendarClock className="w-3 h-3" />
                                {formatSlotTime(booking.slot_time)}
                              </span>
                            </div>
                            <div className="mt-3">
                              <button
                                onClick={() => handleCancel(booking)}
                                disabled={cancellingId === booking.id || isNow}
                                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                id={`cancel-booking-${booking.id}`}>
                                {cancellingId === booking.id
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <X className="w-3.5 h-3.5" />
                                }
                                {cancellingId === booking.id ? 'Cancelling…' : 'Cancel Booking'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
