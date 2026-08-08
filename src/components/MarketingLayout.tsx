import { useState, useEffect, type ReactNode } from 'react';
import { Building2, ArrowRight, Menu, X, Mail, Phone, MapPin } from 'lucide-react';
import { ChatBot } from '@/components/ChatBot';

export type MarketingPage = 'home' | 'features' | 'how' | 'pricing' | 'customers';

interface MarketingLayoutProps {
  current: MarketingPage;
  onNavigate: (page: MarketingPage) => void;
  onGetStarted: () => void;
  onSignIn: () => void;
  children: ReactNode;
}

const navLinks: { key: MarketingPage; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'features', label: 'Features' },
  { key: 'how', label: 'How it works' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'customers', label: 'Customers' },
];

export function MarketingLayout({ current, onNavigate, onGetStarted, onSignIn, children }: MarketingLayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [current]);

  function go(page: MarketingPage) {
    onNavigate(page);
    setMobileMenu(false);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-transparent'}`}>
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => go('home')} className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">EstateHub</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => go(link.key)}
                className={`text-sm font-medium transition-colors ${current === link.key ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={onSignIn} className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 transition-colors">
              Sign in
            </button>
            <button onClick={onGetStarted} className="btn-primary text-sm">
              Get started free <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-slate-700">
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {mobileMenu && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 animate-fadeIn">
            {navLinks.map((link) => (
              <button key={link.key} onClick={() => go(link.key)} className="block w-full text-left text-sm font-medium text-slate-600 py-2">
                {link.label}
              </button>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button onClick={onSignIn} className="btn-secondary w-full">Sign in</button>
              <button onClick={onGetStarted} className="btn-primary w-full">Get started free</button>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="bg-slate-950 text-slate-400 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-900" />
                </div>
                <span className="text-lg font-bold text-white">EstateHub</span>
              </div>
              <p className="text-sm leading-relaxed">The all-in-one CRM built for modern real estate teams. Close more deals, faster.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm">
                <li><button onClick={() => go('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => go('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => go('how')} className="hover:text-white transition-colors">How it works</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm">
                <li><button onClick={() => go('customers')} className="hover:text-white transition-colors">Customers</button></li>
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@estatehub.com</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 80 4567 8900</li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Bangalore, India</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">© 2026 EstateHub. All rights reserved.</p>
            <div className="flex items-center gap-6 text-xs">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}
