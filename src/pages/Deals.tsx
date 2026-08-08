import { useState, useMemo, type FormEvent } from 'react';
import { Plus, MoreHorizontal, Trash2, Edit3, DollarSign, TrendingUp, Target, X, ArrowRight } from 'lucide-react';
import { useDeals, useLeads, useProperties, useTeamMembers } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/lib/supabase';
import {
  DEAL_STAGES, DEAL_STAGE_LABELS, DEAL_STAGE_STYLES, DEAL_STAGE_COLORS,
  formatCurrency, formatCompact, formatDate, CURRENCIES,
} from '@/lib/constants';
import type { Deal, DealStage } from '@/types';

export function DealsPage() {
  const { deals, loading, reload } = useDeals();
  const { leads } = useLeads();
  const { properties } = useProperties();
  const { members } = useTeamMembers();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dragDeal, setDragDeal] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<DealStage | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  const dealsByStage = useMemo(() => {
    const map: Record<DealStage, Deal[]> = {
      inquiry: [], viewing: [], negotiation: [], offer: [], closed: [], lost: [],
    };
    deals.forEach((d) => map[d.stage].push(d));
    return map;
  }, [deals]);

  const stats = useMemo(() => {
    const active = deals.filter((d) => !['closed', 'lost'].includes(d.stage));
    const closed = deals.filter((d) => d.stage === 'closed');
    return {
      total: deals.length,
      activeCount: active.length,
      activeValue: active.reduce((s, d) => s + Number(d.value), 0),
      closedValue: closed.reduce((s, d) => s + Number(d.value), 0),
      closedCount: closed.length,
    };
  }, [deals]);

  function getLead(id: string) { return leads.find((l) => l.id === id); }
  function getProperty(id: string | null) { return id ? properties.find((p) => p.id === id) : null; }
  function getMember(id: string | null) { return id ? members.find((m) => m.user_id === id) : null; }

  async function handleDrop(stage: DealStage) {
    if (!dragDeal) return;
    const deal = deals.find((d) => d.id === dragDeal);
    if (!deal || deal.stage === stage) { setDragDeal(null); setDragOver(null); return; }
    const { error } = await supabase.from('deals').update({ stage }).eq('id', dragDeal);
    if (error) { toast(error.message, 'error'); return; }
    toast(`Deal moved to ${DEAL_STAGE_LABELS[stage]}`);
    setDragDeal(null);
    setDragOver(null);
    reload();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from('deals').delete().eq('id', deleteId);
    if (error) { toast(error.message, 'error'); return; }
    toast('Deal deleted');
    reload();
  }

  return (
    <div className="space-y-5" onClick={() => setMenuId(null)}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Deals', value: stats.activeCount, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pipeline Value', value: formatCurrency(stats.activeValue), icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Closed Deals', value: stats.closedCount, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Revenue', value: formatCurrency(stats.closedValue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-bold text-slate-900 truncate">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Drag deals between columns to update their stage.</p>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Deal
        </button>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400 text-sm">Loading deals…</div>
      ) : deals.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Target className="w-6 h-6" />}
            title="No deals yet"
            description="Create your first deal to start tracking your pipeline from inquiry to close."
            action={<button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4" /> Add Deal</button>}
          />
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max">
            {DEAL_STAGES.map((stage) => {
              const stageDeals = dealsByStage[stage];
              const stageValue = stageDeals.reduce((s, d) => s + Number(d.value), 0);
              return (
                <div
                  key={stage}
                  className={`w-72 flex-shrink-0 rounded-xl border-2 transition-colors ${dragOver === stage ? 'border-slate-400 bg-slate-100' : 'border-slate-200 bg-slate-50'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(stage); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={() => handleDrop(stage)}
                >
                  <div className="p-3 sticky top-0 bg-inherit rounded-t-xl">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${DEAL_STAGE_COLORS[stage]}`} />
                        <span className="font-semibold text-sm text-slate-900">{DEAL_STAGE_LABELS[stage]}</span>
                      </div>
                      <span className="badge bg-white text-slate-600 border border-slate-200">{stageDeals.length}</span>
                    </div>
                    <div className="text-xs text-slate-500">{formatCompact(stageValue)} total</div>
                  </div>
                  <div className="p-2 pt-0 space-y-2 min-h-[100px]">
                    {stageDeals.map((deal) => {
                      const lead = getLead(deal.lead_id);
                      const prop = getProperty(deal.property_id);
                      const member = getMember(deal.assigned_to);
                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={() => setDragDeal(deal.id)}
                          onDragEnd={() => { setDragDeal(null); setDragOver(null); }}
                          className={`card p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${dragDeal === deal.id ? 'opacity-50' : ''}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="font-semibold text-sm text-slate-900 leading-tight">
                              {lead?.full_name ?? 'Unknown lead'}
                            </div>
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => setMenuId(menuId === deal.id ? null : deal.id)} className="p-1 text-slate-400 hover:text-slate-700 rounded">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                              {menuId === deal.id && (
                                <div className="absolute right-0 top-full mt-1 w-32 card p-1 z-20 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => { setEditing(deal); setShowForm(true); setMenuId(null); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded">
                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                  </button>
                                  <button onClick={() => { setDeleteId(deal.id); setMenuId(null); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {prop && (
                            <div className="text-xs text-slate-500 mb-2 truncate">{prop.title}</div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-slate-900">{formatCurrency(deal.value, deal.currency)}</div>
                            {member && <Avatar name={member.full_name} src={member.avatar_url} size="xs" />}
                          </div>
                          {deal.close_date && (
                            <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                              <Target className="w-3 h-3" /> Close: {formatDate(deal.close_date)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {stageDeals.length === 0 && (
                      <div className="text-center text-xs text-slate-300 py-6 border-2 border-dashed border-slate-200 rounded-lg">
                        Drop deals here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm && (
        <DealForm
          deal={editing}
          leads={leads}
          properties={properties}
          members={members}
          currentUserId={profile?.user_id ?? ''}
          agencyId={profile?.agency_id ?? ''}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); reload(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete deal?"
        message="This will permanently remove the deal from your pipeline."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

interface DealFormProps {
  deal: Deal | null;
  leads: { id: string; full_name: string }[];
  properties: { id: string; title: string }[];
  members: { user_id: string; full_name: string }[];
  currentUserId: string;
  agencyId: string;
  onClose: () => void;
  onSaved: () => void;
}

function DealForm({ deal, leads, properties, members, currentUserId, agencyId, onClose, onSaved }: DealFormProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    lead_id: deal?.lead_id ?? (leads[0]?.id ?? ''),
    property_id: deal?.property_id ?? '',
    assigned_to: deal?.assigned_to ?? currentUserId,
    stage: deal?.stage ?? ('inquiry' as DealStage),
    value: deal?.value ?? '',
    currency: deal?.currency ?? 'INR',
    close_date: deal?.close_date ?? '',
    notes: deal?.notes ?? '',
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.lead_id) { toast('Select a lead first', 'error'); return; }
    setBusy(true);
    const payload = {
      agency_id: agencyId,
      lead_id: form.lead_id,
      property_id: form.property_id || null,
      assigned_to: form.assigned_to || null,
      stage: form.stage,
      value: Number(form.value) || 0,
      currency: form.currency,
      close_date: form.close_date || null,
      notes: form.notes || null,
    };

    const { error } = deal
      ? await supabase.from('deals').update(payload).eq('id', deal.id)
      : await supabase.from('deals').insert(payload);

    setBusy(false);
    if (error) { toast(error.message, 'error'); return; }
    toast(deal ? 'Deal updated' : 'Deal created');
    onSaved();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={deal ? 'Edit Deal' : 'Create New Deal'}
      description="Track a deal from inquiry through to closing."
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Saving…' : deal ? 'Save changes' : 'Create deal'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Lead *</label>
          <select className="input" value={form.lead_id} onChange={(e) => setForm({ ...form, lead_id: e.target.value })} required>
            <option value="">Select a lead…</option>
            {leads.map((l) => <option key={l.id} value={l.id}>{l.full_name}</option>)}
          </select>
          {leads.length === 0 && <p className="text-xs text-amber-600 mt-1">Add leads first to create deals.</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Property <span className="text-slate-400 font-normal">(optional)</span></label>
            <select className="input" value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })}>
              <option value="">No property</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Assigned to</label>
            <select className="input" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
              {members.map((m) => <option key={m.user_id} value={m.user_id}>{m.full_name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Stage</label>
            <select className="input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as DealStage })}>
              {DEAL_STAGES.map((s) => <option key={s} value={s}>{DEAL_STAGE_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Value</label>
            <input className="input" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="0" />
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Expected close date</label>
          <input className="input" type="date" value={form.close_date} onChange={(e) => setForm({ ...form, close_date: e.target.value })} />
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-[70px] resize-y" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Deal notes…" />
        </div>

        {/* Stage visualizer */}
        <div className="flex items-center gap-1 p-3 bg-slate-50 rounded-lg">
          {DEAL_STAGES.filter((s) => s !== 'lost').map((s, i, arr) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`flex-1 h-1.5 rounded-full ${DEAL_STAGE_STYLES[s].split(' ')[0]}`} />
              {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300" />}
            </div>
          ))}
        </div>
      </form>
    </Modal>
  );
}
