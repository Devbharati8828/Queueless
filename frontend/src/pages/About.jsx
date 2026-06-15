import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Users, Globe, Heart, Target, Lightbulb, ArrowRight, Shield, Wifi } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } })
};

const values = [
  { icon: Users, title: 'People First', desc: 'Built for everyday citizens, not enterprises.' },
  { icon: Globe, title: 'Universal Access', desc: 'Works for clinics, banks, government offices.' },
  { icon: Shield, title: 'Privacy by Design', desc: 'No personal data required to join a queue.' },
  { icon: Wifi, title: 'Offline Ready', desc: 'Works even in areas with poor connectivity.' },
];

const team = [
  { name: 'Aarav Patel', role: 'Founder & CEO', emoji: '👨‍💻' },
  { name: 'Priya Sharma', role: 'Lead Designer', emoji: '🎨' },
  { name: 'Rahul Verma', role: 'Backend Engineer', emoji: '⚙️' },
  { name: 'Sneha Gupta', role: 'Mobile Developer', emoji: '📱' },
];

export default function About() {
  return (
    <div className="relative overflow-hidden w-full">
      <div className="bg-orb bg-orb-blue w-[600px] h-[600px] -top-40 -right-40" />

      {/* Hero */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span className="text-sm text-dark-300 font-medium">Our Story</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-display)] leading-tight">
              We're Building a <span className="gradient-text">Queue-Free</span> World
            </h1>
            <p className="text-dark-400 mt-6 text-lg max-w-2xl mx-auto leading-relaxed">
              QueueLess was born from a simple frustration: why do billions of people still waste hours 
              standing in physical queues when technology can solve this?
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="glass rounded-2xl p-8">
              <Target className="w-8 h-8 text-primary-400 mb-4" />
              <h3 className="text-xl font-bold text-dark-100 mb-3">Our Mission</h3>
              <p className="text-dark-400 leading-relaxed">
                To eliminate wasted hours in physical queues by creating a universal, free, 
                and open-source digital queue management protocol accessible to every citizen.
              </p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="glass rounded-2xl p-8">
              <Lightbulb className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-xl font-bold text-dark-100 mb-3">Our Vision</h3>
              <p className="text-dark-400 leading-relaxed">
                To become the universal queue protocol — the "Google Calendar of queues" — 
                adopted by millions of service providers worldwide.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">Our <span className="gradient-text">Values</span></h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={v.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                  className="glass rounded-2xl p-6 text-center group hover:border-primary-500/20 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="font-bold text-dark-100 mb-2">{v.title}</h3>
                  <p className="text-xs text-dark-400 leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">The <span className="gradient-text">Team</span></h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {team.map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="glass rounded-2xl p-6 text-center hover:border-primary-500/20 transition-all">
                <span className="text-4xl mb-3 block">{t.emoji}</span>
                <h3 className="font-bold text-dark-100">{t.name}</h3>
                <p className="text-xs text-dark-400 mt-1">{t.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-4">
              Join the <span className="gradient-text">Movement</span>
            </h2>
            <p className="text-dark-400 mb-8">Help us build a world where no one wastes time in queues.</p>
            <Link to="/join" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2 group">
              <Zap className="w-5 h-5" /> Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
