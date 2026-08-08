import {
  ArrowRight, Check, Sparkles, TrendingUp, ChevronRight, Users, Building2,
  type LucideIcon,
} from '@/lib/marketing-data';
import { images, stats, features } from '@/lib/marketing-data';
import type { MarketingPage } from '@/components/MarketingLayout';

interface HomePageProps {
  onGetStarted: () => void;
  onNavigate: (page: MarketingPage) => void;
}

export function HomePage({ onGetStarted, onNavigate }: HomePageProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-emerald-100 rounded-full blur-[120px] opacity-40" />

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              AI-powered CRM for real estate
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Close more deals with{' '}
              <span className="text-blue-600">one platform</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
              EstateHub brings your leads, listings, deals, and client relationships into a single, powerful workspace. Built for modern real estate teams who move fast.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button onClick={onGetStarted} className="btn-primary text-base px-6 py-3">
                Start your free trial <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => onNavigate('how')} className="btn-secondary text-base px-6 py-3">
                See how it works
              </button>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 14-day free trial</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> No credit card</div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img src={images.hero} alt="Modern luxury home" className="w-full h-[440px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-xl border border-slate-100 p-4 w-48 hidden sm:block animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 leading-none">+40%</p>
                  <p className="text-xs text-slate-500 mt-1">More deals closed</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl border border-slate-100 p-3.5 w-52 hidden sm:block animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">RS</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-none">New lead</p>
                  <p className="text-xs text-slate-400 mt-0.5">Hot score · 85</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Ready to contact
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-white mb-1">{s.value}</p>
                <p className="text-sm text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature preview */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Everything you need</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">One platform for your entire workflow</h2>
            <p className="text-lg text-slate-600">From the first hello to the final handshake — manage it all without switching tabs.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <Icon className="w-5.5 h-5.5 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => onNavigate('features')} className="btn-primary">
              Explore all features <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Showcase</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Your listings, beautifully presented</h2>
            <p className="text-lg text-slate-400">Present every property with rich media that makes buyers fall in love before the viewing.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="md:col-span-2 rounded-2xl overflow-hidden group relative h-[320px]">
              <img src={images.nightHome} alt="Luxury home at night" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="badge bg-emerald-500 text-white mb-2">Available</span>
                <h3 className="text-xl font-bold">Hillside Villa</h3>
                <p className="text-sm text-slate-300">₹4.2 Cr · 5 Bed · 6,500 sq ft</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden group relative h-[320px]">
              <img src={images.apartments} alt="Modern apartments" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="badge bg-blue-500 text-white mb-2">For Rent</span>
                <h3 className="text-xl font-bold">City Apartments</h3>
                <p className="text-sm text-slate-300">₹85K/mo · 3 Bed · 1,800 sq ft</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden group relative h-[240px]">
              <img src={images.twoStory} alt="Two-story home" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="badge bg-emerald-500 text-white mb-1.5">Available</span>
                <h3 className="text-lg font-bold">Garden Estate</h3>
                <p className="text-xs text-slate-300">₹2.8 Cr · 4 Bed</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden group relative h-[240px]">
              <img src={images.cottage} alt="Modern cottage" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="badge bg-amber-500 text-white mb-1.5">Reserved</span>
                <h3 className="text-lg font-bold">Cottage Retreat</h3>
                <p className="text-xs text-slate-300">₹1.9 Cr · 3 Bed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-5">Ready to transform your real estate business?</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">Join 12,000+ agents who close more deals with EstateHub. Set up in minutes — no setup fees, no contracts.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={onGetStarted} className="btn-primary text-base px-6 py-3">Start your free trial <ArrowRight className="w-5 h-5" /></button>
            <button onClick={() => onNavigate('pricing')} className="btn-secondary text-base px-6 py-3">View pricing</button>
          </div>
        </div>
      </section>
    </>
  );
}
