import { Check, ArrowRight, ChevronRight } from '@/lib/marketing-data';
import { features, detailedFeatures, images } from '@/lib/marketing-data';
import type { MarketingPage } from '@/components/MarketingLayout';

interface FeaturesPageProps {
  onGetStarted: () => void;
  onNavigate: (page: MarketingPage) => void;
}

export function FeaturesPage({ onGetStarted, onNavigate }: FeaturesPageProps) {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Features</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">Everything you need to close more deals</h1>
          <p className="text-lg text-slate-600">A complete toolkit for real estate teams — from lead capture to final signature, all in one place.</p>
        </div>
      </section>

      {/* Core features grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, longDesc }) => (
              <div key={title} className="card p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <Icon className="w-5.5 h-5.5 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">{longDesc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed feature sections */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Powerful tools under the hood</h2>
            <p className="text-lg text-slate-600">Deep capabilities that scale from solo agents to large brokerages.</p>
          </div>
          <div className="space-y-16">
            {detailedFeatures.map(({ icon: Icon, title, desc, points }, i) => (
              <div key={title} className={`grid lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-5">{desc}</p>
                  <ul className="space-y-2.5">
                    {points.map((p) => (
                      <li key={p} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-sm text-slate-700">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="rounded-2xl overflow-hidden shadow-xl h-[300px] bg-slate-100">
                    <img src={i % 3 === 0 ? images.agentMeeting : i % 3 === 1 ? images.teamMeeting : images.dealHandshake} alt={title} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">See it in action</h2>
          <p className="text-lg text-slate-400 mb-8">Start your 14-day free trial and explore every feature — no credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={onGetStarted} className="btn bg-white text-slate-900 hover:bg-slate-100 text-base px-6 py-3">Start free trial <ArrowRight className="w-5 h-5" /></button>
            <button onClick={() => onNavigate('pricing')} className="btn border border-slate-700 text-white hover:bg-slate-800 text-base px-6 py-3">View pricing</button>
          </div>
        </div>
      </section>
    </>
  );
}
