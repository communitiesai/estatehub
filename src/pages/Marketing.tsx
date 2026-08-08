import { useState, useMemo, useEffect, useCallback, type FormEvent } from 'react';
import {
  Megaphone, Facebook, Search, Mail, MessageSquare, Send, Plus, Calendar as CalIcon,
  TrendingUp, Eye, MousePointerClick, Target, DollarSign, Users, Zap, Loader2,
  Trash2, Edit3, MoreHorizontal, Image as ImageIcon, Link2, Clock, Check,
  BarChart3, ArrowRight, Sparkles, Newspaper, Share2,
} from 'lucide-react';
import { useLeads, useCampaigns, useIntegrations, useSocialPosts, useProperties } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/lib/supabase';
import {
  formatCurrency, formatCompact, formatDate,
  LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS,
  CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_STYLES,
  SOCIAL_PLATFORMS, SOCIAL_PLATFORM_LABELS, SOCIAL_PLATFORM_COLORS,
  SOCIAL_POST_STATUS_LABELS, SOCIAL_POST_STATUS_STYLES, SOCIAL_POST_STATUSES,
} from '@/lib/constants';
import type { AdCampaign, SocialPlatform, SocialPostStatus, SocialPost, LeadSource, Campaign } from '@/types';

type MarketingTab = 'overview' | 'ads' | 'social' | 'sources';

export function MarketingPage() {
  const [tab, setTab] = useState<MarketingTab>('overview');

  const tabs: { key: MarketingTab; label: string; icon: typeof Megaphone }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'ads', label: 'Ad Campaigns', icon: Zap },
    { key: 'social', label: 'Social Media', icon: Share2 },
    { key: 'sources', label: 'Lead Sources', icon: Target },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-slate-700" /> Marketing
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage ad campaigns, social media, and track lead source ROI — all in one place.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab onNavigate={setTab} />}
      {tab === 'ads' && <AdsTab />}
      {tab === 'social' && <SocialTab />}
      {tab === 'sources' && <SourcesTab />}
    </div>
  );
}

