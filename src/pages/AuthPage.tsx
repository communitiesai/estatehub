import { useState, type FormEvent } from 'react';
import { Building2, Lock, Mail, User as UserIcon, Briefcase, ArrowRight, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error: err } = await signIn(email, password);
        if (err) setError(err);
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setBusy(false);
          return;
        }
        const { error: err } = await signUp(email, password, fullName, agencyName || undefined);
        if (err) setError(err);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-slate-900" />
            </div>
            <span className="text-xl font-bold tracking-tight">EstateHub</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              The all-in-one CRM for modern real estate teams
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Manage leads, listings, deals, and client relationships from a single, powerful platform.
            </p>
            <div className="space-y-4">
              {[
                { icon: Users, text: 'Capture & score leads from every channel' },
                { icon: TrendingUp, text: 'Track deals through your entire pipeline' },
                { icon: Sparkles, text: 'AI-powered property recommendations' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-4.5 h-4.5 text-blue-300" />
                  </div>
                  <span className="text-slate-200">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-slate-400">
            Trusted by 12,000+ agents worldwide
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">EstateHub</span>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {mode === 'signin'
                ? 'Sign in to your EstateHub workspace'
                : 'Start your 14-day free trial — no credit card required'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="label">Full name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      className="input pl-10"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Cooper"
                      required
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="label">Agency name <span className="text-slate-400 font-normal">(optional)</span></label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      className="input pl-10"
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder="Cooper Realty Group"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="input pl-10"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@agency.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="input pl-10"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3.5 py-2.5 animate-fadeIn">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy ? 'Please wait…' : (
                  <>
                    {mode === 'signin' ? 'Sign in' : 'Create account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => { setMode('signup'); setError(null); }} className="font-semibold text-slate-900 hover:underline">
                    Sign up free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => { setMode('signin'); setError(null); }} className="font-semibold text-slate-900 hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
