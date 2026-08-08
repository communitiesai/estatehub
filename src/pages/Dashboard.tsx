import { useMemo, useState } from 'react';
import {
  Users, Home, DollarSign, CheckCircle2, Circle, TrendingUp,
  ArrowUpRight, MoreHorizontal, Plus, Bed, Bath, SquareIcon,
} from 'lucide-react';
import { useLeads, useProperties, useDeals, useTasks } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';
import { SeedDemoButton } from '@/hooks/useSeedDemo';
import {
  formatCurrency, scoreCategory,
  LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS,
  DEAL_STAGE_LABELS, TASK_PRIORITY_STYLES, TASK_PRIORITY_LABELS,
  PROPERTY_STATUS_LABELS, PROPERTY_STATUS_STYLES,
  relativeTime, formatDate,
} from '@/lib/constants';
import type { PageKey } from '@/lib/nav';
import type { Deal, Lead, Task } from '@/types';

/* ─── helpers ──────────────────────────────────────────────────────────── */

const PIPELINE_STAGES: Deal['stage'][] = ['inquiry', 'viewing', 'negotiation', 'offer', 'closed'];

const STAGE_COLORS: Record<Deal['stage'], string> = {
  inquiry: 'border-t-blue-400',
  viewing: 'border-t-cyan-400',
  negotiation: 'border-t-amber-400',
  offer: 'border-t-violet-400',
  closed: 'border-t-emerald-400',
  lost: 'border-t-slate-300',
};

const SOURCE_COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#f97316', '#ec4899', '#64748b',
];

