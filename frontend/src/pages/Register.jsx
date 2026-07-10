import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      const registeredUser = await register(name, email, password, role);
      navigate(registeredUser.role === 'provider' ? '/dashboard' : '/join');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden w-full">
      <div className="bg-orb bg-orb-cyan w-[500px] h-[500px] -top-40 -left-40" />
      <div className="bg-orb bg-orb-blue w-[400px] h-[400px] bottom-0 -right-40" />

      <div className="max-w-md w-full mx-auto px-4 py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold font-display">
                <span className="text-white">Queue</span><span className="gradient-text">Less</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-dark-100">Create your account</h1>
            <p className="text-dark-400 mt-1 text-sm">Start saving time today</p>
          </div>

          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 space-y-5">
            {/* Role Toggle */}
            <div className="flex rounded-xl glass-light p-1">
              {[{ value: 'user', label: 'User' }, { value: 'provider', label: 'Service Provider' }].map(r => (
                <button key={r.value} type="button" onClick={() => setRole(r.value)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                    role === r.value ? 'gradient-primary text-white shadow-lg' : 'text-dark-400 hover:text-dark-200'
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }}
                  placeholder="John Doe" className="input-glass pl-10" id="register-name" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com" className="input-glass pl-10" id="register-email" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Min. 6 characters" className="input-glass pl-10 pr-10" id="register-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-rose-400 text-sm">{error}</p>}

            <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" id="register-submit">
              Create Account <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-sm text-dark-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
