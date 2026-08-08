import { useState, useMemo, type FormEvent } from 'react';
import { Plus, Search, Filter, Upload, Download, MoreHorizontal, Trash2, Edit3, Phone, Mail, Flame, X, Tag as TagIcon, StickyNote } from 'lucide-react';
import { useLeads, useTeamMembers } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { LeadNotesPanel } from '@/components/LeadNotesPanel';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/lib/supabase';
import {
  LEAD_SOURCES, LEAD_STATUSES, LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS,
  LEAD_STATUS_STYLES, scoreCategory, SCORE_STYLES, SCORE_DOT,
  formatCurrency, relativeTime, CURRENCIES,
} from '@/lib/constants';
import type { Lead, LeadSource, LeadStatus } from '@/types';

const COMMON_TAGS = ['VIP', 'Investor', 'First-time Buyer', 'Cash Buyer', 'Renter', 'Luxury', 'Urgent', 'Follow-up'];

export function LeadsPage() {
  const { leads, loading, reload } = useLeads();
  const { members } = useTeamMembers();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [editing, setEditing] = useState<Lead | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notesLead, setNotesLead] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
      if (scoreFilter !== 'all' && scoreCategory(l.score) !== scoreFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          l.full_name.toLowerCase().includes(q) ||
          (l.email?.toLowerCase().includes(q) ?? false) ||
          (l.phone?.includes(q) ?? false) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [leads, search, statusFilter, sourceFilter, scoreFilter]);

  const stats = useMemo(() => ({
    total: leads.length,
    hot: leads.filter((l) => scoreCategory(l.score) === 'hot').length,
    warm: leads.filter((l) => scoreCategory(l.score) === 'warm').length,
    cold: leads.filter((l) => scoreCategory(l.score) === 'cold').length,
    converted: leads.filter((l) => l.status === 'converted').length,
  }), [leads]);

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from('leads').delete().eq('id', deleteId);
    if (error) { toast(error.message, 'error'); return; }
    toast('Lead deleted');
    reload();
  }

  async function handleStatusChange(id: string, status: LeadStatus) {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (error) { toast(error.message, 'error'); return; }
    toast(`Lead marked as ${LEAD_STATUS_LABELS[status]}`);
    reload();
  }

  return (
    <div className="space-y-5" onClick={() => setMenuId(null)}>
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-900' },
          { label: 'Hot', value: stats.hot, color: 'text-red-600' },
          { label: 'Warm', value: stats.warm, color: 'text-amber-600' },
          { label: 'Cold', value: stats.cold, color: 'text-sky-600' },
          { label: 'Converted', value: stats.converted, color: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search leads by name, email, phone, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setShowFilters((f) => !f)}>
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="btn-secondary" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4 flex flex-wrap gap-4 animate-fadeIn">
          <div className="flex-1 min-w-[160px]">
            <label className="label">Status</label>
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}>
              <option value="all">All statuses</option>
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="label">Source</label>
            <select className="input" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as LeadSource | 'all')}>
              <option value="all">All sources</option>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{LEAD_SOURCE_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="label">Score</label>
            <select className="input" value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value as 'all' | 'hot' | 'warm' | 'cold')}>
              <option value="all">All scores</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </div>
          {(statusFilter !== 'all' || sourceFilter !== 'all' || scoreFilter !== 'all') && (
            <button
              className="btn-ghost self-end"
              onClick={() => { setStatusFilter('all'); setSourceFilter('all'); setScoreFilter('all'); }}
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading leads…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Flame className="w-6 h-6" />}
            title={leads.length === 0 ? 'No leads yet' : 'No leads match your filters'}
            description={leads.length === 0 ? 'Add your first lead or import from CSV to get started.' : 'Try adjusting your search or filters.'}
            action={
              leads.length === 0 ? (
                <div className="flex gap-2">
                  <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
                    <Plus className="w-4 h-4" /> Add Lead
                  </button>
                  <button className="btn-secondary" onClick={() => setShowImport(true)}>
                    <Upload className="w-4 h-4" /> Import CSV
                  </button>
                </div>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Source</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Score</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Budget</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Tags</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Contacted</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => {
                  const cat = scoreCategory(lead.score);
                  const member = members.find((m) => m.user_id === lead.assigned_to);
                  return (
                    <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={lead.full_name} size="sm" />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">{lead.full_name}</div>
                            <div className="text-xs text-slate-400 truncate">
                              {lead.email ?? lead.phone ?? '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{LEAD_SOURCE_LABELS[lead.source]}</td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className={`badge cursor-pointer border-0 ${LEAD_STATUS_STYLES[lead.status]}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${SCORE_DOT[cat]}`} />
                          <span className="font-semibold text-slate-900">{lead.score}</span>
                          <span className={`badge ${SCORE_STYLES[cat]} hidden sm:inline-flex`}>{cat}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {lead.budget_min ? `${formatCurrency(lead.budget_min, lead.currency)}` : '—'}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {lead.tags.slice(0, 2).map((t) => (
                            <span key={t} className="badge bg-slate-100 text-slate-600">{t}</span>
                          ))}
                          {lead.tags.length > 2 && <span className="badge bg-slate-100 text-slate-500">+{lead.tags.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-slate-500 text-xs">
                        {relativeTime(lead.last_contacted_at)}
                      </td>
                      <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => setMenuId(menuId === lead.id ? null : lead.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {menuId === lead.id && (
                            <div className="absolute right-4 top-full mt-1 w-40 card p-1.5 z-20 animate-scaleIn">
                              <button
                                onClick={() => { setNotesLead(lead); setMenuId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md"
                              >
                                <StickyNote className="w-4 h-4" /> Notes
                              </button>
                              <button
                                onClick={() => { setEditing(lead); setShowForm(true); setMenuId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md"
                              >
                                <Edit3 className="w-4 h-4" /> Edit
                              </button>
                              <button
                                onClick={() => { setDeleteId(lead.id); setMenuId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          )}
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

      {showForm && (
        <LeadForm
          lead={editing}
          members={members}
          currentUserId={profile?.user_id ?? ''}
          agencyId={profile?.agency_id ?? ''}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); reload(); }}
        />
      )}

      {showImport && (
        <ImportModal
          agencyId={profile?.agency_id ?? ''}
          onClose={() => setShowImport(false)}
          onImported={() => { setShowImport(false); reload(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete lead?"
        message="This will permanently remove the lead and cannot be undone."
        confirmLabel="Delete"
        danger
      />

      {notesLead && (
        <LeadNotesPanel lead={notesLead} onClose={() => setNotesLead(null)} />
      )}
    </div>
  );
}

// ============ Lead Form ============

interface LeadFormProps {
  lead: Lead | null;
  members: { user_id: string; full_name: string }[];
  currentUserId: string;
  agencyId: string;
  onClose: () => void;
  onSaved: () => void;
}

function LeadForm({ lead, members, currentUserId, agencyId, onClose, onSaved }: LeadFormProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: lead?.full_name ?? '',
    email: lead?.email ?? '',
    phone: lead?.phone ?? '',
    source: lead?.source ?? ('website' as LeadSource),
    status: lead?.status ?? ('new' as LeadStatus),
    score: lead?.score ?? 50,
    budget_min: lead?.budget_min ?? '',
    budget_max: lead?.budget_max ?? '',
    currency: lead?.currency ?? 'INR',
    notes: lead?.notes ?? '',
    assigned_to: lead?.assigned_to ?? currentUserId,
    tags: lead?.tags ?? [],
  });
  const [tagInput, setTagInput] = useState('');

  function addTag(tag: string) {
    const t = tag.trim();
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] });
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      agency_id: agencyId,
      full_name: form.full_name,
      email: form.email || null,
      phone: form.phone || null,
      source: form.source,
      status: form.status,
      score: Number(form.score),
      budget_min: form.budget_min ? Number(form.budget_min) : null,
      budget_max: form.budget_max ? Number(form.budget_max) : null,
      currency: form.currency,
      notes: form.notes || null,
      assigned_to: form.assigned_to || null,
      tags: form.tags,
    };

    const { error } = lead
      ? await supabase.from('leads').update(payload).eq('id', lead.id)
      : await supabase.from('leads').insert(payload);

    setBusy(false);
    if (error) { toast(error.message, 'error'); return; }
    toast(lead ? 'Lead updated' : 'Lead added');
    onSaved();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={lead ? 'Edit Lead' : 'Add New Lead'}
      description={lead ? 'Update lead information and score.' : 'Capture a new lead into your CRM.'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Saving…' : lead ? 'Save changes' : 'Add lead'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full name *</label>
            <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Assigned to</label>
            <select className="input" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
              {members.map((m) => <option key={m.user_id} value={m.user_id}>{m.full_name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Source</label>
            <select className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as LeadSource })}>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{LEAD_SOURCE_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}>
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Lead score: {form.score}</label>
            <input type="range" min="0" max="100" value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} className="w-full mt-3 accent-slate-900" />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Cold</span><span>Warm</span><span>Hot</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Min budget</label>
            <input className="input" type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} placeholder="0" />
          </div>
          <div>
            <label className="label">Max budget</label>
            <input className="input" type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} placeholder="0" />
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="label">Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.tags.map((t) => (
              <span key={t} className="badge bg-slate-100 text-slate-700 gap-1">
                {t}
                <button type="button" onClick={() => removeTag(t)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input pl-9"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))}
                placeholder="Type a tag and press Enter"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {COMMON_TAGS.filter((t) => !form.tags.includes(t)).map((t) => (
              <button key={t} type="button" onClick={() => addTag(t)} className="badge bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200">
                + {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-[80px] resize-y" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Add notes about this lead…" />
        </div>
      </form>
    </Modal>
  );
}

// ============ Import Modal ============

function ImportModal({ agencyId, onClose, onImported }: { agencyId: string; onClose: () => void; onImported: () => void }) {
  const { toast } = useToast();
  const [csvText, setCsvText] = useState('');
  const [busy, setBusy] = useState(false);

  const sample = `full_name,email,phone,source,status,score,tags
John Smith,john@email.com,+1234567890,website,new,75,VIP|Investor
Sarah Lee,sarah@email.com,+1987654321,social,contacted,60,Luxury`;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsvText(String(reader.result));
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!csvText.trim()) { toast('Please paste CSV data or upload a file', 'error'); return; }
    setBusy(true);
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1).filter((l) => l.trim());

    const records = rows.map((line) => {
      const vals = line.split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
      return {
        agency_id: agencyId,
        full_name: row.full_name || 'Unknown',
        email: row.email || null,
        phone: row.phone || null,
        source: (row.source as LeadSource) || 'website',
        status: (row.status as LeadStatus) || 'new',
        score: Number(row.score) || 0,
        tags: row.tags ? row.tags.split('|').map((t) => t.trim()).filter(Boolean) : [],
      };
    });

    const { error } = await supabase.from('leads').insert(records);
    setBusy(false);
    if (error) { toast(error.message, 'error'); return; }
    toast(`Imported ${records.length} leads`);
    onImported();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Import Leads from CSV"
      description="Upload a CSV file or paste data directly. First row must be headers."
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={() => setCsvText(sample)}>Load sample</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleImport} disabled={busy}>
            {busy ? 'Importing…' : <><Upload className="w-4 h-4" /> Import</>}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Upload CSV file</label>
          <input type="file" accept=".csv" onChange={handleFile} className="input" />
        </div>
        <div className="text-center text-sm text-slate-400">— or paste CSV below —</div>
        <div>
          <label className="label">CSV data</label>
          <textarea
            className="input min-h-[160px] resize-y font-mono text-xs"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={sample}
          />
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
          <strong>Required columns:</strong> full_name<br />
          <strong>Optional:</strong> email, phone, source, status, score, tags (pipe-separated)<br />
          <strong>Sources:</strong> portal, social, csv, form, chatbot, whatsapp, referral, website, other
        </div>
      </div>
    </Modal>
  );
}
