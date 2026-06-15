import { Link } from 'react-router-dom';
import { Zap, Globe, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-dark-800/60">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold font-[family-name:var(--font-display)]">
                <span className="text-white">Queue</span>
                <span className="gradient-text">Less</span>
              </span>
            </Link>
            <p className="text-sm text-dark-400 leading-relaxed">
              Eliminating wasted hours in physical queues by digitizing waiting lines for everyday services.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              {['How it Works', 'For Providers', 'Pricing', 'API Docs'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              {['About Us', 'Blog', 'Careers', 'Contact'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-dark-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-dark-500 flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> in India
          </p>
          <p className="text-sm text-dark-500">
            © {new Date().getFullYear()} QueueLess. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="p-2 rounded-lg text-dark-500 hover:text-dark-200 hover:bg-dark-800/50 transition-all duration-300">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg text-dark-500 hover:text-dark-200 hover:bg-dark-800/50 transition-all duration-300">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
