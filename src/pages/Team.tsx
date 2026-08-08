import { useState, useMemo, type FormEvent } from 'react';
import {
  UserCog, Plus, MoreHorizontal, Mail, Phone, Edit3,
  ShieldCheck, User, Crown, UserX, Search, ArrowUpRight,
} from 'lucide-react';
import { useTeamMembers } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/lib/supabase';
import {
  USER_ROLES, USER_ROLE_LABELS, USER_ROLE_STYLES, formatDate,
} from '@/lib/constants';
import type { Profile, UserRole } from '@/types';

export function TeamPage() {
  const { members, loading, reload } = useTeamMembers();
  const { profile } = useAuth();
  const { toast } = useToast();

  const isAdmin = profile?.role === 'admin';

  const [showInvite, setShowInvite] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesQuery = !query ||
        m.full_name.toLowerCase().includes(query.toLowerCase()) ||
        (m.title ?? '').toLowerCase().includes(query.toLowerCase()) ||
        (m.phone ?? '').toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === 'all' || m.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [members, query, roleFilter]);

  const stats = useMemo(() => ({
    total: members.length,
    admins: members.filter((m) => m.role === 'admin').length,
    agents: members.filter((m) => m.role === 'agent').length,
    clients: members.filter((m) => m.role === 'client').length,
  }), [members]);

  async function handleToggleActive(member: Profile) {
    const next = !member.active;
    const { error } = await supabase
      .from('profiles')
      .update({ active: next })
      .eq('user_id', member.user_id);
    if (error) { toast(error.message, 'error'); return; }
    toast(next ? 'Member reactivated' : 'Member deactivated');
    reload();
  }

  async function handleConfirmDeactivate() {
    if (!deactivateId) return;
    const { error } = await supabase
      .from('profiles')
      .update({ active: false })
      .eq('user_id', deactivateId);
    if (error) { toast(error.message, 'error'); return; }
    toast('Member deactivated');
    setDeactivateId(null);
    reload();
  }

  return (
    <div className="space-y-5" onClick={() => setMenuId(null)}>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><UserCog className="w-4 h-4" /> Total</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Crown className="w-4 h-4" /> Admins</div>
          <div className="text-2xl font-bold text-slate-900">{stats.admins}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><ShieldCheck className="w-4 h-4" /> Agents</div>
          <div className="text-2xl font-bold text-blue-600">{stats.agents}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><User className="w-4 h-4" /> Clients</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.clients}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search by name, title…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="input w-auto"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          >
            <option value="all">All roles</option>
            {USER_ROLES.map((r) => <option key={r} value={r}>{USER_ROLE_LABELS[r]}</option>)}
          </select>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowInvite(true)}>
            <Plus className="w-4 h-4" /> Invite member
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400 text-sm">Loading team…</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<UserCog className="w-6 h-6" />}
            title={query || roleFilter !== 'all' ? 'No members match your filters' : 'No team members yet'}
            description={isAdmin ? 'Invite agents and clients to your agency to start collaborating.' : 'Team members will appear here.'}
            action={isAdmin && !query && roleFilter === 'all' ? (
              <button className="btn-primary" onClick={() => setShowInvite(true)}>
                <Plus className="w-4 h-4" /> Invite member
              </button>
            ) : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((member) => {
            const isSelf = member.user_id === profile?.user_id;
            const memberIsAdmin = member.role === 'admin';
            return (
              <div
                key={member.user_id}
                className={`card p-5 flex items-start gap-4 hover:shadow-md transition-all ${!member.active ? 'opacity-60' : ''}`}
              >
                <Avatar name={member.full_name} src={member.avatar_url} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 truncate">{member.full_name}</h3>
                    {isSelf && <span className="badge bg-slate-100 text-slate-500">You</span>}
                    {!member.active && <span className="badge bg-slate-100 text-slate-400">Inactive</span>}
                  </div>
                  <p className="text-sm text-slate-500 truncate mt-0.5">{member.title ?? USER_ROLE_LABELS[member.role]}</p>
                  <div className="flex flex-col gap-1 mt-3 text-xs text-slate-500">
                    {member.phone && (
                      <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {member.phone}</span>
                    )}
                    <span className="flex items-center gap-1.5"><ArrowUpRight className="w-3 h-3" /> Joined {formatDate(member.created_at)}</span>
                  </div>
                  <div className="mt-3">
                    <span className={`badge ${USER_ROLE_STYLES[member.role]}`}>
                      {memberIsAdmin ? <Crown className="w-3 h-3" /> : member.role === 'agent' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {USER_ROLE_LABELS[member.role]}
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setMenuId(menuId === member.user_id ? null : member.user_id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuId === member.user_id && (
                      <div className="absolute right-0 top-full mt-1 w-36 card p-1.5 z-20 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => { setEditing(member); setMenuId(null); }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit details
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => { handleToggleActive(member); setMenuId(null); }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded"
                          >
                            <UserX className="w-3.5 h-3.5" /> {member.active ? 'Deactivate' : 'Reactivate'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showInvite && (
        <InviteForm
          onClose={() => setShowInvite(false)}
          onSaved={() => { setShowInvite(false); reload(); }}
        />
      )}

      {editing && (
        <EditForm
          member={editing}
          isSelf={editing.user_id === profile?.user_id}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}

      <ConfirmDialog
        open={!!deactivateId}
        onClose={() => setDeactivateId(null)}
        onConfirm={handleConfirmDeactivate}
        title="Deactivate member?"
        message="They will lose access to the agency but their profile and history remain intact."
        confirmLabel="Deactivate"
        danger
      />
    </div>
  );
}

/* ---------- Invite form ---------- */

interface InviteFormProps {
  onClose: () => void;
  onSaved: () => void;
}

function InviteForm({ onClose, onSaved }: InviteFormProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: 'agent' as UserRole,
    title: '',
    phone: '',
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      toast('Name and email are required', 'error');
      return;
    }
    setBusy(true);
    try {
      const session = await supabase.auth.getSession();
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-team-member`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.session?.access_token ?? ''}`,
        },
        body: JSON.stringify({
          email: form.email,
          fullName: form.full_name,
          role: form.role,
          title: form.title || undefined,
          phone: form.phone || undefined,
        }),
      });
      const data = await response.json();
      setBusy(false);
      if (!response.ok) {
        toast(data.error ?? `Request failed (${response.status})`, 'error');
        return;
      }
      toast(`Invitation sent — temp password: ${data.tempPassword}`);
      onSaved();
    } catch (err) {
      setBusy(false);
      toast((err as Error).message, 'error');
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Invite team member"
      description="They'll get a temporary password and join your agency."
      size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Sending…' : 'Send invite'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full name *</label>
            <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Priya Sharma" required />
          </div>
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="priya@agency.com" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
              {USER_ROLES.map((r) => <option key={r} value={r}>{USER_ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Senior Agent" />
          </div>
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Edit form ---------- */

interface EditFormProps {
  member: Profile;
  isSelf: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function EditForm({ member, isSelf, onClose, onSaved }: EditFormProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: member.full_name,
    role: member.role,
    title: member.title ?? '',
    phone: member.phone ?? '',
    avatar_url: member.avatar_url ?? '',
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim()) { toast('Name is required', 'error'); return; }
    setBusy(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        role: form.role,
        title: form.title || null,
        phone: form.phone || null,
        avatar_url: form.avatar_url || null,
      })
      .eq('user_id', member.user_id);
    setBusy(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('Member updated');
    onSaved();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit team member"
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
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <Avatar name={form.full_name} src={form.avatar_url || null} size="lg" />
          <div className="flex-1">
            <label className="label">Avatar URL</label>
            <input className="input" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://…" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full name *</label>
            <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
              {USER_ROLES.map((r) => <option key={r} value={r}>{USER_ROLE_LABELS[r]}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Senior Agent" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
        </div>
        {isSelf && (
          <p className="text-xs text-slate-400 flex items-center gap-1.5"><Mail className="w-3 h-3" /> You can edit your own profile here or from the Settings page.</p>
        )}
      </form>
    </Modal>
  );
}
