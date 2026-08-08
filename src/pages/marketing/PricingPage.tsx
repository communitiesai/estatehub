import { useState } from 'react';
import { Check, ArrowRight, ChevronDown } from '@/lib/marketing-data';
import { pricingPlans, pricingComparison, pricingFaq } from '@/lib/marketing-data';
import type { MarketingPage } from '@/components/MarketingLayout';

interface PricingPageProps {
  onGetStarted: () => void;
  onNavigate: (page: MarketingPage) => void;
}

export function PricingPage({ onGetStarted }: PricingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">Simple, transparent pricing</h1>
          <p className="text-lg text-slate-600">Start free for 14 days. No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-7 flex flex-col ${
                  plan.highlight
                    ? 'bg-slate-900 text-white shadow-2xl lg:scale-105 border border-slate-800'
                    : 'bg-white border border-slate-200 shadow-sm'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <p className={`text-sm mb-5 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-blue-400' : 'text-emerald-500'}`} />
                      <span className={plan.highlight ? 'text-slate-300' : 'text-slate-700'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className={plan.highlight ? 'btn bg-blue-600 text-white hover:bg-blue-500 w-full' : 'btn-secondary w-full'}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Compare plans</h2>
            <p className="text-lg text-slate-600">Everything included in each plan, side by side.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">Feature</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-slate-900">Starter</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-blue-600">Professional</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-slate-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {pricingComparison.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                    <td className="py-3.5 px-4 text-sm font-medium text-slate-700">{row.feature}</td>
                    <td className="py-3.5 px-4 text-center text-sm text-slate-500">{row.starter}</td>
                    <td className="py-3.5 px-4 text-center text-sm font-semibold text-blue-600">{row.pro}</td>
                    <td className="py-3.5 px-4 text-center text-sm text-slate-500">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Pricing FAQ</h2>
          </div>
          <div className="space-y-3">
            {pricingFaq.map((faq, i) => (
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
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Still have questions?</h2>
          <p className="text-lg text-slate-400 mb-8">Start your free trial today. No credit card, no commitment — just 14 days of full access.</p>
          <button onClick={onGetStarted} className="btn bg-white text-slate-900 hover:bg-slate-100 text-base px-6 py-3">Start your free trial <ArrowRight className="w-5 h-5" /></button>
        </div>
      </section>
    </>
  );
}
