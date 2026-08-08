import { useState, type ReactNode } from 'react';
import { Building2, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NAV_ITEMS, type PageKey } from '@/lib/nav';
import { Avatar } from '@/components/Avatar';
import { USER_ROLE_LABELS, USER_ROLE_STYLES } from '@/lib/constants';
import { ChatBot } from '@/components/ChatBot';

interface LayoutProps {
  current: PageKey;
  onNavigate: (page: PageKey) => void;
  children: ReactNode;
}

export function AppLayout({ current, onNavigate, children }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const agencyName = profile?.agency_id ? 'Your Agency' : 'EstateHub';

  const handleNav = (key: PageKey) => {
    onNavigate(key);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - desktop */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-800 flex-shrink-0">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-slate-900" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white leading-tight">EstateHub</div>
            <div className="text-xs text-slate-400 truncate">{agencyName}</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = current === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`nav-item w-full ${active ? 'nav-item-active' : ''}`}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 flex-shrink-0">
          <div className="rounded-lg bg-slate-800 p-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Plan</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Starter</span>
              <span className="badge bg-blue-500 text-white">14d trial</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600 hover:text-slate-900 p-1.5 hover:bg-slate-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 capitalize">
              {NAV_ITEMS.find((n) => n.key === current)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 hover:bg-slate-100 rounded-lg p-1.5 pr-2 transition-colors"
              >
                <Avatar name={profile?.full_name ?? 'User'} src={profile?.avatar_url} size="sm" />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-slate-900 leading-tight">{profile?.full_name ?? 'User'}</div>
                  <div className="text-xs text-slate-400">{USER_ROLE_LABELS[profile?.role ?? 'agent']}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 card p-2 z-40 animate-scaleIn">
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <Avatar name={profile?.full_name ?? 'User'} src={profile?.avatar_url} size="md" />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name ?? 'User'}</div>
                          <div className="text-xs text-slate-400 truncate">{profile?.title ?? 'Real Estate Agent'}</div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`badge ${USER_ROLE_STYLES[profile?.role ?? 'agent']}`}>
                          {USER_ROLE_LABELS[profile?.role ?? 'agent']}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setMenuOpen(false); signOut(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto animate-fadeIn">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar close button */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed top-4 right-4 z-50 lg:hidden text-white p-2"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <ChatBot />
    </div>
  );
}
