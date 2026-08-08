import { useMemo, useState, useEffect, useCallback } from 'react';
import { TrendingUp, Users, Home, DollarSign, Target, Award, Eye, MessageSquare, BarChart3, Facebook, Search, Loader2, Zap, MousePointerClick, DollarSign as DollarIcon } from 'lucide-react';
import { useLeads, useProperties, useDeals, useTeamMembers, useIntegrations } from '@/hooks/useData';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/lib/supabase';
import {
  formatCurrency, formatCompact, scoreCategory,
  LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, LEAD_STATUS_STYLES,
  PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS,
  DEAL_STAGE_LABELS, DEAL_STAGE_COLORS,
} from '@/lib/constants';
import type { LeadSource, LeadStatus, PropertyType, PropertyStatus, DealStage, AdCampaign } from '@/types';

export function AnalyticsPage() {
  const { leads } = useLeads();
  const { properties } = useProperties();
  const { deals } = useDeals();
  const { members } = useTeamMembers();

  const leadStats = useMemo(() => {
    const bySource: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    leads.forEach((l) => {
      bySource[l.source] = (bySource[l.source] ?? 0) + 1;
      byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
    });
    const total = leads.length;
    const converted = leads.filter((l) => l.status === 'converted').length;
    const conversionRate = total > 0 ? (converted / total) * 100 : 0;
    const avgScore = total > 0 ? leads.reduce((s, l) => s + l.score, 0) / total : 0;
    return { bySource, byStatus, total, converted, conversionRate, avgScore };
  }, [leads]);

  const propertyStats = useMemo(() => {
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalViews = 0, totalInquiries = 0;
    properties.forEach((p) => {
      byType[p.type] = (byType[p.type] ?? 0) + 1;
      byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
      totalViews += p.views;
      totalInquiries += p.inquiries;
    });
    const topProperties = [...properties].sort((a, b) => b.views - a.views).slice(0, 5);
    return { byType, byStatus, totalViews, totalInquiries, topProperties };
  }, [properties]);

  const dealStats = useMemo(() => {
    const byStage: Record<string, { count: number; value: number }> = {};
    deals.forEach((d) => {
      if (!byStage[d.stage]) byStage[d.stage] = { count: 0, value: 0 };
      byStage[d.stage].count++;
      byStage[d.stage].value += Number(d.value);
    });
    const closedValue = deals.filter((d) => d.stage === 'closed').reduce((s, d) => s + Number(d.value), 0);
    const pipelineValue = deals.filter((d) => !['closed', 'lost'].includes(d.stage)).reduce((s, d) => s + Number(d.value), 0);
    const avgDealSize = deals.length > 0 ? deals.reduce((s, d) => s + Number(d.value), 0) / deals.length : 0;
    return { byStage, closedValue, pipelineValue, avgDealSize };
  }, [deals]);

  const agentPerformance = useMemo(() => {
    return members.map((m) => {
      const agentLeads = leads.filter((l) => l.assigned_to === m.user_id);
      const agentDeals = deals.filter((d) => d.assigned_to === m.user_id);
      const closedDeals = agentDeals.filter((d) => d.stage === 'closed');
      const revenue = closedDeals.reduce((s, d) => s + Number(d.value), 0);
      const conversions = agentLeads.filter((l) => l.status === 'converted').length;
      return {
        ...m,
        leadCount: agentLeads.length,
        dealCount: agentDeals.length,
        closedCount: closedDeals.length,
        revenue,
        conversionRate: agentLeads.length > 0 ? (conversions / agentLeads.length) * 100 : 0,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [members, leads, deals]);

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const months: { label: string; leads: number; deals: number; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const next = new Date(d);
      next.setMonth(next.getMonth() + 1);
      const monthLeads = leads.filter((l) => {
        const c = new Date(l.created_at);
        return c >= d && c < next;
      }).length;
      const monthClosedDeals = deals.filter((dl) => {
        if (dl.stage !== 'closed') return false;
        const c = new Date(dl.created_at);
        return c >= d && c < next;
      });
      months.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        leads: monthLeads,
        deals: monthClosedDeals.length,
        revenue: monthClosedDeals.reduce((s, dl) => s + Number(dl.value), 0),
      });
    }
    return months;
  }, [leads, deals]);

  const maxLeadsTrend = Math.max(...monthlyTrend.map((m) => m.leads), 1);
  const maxRevenueTrend = Math.max(...monthlyTrend.map((m) => m.revenue), 1);

  const hasData = leads.length > 0 || properties.length > 0 || deals.length > 0;

  if (!hasData) {
    return (
      <div className="card">
        <EmptyState
          icon={<BarChart3 className="w-6 h-6" />}
          title="No analytics data yet"
          description="Add leads, properties, and deals to see your performance metrics here."
        />
      </div>
    );
  }

  const kpis = [
    { label: 'Total Revenue', value: formatCurrency(dealStats.closedValue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pipeline Value', value: formatCurrency(dealStats.pipelineValue), icon: Target, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Avg Deal Size', value: formatCurrency(dealStats.avgDealSize), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Conversion Rate', value: `${leadStats.conversionRate.toFixed(1)}%`, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg} mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 mb-1">6-Month Performance Trend</h3>
        <p className="text-xs text-slate-500 mb-5">Leads and revenue over time</p>
        <div className="grid grid-cols-6 gap-3 h-48">
          {monthlyTrend.map((m, i) => (
            <div key={i} className="flex flex-col items-center justify-end gap-2">
              <div className="text-xs font-semibold text-slate-700">{formatCompact(m.revenue)}</div>
              <div className="w-full flex items-end justify-center" style={{ height: '130px' }}>
                <div
                  className="w-full max-w-[32px] bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md relative group"
                  style={{ height: `${(m.revenue / maxRevenueTrend) * 100}%`, minHeight: m.revenue > 0 ? '4px' : '2px' }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-slate-700 whitespace-nowrap">
                    {m.leads} leads
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-400">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lead sources */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 mb-4">Leads by Source</h3>
          <DonutChart
            data={Object.entries(leadStats.bySource).map(([key, value]) => ({
              label: LEAD_SOURCE_LABELS[key as LeadSource] ?? key,
              value,
            }))}
          />
        </div>

        {/* Lead statuses */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 mb-4">Leads by Status</h3>
          <div className="space-y-3">
            {Object.entries(leadStats.byStatus).map(([status, count]) => {
              const pct = leadStats.total > 0 ? (count / leadStats.total) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600">{LEAD_STATUS_LABELS[status as LeadStatus]}</span>
                    <span className="font-semibold text-slate-900">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${LEAD_STATUS_STYLES[status as LeadStatus].split(' ')[0]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Property performance */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 mb-4">Top Performing Properties</h3>
          {propertyStats.topProperties.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No properties yet.</p>
          ) : (
            <div className="space-y-3">
              {propertyStats.topProperties.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="text-sm font-bold text-slate-400 w-5">{i + 1}</div>
                  <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    {p.images[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 truncate">{p.title}</div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.views}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{p.inquiries}</span>
                    </div>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">{formatCurrency(p.price, p.currency)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Property types breakdown */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 mb-4">Property Distribution</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(propertyStats.byType).map(([type, count]) => (
              <div key={type} className="p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">{count}</div>
                <div className="text-xs text-slate-500">{PROPERTY_TYPE_LABELS[type as PropertyType]}</div>
              </div>
            ))}
            {Object.keys(propertyStats.byType).length === 0 && (
              <p className="text-sm text-slate-400 col-span-2 py-4 text-center">No properties yet.</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Status Breakdown</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(propertyStats.byStatus).map(([status, count]) => (
                <span key={status} className="badge bg-slate-100 text-slate-600">
                  {PROPERTY_STATUS_LABELS[status as PropertyStatus] ?? status}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agent productivity */}
      <div className="card p-5">
        <h3 className="font-bold text-slate-900 mb-4">Agent Productivity</h3>
        {agentPerformance.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No team members yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-3 py-2.5 font-semibold text-slate-600">Agent</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600 text-center">Leads</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600 text-center">Active Deals</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600 text-center">Closed</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600 text-center">Conv. Rate</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.map((a) => (
                  <tr key={a.user_id} className="border-b border-slate-100">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={a.full_name} src={a.avatar_url} size="sm" />
                        <div>
                          <div className="font-semibold text-slate-900">{a.full_name}</div>
                          <div className="text-xs text-slate-400">{a.title ?? 'Agent'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-slate-600">{a.leadCount}</td>
                    <td className="px-3 py-3 text-center text-slate-600">{a.dealCount}</td>
                    <td className="px-3 py-3 text-center text-slate-600">{a.closedCount}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-semibold text-slate-900">{a.conversionRate.toFixed(0)}%</span>
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-slate-900">{formatCurrency(a.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ad Campaigns Performance */}
      <AdCampaignsSection />
    </div>
  );
}

/* ─── Ad Campaigns Section ─────────────────────────────────────────────── */
function AdCampaignsSection() {
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

  const totals = useMemo(() => {
    return filtered.reduce((acc, c) => ({
      spend: acc.spend + c.spend,
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      conversions: acc.conversions + c.conversions,
    }), { spend: 0, impressions: 0, clicks: 0, conversions: 0 });
  }, [filtered]);

  const avgCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  const avgCpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;

  if (!hasAdIntegration) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-900">Ad Campaign Performance</h3>
        </div>
        <EmptyState
          icon={<Zap className="w-6 h-6" />}
          title="No ad integrations connected"
          description="Connect Meta Ads or Google Ads in Settings to see campaign performance metrics here — spend, impressions, clicks, conversions, and ROI."
        />
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-900">Ad Campaign Performance</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              platformFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setPlatformFilter('meta')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              platformFilter === 'meta' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Facebook className="w-3.5 h-3.5" /> Meta
          </button>
          <button
            onClick={() => setPlatformFilter('google')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              platformFilter === 'google' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Google
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Spend', value: formatCurrency(totals.spend), icon: DollarIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Impressions', value: formatCompact(totals.impressions), icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Clicks', value: formatCompact(totals.clicks), icon: MousePointerClick, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Conversions', value: String(totals.conversions), icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="p-3 bg-slate-50 rounded-lg">
              <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <div className="text-lg font-bold text-slate-900">{k.value}</div>
              <div className="text-xs text-slate-400">{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Derived metrics */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-lg font-bold text-slate-900">{avgCtr.toFixed(2)}%</div>
          <div className="text-xs text-slate-400">Avg CTR</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-lg font-bold text-slate-900">{formatCurrency(avgCpc)}</div>
          <div className="text-xs text-slate-400">Avg CPC</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-lg font-bold text-slate-900">{formatCurrency(avgCpa)}</div>
          <div className="text-xs text-slate-400">Avg CPA</div>
        </div>
      </div>

      {/* Campaign table */}
      {loading ? (
        <div className="py-8 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading campaigns…
        </div>
      ) : error ? (
        <div className="py-6 text-center">
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <button onClick={loadCampaigns} className="btn-secondary text-xs">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">No campaigns found for this platform.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-3 py-2.5 font-semibold text-slate-600">Campaign</th>
                <th className="px-3 py-2.5 font-semibold text-slate-600">Platform</th>
                <th className="px-3 py-2.5 font-semibold text-slate-600 text-center">Status</th>
                <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">Spend</th>
                <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">Impr.</th>
                <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">Clicks</th>
                <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">CTR</th>
                <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">Conv.</th>
                <th className="px-3 py-2.5 font-semibold text-slate-600 text-right">CPA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-3 py-3">
                    <span className={`badge flex items-center gap-1 w-fit ${
                      c.platform === 'meta' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {c.platform === 'meta' ? <Facebook className="w-3 h-3" /> : <Search className="w-3 h-3" />}
                      {c.platform === 'meta' ? 'Meta' : 'Google'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`badge ${
                      c.status === 'active' ? 'bg-emerald-100 text-emerald-700'
                      : c.status === 'paused' ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-900">{formatCurrency(c.spend)}</td>
                  <td className="px-3 py-3 text-right text-slate-600">{formatCompact(c.impressions)}</td>
                  <td className="px-3 py-3 text-right text-slate-600">{formatCompact(c.clicks)}</td>
                  <td className="px-3 py-3 text-right text-slate-600">{c.ctr.toFixed(2)}%</td>
                  <td className="px-3 py-3 text-right text-slate-600">{c.conversions}</td>
                  <td className="px-3 py-3 text-right text-slate-600">{c.cpa > 0 ? formatCurrency(c.cpa) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Simple donut chart using conic-gradient
function DonutChart({ data }: { data: { label: string; value: number }[] }) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#ef4444', '#84cc16', '#6366f1'];
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return <p className="text-sm text-slate-400 py-8 text-center">No data yet.</p>;
  }

  let cumulative = 0;
  const gradient = data.map((d, i) => {
    const start = (cumulative / total) * 360;
    cumulative += d.value;
    const end = (cumulative / total) * 360;
    return `${colors[i % colors.length]} ${start}deg ${end}deg`;
  }).join(', ');

  return (
    <div className="flex items-center gap-6">
      <div
        className="w-32 h-32 rounded-full flex-shrink-0 relative"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-bold text-slate-900">{total}</div>
            <div className="text-xs text-slate-400">total</div>
          </div>
        </div>
      </div>
      <div className="space-y-2 flex-1 min-w-0">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: colors[i % colors.length] }} />
            <span className="text-slate-600 flex-1 truncate">{d.label}</span>
            <span className="font-semibold text-slate-900">{d.value}</span>
            <span className="text-slate-400 text-xs">{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
