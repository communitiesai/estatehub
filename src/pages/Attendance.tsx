import { useState, useMemo } from 'react';
import {
  Clock, LogIn, LogOut, Calendar, Search, MoreHorizontal,
  Edit3, Trash2, Users, UserCheck, UserX, AlertCircle,
} from 'lucide-react';
import { useAttendance, useTeamMembers } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/lib/supabase';
import {
  ATTENDANCE_STATUSES, ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_STYLES,
  formatDate, formatTime,
} from '@/lib/constants';
import type { Attendance as AttendanceRecord, AttendanceStatus } from '@/types';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function durationLabel(checkIn: string, checkOut: string | null) {
  const end = checkOut ? new Date(checkOut).getTime() : Date.now();
  const mins = Math.round((end - new Date(checkIn).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function AttendancePage() {
  const { records, loading, reload } = useAttendance();
  const { members } = useTeamMembers();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>('all');
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const today = todayStr();
  const myToday = useMemo(
    () => records.find((r) => r.user_id === profile?.user_id && r.date === today),
    [records, profile?.user_id, today],
  );

  const todayRecords = useMemo(
    () => records.filter((r) => r.date === today),
    [records, today],
  );

  const stats = useMemo(() => ({
    checkedIn: todayRecords.filter((r) => !r.check_out_at).length,
    checkedOut: todayRecords.filter((r) => r.check_out_at).length,
    late: todayRecords.filter((r) => r.status === 'late').length,
    absent: todayRecords.filter((r) => r.status === 'absent').length,
  }), [todayRecords]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const member = members.find((m) => m.user_id === r.user_id);
      const name = member?.full_name ?? 'Unknown';
      const matchesQuery = !query || name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [records, members, query, statusFilter]);

  function getMember(id: string | null) {
    return id ? members.find((m) => m.user_id === id) ?? null : null;
  }

  async function handleCheckIn() {
    if (!profile?.agency_id || !profile?.user_id) return;
    if (myToday) { toast('You are already checked in today', 'error'); return; }
    const now = new Date();
    const hour = now.getHours();
    const status: AttendanceStatus = hour >= 10 ? 'late' : 'present';
    const { error } = await supabase.from('attendance').insert({
      agency_id: profile.agency_id,
      user_id: profile.user_id,
      date: today,
      check_in_at: now.toISOString(),
      status,
    });
    if (error) { toast(error.message, 'error'); return; }
    toast(`Checked in as ${status === 'late' ? 'Late' : 'Present'}`);
    reload();
  }

  async function handleCheckOut() {
    if (!myToday) { toast('No active check-in to check out from', 'error'); return; }
    if (myToday.check_out_at) { toast('Already checked out', 'error'); return; }
    const { error } = await supabase.from('attendance').update({
      check_out_at: new Date().toISOString(),
    }).eq('id', myToday.id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Checked out');
    reload();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from('attendance').delete().eq('id', deleteId);
    if (error) { toast(error.message, 'error'); return; }
    toast('Attendance record deleted');
    setDeleteId(null);
    reload();
  }

  return (
    <div className="space-y-5" onClick={() => setMenuId(null)}>
      {/* Check-in card */}
      <div className="card p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
              <Calendar className="w-4 h-4" /> {formatDate(new Date().toISOString())}
            </div>
            <h2 className="text-xl font-bold">
              {myToday
                ? myToday.check_out_at
                  ? 'Day complete'
                  : 'You are checked in'
                : 'Ready to check in?'}
            </h2>
            {myToday && (
              <p className="text-sm text-slate-300 mt-1">
                In at {formatTime(myToday.check_in_at)}
                {myToday.check_out_at && ` · Out at ${formatTime(myToday.check_out_at)}`}
                {' · '} {durationLabel(myToday.check_in_at, myToday.check_out_at)}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {!myToday && (
              <button
                onClick={handleCheckIn}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm flex items-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4" /> Check In
              </button>
            )}
            {myToday && !myToday.check_out_at && (
              <button
                onClick={handleCheckOut}
                className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-medium text-sm flex items-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" /> Check Out
              </button>
            )}
            {myToday?.check_out_at && (
              <span className={`badge ${ATTENDANCE_STATUS_STYLES[myToday.status]}`}>
                {ATTENDANCE_STATUS_LABELS[myToday.status]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><UserCheck className="w-4 h-4" /> Checked In</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.checkedIn}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><LogOut className="w-4 h-4" /> Checked Out</div>
          <div className="text-2xl font-bold text-slate-900">{stats.checkedOut}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-amber-500 text-xs mb-1"><Clock className="w-4 h-4" /> Late</div>
          <div className="text-2xl font-bold text-amber-600">{stats.late}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-red-500 text-xs mb-1"><UserX className="w-4 h-4" /> Absent</div>
          <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search by name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="input w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AttendanceStatus | 'all')}
          >
            <option value="all">All statuses</option>
            {ATTENDANCE_STATUSES.map((s) => <option key={s} value={s}>{ATTENDANCE_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400 text-sm">Loading attendance…</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Clock className="w-6 h-6" />}
            title={query || statusFilter !== 'all' ? 'No records match your filters' : 'No attendance records yet'}
            description="Check in to start tracking your attendance for today."
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((rec) => {
            const member = getMember(rec.user_id);
            const isActive = !rec.check_out_at && rec.date === today;
            return (
              <div key={rec.id} className={`card p-4 flex items-center gap-3 hover:shadow-md transition-all ${isActive ? 'ring-1 ring-emerald-200' : ''}`}>
                <Avatar name={member?.full_name ?? '?'} src={member?.avatar_url ?? null} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">{member?.full_name ?? 'Unknown member'}</div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(rec.date)}</span>
                    <span className="flex items-center gap-1"><LogIn className="w-3 h-3" /> {formatTime(rec.check_in_at)}</span>
                    {rec.check_out_at && (
                      <span className="flex items-center gap-1"><LogOut className="w-3 h-3" /> {formatTime(rec.check_out_at)}</span>
                    )}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {durationLabel(rec.check_in_at, rec.check_out_at)}</span>
                    {rec.note && <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {rec.note}</span>}
                  </div>
                </div>
                <span className={`badge ${ATTENDANCE_STATUS_STYLES[rec.status]}`}>{ATTENDANCE_STATUS_LABELS[rec.status]}</span>
                {isActive && <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active</span>}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setMenuId(menuId === rec.id ? null : rec.id)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {menuId === rec.id && (
                    <div className="absolute right-0 top-full mt-1 w-32 card p-1.5 z-20 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditing(rec); setMenuId(null); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded">
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => { setDeleteId(rec.id); setMenuId(null); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <EditAttendanceModal
          record={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete attendance record?"
        message="This will permanently remove the attendance entry."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

interface EditAttendanceModalProps {
  record: AttendanceRecord;
  onClose: () => void;
  onSaved: () => void;
}

function EditAttendanceModal({ record, onClose, onSaved }: EditAttendanceModalProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    status: record.status,
    check_in_at: record.check_in_at.slice(0, 16),
    check_out_at: record.check_out_at ? record.check_out_at.slice(0, 16) : '',
    note: record.note ?? '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from('attendance').update({
      status: form.status,
      check_in_at: new Date(form.check_in_at).toISOString(),
      check_out_at: form.check_out_at ? new Date(form.check_out_at).toISOString() : null,
      note: form.note || null,
    }).eq('id', record.id);
    setBusy(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('Attendance updated');
    onSaved();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit attendance"
      size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AttendanceStatus })}>
            {ATTENDANCE_STATUSES.map((s) => <option key={s} value={s}>{ATTENDANCE_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Check In</label>
            <input className="input" type="datetime-local" value={form.check_in_at} onChange={(e) => setForm({ ...form, check_in_at: e.target.value })} />
          </div>
          <div>
            <label className="label">Check Out</label>
            <input className="input" type="datetime-local" value={form.check_out_at} onChange={(e) => setForm({ ...form, check_out_at: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Note</label>
          <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional note…" />
        </div>
      </form>
    </Modal>
  );
}
