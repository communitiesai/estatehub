import { ArrowRight, Star, Quote, Check } from '@/lib/marketing-data';
import { testimonials, caseStudies, stats, images } from '@/lib/marketing-data';
import type { MarketingPage } from '@/components/MarketingLayout';

interface CustomersPageProps {
  onGetStarted: () => void;
  onNavigate: (page: MarketingPage) => void;
}

export function CustomersPage({ onGetStarted }: CustomersPageProps) {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Customers</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">Loved by agents across India</h1>
          <p className="text-lg text-slate-600">Join 12,000+ real estate professionals who trust EstateHub to run their business.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-slate-900 mb-1">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-4">What our customers say</h2>
            <p className="text-lg text-slate-600">Real stories from real estate professionals who transformed their business.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-6 flex flex-col">
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-slate-700 leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  {t.img ? (
                    <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                      {t.avatar}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case studies */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Success stories</h2>
            <p className="text-lg text-slate-600">How agencies transformed their operations with EstateHub.</p>
          </div>
          <div className="space-y-8">
            {caseStudies.map((cs) => (
              <div key={cs.agency} className="card overflow-hidden grid md:grid-cols-5 gap-0">
                <div className="md:col-span-2 h-[240px] md:h-auto">
                  <img src={cs.img} alt={cs.agency} className="w-full h-full object-cover" />
                </div>
                <div className="md:col-span-3 p-7 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{cs.location}</span>
                    <span className="text-xs text-slate-500">{cs.agents} agents</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{cs.agency}</h3>
                  <div className="space-y-3 mb-5">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Challenge</p>
                      <p className="text-sm text-slate-600">{cs.challenge}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Solution</p>
                      <p className="text-sm text-slate-600">{cs.solution}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">{cs.stat}</p>
                      <p className="text-xs text-slate-500">{cs.statLabel}</p>
                    </div>
                    <p className="text-sm text-slate-600 flex-1">{cs.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logo wall */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">Trusted by leading agencies</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            {['Sharma Realty', 'Horizon Properties', 'Patel & Co', 'Mehta Group', 'Singh Estates', 'Gupta Realty'].map((name) => (
              <div key={name} className="text-center text-slate-300 font-bold text-sm">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Join 12,000+ agents</h2>
          <p className="text-lg text-slate-400 mb-8">Become the next success story. Start your free trial today.</p>
          <button onClick={onGetStarted} className="btn bg-white text-slate-900 hover:bg-slate-100 text-base px-6 py-3">Start your free trial <ArrowRight className="w-5 h-5" /></button>
        </div>
      </section>
    </>
  );
}
