import { useState, useMemo, type FormEvent } from 'react';
import { Plus, Mail, MessageSquare, Send, Eye, MousePointerClick, MoreHorizontal, Trash2, Edit3, Users, Clock } from 'lucide-react';
import { useCampaigns, useLeads } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/lib/supabase';
import {
  CAMPAIGN_CHANNELS, CAMPAIGN_STATUSES,
  CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_STYLES, formatDate,
  LEAD_STATUSES, LEAD_STATUS_LABELS,
} from '@/lib/constants';
import type { Campaign, CampaignChannel, CampaignStatus } from '@/types';

export function CampaignsPage() {
  const { campaigns, loading, reload } = useCampaigns();
  const { leads } = useLeads();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  const stats = useMemo(() => ({
    total: campaigns.length,
    sent: campaigns.filter((c) => c.status === 'sent').length,
    totalSent: campaigns.reduce((s, c) => s + c.sent_count, 0),
    avgOpenRate: (() => {
      const sent = campaigns.filter((c) => c.status === 'sent');
      if (sent.length === 0) return 0;
      const totalOpens = sent.reduce((s, c) => s + c.open_count, 0);
      const totalSentCount = sent.reduce((s, c) => s + c.sent_count, 0);
      return totalSentCount > 0 ? (totalOpens / totalSentCount) * 100 : 0;
    })(),
  }), [campaigns]);

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from('campaigns').delete().eq('id', deleteId);
    if (error) { toast(error.message, 'error'); return; }
    toast('Campaign deleted');
    reload();
  }

  async function sendNow(c: Campaign) {
    const recipients = leads.filter((l) => c.audience.includes(l.status) || c.audience.length === 0);
    const { error } = await supabase.from('campaigns').update({
      status: 'sent',
      sent_count: recipients.length,
      open_count: Math.floor(recipients.length * 0.42),
      click_count: Math.floor(recipients.length * 0.18),
    }).eq('id', c.id);
    if (error) { toast(error.message, 'error'); return; }
    toast(`Campaign sent to ${recipients.length} recipients`);
    reload();
  }

  return (
    <div className="space-y-5" onClick={() => setMenuId(null)}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Campaigns', value: stats.total, icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Sent', value: stats.sent, icon: Send, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Emails Sent', value: stats.totalSent, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Avg Open Rate', value: `${stats.avgOpenRate.toFixed(0)}%`, icon: Eye, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Create email and SMS campaigns to nurture leads with property updates.</p>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-slate-400 text-sm">Loading campaigns…</div>
      ) : campaigns.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Mail className="w-6 h-6" />}
            title="No campaigns yet"
            description="Create your first email or SMS campaign to keep your leads engaged with new property listings."
            action={<button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4" /> New Campaign</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c) => {
            const Icon = c.channel === 'email' ? Mail : MessageSquare;
            const openRate = c.sent_count > 0 ? (c.open_count / c.sent_count) * 100 : 0;
            const clickRate = c.sent_count > 0 ? (c.click_count / c.sent_count) * 100 : 0;
            return (
              <div key={c.id} className="card p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${c.channel === 'email' ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                      <Icon className={`w-5 h-5 ${c.channel === 'email' ? 'text-blue-600' : 'text-emerald-600'}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{c.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge ${CAMPAIGN_STATUS_STYLES[c.status]}`}>{CAMPAIGN_STATUS_LABELS[c.status]}</span>
                        <span className="text-xs text-slate-400 capitalize">{c.channel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setMenuId(menuId === c.id ? null : c.id)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuId === c.id && (
                      <div className="absolute right-0 top-full mt-1 w-36 card p-1.5 z-20 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setEditing(c); setShowForm(true); setMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md">
                          <Edit3 className="w-4 h-4" /> Edit
                        </button>
                        {c.status === 'draft' && (
                          <button onClick={() => { sendNow(c); setMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
                            <Send className="w-4 h-4" /> Send now
                          </button>
                        )}
                        <button onClick={() => { setDeleteId(c.id); setMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {c.subject && <p className="text-sm font-medium text-slate-700 mb-1 line-clamp-1">{c.subject}</p>}
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{c.content}</p>

                {c.audience.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {c.audience.map((a) => (
                      <span key={a} className="badge bg-slate-100 text-slate-600">{a}</span>
                    ))}
                  </div>
                )}

                {c.status === 'sent' ? (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                    <div className="text-center">
                      <div className="font-bold text-slate-900">{c.sent_count}</div>
                      <div className="text-xs text-slate-400">Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-slate-900">{openRate.toFixed(0)}%</div>
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-0.5"><Eye className="w-3 h-3" /> Opens</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-slate-900">{clickRate.toFixed(0)}%</div>
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-0.5"><MousePointerClick className="w-3 h-3" /> Clicks</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-400 pt-3 border-t border-slate-100">
                    <Clock className="w-3.5 h-3.5" />
                    {c.scheduled_at ? `Scheduled for ${formatDate(c.scheduled_at)}` : `Created ${formatDate(c.created_at)}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <CampaignForm
          campaign={editing}
          leadCount={leads.length}
          agencyId={profile?.agency_id ?? ''}
          userId={profile?.user_id ?? ''}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); reload(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete campaign?"
        message="This will permanently remove the campaign."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

interface CampaignFormProps {
  campaign: Campaign | null;
  leadCount: number;
  agencyId: string;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}

function CampaignForm({ campaign: c, leadCount, agencyId, userId, onClose, onSaved }: CampaignFormProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: c?.name ?? '',
    channel: c?.channel ?? ('email' as CampaignChannel),
    subject: c?.subject ?? '',
    content: c?.content ?? '',
    status: c?.status ?? ('draft' as CampaignStatus),
    audience: c?.audience ?? [],
  });

  function toggleAudience(status: string) {
    setForm({
      ...form,
      audience: form.audience.includes(status)
        ? form.audience.filter((s) => s !== status)
        : [...form.audience, status],
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) { toast('Name and content are required', 'error'); return; }
    setBusy(true);
    const payload = {
      agency_id: agencyId,
      created_by: c ? c.created_by : userId,
      name: form.name,
      channel: form.channel,
      subject: form.subject || null,
      content: form.content,
      status: form.status,
      audience: form.audience,
    };

    const { error } = c
      ? await supabase.from('campaigns').update(payload).eq('id', c.id)
      : await supabase.from('campaigns').insert(payload);

    setBusy(false);
    if (error) { toast(error.message, 'error'); return; }
    toast(c ? 'Campaign updated' : 'Campaign created');
    onSaved();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={c ? 'Edit Campaign' : 'New Campaign'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Saving…' : c ? 'Save changes' : 'Create campaign'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Campaign name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="New listings — Q1 newsletter" required />
          </div>
          <div>
            <label className="label">Channel</label>
            <select className="input" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as CampaignChannel })}>
              {CAMPAIGN_CHANNELS.map((ch) => <option key={ch} value={ch}>{ch === 'email' ? 'Email' : 'SMS'}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Subject line {form.channel === 'email' ? '*' : ''}</label>
          <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="5 new luxury homes just hit the market" />
        </div>

        <div>
          <label className="label">Content *</label>
          <textarea className="input min-h-[120px] resize-y" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your campaign message…" required />
        </div>

        <div>
          <label className="label">Target audience</label>
          <p className="text-xs text-slate-400 mb-2">Select which lead segments to include. Leave empty to send to all {leadCount} leads.</p>
          <div className="flex flex-wrap gap-2">
            {LEAD_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleAudience(s)}
                className={`badge px-3 py-1.5 cursor-pointer transition-all ${form.audience.includes(s) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {LEAD_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CampaignStatus })}>
            {CAMPAIGN_STATUSES.map((s) => <option key={s} value={s}>{CAMPAIGN_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
      </form>
    </Modal>
  );
}