/* ─── Overview Tab ─────────────────────────────────────────────────────── */
function OverviewTab({ onNavigate }: { onNavigate: (t: MarketingTab) => void }) {
  const { leads } = useLeads();
  const { campaigns } = useCampaigns();
  const { posts } = useSocialPosts();
  const { integrations } = useIntegrations();

  const adIntegrations = integrations.filter(
    (i) => (i.provider === 'meta_ads' || i.provider === 'google_ads') && i.connected,
  );
  const sentCampaigns = campaigns.filter((c) => c.status === 'sent');
  const totalEmailsSent = sentCampaigns.reduce((s, c) => s + c.sent_count, 0);
  const totalOpens = sentCampaigns.reduce((s, c) => s + c.open_count, 0);
  const avgOpenRate = totalEmailsSent > 0 ? (totalOpens / totalEmailsSent) * 100 : 0;
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled').length;
  const publishedPosts = posts.filter((p) => p.status === 'published').length;

  const leadsBySource = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of leads) { map[l.source] = (map[l.source] ?? 0) + 1; }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  const topSource = leadsBySource[0];

  const cards = [
    {
      label: 'Ad Integrations', value: adIntegrations.length, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50',
      sub: adIntegrations.length > 0 ? `${adIntegrations.map((i) => i.provider === 'meta_ads' ? 'Meta' : 'Google').join(', ')}` : 'Not connected',
      tab: 'ads' as MarketingTab,
    },
    {
      label: 'Campaigns Sent', value: sentCampaigns.length, icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50',
      sub: `${totalEmailsSent} emails delivered`, tab: undefined,
    },
    {
      label: 'Avg Open Rate', value: `${avgOpenRate.toFixed(0)}%`, icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50',
      sub: `${totalOpens} total opens`, tab: undefined,
    },
    {
      label: 'Social Posts', value: publishedPosts + scheduledPosts, icon: Share2, color: 'text-pink-600', bg: 'bg-pink-50',
      sub: `${scheduledPosts} scheduled, ${publishedPosts} published`, tab: 'social' as MarketingTab,
    },
  ];

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(({ label, value, icon: Icon, color, bg, sub, tab }) => (
          <button
            key={label}
            onClick={() => tab && onNavigate(tab)}
            disabled={!tab}
            className={`card p-4 text-left ${tab ? 'hover:shadow-md cursor-pointer transition-all' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">{sub}</p>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          icon={Zap} title="Ad Campaigns" desc={adIntegrations.length > 0 ? 'View live ad performance from Meta & Google' : 'Connect Meta or Google Ads to track performance'}
          color="text-amber-600" bg="bg-amber-50" onClick={() => onNavigate('ads')}
        />
        <QuickActionCard
          icon={Share2} title="Schedule a Post" desc="Plan and schedule social media content across platforms"
          color="text-pink-600" bg="bg-pink-50" onClick={() => onNavigate('social')}
        />
        <QuickActionCard
          icon={Target} title="Lead Source ROI" desc={topSource ? `Top source: ${LEAD_SOURCE_LABELS[topSource[0] as LeadSource] ?? topSource[0]} (${topSource[1]} leads)` : 'See which channels drive the most leads'}
          color="text-emerald-600" bg="bg-emerald-50" onClick={() => onNavigate('sources')}
        />
      </div>

      {/* Lead source mini chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" /> Lead Source Distribution
          </h3>
          <button onClick={() => onNavigate('sources')} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
            View details <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {leadsBySource.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No leads yet.</p>
        ) : (
          <div className="space-y-2.5">
            {leadsBySource.slice(0, 6).map(([source, count]) => {
              const pct = leads.length > 0 ? (count / leads.length) * 100 : 0;
              return (
                <div key={source} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-slate-600 truncate">
                    {LEAD_SOURCE_LABELS[source as LeadSource] ?? source}
                  </div>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-12 text-sm font-semibold text-slate-900 text-right">{count}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickActionCard({
  icon: Icon, title, desc, color, bg, onClick,
}: {
  icon: typeof Megaphone; title: string; desc: string; color: string; bg: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="card p-5 text-left hover:shadow-md transition-all group">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
        {title}
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
      </h3>
      <p className="text-sm text-slate-500">{desc}</p>
    </button>
  );
}

/* ─── Ad Campaigns Tab ─────────────────────────────────────────────────── */
function AdsTab() {
  const { integrations } = useIntegrations();
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<'all' | 'meta' | 'google'>('all');

  const hasAdIntegration = integrations.some(
    (i) => (i.provider === 'meta_ads' || i.provider === 'google_ads') && i.connected,
  );

  const loadCampaigns = useCallback(async () => {
    if (!hasAdIntegration) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ads-analytics`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      if (!resp.ok) throw new Error(`Failed to load ad data (${resp.status})`);
      const json = await resp.json();
      if (json.error) throw new Error(json.error);
      setCampaigns(json.campaigns ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [hasAdIntegration]);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const filtered = useMemo(
    () => platformFilter === 'all' ? campaigns : campaigns.filter((c) => c.platform === platformFilter),
    [campaigns, platformFilter],
  );

  const totals = useMemo(() => filtered.reduce((acc, c) => ({
    spend: acc.spend + c.spend, impressions: acc.impressions + c.impressions,
    clicks: acc.clicks + c.clicks, conversions: acc.conversions + c.conversions,
  }), { spend: 0, impressions: 0, clicks: 0, conversions: 0 }), [filtered]);

  const avgCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  const avgCpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;

  if (!hasAdIntegration) {
    return (
      <div className="card p-6">
        <EmptyState
          icon={<Zap className="w-6 h-6" />}
          title="No ad integrations connected"
          description="Connect Meta Ads or Google Ads in Settings to see live campaign performance — spend, impressions, clicks, conversions, CTR, CPC, and CPA."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Spend', value: formatCurrency(totals.spend), icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Impressions', value: formatCompact(totals.impressions), icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Clicks', value: formatCompact(totals.clicks), icon: MousePointerClick, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Conversions', value: String(totals.conversions), icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <div className="text-lg font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Derived metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <div className="text-lg font-bold text-slate-900">{avgCtr.toFixed(2)}%</div>
          <div className="text-xs text-slate-400">Avg CTR</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-lg font-bold text-slate-900">{formatCurrency(avgCpc)}</div>
          <div className="text-xs text-slate-400">Avg CPC</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-lg font-bold text-slate-900">{formatCurrency(avgCpa)}</div>
          <div className="text-xs text-slate-400">Avg CPA</div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2">
        {[
          { key: 'all' as const, label: 'All Platforms' },
          { key: 'meta' as const, label: 'Meta', icon: Facebook },
          { key: 'google' as const, label: 'Google', icon: Search },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setPlatformFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              platformFilter === key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />} {label}
          </button>
        ))}
      </div>

      {/* Campaign table */}
      {loading ? (
        <div className="card p-8 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading campaigns…
        </div>
      ) : error ? (
        <div className="card p-6 text-center">
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <button onClick={loadCampaigns} className="btn-secondary text-xs">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-6 text-center text-sm text-slate-400">No campaigns found.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Campaign</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Platform</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Spend</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Impr.</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Clicks</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">CTR</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Conv.</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">CPA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className={`badge flex items-center gap-1 w-fit ${
                      c.platform === 'meta' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {c.platform === 'meta' ? <Facebook className="w-3 h-3" /> : <Search className="w-3 h-3" />}
                      {c.platform === 'meta' ? 'Meta' : 'Google'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${
                      c.status === 'active' ? 'bg-emerald-100 text-emerald-700'
                      : c.status === 'paused' ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(c.spend)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCompact(c.impressions)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCompact(c.clicks)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{c.ctr.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right text-slate-600">{c.conversions}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{c.cpa > 0 ? formatCurrency(c.cpa) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Social Media Tab ─────────────────────────────────────────────────── */
function SocialTab() {
  const { posts, loading, create, update, remove } = useSocialPosts();
  const { properties } = useProperties();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SocialPost | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    const ok = await remove(deleteId);
    if (ok) toast('Post deleted');
    setDeleteId(null);
  }

  async function publishNow(post: SocialPost) {
    const updated = await update(post.id, { status: 'published', published_at: new Date().toISOString() });
    if (updated) toast('Post published');
  }

  const stats = useMemo(() => ({
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    published: posts.filter((p) => p.status === 'published').length,
    drafts: posts.filter((p) => p.status === 'draft').length,
    failed: posts.filter((p) => p.status === 'failed').length,
  }), [posts]);

  return (
    <div className="space-y-5" onClick={() => setMenuId(null)}>
      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {[
          { label: 'Scheduled', value: stats.scheduled, icon: CalIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Published', value: stats.published, icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Drafts', value: stats.drafts, icon: Edit3, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Failed', value: stats.failed, icon: Target, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">{value}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Schedule and manage social media posts across Facebook, Instagram, LinkedIn, Twitter, and more.</p>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-slate-400 text-sm">Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Share2 className="w-6 h-6" />}
            title="No social posts yet"
            description="Create your first post to schedule it across multiple social media platforms."
            action={<button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4" /> New Post</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((p) => (
            <div key={p.id} className="card p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <span className={`badge ${SOCIAL_POST_STATUS_STYLES[p.status]}`}>
                    {SOCIAL_POST_STATUS_LABELS[p.status]}
                  </span>
                  {p.scheduled_at && (
                    <span className="text-xs text-slate-400 ml-2 flex items-center gap-1 inline-flex">
                      <Clock className="w-3 h-3" /> {formatDate(p.scheduled_at)}
                    </span>
                  )}
                </div>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setMenuId(menuId === p.id ? null : p.id)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {menuId === p.id && (
                    <div className="absolute right-0 top-full mt-1 w-36 card p-1.5 z-20 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditing(p); setShowForm(true); setMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md">
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                      {(p.status === 'draft' || p.status === 'scheduled') && (
                        <button onClick={() => { publishNow(p); setMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-md">
                          <Send className="w-4 h-4" /> Publish now
                        </button>
                      )}
                      <button onClick={() => { setDeleteId(p.id); setMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-700 line-clamp-3 mb-3">{p.content}</p>

              {p.image_url && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <img src={p.image_url} alt="" className="w-full h-32 object-cover" />
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {p.platforms.map((plat) => (
                  <span key={plat} className={`badge ${SOCIAL_PLATFORM_COLORS[plat]}`}>
                    {SOCIAL_PLATFORM_LABELS[plat]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <SocialPostForm
          post={editing}
          properties={properties}
          onClose={() => setShowForm(false)}
          onSave={async (data) => {
            if (editing) {
              const updated = await update(editing.id, data);
              if (updated) { toast('Post updated'); setShowForm(false); }
            } else {
              const created = await create(data);
              if (created) { toast('Post created'); setShowForm(false); }
            }
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete post?"
        message="This will permanently remove the social media post."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function SocialPostForm({
  post, properties, onClose, onSave,
}: {
  post: SocialPost | null;
  properties: { id: string; title: string }[];
  onClose: () => void;
  onSave: (data: {
    content: string;
    platforms: SocialPlatform[];
    image_url: string | null;
    link_url: string | null;
    property_id: string | null;
    status: SocialPostStatus;
    scheduled_at: string | null;
  }) => void;
}) {
  const [content, setContent] = useState(post?.content ?? '');
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(post?.platforms ?? []);
  const [imageUrl, setImageUrl] = useState(post?.image_url ?? '');
  const [linkUrl, setLinkUrl] = useState(post?.link_url ?? '');
  const [propertyId, setPropertyId] = useState(post?.property_id ?? '');
  const [status, setStatus] = useState<SocialPostStatus>(post?.status ?? 'draft');
  const [scheduledAt, setScheduledAt] = useState(
    post?.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : '',
  );
  const [busy, setBusy] = useState(false);

  function togglePlatform(p: SocialPlatform) {
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    if (platforms.length === 0) return;
    setBusy(true);
    onSave({
      content: content.trim(),
      platforms,
      image_url: imageUrl.trim() || null,
      link_url: linkUrl.trim() || null,
      property_id: propertyId || null,
      status,
      scheduled_at: status === 'scheduled' && scheduledAt ? new Date(scheduledAt).toISOString() : null,
    });
    setBusy(false);
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={post ? 'Edit Post' : 'New Social Post'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={busy || !content.trim() || platforms.length === 0}>
            {busy ? 'Saving…' : post ? 'Save changes' : 'Create post'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Content *</label>
          <textarea
            className="input min-h-[100px] resize-y"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content…"
            required
          />
          <p className="text-xs text-slate-400 mt-1">{content.length} characters</p>
        </div>

        <div>
          <label className="label">Platforms *</label>
          <div className="flex flex-wrap gap-2">
            {SOCIAL_PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={`badge px-3 py-1.5 cursor-pointer transition-all ${
                  platforms.includes(p) ? SOCIAL_PLATFORM_COLORS[p] : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {SOCIAL_PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Image URL</label>
            <input className="input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> Link URL</label>
            <input className="input" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" />
          </div>
        </div>

        <div>
          <label className="label">Link to property (optional)</label>
          <select className="input" value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
            <option value="">None</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as SocialPostStatus)}>
              {SOCIAL_POST_STATUSES.map((s) => <option key={s} value={s}>{SOCIAL_POST_STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          {status === 'scheduled' && (
            <div>
              <label className="label">Schedule for</label>
              <input type="datetime-local" className="input" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

/* ─── Lead Sources Tab ─────────────────────────────────────────────────── */
function SourcesTab() {
  const { leads } = useLeads();
  const { campaigns } = useCampaigns();

  const sourceData = useMemo(() => {
    const map: Record<string, { count: number; converted: number; hot: number }> = {};
    for (const l of leads) {
      if (!map[l.source]) map[l.source] = { count: 0, converted: 0, hot: 0 };
      map[l.source].count++;
      if (l.status === 'converted') map[l.source].converted++;
      if (l.score >= 75) map[l.source].hot++;
    }
    return Object.entries(map)
      .map(([source, d]) => ({
        source,
        ...d,
        conversionRate: d.count > 0 ? (d.converted / d.count) * 100 : 0,
        hotRate: d.count > 0 ? (d.hot / d.count) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  const maxCount = sourceData[0]?.count ?? 1;

  const emailCampaigns = campaigns.filter((c) => c.channel === 'email' && c.status === 'sent');

  return (
    <div className="space-y-5">
      {/* Lead source breakdown */}
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-600" /> Lead Source Performance
        </h3>
        {sourceData.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No leads yet to analyze.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-3 py-2.5 font-semibold text-slate-600">Source</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">Leads</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">Hot Leads</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">Converted</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">Conv. Rate</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600" style={{ minWidth: 120 }}>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {sourceData.map(({ source, count, hot, converted, conversionRate }) => (
                  <tr key={source} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3">
                      <span className="badge bg-slate-100 text-slate-600">
                        {LEAD_SOURCE_LABELS[source as LeadSource] ?? source}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-slate-900">{count}</td>
                    <td className="px-3 py-3 text-right text-slate-600">{hot}</td>
                    <td className="px-3 py-3 text-right text-slate-600">{converted}</td>
                    <td className="px-3 py-3 text-right">
                      <span className="font-semibold text-slate-900">{conversionRate.toFixed(0)}%</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email campaign performance */}
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-600" /> Email Campaign Performance
        </h3>
        {emailCampaigns.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No sent email campaigns yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-3 py-2.5 font-semibold text-slate-600">Campaign</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">Sent</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">Opens</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">Open Rate</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">Clicks</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">Click Rate</th>
                </tr>
              </thead>
              <tbody>
                {emailCampaigns.map((c: Campaign) => {
                  const openRate = c.sent_count > 0 ? (c.open_count / c.sent_count) * 100 : 0;
                  const clickRate = c.sent_count > 0 ? (c.click_count / c.sent_count) * 100 : 0;
                  return (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3 font-medium text-slate-900">{c.name}</td>
                      <td className="px-3 py-3 text-right text-slate-600">{c.sent_count}</td>
                      <td className="px-3 py-3 text-right text-slate-600">{c.open_count}</td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${openRate}%` }} />
                          </div>
                          <span className="font-semibold text-slate-900 w-12 text-right">{openRate.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-slate-600">{c.click_count}</td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${clickRate}%` }} />
                          </div>
                          <span className="font-semibold text-slate-900 w-12 text-right">{clickRate.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
