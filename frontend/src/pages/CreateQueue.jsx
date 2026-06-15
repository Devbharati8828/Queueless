import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Clock, Users, FileText, MapPin, ArrowLeft, CheckCircle } from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { generateQueueCode } from '../utils/helpers';

export default function CreateQueue() {
  const { createQueue } = useQueue();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Healthcare',
    avgWaitTime: 15,
    maxCapacity: 50,
    address: '',
    operatingHours: '9:00 AM - 5:00 PM',
  });

  const categories = ['Healthcare', 'Banking', 'Government', 'Retail', 'Education', 'Other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = generateQueueCode();
    createQueue({ ...form, code });
    setSuccess(true);
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-dark-100 mb-2">Queue Created!</h2>
          <p className="text-dark-400">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden w-full">
      <div className="bg-orb bg-orb-blue w-[400px] h-[400px] top-20 -right-40" />
      <div className="bg-orb bg-orb-purple w-[300px] h-[300px] bottom-20 -left-20" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-16 relative z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-400 hover:text-dark-200 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4">
            <Plus className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-dark-300 font-medium">New Queue</span>
          </div>
          <h1 className="text-3xl font-bold font-display mb-8">
            Create a <span className="gradient-text">Queue</span>
          </h1>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Queue Name *</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input type="text" required value={form.name} onChange={e => updateField('name', e.target.value)}
                placeholder="e.g. General Consultation" className="input-glass pl-10" id="queue-name" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Description</label>
            <textarea value={form.description} onChange={e => updateField('description', e.target.value)}
              placeholder="Brief description of this queue..." rows={3}
              className="input-glass resize-none" id="queue-description" />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Category *</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button key={cat} type="button" onClick={() => updateField('category', cat)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                    form.category === cat
                      ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                      : 'glass-light text-dark-400 hover:text-dark-200 border border-transparent'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Two columns */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Avg Wait (minutes)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="number" min="1" max="120" value={form.avgWaitTime}
                  onChange={e => updateField('avgWaitTime', parseInt(e.target.value) || 15)}
                  className="input-glass pl-10" id="avg-wait" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Max Capacity</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="number" min="5" max="500" value={form.maxCapacity}
                  onChange={e => updateField('maxCapacity', parseInt(e.target.value) || 50)}
                  className="input-glass pl-10" id="max-capacity" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-dark-500" />
              <input type="text" value={form.address} onChange={e => updateField('address', e.target.value)}
                placeholder="Service location address" className="input-glass pl-10" id="queue-address" />
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Operating Hours</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input type="text" value={form.operatingHours} onChange={e => updateField('operatingHours', e.target.value)}
                placeholder="e.g. 9:00 AM - 5:00 PM" className="input-glass pl-10" id="operating-hours" />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2" id="create-queue-submit">
            <Plus className="w-5 h-5" /> Create Queue
          </button>
        </motion.form>
      </div>
    </div>
  );
}
