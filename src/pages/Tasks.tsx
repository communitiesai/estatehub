import { useState, useMemo, type FormEvent } from 'react';
import { Plus, CheckSquare, Clock, AlertCircle, MoreHorizontal, Trash2, Edit3, Calendar, Flag } from 'lucide-react';
import { useTasks, useLeads, useDeals, useTeamMembers } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/lib/supabase';
import {
  TASK_PRIORITIES, TASK_STATUSES,
  TASK_PRIORITY_LABELS, TASK_PRIORITY_STYLES,
  TASK_STATUS_LABELS, TASK_STATUS_STYLES,
  formatDate, isOverdue, relativeTime,
} from '@/lib/constants';
import type { Task, TaskPriority, TaskStatus } from '@/types';

export function TasksPage() {
  const { tasks, loading, reload } = useTasks();
  const { leads } = useLeads();
  const { deals } = useDeals();
  const { members } = useTeamMembers();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [menuId, setMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'pending') return tasks.filter((t) => t.status !== 'completed');
    if (filter === 'completed') return tasks.filter((t) => t.status === 'completed');
    return tasks;
  }, [tasks, filter]);

  const counts = useMemo(() => ({
    pending: tasks.filter((t) => t.status !== 'completed').length,
    overdue: tasks.filter((t) => t.status !== 'completed' && isOverdue(t.due_at)).length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  }), [tasks]);

  function getLead(id: string | null) { return id ? leads.find((l) => l.id === id) : null; }
  function getMember(id: string | null) { return id ? members.find((m) => m.user_id === id) : null; }

  async function toggleComplete(task: Task) {
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    const { error } = await supabase.from('tasks').update({
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    }).eq('id', task.id);
    if (error) { toast(error.message, 'error'); return; }
    reload();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from('tasks').delete().eq('id', deleteId);
    if (error) { toast(error.message, 'error'); return; }
    toast('Task deleted');
    reload();
  }

  return (
    <div className="space-y-5" onClick={() => setMenuId(null)}>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Clock className="w-4 h-4" /> Pending</div>
          <div className="text-2xl font-bold text-slate-900">{counts.pending}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-red-500 text-xs mb-1"><AlertCircle className="w-4 h-4" /> Overdue</div>
          <div className="text-2xl font-bold text-red-600">{counts.overdue}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-emerald-500 text-xs mb-1"><CheckSquare className="w-4 h-4" /> Completed</div>
          <div className="text-2xl font-bold text-emerald-600">{counts.completed}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-2">
          {(['pending', 'completed', 'all'] as const).map((f) => (
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
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-slate-400 text-sm">Loading tasks…</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<CheckSquare className="w-6 h-6" />}
            title={filter === 'completed' ? 'No completed tasks' : 'No tasks'}
            description={filter === 'pending' ? 'Create a follow-up task to stay on top of your deals.' : 'Tasks will appear here.'}
            action={filter !== 'completed' ? <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="w-4 h-4" /> New Task</button> : undefined}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const lead = getLead(task.lead_id);
            const member = getMember(task.assigned_to);
            const overdue = task.status !== 'completed' && isOverdue(task.due_at);
            const done = task.status === 'completed';
            return (
              <div key={task.id} className={`card p-4 flex items-center gap-3 ${done ? 'opacity-60' : ''} hover:shadow-md transition-all`}>
                <button
                  onClick={() => toggleComplete(task)}
                  className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-slate-400'}`}
                >
                  {done && <CheckSquare className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-slate-900 ${done ? 'line-through' : ''}`}>{task.title}</div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    {task.due_at && (
                      <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-semibold' : ''}`}>
                        <Calendar className="w-3 h-3" />
                        {overdue ? 'Overdue · ' : ''}{formatDate(task.due_at)}
                      </span>
                    )}
                    {lead && <span>· {lead.full_name}</span>}
                    {member && <span className="flex items-center gap-1">· <Avatar name={member.full_name} src={member.avatar_url} size="xs" /> {member.full_name}</span>}
                  </div>
                </div>
                <span className={`badge ${TASK_PRIORITY_STYLES[task.priority]}`}>
                  <Flag className="w-3 h-3" /> {TASK_PRIORITY_LABELS[task.priority]}
                </span>
                <span className={`badge ${TASK_STATUS_STYLES[task.status]}`}>{TASK_STATUS_LABELS[task.status]}</span>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setMenuId(menuId === task.id ? null : task.id)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {menuId === task.id && (
                    <div className="absolute right-0 top-full mt-1 w-32 card p-1.5 z-20 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditing(task); setShowForm(true); setMenuId(null); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded">
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => { setDeleteId(task.id); setMenuId(null); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded">
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

      {showForm && (
        <TaskForm
          task={editing}
          leads={leads}
          deals={deals}
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
        title="Delete task?"
        message="This will permanently remove the task."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

interface TaskFormProps {
  task: Task | null;
  leads: { id: string; full_name: string }[];
  deals: { id: string; lead_id: string }[];
  members: { user_id: string; full_name: string }[];
  currentUserId: string;
  agencyId: string;
  onClose: () => void;
  onSaved: () => void;
}

function TaskForm({ task, leads, members, currentUserId, agencyId, onClose, onSaved }: TaskFormProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    lead_id: task?.lead_id ?? '',
    assigned_to: task?.assigned_to ?? currentUserId,
    priority: task?.priority ?? ('medium' as TaskPriority),
    status: task?.status ?? ('pending' as TaskStatus),
    due_at: task?.due_at ? new Date(task.due_at).toISOString().slice(0, 16) : '',
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
      assigned_to: form.assigned_to || null,
      priority: form.priority,
      status: form.status,
      due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
      completed_at: form.status === 'completed' ? new Date().toISOString() : null,
    };

    const { error } = task
      ? await supabase.from('tasks').update(payload).eq('id', task.id)
      : await supabase.from('tasks').insert(payload);

    setBusy(false);
    if (error) { toast(error.message, 'error'); return; }
    toast(task ? 'Task updated' : 'Task created');
    onSaved();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={task ? 'Edit Task' : 'New Task'}
      size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Saving…' : task ? 'Save changes' : 'Create task'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Follow up with John about the offer" required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[70px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Task details…" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
              {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{TASK_PRIORITY_LABELS[p]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}>
              {TASK_STATUSES.map((s) => <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Related lead</label>
            <select className="input" value={form.lead_id} onChange={(e) => setForm({ ...form, lead_id: e.target.value })}>
              <option value="">No lead</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Assigned to</label>
            <select className="input" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
              {members.map((m) => <option key={m.user_id} value={m.user_id}>{m.full_name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Due date</label>
          <input className="input" type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} />
        </div>
      </form>
    </Modal>
  );
}
