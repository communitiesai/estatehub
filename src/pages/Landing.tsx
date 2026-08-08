import { useState } from 'react';
import { MarketingLayout, type MarketingPage } from '@/components/MarketingLayout';
import { HomePage } from '@/pages/marketing/HomePage';
import { FeaturesPage } from '@/pages/marketing/FeaturesPage';
import { HowItWorksPage } from '@/pages/marketing/HowItWorksPage';
import { PricingPage } from '@/pages/marketing/PricingPage';
import { CustomersPage } from '@/pages/marketing/CustomersPage';

interface LandingProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function Landing({ onGetStarted, onSignIn }: LandingProps) {
  const [page, setPage] = useState<MarketingPage>('home');

  return (
    <MarketingLayout current={page} onNavigate={setPage} onGetStarted={onGetStarted} onSignIn={onSignIn}>
      {page === 'home' && <HomePage onGetStarted={onGetStarted} onNavigate={setPage} />}
      {page === 'features' && <FeaturesPage onGetStarted={onGetStarted} onNavigate={setPage} />}
      {page === 'how' && <HowItWorksPage onGetStarted={onGetStarted} onNavigate={setPage} />}
      {page === 'pricing' && <PricingPage onGetStarted={onGetStarted} onNavigate={setPage} />}
      {page === 'customers' && <CustomersPage onGetStarted={onGetStarted} onNavigate={setPage} />}
    </MarketingLayout>
  );
}
