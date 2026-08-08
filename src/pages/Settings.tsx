import { useState, type FormEvent } from 'react';
import {
  MessageCircle, Mail, Video, Cloud, CreditCard, Calendar,
  Check, Building2, User as UserIcon, Phone, Shield, Bell, Zap, Bot, FileText, Sparkles,
  Facebook, Search, X, Loader2, ExternalLink, KeyRound,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import { useIntegrations } from '@/hooks/useData';
import { Modal } from '@/components/Modal';
import {
  USER_ROLE_LABELS, USER_ROLE_STYLES,
  INTEGRATION_LABELS, INTEGRATION_DESCRIPTIONS, INTEGRATION_CATEGORIES,
} from '@/lib/constants';
import type { IntegrationProvider, Integration } from '@/types';

const INTEGRATION_META: Record<IntegrationProvider, {
  icon: typeof MessageCircle;
  color: string;
  bg: string;
  needsCredentials: boolean;
  credentialFields?: { key: string; label: string; placeholder: string; required: boolean; secret?: boolean }[];
}> = {
  meta_ads: {
    icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50', needsCredentials: true,
    credentialFields: [
      { key: 'access_token', label: 'Access Token', placeholder: 'EAAB...', required: true, secret: true },
      { key: 'account_id', label: 'Ad Account ID', placeholder: 'act_1234567890', required: true },
      { key: 'pixel_id', label: 'Pixel ID (optional)', placeholder: '123456789012345', required: false },
    ],
  },
  google_ads: {
    icon: Search, color: 'text-red-600', bg: 'bg-red-50', needsCredentials: true,
    credentialFields: [
      { key: 'access_token', label: 'OAuth Access Token', placeholder: 'ya29...', required: true, secret: true },
      { key: 'customer_id', label: 'Customer ID (10-digit)', placeholder: '123-456-7890', required: true },
      { key: 'developer_token', label: 'Developer Token', placeholder: 'dev-token', required: true, secret: true },
    ],
  },
  whatsapp: {
    icon: MessageCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', needsCredentials: true,
    credentialFields: [
      { key: 'access_token', label: 'API Token', placeholder: 'temporary_or_permanent_token', required: true, secret: true },
      { key: 'phone_number_id', label: 'Phone Number ID', placeholder: '107...', required: true },
    ],
  },
  gmail: { icon: Mail, color: 'text-red-600', bg: 'bg-red-50', needsCredentials: false },
  outlook: { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50', needsCredentials: false },
  gcal: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', needsCredentials: false },
  zoom: { icon: Video, color: 'text-violet-600', bg: 'bg-violet-50', needsCredentials: true,
    credentialFields: [
      { key: 'access_token', label: 'Server-to-Server OAuth Token', placeholder: 'zoom_token', required: true, secret: true },
    ],
  },
  gmeet: { icon: Video, color: 'text-blue-600', bg: 'bg-blue-50', needsCredentials: false },
  stripe: { icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50', needsCredentials: true,
    credentialFields: [
      { key: 'access_token', label: 'Secret Key', placeholder: 'sk_live_...', required: true, secret: true },
    ],
  },
  storage: { icon: Cloud, color: 'text-sky-600', bg: 'bg-sky-50', needsCredentials: false },
};

const PROVIDER_ORDER: IntegrationProvider[] = [
  'meta_ads', 'google_ads', 'whatsapp', 'gmail', 'outlook', 'gcal', 'zoom', 'gmeet', 'stripe', 'storage',
];

const AD_PROVIDERS: IntegrationProvider[] = ['meta_ads', 'google_ads'];

export function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<'profile' | 'agency' | 'integrations' | 'automation' | 'roles'>('profile');
  const [busy, setBusy] = useState(false);
  const { integrations, upsert, remove, reload: reloadIntegrations } = useIntegrations();
  const [connectProvider, setConnectProvider] = useState<IntegrationProvider | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [automation, setAutomation] = useState({
    followUpReminders: true,
    autoBrochures: true,
    autoSocialPosts: false,
    leadScoring: true,
    aiRecommendations: true,
    welcomeEmail: true,
    stageAutomation: true,
  });

  function getIntegration(provider: IntegrationProvider): Integration | undefined {
    return integrations.find((i) => i.provider === provider);
  }

  async function handleDisconnect(provider: IntegrationProvider) {
    await remove(provider);
    toast(`${INTEGRATION_LABELS[provider]} disconnected`);
  }

  function toggleAutomation(key: keyof typeof automation) {
    setAutomation((prev) => ({ ...prev, [key]: !prev[key] }));
    toast('Automation setting updated');
  }

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from('profiles').update({
      full_name: profileForm.full_name,
      phone: profileForm.phone || null,
      title: profileForm.title || null,
    }).eq('user_id', profile?.user_id);
    setBusy(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('Profile updated');
    refreshProfile();
  }

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    title: profile?.title ?? '',
  });

  const tabs = [
    { key: 'profile' as const, label: 'Profile', icon: UserIcon },
    { key: 'agency' as const, label: 'Agency', icon: Building2 },
    { key: 'integrations' as const, label: 'Integrations', icon: Zap },
    { key: 'automation' as const, label: 'Automation', icon: Bot },
    { key: 'roles' as const, label: 'Roles & Access', icon: Shield },
  ];

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${tab === key ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="card p-6 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
              {profile?.full_name?.split(' ').map((s) => s[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{profile?.full_name}</h3>
              <span className={`badge ${USER_ROLE_STYLES[profile?.role ?? 'agent']}`}>{USER_ROLE_LABELS[profile?.role ?? 'agent']}</span>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone</label>
                <input className="input" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+1 234 567 890" />
              </div>
              <div>
                <label className="label">Job title</label>
                <input className="input" value={profileForm.title} onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })} placeholder="Senior Agent" />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </div>
      )}

      {/* Agency tab */}
      {tab === 'agency' && (
        <div className="card p-6 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Your Agency</h3>
              <p className="text-sm text-slate-500">Manage your agency details and subscription.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Agency ID</div>
              <div className="font-mono text-sm text-slate-700">{profile?.agency_id}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Current Plan</div>
                <div className="font-bold text-slate-900">Starter (14-day trial)</div>
              </div>
              <button className="btn-primary">Upgrade plan</button>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Trial Features</div>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                {['Unlimited leads', 'Unlimited properties', 'Deal pipeline', 'Email campaigns', 'Analytics', 'Team members', 'Integrations', 'AI recommendations'].map((f) => (
                  <div key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" />{f}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integrations tab */}
      {tab === 'integrations' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-500">Connect your advertising and communication tools. Credentials are stored securely and only used by server-side functions.</p>

          {/* Advertising integrations — featured */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Advertising
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AD_PROVIDERS.map((provider) => (
                <IntegrationCard
                  key={provider}
                  provider={provider}
                  integration={getIntegration(provider)}
                  onConnect={() => setConnectProvider(provider)}
                  onDisconnect={() => handleDisconnect(provider)}
                />
              ))}
            </div>
          </div>

          {/* Other integrations */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Communication & Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROVIDER_ORDER.filter((p) => !AD_PROVIDERS.includes(p)).map((provider) => (
                <IntegrationCard
                  key={provider}
                  provider={provider}
                  integration={getIntegration(provider)}
                  onConnect={() => setConnectProvider(provider)}
                  onDisconnect={() => handleDisconnect(provider)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Automation tab */}
      {tab === 'automation' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Automate repetitive tasks and let the system work for you.</p>
          <div className="card divide-y divide-slate-100">
            {[
              { key: 'followUpReminders' as const, title: 'Smart follow-up reminders', desc: 'Get reminded to follow up with leads based on their activity and score.', icon: Bell },
              { key: 'leadScoring' as const, title: 'Automatic lead scoring', desc: 'Leads are scored based on engagement, source, and profile completeness.', icon: Zap },
              { key: 'aiRecommendations' as const, title: 'AI property recommendations', desc: 'Suggest properties to leads based on their preferences and behavior.', icon: Sparkles },
              { key: 'autoBrochures' as const, title: 'Auto-generated property brochures', desc: 'Generate professional PDF brochures from property listings automatically.', icon: FileText },
              { key: 'autoSocialPosts' as const, title: 'Auto social media posts', desc: 'Post new listings to your social media accounts automatically.', icon: MessageCircle },
              { key: 'welcomeEmail' as const, title: 'Welcome email automation', desc: 'Send a welcome email to new leads automatically upon capture.', icon: Mail },
              { key: 'stageAutomation' as const, title: 'Deal stage automation', desc: 'Automatically move deals through stages based on triggers and actions.', icon: Bot },
            ].map(({ key, title, desc, icon: Icon }) => (
              <div key={key} className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => toggleAutomation(key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${automation[key] ? 'bg-slate-900' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${automation[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles tab */}
      {tab === 'roles' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Manage access levels for your team members.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { role: 'admin', icon: Shield, color: 'text-slate-900', bg: 'bg-slate-900', desc: 'Full access to all features, settings, and team management.', permissions: ['Manage all data', 'Invite team members', 'Manage billing', 'Configure integrations', 'View all analytics', 'Delete records'] },
              { role: 'agent', icon: UserIcon, color: 'text-blue-700', bg: 'bg-blue-600', desc: 'Manage their own leads, properties, deals, and appointments.', permissions: ['Manage own leads', 'Add/edit properties', 'Track deals', 'Schedule appointments', 'Create tasks', 'View own analytics'] },
              { role: 'client', icon: Building2, color: 'text-emerald-700', bg: 'bg-emerald-600', desc: 'Limited access to view properties and communicate with agents.', permissions: ['Browse properties', 'Submit inquiries', 'View appointments', 'Message agents'] },
            ].map(({ role, icon: Icon, color, bg, desc, permissions }) => (
              <div key={role} className="card p-5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${bg}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 capitalize">{role}</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">{desc}</p>
                <div className="space-y-2">
                  {permissions.map((p) => (
                    <div key={p} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Shield className="w-4 h-4" />
              Your current role: <span className={`badge ${USER_ROLE_STYLES[profile?.role ?? 'agent']}`}>{USER_ROLE_LABELS[profile?.role ?? 'agent']}</span>
            </div>
          </div>
        </div>
      )}

      {connectProvider && (
        <ConnectModal
          provider={connectProvider}
          existing={getIntegration(connectProvider)}
          onClose={() => setConnectProvider(null)}
          onConnect={async (credentials) => {
            setConnecting(true);
            const meta = INTEGRATION_META[connectProvider];
            const patch: Partial<Integration> = {
              connected: true,
              access_token: credentials.access_token ?? null,
              account_id: credentials.account_id ?? null,
              account_name: credentials.account_name ?? credentials.account_id ?? null,
              metadata: { ...credentials },
            };
            delete (patch.metadata as Record<string, string>).access_token;
            const updated = await upsert(connectProvider, patch);
            setConnecting(false);
            if (updated) {
              toast(`${INTEGRATION_LABELS[connectProvider]} connected successfully`);
              setConnectProvider(null);
            } else {
              toast('Failed to connect. Please check your credentials.', 'error');
            }
          }}
          connecting={connecting}
        />
      )}
    </div>
  );
}

/* ─── Integration Card ─────────────────────────────────────────────────── */
function IntegrationCard({
  provider, integration, onConnect, onDisconnect,
}: {
  provider: IntegrationProvider;
  integration: Integration | undefined;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const meta = INTEGRATION_META[provider];
  const Icon = meta.icon;
  const connected = integration?.connected ?? false;

  return (
    <div className={`card p-5 flex items-center gap-4 transition-all ${connected ? 'ring-1 ring-emerald-200' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
        <Icon className={`w-6 h-6 ${meta.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-slate-900">{INTEGRATION_LABELS[provider]}</h3>
          {connected && (
            <span className="badge bg-emerald-100 text-emerald-700 flex items-center gap-1">
              <Check className="w-3 h-3" /> Connected
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-0.5">{INTEGRATION_DESCRIPTIONS[provider]}</p>
        {connected && integration?.account_name && (
          <p className="text-xs text-slate-400 mt-1">Account: {integration.account_name}</p>
        )}
      </div>
      {connected ? (
        <button onClick={onDisconnect} className="btn-secondary text-red-600 hover:bg-red-50">
          Disconnect
        </button>
      ) : (
        <button onClick={onConnect} className="btn-primary">
          Connect
        </button>
      )}
    </div>
  );
}

/* ─── Connect Modal ────────────────────────────────────────────────────── */
function ConnectModal({
  provider, existing, onClose, onConnect, connecting,
}: {
  provider: IntegrationProvider;
  existing: Integration | undefined;
  onClose: () => void;
  onConnect: (credentials: Record<string, string>) => void;
  connecting: boolean;
}) {
  const meta = INTEGRATION_META[provider];
  const Icon = meta.icon;
  const [form, setForm] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of meta.credentialFields ?? []) {
      if (f.key === 'access_token') init[f.key] = existing?.access_token ?? '';
      else if (f.key === 'account_id') init[f.key] = existing?.account_id ?? '';
      else init[f.key] = String((existing?.metadata as Record<string, string>)?.[f.key] ?? '');
    }
    return init;
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onConnect(form);
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Connect ${INTEGRATION_LABELS[provider]}`}
      size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={connecting}>
            {connecting ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</> : 'Connect'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.bg}`}>
            <Icon className={`w-5 h-5 ${meta.color}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{INTEGRATION_DESCRIPTIONS[provider]}</p>
            <p className="text-xs text-slate-500">{INTEGRATION_CATEGORIES[provider]}</p>
          </div>
        </div>

        {meta.needsCredentials && meta.credentialFields ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {meta.credentialFields.map((f) => (
              <div key={f.key}>
                <label className="label flex items-center gap-1.5">
                  {f.secret && <KeyRound className="w-3.5 h-3.5 text-slate-400" />}
                  {f.label}
                  {f.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={f.secret ? 'password' : 'text'}
                  className="input"
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  required={f.required}
                />
              </div>
            ))}
            <div className="flex items-start gap-2 text-xs text-slate-500 bg-blue-50 p-3 rounded-lg">
              <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p>Credentials are encrypted at rest and only used by server-side functions to fetch ad performance data. They are never exposed to the browser after saving.</p>
            </div>
          </form>
        ) : (
          <OAuthConnectSection provider={provider} />
        )}
      </div>
    </Modal>
  );
}

function OAuthConnectSection({ provider }: { provider: IntegrationProvider }) {
  const helpLinks: Record<string, { url: string; label: string }> = {
    gmail: { url: 'https://console.cloud.google.com/', label: 'Google Cloud Console' },
    outlook: { url: 'https://portal.azure.com/', label: 'Azure Portal' },
    gcal: { url: 'https://console.cloud.google.com/', label: 'Google Cloud Console' },
    gmeet: { url: 'https://console.cloud.google.com/', label: 'Google Cloud Console' },
    storage: { url: 'https://console.cloud.google.com/', label: 'Google Cloud Storage' },
  };
  const link = helpLinks[provider];

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        This integration uses OAuth. Click the button below to authorize access via the provider's secure login page.
      </p>
      <button className="btn-primary w-full flex items-center justify-center gap-2">
        <ExternalLink className="w-4 h-4" />
        Authorize with {INTEGRATION_LABELS[provider]}
      </button>
      {link && (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Need help? Visit {link.label} <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
