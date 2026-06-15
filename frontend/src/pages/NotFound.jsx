import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden w-full">
      <div className="bg-orb bg-orb-blue w-[500px] h-[500px] -top-40 -right-40" />
      <div className="bg-orb bg-orb-purple w-[400px] h-[400px] bottom-20 -left-40" />

      <div className="max-w-lg mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-3xl glass flex items-center justify-center mx-auto mb-8"
          >
            <SearchX className="w-12 h-12 text-dark-500" />
          </motion.div>

          <h1 className="text-7xl sm:text-8xl font-black font-[family-name:var(--font-display)] gradient-text mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold text-dark-200 mb-3">Page Not Found</h2>
          <p className="text-dark-400 mb-8 leading-relaxed">
            Oops! The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="btn-primary px-8 py-3 flex items-center gap-2">
              <Home className="w-4 h-4" /> Go Home
            </Link>
            <button onClick={() => window.history.back()} className="btn-secondary px-8 py-3 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
