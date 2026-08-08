import { useState, useMemo, type FormEvent } from 'react';
import { Plus, Calendar, Clock, MapPin, Video, Phone, Building, MoreHorizontal, Trash2, Edit3, CheckCircle2, XCircle } from 'lucide-react';
import { useAppointments, useLeads, useProperties, useTeamMembers } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/lib/supabase';
import {
  APPOINTMENT_TYPES, APPOINTMENT_STATUSES,
  APPT_TYPE_LABELS, APPT_STATUS_LABELS, APPT_STATUS_STYLES,
  formatDate,
} from '@/lib/constants';
import type { Appointment, AppointmentType, AppointmentStatus } from '@/types';

const TYPE_ICONS: Record<AppointmentType, typeof Calendar> = {
  viewing: Building, call: Phone, office_meeting: MapPin, video: Video,
};

export function AppointmentsPage() {
  const { appointments, loading, reload } = useAppointments();
  const { leads } = useLeads();
  const { properties } = useProperties();
  const { members } = useTeamMembers();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [menuId, setMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const now = new Date();
    if (filter === 'upcoming') return appointments.filter((a) => new Date(a.start_at) >= now && a.status === 'scheduled');
    if (filter === 'past') return appointments.filter((a) => new Date(a.start_at) < now);
    return appointments;
  }, [appointments, filter]);

  function getLead(id: string | null) { return id ? leads.find((l) => l.id === id) : null; }
  function getProperty(id: string | null) { return id ? properties.find((p) => p.id === id) : null; }
  function getMember(id: string | null) { return id ? members.find((m) => m.user_id === id) : null; }

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) { toast(error.message, 'error'); return; }
    toast(`Appointment marked as ${APPT_STATUS_LABELS[status]}`);
    reload();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from('appointments').delete().eq('id', deleteId);
    if (error) { toast(error.message, 'error'); return; }
    toast('Appointment deleted');
    reload();
  }

  return (
    <div className="space-y-5" onClick={() => setMenuId(null)}>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-2">
          {(['upcoming', 'past', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Schedule Appointment
        </button>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-slate-400 text-sm">Loading appointments…</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Calendar className="w-6 h-6" />}
            title="No appointments"
            description={filter === 'upcoming' ? "You're all caught up! Schedule a new appointment to fill your calendar." : 'No appointments in this view.'}
            action={filter === 'upcoming' ? <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4" /> Schedule</button> : undefined}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => {
            const lead = getLead(appt.lead_id);
            const prop = getProperty(appt.property_id);
            const member = getMember(appt.assigned_to);
            const Icon = TYPE_ICONS[appt.type];
            const isPast = new Date(appt.start_at) < new Date();
            return (
              <div key={appt.id} className="card p-4 flex items-start gap-4 hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${APPT_STATUS_STYLES[appt.status]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{appt.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(appt.start_at, { withTime: true })}</span>
                        {appt.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{appt.location}</span>}
                        {lead && <span>with {lead.full_name}</span>}
                        {prop && <span className="truncate">· {prop.title}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge ${APPT_STATUS_STYLES[appt.status]}`}>{APPT_STATUS_LABELS[appt.status]}</span>
                      {member && <Avatar name={member.full_name} src={member.avatar_url} size="xs" />}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setMenuId(menuId === appt.id ? null : appt.id)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {menuId === appt.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 card p-1.5 z-20 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => { setEditing(appt); setShowForm(true); setMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md">
                              <Edit3 className="w-4 h-4" /> Edit
                            </button>
                            {appt.status === 'scheduled' && (
                              <>
                                <button onClick={() => { handleStatusChange(appt.id, 'completed'); setMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-md">
                                  <CheckCircle2 className="w-4 h-4" /> Mark completed
                                </button>
                                <button onClick={() => { handleStatusChange(appt.id, 'cancelled'); setMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">
                                  <XCircle className="w-4 h-4" /> Cancel
                                </button>
                              </>
                            )}
                            <button onClick={() => { setDeleteId(appt.id); setMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {appt.description && <p className="text-sm text-slate-600 mt-2">{appt.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <AppointmentForm
          appointment={editing}
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
        title="Delete appointment?"
        message="This will permanently remove the appointment."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

interface ApptFormProps {
  appointment: Appointment | null;
  leads: { id: string; full_name: string }[];
  properties: { id: string; title: string }[];
  members: { user_id: string; full_name: string }[];
  currentUserId: string;
  agencyId: string;
  onClose: () => void;
  onSaved: () => void;
}

function AppointmentForm({ appointment: a, leads, properties, members, currentUserId, agencyId, onClose, onSaved }: ApptFormProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const defaultStart = new Date();
  defaultStart.setHours(defaultStart.getHours() + 1, 0, 0, 0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(defaultEnd.getHours() + 1);

  const toLocalInput = (d: Date) => {
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    title: a?.title ?? '',
    description: a?.description ?? '',
    lead_id: a?.lead_id ?? '',
    property_id: a?.property_id ?? '',
    assigned_to: a?.assigned_to ?? currentUserId,
    type: a?.type ?? ('viewing' as AppointmentType),
    status: a?.status ?? ('scheduled' as AppointmentStatus),
    start_at: a ? toLocalInput(new Date(a.start_at)) : toLocalInput(defaultStart),
    end_at: a ? toLocalInput(new Date(a.end_at)) : toLocalInput(defaultEnd),
    location: a?.location ?? '',
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast('Title is required', 'error'); return; }
    setBusy(true);
    const payload = {
      agency_id: agencyId,
      title: form.title,
      description: form.description || null,
      lead_id: form.lead_id || null,
      property_id: form.property_id || null,
      assigned_to: form.assigned_to || null,
      type: form.type,
      status: form.status,
      start_at: new Date(form.start_at).toISOString(),
      end_at: new Date(form.end_at).toISOString(),
      location: form.location || null,
    };

    const { error } = a
      ? await supabase.from('appointments').update(payload).eq('id', a.id)
      : await supabase.from('appointments').insert(payload);

    setBusy(false);
    if (error) { toast(error.message, 'error'); return; }
    toast(a ? 'Appointment updated' : 'Appointment scheduled');
    onSaved();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={a ? 'Edit Appointment' : 'Schedule Appointment'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Saving…' : a ? 'Save changes' : 'Schedule'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Property viewing with John" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AppointmentType })}>
              {APPOINTMENT_TYPES.map((t) => <option key={t} value={t}>{APPT_TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AppointmentStatus })}>
              {APPOINTMENT_STATUSES.map((s) => <option key={s} value={s}>{APPT_STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start</label>
            <input className="input" type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} />
          </div>
          <div>
            <label className="label">End</label>
            <input className="input" type="datetime-local" value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Lead</label>
            <select className="input" value={form.lead_id} onChange={(e) => setForm({ ...form, lead_id: e.target.value })}>
              <option value="">No lead</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Property</label>
            <select className="input" value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })}>
              <option value="">No property</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Assigned to</label>
            <select className="input" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
              {members.map((m) => <option key={m.user_id} value={m.user_id}>{m.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Office, address, or video link" />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[70px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Agenda, notes…" />
        </div>
      </form>
    </Modal>
  );
}
