import { useState } from 'react';
import { Check, ArrowRight, ChevronRight, ChevronDown } from '@/lib/marketing-data';
import { steps, images, howFaq } from '@/lib/marketing-data';
import type { MarketingPage } from '@/components/MarketingLayout';

interface HowItWorksPageProps {
  onGetStarted: () => void;
  onNavigate: (page: MarketingPage) => void;
}

export function HowItWorksPage({ onGetStarted, onNavigate }: HowItWorksPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">How it works</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">From lead to close in three steps</h1>
          <p className="text-lg text-slate-600">Get set up in minutes, not weeks. EstateHub handles the heavy lifting so you can focus on relationships.</p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-20">
            {steps.map(({ icon: Icon, step, title, desc, points }, i) => (
              <div key={step} className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-blue-600" />
                    </div>
                    <span className="text-5xl font-bold text-slate-200">{step}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3">{title}</h2>
                  <p className="text-slate-600 leading-relaxed mb-6">{desc}</p>
                  <ul className="space-y-3">
                    {points.map((p) => (
                      <li key={p} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-sm text-slate-700">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="rounded-2xl overflow-hidden shadow-xl h-[320px]">
                    <img src={i === 0 ? images.agentsDiscussion : i === 1 ? images.agentMeeting : images.dealHandshake} alt={title} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase band */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src={images.teamPlanning} alt="Team planning" className="w-full h-[360px] object-cover" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Build trust at every touchpoint</h2>
              <p className="text-slate-600 leading-relaxed mb-6">Every call, email, viewing, and note is logged automatically. Your team always knows the full history of each client — so no conversation starts from scratch.</p>
              <ul className="space-y-3 mb-8">
                {['Timestamped notes on every lead', 'Automatic activity logging', 'Shared team visibility', 'Smart reminders for follow-ups'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => onNavigate('features')} className="btn-secondary">Explore all features <ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {howFaq.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-slate-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed animate-fadeIn">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Ready to get started?</h2>
          <p className="text-lg text-slate-400 mb-8">Set up your workspace in under 30 minutes. Import leads, connect portals, and start closing.</p>
          <button onClick={onGetStarted} className="btn bg-white text-slate-900 hover:bg-slate-100 text-base px-6 py-3">Start your free trial <ArrowRight className="w-5 h-5" /></button>
        </div>
      </section>
    </>
  );
}
