import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Shield, Bell, Palette, LogOut, Save,
  Camera, ChevronRight, Moon, Smartphone, Globe
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } })
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    language: 'English',
    notifications: true,
    pushAlerts: true,
    darkMode: true,
    queueReminder: 5,
  });

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden w-full">
      <div className="bg-orb bg-orb-blue w-[500px] h-[500px] -top-40 right-0" />
      <div className="bg-orb bg-orb-purple w-[400px] h-[400px] bottom-40 -left-40" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
            <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-dark-400 mt-1">Manage your account and preferences</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="lg:col-span-1">
            <div className="glass rounded-2xl p-5">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-3xl font-bold text-white mx-auto">
                    {user.name.charAt(0)}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-dark-700 border border-dark-600 flex items-center justify-center hover:bg-dark-600 transition-colors">
                    <Camera className="w-3.5 h-3.5 text-dark-300" />
                  </button>
                </div>
                <p className="font-semibold text-dark-100 mt-3">{user.name}</p>
                <span className="badge badge-active mt-1 text-[10px]">{user.role}</span>
              </div>

              {/* Tab Navigation */}
              <nav className="space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-primary-500/15 text-primary-400'
                          : 'text-dark-400 hover:bg-dark-700/50 hover:text-dark-200'
                      }`}>
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${activeTab === tab.id ? 'rotate-90' : ''}`} />
                    </button>
                  );
                })}

                <div className="pt-3 mt-3 border-t border-dark-700/50">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="lg:col-span-3">
            <div className="glass rounded-2xl p-6 md:p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-dark-100 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-400" /> Profile Information
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                        <input type="text" value={form.name} onChange={e => updateField('name', e.target.value)}
                          className="input-glass pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                        <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)}
                          className="input-glass pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Phone Number</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                        <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)}
                          placeholder="+91 98765 43210" className="input-glass pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Language</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                        <select value={form.language} onChange={e => updateField('language', e.target.value)}
                          className="input-glass pl-10 appearance-none cursor-pointer">
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Tamil">Tamil</option>
                          <option value="Telugu">Telugu</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-bold text-dark-100 mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary-400" /> Notification Settings
                  </h2>
                  <div className="space-y-4">
                    {[
                      { key: 'notifications', label: 'Queue Notifications', desc: 'Get notified when your turn is approaching' },
                      { key: 'pushAlerts', label: 'Push Alerts', desc: 'Receive browser push notifications' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between glass-light rounded-xl p-4">
                        <div>
                          <p className="text-sm font-semibold text-dark-100">{item.label}</p>
                          <p className="text-xs text-dark-400 mt-0.5">{item.desc}</p>
                        </div>
                        <button onClick={() => updateField(item.key, !form[item.key])}
                          className={`w-12 h-7 rounded-full transition-all duration-300 relative ${
                            form[item.key] ? 'bg-primary-500' : 'bg-dark-600'
                          }`}>
                          <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-300 ${
                            form[item.key] ? 'left-6' : 'left-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                    <div className="glass-light rounded-xl p-4">
                      <p className="text-sm font-semibold text-dark-100 mb-2">Remind me before turn</p>
                      <p className="text-xs text-dark-400 mb-3">Number of people ahead when you want a reminder</p>
                      <div className="flex gap-2">
                        {[3, 5, 10].map(n => (
                          <button key={n} onClick={() => updateField('queueReminder', n)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              form.queueReminder === n
                                ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                                : 'glass text-dark-400 hover:text-dark-200'
                            }`}>
                            {n} people
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl font-bold text-dark-100 mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary-400" /> Preferences
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between glass-light rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-dark-400" />
                        <div>
                          <p className="text-sm font-semibold text-dark-100">Dark Mode</p>
                          <p className="text-xs text-dark-400 mt-0.5">Always enabled for the best experience</p>
                        </div>
                      </div>
                      <button className="w-12 h-7 rounded-full bg-primary-500 relative cursor-default">
                        <div className="w-5 h-5 rounded-full bg-white absolute top-1 left-6" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-bold text-dark-100 mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary-400" /> Security
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Current Password</label>
                      <input type="password" placeholder="••••••••" className="input-glass" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">New Password</label>
                      <input type="password" placeholder="Min. 6 characters" className="input-glass" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Confirm New Password</label>
                      <input type="password" placeholder="Re-enter new password" className="input-glass" />
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 flex items-center gap-4">
                <button onClick={handleSave}
                  className="btn-primary px-8 py-3 flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-emerald-400 font-medium"
                  >
                    ✓ Changes saved successfully
                  </motion.span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
