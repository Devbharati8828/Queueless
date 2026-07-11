import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, QrCode, Clock, Bell, Users, Shield, WifiOff,
  ArrowRight, ChevronRight, Star, Building2, Stethoscope,
  Landmark, ShoppingBag, Smartphone, Coffee, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const features = [
  { icon: QrCode, title: 'Scan & Join Instantly', description: 'Scan a QR code or enter a short code to join any queue in seconds.', color: 'from-primary-500 to-cyan-500' },
  { icon: Clock, title: 'Real-Time Tracking', description: 'See your exact position and estimated wait time with live updates.', color: 'from-emerald-500 to-cyan-500' },
  { icon: Bell, title: 'Smart Notifications', description: 'Get notified when your turn is approaching. Never miss your slot.', color: 'from-amber-500 to-rose-500' },
  { icon: WifiOff, title: 'Works Offline', description: 'Offline-first architecture works even in low-connectivity areas.', color: 'from-purple-500 to-primary-500' },
  { icon: Shield, title: 'Privacy First', description: 'No personal data required to join. Your privacy is our priority.', color: 'from-rose-500 to-amber-500' },
  { icon: Users, title: 'Community Driven', description: 'Any shop, clinic, or office can create and manage queues for free.', color: 'from-cyan-500 to-emerald-500' }
];

const steps = [
  { step: '01', title: 'Scan QR Code', desc: 'Find the QueueLess QR code at the location', icon: QrCode },
  { step: '02', title: 'Join the Queue', desc: 'Get your digital token instantly', icon: Smartphone },
  { step: '03', title: 'Track Your Turn', desc: 'Watch your position update in real-time', icon: Clock },
  { step: '04', title: 'Get Notified', desc: 'Receive a notification when it\'s your turn', icon: Bell },
];

const categories = [
  { icon: Stethoscope, label: 'Hospitals', count: '2.4K+' },
  { icon: Landmark, label: 'Government', count: '1.8K+' },
  { icon: Building2, label: 'Banks', count: '3.1K+' },
  { icon: ShoppingBag, label: 'Retail', count: '5.2K+' },
];

const comparisonRows = [
  { bad: '😤 Stand 2+ hours', good: '😊 Sit anywhere' },
  { bad: '📋 Paper token', good: '📱 Digital token' },
  { bad: '❓ No idea wait time', good: '⏱ Live tracking' },
  { bad: '😰 Miss your turn', good: '🔔 Get notified' },
  { bad: '📍 Must stay in line', good: '🚶 Walk freely' },
];

