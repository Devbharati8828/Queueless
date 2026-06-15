import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Search, ArrowRight, MapPin, Clock, Users, Zap } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useQueue } from '../context/QueueContext';
import { useToast } from '../components/ui/Toast';
import { formatTime } from '../utils/helpers';
import { categoryColors } from '../data/mockData';

const QRScannerPlugin = ({ onScanSuccess, onScanFailure }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { qrbox: { width: 250, height: 250 }, fps: 5 }, false);
    scanner.render(onScanSuccess, onScanFailure);
    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [onScanSuccess, onScanFailure]);

  return <div id="reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-white p-2"></div>;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } })
};

export default function JoinQueue() {
  const [code, setCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const { queues, joinQueue, joinByCode } = useQueue();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleScanSuccess = (decodedText) => {
    setIsScanning(false);
    if (decodedText.includes('/join/')) {
      const parts = decodedText.split('/join/');
      const queueId = parts[parts.length - 1];
      const ticket = joinQueue(queueId);
      if (ticket) {
        addToast(`Joined queue! Your token is #${ticket.tokenNumber}`, 'success');
        navigate('/queue-status');
      } else {
        addToast('Invalid QR code. Please try again.', 'error');
      }
    } else {
      setCode(decodedText.toUpperCase());
    }
  };

  const filtered = queues.filter(q =>
    q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    const ticket = joinByCode(code.trim());
    if (ticket) {
      addToast(`Joined queue! Your token is #${ticket.tokenNumber}`, 'success');
      navigate('/queue-status');
    } else {
      addToast('Invalid queue code. Please check and try again.', 'error');
      setError('Invalid queue code. Please check and try again.');
    }
  };

  const handleJoinQueue = (queueId) => {
    const ticket = joinQueue(queueId);
    if (ticket) {
      addToast(`Joined queue! Your token is #${ticket.tokenNumber}`, 'success');
      navigate('/queue-status');
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
          <p className="text-dark-400 mt-3 text-lg">Enter a queue code or browse available queues near you</p>
        </motion.div>

        {/* Code Entry */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <div className="glass rounded-2xl p-6 md:p-8 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-dark-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-400" /> Enter Queue Code
              </h2>
              <button onClick={() => setIsScanning(!isScanning)} className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 font-medium">
                <QrCode className="w-4 h-4" /> {isScanning ? 'Close Scanner' : 'Scan QR Code'}
              </button>
            </div>

            {isScanning ? (
              <div className="mb-4">
                <QRScannerPlugin onScanSuccess={handleScanSuccess} onScanFailure={() => {}} />
                <p className="text-center text-dark-400 text-xs mt-4">Point your camera at the QR code</p>
              </div>
            ) : (
              <form onSubmit={handleCodeSubmit}>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="e.g. CGH-OPD"
                    className="input-glass flex-1 text-center text-xl tracking-[0.3em] font-display font-bold uppercase"
                    maxLength={10}
                    id="queue-code-input"
                  />
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
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, provider, or category..."
              className="input-glass pl-12 py-3.5"
              id="queue-search-input"
            />
          </div>
        </motion.div>

        {/* Queue List */}
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((queue, i) => {
            const catColor = categoryColors[queue.category] || categoryColors.Retail;
            const waitTime = (queue.totalInQueue - queue.currentServing) * queue.avgWaitTime;
            return (
              <motion.div
                key={queue.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i + 3}
                className="glass rounded-2xl p-5 hover:border-primary-500/20 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{queue.icon}</span>
                    <div>
                      <h3 className="font-bold text-dark-100 group-hover:text-primary-400 transition-colors">{queue.name}</h3>
                      <p className="text-xs text-dark-400">{queue.provider}</p>
                    </div>
                  </div>
                  <span className="badge text-[10px]" style={{ background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}` }}>
                    {queue.category}
                  </span>
                </div>

                <p className="text-sm text-dark-400 mb-4 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {queue.address}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="glass-light rounded-lg p-2 text-center">
                    <Users className="w-3.5 h-3.5 text-primary-400 mx-auto mb-1" />
                    <p className="text-xs text-dark-400">In Queue</p>
                    <p className="text-sm font-bold text-dark-100">{queue.totalInQueue - queue.currentServing}</p>
                  </div>
                  <div className="glass-light rounded-lg p-2 text-center">
                    <Clock className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                    <p className="text-xs text-dark-400">Wait</p>
                    <p className="text-sm font-bold text-dark-100">{formatTime(waitTime)}</p>
                  </div>
                  <div className="glass-light rounded-lg p-2 text-center">
                    <Zap className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-xs text-dark-400">Serving</p>
                    <p className="text-sm font-bold text-dark-100">#{queue.currentServing}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinQueue(queue.id)}
                  className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 group/btn"
                  id={`join-queue-${queue.id}`}
                >
                  Join Queue <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <QrCode className="w-16 h-16 text-dark-700 mx-auto mb-4" />
            <p className="text-dark-400 text-lg">No queues found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
