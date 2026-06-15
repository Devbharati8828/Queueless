import { motion } from 'framer-motion';
import { Clock, Calendar, Inbox } from 'lucide-react';

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

export default function History() {
  return (
    <div className="relative min-h-screen overflow-hidden w-full">
      <div className="bg-orb bg-orb-blue w-[500px] h-[500px] -top-40 right-0" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4">
            <Clock className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-dark-300 font-medium">Your activity</span>
          </div>
          <h1 className="text-3xl font-bold font-display">
            Queue <span className="gradient-text">History</span>
          </h1>
          <p className="text-dark-400 mt-2">Your past queue visits and wait times</p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="grid grid-cols-3 gap-4 mb-8">
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
        </motion.div>

        {/* History List */}
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
                      <Calendar className="w-3 h-3" /> {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.waitTime} min wait
                    </span>
                    <span className="flex items-center gap-1">
                      Token #{item.token}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {mockHistory.length === 0 && (
          <div className="text-center py-16">
            <Inbox className="w-16 h-16 text-dark-700 mx-auto mb-4" />
            <p className="text-dark-400 text-lg">No queue history yet</p>
            <p className="text-dark-500 text-sm mt-1">Join a queue to see your history here</p>
          </div>
        )}
      </div>
    </div>
  );
}