export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      {/* HERO */}
      <section className="relative flex items-center">
        <div className="bg-orb bg-orb-blue w-[600px] h-[600px] -top-40 -right-40" />
        <div className="bg-orb bg-orb-cyan w-[400px] h-[400px] top-60 -left-40" />
        <div className="bg-orb bg-orb-purple w-[500px] h-[500px] bottom-0 right-1/4" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 md:pt-12 md:pb-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-dark-300 font-medium">Now serving 500K+ users across India</span>
              </motion.div>

              <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-[family-name:var(--font-display)] leading-[1.1] tracking-tight">
                Skip the Line.<br /><span className="gradient-text">Save Your Time.</span>
              </motion.h1>

              <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="mt-6 text-lg sm:text-xl text-dark-400 leading-relaxed max-w-lg">
                Join any queue digitally. Track your position in real-time. Get notified when it's your turn.
              </motion.p>

              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="mt-6 flex flex-wrap gap-4">
                <Button asChild size="lg" className="rounded-full px-8 py-6 text-base group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                  <Link to="/join">
                    Join a Queue <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="rounded-full px-8 py-6 text-base shadow-sm border border-border/50">
                  <Link to="/register">
                    For Providers <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="mt-6 flex gap-8">
                {[{ val: '2M+', lab: 'Hours Saved' }, { val: '50K+', lab: 'Queues' }, { val: '98%', lab: 'Happy' }].map(s => (
                  <div key={s.lab}>
                    <p className="text-2xl font-bold gradient-text font-[family-name:var(--font-display)]">{s.val}</p>
                    <p className="text-xs text-dark-500 mt-0.5">{s.lab}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero Visual Card - Before & After Comparison */}
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="relative hidden lg:block w-full max-w-md mx-auto">
              <div className="glass rounded-3xl overflow-hidden border border-dark-700/50 bg-background/60 backdrop-blur-md shadow-2xl relative group">
                
                {/* Background Glows */}
                <div className="absolute top-0 left-0 w-1/2 h-full bg-rose-500/5 blur-3xl group-hover:bg-rose-500/10 transition-colors duration-500" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-colors duration-500" />

                {/* Header */}
                <div className="flex text-center border-b border-dark-700/50 relative z-10">
                  <div className="w-1/2 py-4 px-2 text-rose-400/80 font-bold text-[13px] tracking-wider">
                    ❌ Without QueueLess
                  </div>
                  <div className="w-1/2 py-4 px-2 text-cyan-400 font-bold text-[13px] tracking-wider group-hover:text-cyan-300 transition-colors duration-500 border-l border-dark-700/50">
                    ✅ With QueueLess
                  </div>
                </div>

                {/* Center Divider for Rows */}
                <div className="absolute top-14 bottom-0 left-1/2 w-px bg-dark-700/50 -translate-x-1/2 z-0" />

                {/* Rows */}
                <div className="p-5 space-y-5 relative z-10">
                  {comparisonRows.map((row, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.2, duration: 0.5 }}
                      className="flex items-center text-[14px] relative"
                    >
                      {/* Left Side */}
                      <div className="w-1/2 text-rose-200/60 text-left pr-5 font-medium">
                        {row.bad}
                      </div>
                      
                      {/* Arrow Overlap */}
                      <div className="absolute left-1/2 -translate-x-1/2 text-dark-500 bg-[#070b14] px-2 text-xs rounded-full">
                        →
                      </div>
                      
                      {/* Right Side */}
                      <motion.div 
                        initial={{ color: '#fff', textShadow: '0 0 8px #10b981', backgroundColor: 'rgba(16, 185, 129, 0.4)' }}
                        animate={{ color: '#34d399', textShadow: '0 0 0px #10b981', backgroundColor: 'rgba(16, 185, 129, 0)' }}
                        transition={{ delay: 0.8 + i * 0.2 + 0.1, duration: 0.8 }}
                        className="w-1/2 font-bold text-left pl-5 group-hover:text-cyan-300 group-hover:brightness-125 transition-all duration-300 rounded"
                      >
                        {row.good}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Text below card */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2, duration: 0.8 }}
                className="text-center text-dark-400 text-xs font-medium mt-4"
              >
                Join 500K+ users across India who stopped standing in line
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-8 md:py-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="flex items-center gap-5 px-8 py-5 md:px-10 md:py-6 cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-background/50 backdrop-blur-sm">
                    <div className="p-3.5 rounded-full bg-primary/10">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-base md:text-lg font-bold text-foreground">{cat.label}</p>
                      <p className="text-sm text-muted-foreground">{cat.count} queues</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-10 md:py-12 relative">
        <div className="bg-orb bg-orb-cyan w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-8">
            <span className="text-sm font-semibold text-primary-400 uppercase tracking-wider">How It Works</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] mt-3">
              Four Simple <span className="gradient-text">Steps</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                  className="glass rounded-2xl p-6 group hover:border-primary-500/30 transition-all duration-500 relative">
                  <span className="absolute top-4 right-4 text-5xl font-black text-dark-800/50 font-[family-name:var(--font-display)]">{s.step}</span>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-bold text-dark-100 mb-2">{s.title}</h3>
                  <p className="text-sm text-dark-400 leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-10 md:py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-8">
            <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Features</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] mt-3">
              Built for <span className="gradient-text">Everyone</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="h-full group hover:border-primary/50 transition-all duration-500 bg-background/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 opacity-90 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl text-foreground">{f.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 md:py-12 relative">
        <div className="bg-orb bg-orb-blue w-[500px] h-[500px] top-0 left-1/4" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm text-dark-300 font-medium">Free for Citizens. Forever.</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] leading-tight">
              Ready to Go <span className="gradient-text">QueueLess</span>?
            </h2>
            <p className="text-dark-400 mt-4 text-lg max-w-2xl mx-auto">
              Join thousands who've already saved hours. It's free, fast, and works everywhere.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="rounded-full px-10 py-7 text-lg group bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20">
                <Link to="/join">
                  <QrCode className="mr-2 w-5 h-5" /> Join a Queue Now <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-10 py-7 text-lg border-2 border-primary/20 hover:bg-primary/5">
                <Link to="/register">Register as Provider</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
