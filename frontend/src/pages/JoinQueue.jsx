import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Search, ArrowRight, MapPin, Clock, Users, Zap,
  CalendarClock, X, CheckCircle2, AlertTriangle, Loader2,
  ChevronLeft, Ticket
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { categoryColors, mockQueues } from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getToken = () => localStorage.getItem('queueless_token');

const CATEGORIES = ['All', 'Healthcare', 'Banking', 'Government', 'Retail', 'Education'];

const QRScannerPlugin = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 5 }, false);
    scanner.render(onScanSuccess, () => {});
    return () => { scanner.clear().catch(() => {}); };
  }, [onScanSuccess]);
  return <div id="reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-white p-2" />;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } })
};

// Format a slot time like "10:00 AM"
const formatSlotTime = (dt) => {
  const d = new Date(dt);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export default function JoinQueue() {
  const [code, setCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [queues, setQueues] = useState([]);
  const [loadingQueues, setLoadingQueues] = useState(true);

  // Join / Book modal state
  const [selectedQueue, setSelectedQueue] = useState(null); // queue object
  const [modalStep, setModalStep] = useState('choose');      // 'choose' | 'slots' | 'confirmed'
  const [slots, setSlots] = useState({ today: [], tomorrow: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const { joinByCode } = useQueue();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // ─── Fetch real queues from API ─────────────────────────────────────────
  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const res = await fetch(`${API_URL}/api/queue`);
        if (res.ok) {
          const data = await res.json();
          // Normalize API shape to match what the card expects
          const normalized = data.map(q => ({
            id: q.id,
            name: q.name,
            provider: q.provider_name,
            category: q.category || 'General',
            code: q.queue_code,
            description: q.description,
            address: q.address || '',
            operatingHours: q.operating_hours || '',
            waitingCount: parseInt(q.waitingCount) || 0,
            currentlyServingToken: q.currentlyServingToken || null,
            avgWaitTime: q.average_wait_minutes || 15,
            is_paused: !!q.is_paused,
            is_active: !!q.is_active,
            icon: CATEGORY_ICONS[q.category] || '🏢',
          }));
          setQueues(normalized.filter(q => q.is_active));
        } else {
          setQueues(mockQueues);
        }
      } catch {
        setQueues(mockQueues);
      } finally {
        setLoadingQueues(false);
      }
    };
    fetchQueues();
  }, []);

  const CATEGORY_ICONS = {
    Healthcare: '🏥', Banking: '🏦', Government: '🏛️', Retail: '🛍️', Education: '🎓', General: '🏢'
  };

  // ─── Filtering ─────────────────────────────────────────────────────────
  const filtered = queues.filter(q => {
    const matchSearch =
      q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.provider || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = activeCategory === 'All' || q.category === activeCategory;
    return matchSearch && matchCat;
  });

  // ─── QR Scan ───────────────────────────────────────────────────────────
  const handleScanSuccess = (decodedText) => {
    setIsScanning(false);
    const parts = decodedText.split('/join?q=');
    if (parts.length > 1) {
      const queueId = parseInt(parts[1]);
      const q = queues.find(q => q.id === queueId);
      if (q) { openJoinModal(q); return; }
    }
    setCode(decodedText.toUpperCase());
  };

  // ─── Code join ─────────────────────────────────────────────────────────
  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    const ticket = joinByCode(code.trim());
    if (ticket) {
      addToast(`Joined queue! Your token is #${ticket.tokenNumber}`, 'success');
      navigate('/queue-status');
    } else {
      setError('Invalid queue code. Please check and try again.');
    }
  };

  // ─── Open join/book modal ───────────────────────────────────────────────
  const openJoinModal = (queue) => {
    if (queue.is_paused) {
      addToast('This queue is currently paused. Please try again later.', 'error');
      return;
    }
    setSelectedQueue(queue);
    setModalStep('choose');
    setConfirmedBooking(null);
  };

  const closeModal = () => {
    setSelectedQueue(null);
    setModalStep('choose');
    setSlots({ today: [], tomorrow: [] });
    setConfirmedBooking(null);
  };

  // ─── Join Now (immediate) ───────────────────────────────────────────────
  const handleJoinNow = async () => {
    if (!user) {
      addToast('Please log in to join a queue', 'error');
      navigate('/login');
      return;
    }
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/queue/${selectedQueue.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`Joined queue! Your token is #${data.token_number}`, 'success');
        navigate('/queue-status');
        closeModal();
      } else {
        addToast(data.message || 'Failed to join queue', 'error');
      }
    } catch {
      addToast('Network error. Please try again.', 'error');
    }
  };

  // ─── Load slots ─────────────────────────────────────────────────────────
  const handleShowSlots = async () => {
    if (!user) {
      addToast('Please log in to book a slot', 'error');
      navigate('/login');
      return;
    }
    setLoadingSlots(true);
    setModalStep('slots');
    try {
      const res = await fetch(`${API_URL}/api/queue/${selectedQueue.id}/slots`);
      if (res.ok) setSlots(await res.json());
    } catch {
      addToast('Failed to load slots', 'error');
    } finally {
      setLoadingSlots(false);
    }
  };

  // ─── Book a slot ────────────────────────────────────────────────────────
  const handleBookSlot = async (slotId) => {
    if (!user) { addToast('Please log in to book', 'error'); return; }
    const token = getToken();
    setBookingLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/queue/${selectedQueue.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slotId })
      });
      const data = await res.json();
      if (res.ok) {
        setConfirmedBooking(data);
        setModalStep('confirmed');
        addToast(`Slot booked! Token #${data.token_number}`, 'success');
      } else {
        addToast(data.message || 'Booking failed', 'error');
      }
    } catch {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  // ─── Cancel booking ─────────────────────────────────────────────────────
  const handleCancelBooking = async () => {
    if (!confirmedBooking) return;
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/queue/${selectedQueue.id}/book/${confirmedBooking.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Booking cancelled', 'success');
        closeModal();
      } else {
        const d = await res.json();
        addToast(d.message || 'Cancel failed', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden w-full">
      <div className="bg-orb bg-orb-blue w-[500px] h-[500px] -top-40 right-0" />
      <div className="bg-orb bg-orb-cyan w-[400px] h-[400px] bottom-40 -left-40" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4">
            <QrCode className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-dark-300 font-medium">Join in seconds</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Join a <span className="gradient-text">Queue</span>
          </h1>
          <p className="text-dark-400 mt-3 text-lg">Enter a queue code, scan a QR, or browse available queues</p>
        </motion.div>

        {/* Code Entry */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <div className="glass rounded-2xl p-6 md:p-8 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-dark-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-400" /> Enter Queue Code
              </h2>
              <button onClick={() => setIsScanning(!isScanning)}
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 font-medium">
                <QrCode className="w-4 h-4" /> {isScanning ? 'Close Scanner' : 'Scan QR'}
              </button>
            </div>
            {isScanning ? (
              <div className="mb-4">
                <QRScannerPlugin onScanSuccess={handleScanSuccess} />
                <p className="text-center text-dark-400 text-xs mt-4">Point your camera at the QR code</p>
              </div>
            ) : (
              <form onSubmit={handleCodeSubmit}>
                <div className="flex gap-3">
                  <input type="text" value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="e.g. GEN-101"
                    className="input-glass flex-1 text-center text-xl tracking-[0.3em] font-display font-bold uppercase"
                    maxLength={10} id="queue-code-input" />
                  <button type="submit" className="btn-primary px-6 flex items-center gap-2">
                    Join <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {error && <p className="text-rose-400 text-sm mt-3 text-center">{error}</p>}
                <p className="text-dark-500 text-xs mt-3 text-center">Find the code on the QR poster at the service location</p>
              </form>
            )}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4 max-w-2xl mx-auto mb-8">
          <div className="flex-1 h-px bg-dark-700/50" />
          <span className="text-sm text-dark-500 font-medium">or browse queues</span>
          <div className="flex-1 h-px bg-dark-700/50" />
        </div>

        {/* Search */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input type="text" value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, provider, or category..."
              className="input-glass pl-12 py-3.5" id="queue-search-input" />
          </div>
        </motion.div>

        {/* Category Filter Tabs */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="mb-8">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-primary-500/20 border-primary-500/30 text-primary-300'
                    : 'glass-light border-dark-600/50 text-dark-400 hover:text-dark-200'
                }`}
                id={`cat-filter-${cat.toLowerCase()}`}>
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Queue Cards */}
        {loadingQueues ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((queue, i) => {
              const catColor = categoryColors[queue.category] || categoryColors.Retail;
              const estWait = queue.waitingCount * (queue.avgWaitTime || 15);
              return (
                <motion.div key={queue.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 4}
                  className={`glass rounded-2xl p-5 transition-all duration-300 group ${
                    queue.is_paused ? 'opacity-75' : 'hover:border-primary-500/20'
                  }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{queue.icon}</span>
                      <div>
                        <h3 className="font-bold text-dark-100 group-hover:text-primary-400 transition-colors">{queue.name}</h3>
                        <p className="text-xs text-dark-400">{queue.provider}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="badge text-[10px]" style={{ background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}` }}>
                        {queue.category}
                      </span>
                      {queue.is_paused && (
                        <span className="badge text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">Paused</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-4">
                    {queue.address && (
                      <p className="text-sm text-dark-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" /> {queue.address}
                      </p>
                    )}
                    <p className="text-sm flex items-center gap-1.5 font-semibold text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      {queue.is_paused ? 'Queue paused' : `~${Math.ceil(estWait)} min estimated wait`}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="glass-light rounded-lg p-2 text-center">
                      <Users className="w-3.5 h-3.5 text-primary-400 mx-auto mb-1" />
                      <p className="text-xs text-dark-400">In Queue</p>
                      <p className="text-sm font-bold text-dark-100">{queue.waitingCount}</p>
                    </div>
                    <div className="glass-light rounded-lg p-2 text-center">
                      <Zap className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
                      <p className="text-xs text-dark-400">Serving</p>
                      <p className="text-sm font-bold text-dark-100">
                        {queue.currentlyServingToken ? `#${queue.currentlyServingToken}` : '—'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openJoinModal(queue)}
                    disabled={queue.is_paused}
                    className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                    id={`join-queue-${queue.id}`}>
                    {queue.is_paused ? 'Queue Paused' : <>Join / Book <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loadingQueues && filtered.length === 0 && (
          <div className="text-center py-16">
            <QrCode className="w-16 h-16 text-dark-700 mx-auto mb-4" />
            <p className="text-dark-400 text-lg">No queues found matching your search</p>
          </div>
        )}
      </div>

      {/* ─── Join / Book Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedQueue && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.97 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              id="join-book-modal">

              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-dark-700/30">
                <div className="flex items-center gap-3">
                  {modalStep !== 'choose' && (
                    <button onClick={() => setModalStep('choose')}
                      className="p-1.5 rounded-lg glass-light hover:bg-dark-700/50 transition-colors">
                      <ChevronLeft className="w-4 h-4 text-dark-400" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-dark-100">{selectedQueue.name}</h2>
                    <p className="text-xs text-dark-400 mt-0.5">{selectedQueue.waitingCount} waiting in queue</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 rounded-xl glass-light hover:bg-dark-700/50 transition-colors">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>

              <div className="p-6">
                {/* STEP: Choose */}
                {modalStep === 'choose' && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <p className="text-dark-400 text-sm mb-6">How would you like to join this queue?</p>
                    <div className="grid gap-4">
                      {/* Join Now */}
                      <button onClick={handleJoinNow}
                        className="group glass-light rounded-2xl p-5 text-left hover:bg-primary-500/10 hover:border-primary-500/30 border border-transparent transition-all duration-300"
                        id="join-now-btn">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                            <Zap className="w-6 h-6 text-primary-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-dark-100 group-hover:text-primary-300 transition-colors mb-1">Join Now</h3>
                            <p className="text-sm text-dark-400">
                              Enter the live queue immediately. Current wait: ~{selectedQueue.waitingCount * (selectedQueue.avgWaitTime || 15)} min
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Book a Slot */}
                      <button onClick={handleShowSlots}
                        className="group glass-light rounded-2xl p-5 text-left hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent transition-all duration-300"
                        id="book-slot-btn">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                            <CalendarClock className="w-6 h-6 text-cyan-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-dark-100 group-hover:text-cyan-300 transition-colors mb-1">Book a Slot</h3>
                            <p className="text-sm text-dark-400">Reserve a specific time slot for today or tomorrow</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP: Slots */}
                {modalStep === 'slots' && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <p className="text-dark-400 text-sm mb-6">Select an available time slot</p>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-7 h-7 text-primary-400 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {['today', 'tomorrow'].map(day => (
                          slots[day]?.length > 0 && (
                            <div key={day}>
                              <p className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-3">
                                {day === 'today' ? '📅 Today' : '📆 Tomorrow'}
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {slots[day].map(slot => (
                                  <button key={slot.id}
                                    onClick={() => handleBookSlot(slot.id)}
                                    disabled={slot.slotsLeft === 0 || bookingLoading}
                                    className={`relative p-3 rounded-xl border text-left transition-all duration-200 ${
                                      slot.slotsLeft === 0
                                        ? 'opacity-40 cursor-not-allowed glass-light border-dark-700/30'
                                        : slot.almostFull
                                          ? 'glass-light border-amber-500/30 hover:bg-amber-500/10'
                                          : 'glass-light border-dark-600/50 hover:border-cyan-500/30 hover:bg-cyan-500/10'
                                    }`}
                                    id={`slot-${slot.id}`}>
                                    <p className="font-bold text-dark-100 text-sm">{formatSlotTime(slot.slotTime)}</p>
                                    <p className="text-xs mt-0.5 flex items-center gap-1">
                                      {slot.slotsLeft === 0 ? (
                                        <span className="text-dark-500">Full</span>
                                      ) : slot.almostFull ? (
                                        <span className="text-amber-400 flex items-center gap-1">
                                          <AlertTriangle className="w-3 h-3" /> {slot.slotsLeft} left
                                        </span>
                                      ) : (
                                        <span className="text-emerald-400">{slot.slotsLeft} slots left</span>
                                      )}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                        {slots.today?.length === 0 && slots.tomorrow?.length === 0 && (
                          <div className="text-center py-8">
                            <CalendarClock className="w-12 h-12 text-dark-700 mx-auto mb-3" />
                            <p className="text-dark-400">No available slots for today or tomorrow</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP: Confirmed */}
                {modalStep === 'confirmed' && confirmedBooking && (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-dark-100 mb-1">Booking Confirmed!</h3>
                    <p className="text-dark-400 text-sm mb-6">Your slot has been reserved</p>

                    <div className="glass-light rounded-2xl p-5 mb-6 text-left space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-dark-400 text-sm">Token Number</span>
                        <span className="text-xl font-bold gradient-text font-display">
                          #{confirmedBooking.token_number}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-dark-400 text-sm">Queue</span>
                        <span className="text-dark-100 font-semibold text-sm">{selectedQueue.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-dark-400 text-sm">Slot Time</span>
                        <span className="text-cyan-400 font-semibold text-sm">
                          {confirmedBooking.slot_time ? formatSlotTime(confirmedBooking.slot_time) : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={handleCancelBooking}
                        className="flex-1 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 text-sm font-semibold hover:bg-rose-500/10 transition-colors"
                        id="cancel-booking-btn">
                        Cancel Booking
                      </button>
                      <button onClick={() => { closeModal(); navigate('/history'); }}
                        className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
                        <Ticket className="w-4 h-4" /> My Bookings
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
