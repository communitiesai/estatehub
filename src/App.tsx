import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { AuthPage } from '@/pages/AuthPage';
import { Landing } from '@/pages/Landing';
import { AppLayout } from '@/components/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { LeadsPage } from '@/pages/Leads';
import { PropertiesPage } from '@/pages/Properties';
import { DealsPage } from '@/pages/Deals';
import { AppointmentsPage } from '@/pages/Appointments';
import { CalendarPage } from '@/pages/Calendar';
import { TasksPage } from '@/pages/Tasks';
import { AnalyticsPage } from '@/pages/Analytics';
import { CampaignsPage } from '@/pages/Campaigns';
import { MarketingPage } from '@/pages/Marketing';
import { TeamPage } from '@/pages/Team';
import { AttendancePage } from '@/pages/Attendance';
import { ContactsPage } from '@/pages/Contacts';
import { SettingsPage } from '@/pages/Settings';
import type { PageKey } from '@/lib/nav';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading your workspace…</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [page, setPage] = useState<PageKey>('dashboard');
  const [showAuth, setShowAuth] = useState(false);

  if (loading) return <LoadingScreen />;
  if (!user || !profile) {
    if (showAuth) return <AuthPage />;
    return (
      <Landing
        onGetStarted={() => setShowAuth(true)}
        onSignIn={() => setShowAuth(true)}
      />
    );
  }

  const pages: Record<PageKey, React.ReactNode> = {
    dashboard: <Dashboard onNavigate={setPage} />,
    leads: <LeadsPage />,
    properties: <PropertiesPage />,
    deals: <DealsPage />,
    appointments: <AppointmentsPage />,
    calendar: <CalendarPage />,
    tasks: <TasksPage />,
    analytics: <AnalyticsPage />,
    campaigns: <CampaignsPage />,
    marketing: <MarketingPage />,
    team: <TeamPage />,
    attendance: <AttendancePage />,
    contacts: <ContactsPage />,
    settings: <SettingsPage />,
  };

  return (
    <AppLayout current={page} onNavigate={setPage}>
      {pages[page]}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