/* ─── tiny SVG donut ────────────────────────────────────────────────────── */
function Donut({ slices }: { slices: { value: number; color: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = 56;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const paths = slices.map((sl, i) => {
    const fraction = sl.value / total;
    const dash = fraction * circumference;
    const gap = circumference - dash;
    const el = (
      <circle
        key={i}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={sl.color}
        strokeWidth="22"
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px` }}
      />
    );
    offset += dash;
    return el;
  });

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="flex-shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="22" />
      {paths}
    </svg>
  );
}

/* ─── tiny SVG sparkline ────────────────────────────────────────────────── */
function Sparkline({ data, color = '#3b82f6' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 220;
  const h = 80;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * (h - 12) - 4;
    return `${x},${y}`;
  });
  const areaBottom = `${w},${h} 0,${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20 overflow-visible">
      <defs>
        <linearGradient id="areafill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${pts.join(' ')} ${areaBottom}`} fill="url(#areafill)" />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={(i / (data.length - 1)) * w}
          cy={h - (v / max) * (h - 12) - 4}
          r="3.5"
          fill="white"
          stroke={color}
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

/* ─── main component ────────────────────────────────────────────────────── */
export function Dashboard({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const { profile } = useAuth();
  const { leads, reload: reloadLeads } = useLeads();
  const { properties, reload: reloadProperties } = useProperties();
  const { deals, reload: reloadDeals } = useDeals();
  const { tasks, reload: reloadTasks } = useTasks();
  const [seeding, setSeeding] = useState(false);

  const hasData = leads.length > 0 || properties.length > 0 || deals.length > 0;

  const reloadAll = () => {
    reloadLeads(); reloadProperties(); reloadDeals(); reloadTasks();
  };

  /* ── stats ── */
  const stats = useMemo(() => {
    const activeDeals = deals.filter((d) => !['closed', 'lost'].includes(d.stage)).length;
    const closedDeals = deals.filter((d) => d.stage === 'closed');
    const revenue = closedDeals.reduce((s, d) => s + Number(d.value), 0);
    const dealsClosedCount = closedDeals.length;
    return {
      totalLeads: leads.length,
      activeDeals,
      propertiesListed: properties.length,
      dealsClosed: dealsClosedCount,
      revenue,
    };
  }, [leads, properties, deals]);

  /* ── leads by source donut ── */
  const sourceData = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach((l) => {
      const key = LEAD_SOURCE_LABELS[l.source];
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], i) => ({ name, count, color: SOURCE_COLORS[i % SOURCE_COLORS.length] }));
  }, [leads]);

  /* ── activity sparkline: weekly leads + deals closed ── */
  const activityData = useMemo(() => {
    const weeks: { label: string; leads: number; deals: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const lCount = leads.filter((l) => {
        const c = new Date(l.created_at); return c >= day && c < next;
      }).length;
      const dCount = deals.filter((d) => {
        const c = new Date(d.created_at); return c >= day && c < next && d.stage === 'closed';
      }).length;
      weeks.push({
        label: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        leads: lCount,
        deals: dCount,
      });
    }
    return weeks;
  }, [leads, deals]);

  /* ── pipeline by stage ── */
  const pipeline = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage);
      const total = stageDeals.reduce((s, d) => s + Number(d.value), 0);
      return { stage, deals: stageDeals, count: stageDeals.length, total };
    });
  }, [deals]);

  /* ── recent properties ── */
  const recentProperties = useMemo(() => {
    return [...properties]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);
  }, [properties]);

  /* ── upcoming tasks ── */
  const upcomingTasks = useMemo(() => {
    return [...tasks]
      .filter((t) => t.status !== 'completed')
      .sort((a, b) => {
        if (!a.due_at && !b.due_at) return 0;
        if (!a.due_at) return 1;
        if (!b.due_at) return -1;
        return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      })
      .slice(0, 5);
  }, [tasks]);

  const maxActivity = Math.max(...activityData.map((d) => d.leads), 1);

  const kpis = [
    { label: 'Total Leads', value: stats.totalLeads, change: '+18%', icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Active Deals', value: stats.activeDeals, change: '+12%', icon: TrendingUp, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { label: 'Properties Listed', value: stats.propertiesListed, change: '+8%', icon: Home, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    { label: 'Deals Closed', value: stats.dealsClosed, change: '+33%', icon: CheckCircle2, iconBg: 'bg-violet-50', iconColor: 'text-violet-500' },
    { label: 'Revenue', value: formatCurrency(stats.revenue), change: '+24%', icon: DollarSign, iconBg: 'bg-rose-50', iconColor: 'text-rose-500' },
  ];

  return (
    <div className="space-y-5 -mt-1">
      {/* Empty state banner */}
      {!hasData && !seeding && (
        <div className="card p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold mb-1">Welcome to EstateHub! Load sample data to get started.</h3>
              <p className="text-slate-300 text-sm">Your workspace is empty. Load demo data to explore all features, or start adding your own leads and properties.</p>
            </div>
            <SeedDemoButton onDone={() => { setSeeding(true); reloadAll(); setTimeout(() => setSeeding(false), 100); }} label="Load sample data" />
          </div>
        </div>
      )}
      {seeding && (
        <div className="card p-4 bg-emerald-50 border-emerald-200">
          <p className="text-sm text-emerald-700 font-medium">Loading sample data… Your dashboard will update shortly.</p>
        </div>
      )}

      {/* ── Row 1: KPI cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${k.iconBg}`}>
                  <Icon className={`w-4.5 h-4.5 ${k.iconColor}`} style={{ width: '18px', height: '18px' }} />
                </div>
                <span className="text-xs font-semibold text-emerald-600 ml-auto flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> {k.change}
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 leading-tight">{k.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{k.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">from last week</div>
            </div>
          );
        })}
      </div>

      {/* ── Row 2: Donut + Activity + Tasks ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4">

        {/* Leads by Source */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Leads by Source</h3>
          <div className="flex items-center gap-3">
            <Donut slices={sourceData.map((s) => ({ value: s.count, color: s.color }))} />
            <div className="space-y-1.5 min-w-0">
              {sourceData.slice(0, 5).map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-600 truncate">{s.name}</span>
                  <span className="ml-auto font-semibold text-slate-800 flex-shrink-0">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Leads</span>
            <span className="font-bold text-slate-900">{leads.length}</span>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm">Activity Overview</h3>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />Leads</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Deals</span>
            </div>
          </div>

          {/* Line chart with SVG */}
          <div className="relative h-32">
            <svg viewBox="0 0 480 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="dealsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#f1f5f9" strokeWidth="1" />
              ))}
              {(() => {
                const pts = activityData.map((d, i) => {
                  const x = (i / (activityData.length - 1)) * 480;
                  const y = 90 - (d.leads / maxActivity) * 75;
                  return `${x},${y}`;
                }).join(' ');
                const area = `${pts} 480,100 0,100`;
                const dPts = activityData.map((d, i) => {
                  const x = (i / (activityData.length - 1)) * 480;
                  const maxD = Math.max(...activityData.map((a) => a.deals), 1);
                  const y = 90 - (d.deals / maxD) * 75;
                  return `${x},${y}`;
                }).join(' ');
                const dArea = `${dPts} 480,100 0,100`;
                return (
                  <>
                    <polygon points={area} fill="url(#leadsGrad)" />
                    <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                    <polygon points={dArea} fill="url(#dealsGrad)" />
                    <polyline points={dPts} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                    {activityData.map((d, i) => {
                      const x = (i / (activityData.length - 1)) * 480;
                      const y = 90 - (d.leads / maxActivity) * 75;
                      return <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />;
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
          {/* X-axis labels */}
          <div className="flex justify-between mt-1">
            {activityData.map((d, i) => (
              <span key={i} className="text-[10px] text-slate-400">{d.label}</span>
            ))}
          </div>
        </div>

        {/* Tasks panel */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm">Tasks</h3>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </button>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No pending tasks</p>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Recent Properties + Lead Pipeline ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">

        {/* Recent Properties */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm">Recent Properties</h3>
            <button
              onClick={() => onNavigate('properties')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          {recentProperties.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No properties yet</div>
          ) : (
            <div className="space-y-3">
              {recentProperties.map((p) => (
                <div key={p.id} className="flex items-center gap-3 group">
                  {/* Thumbnail / placeholder */}
                  <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-xs truncate">{p.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {[p.city, p.state].filter(Boolean).join(', ') || p.location || '—'}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      {p.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" /> {p.bedrooms} Bed</span>}
                      {p.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" /> {p.bathrooms} Bath</span>}
                      {p.area_sqft && <span className="flex items-center gap-0.5"><SquareIcon className="w-3 h-3" /> {p.area_sqft.toLocaleString()} sqft</span>}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="font-bold text-emerald-600 text-xs">{formatCurrency(p.price, p.currency)}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PROPERTY_STATUS_STYLES[p.status]}`}>
                      {PROPERTY_STATUS_LABELS[p.status]}
                    </span>
                  </div>
                  <button className="text-slate-300 hover:text-slate-600 flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lead Pipeline kanban */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm">Lead Pipeline</h3>
            <button
              onClick={() => onNavigate('deals')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              View All Deals <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2 overflow-x-auto">
            {pipeline.map(({ stage, deals: stageDeals, count, total }) => (
              <div key={stage} className={`min-w-[130px] rounded-lg border border-slate-200 border-t-4 ${STAGE_COLORS[stage]} bg-slate-50/60 p-3 flex flex-col gap-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{DEAL_STAGE_LABELS[stage]}</span>
                  <span className="text-xs text-slate-400 font-medium">({count})</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">{formatCurrency(total)}</div>
                <div className="space-y-1.5 flex-1">
                  {stageDeals.slice(0, 3).map((deal) => (
                    <PipelineCard key={deal.id} deal={deal} leads={leads} />
                  ))}
                  {count === 0 && (
                    <div className="py-3 text-center text-[10px] text-slate-300">Empty</div>
                  )}
                </div>
                <button
                  onClick={() => onNavigate('deals')}
                  className="w-full mt-1 text-[10px] text-slate-400 hover:text-slate-600 flex items-center justify-center gap-0.5 py-1 rounded hover:bg-slate-100 transition-colors"
                >
                  <Plus className="w-2.5 h-2.5" /> Add Lead
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── sub-components ────────────────────────────────────────────────────── */

function TaskRow({ task }: { task: Task }) {
  const isCompleted = task.status === 'completed';
  const isOverdue = !isCompleted && task.due_at && new Date(task.due_at) < new Date();

  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex-shrink-0">
        {isCompleted
          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          : <Circle className={`w-4 h-4 ${isOverdue ? 'text-red-400' : 'text-slate-300'}`} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium leading-tight ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {task.title}
        </p>
        <p className={`text-[10px] mt-0.5 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
          {task.due_at ? formatDate(task.due_at, { withTime: true }) : 'No due date'}
        </p>
      </div>
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${TASK_PRIORITY_STYLES[task.priority]}`}>
        {TASK_PRIORITY_LABELS[task.priority]}
      </span>
    </div>
  );
}

function PipelineCard({ deal, leads }: { deal: Deal; leads: Lead[] }) {
  const lead = leads.find((l) => l.id === deal.lead_id) ?? null;
  return (
    <div className="bg-white rounded-md border border-slate-200 p-2 shadow-sm">
      <div className="font-medium text-[11px] text-slate-800 truncate">
        {lead?.full_name ?? 'Deal'}
      </div>
      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
        {formatCurrency(deal.value, deal.currency)}
      </div>
    </div>
  );
}
