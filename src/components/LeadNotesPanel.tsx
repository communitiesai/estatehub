import { useState, type FormEvent } from 'react';
import { X, Send, StickyNote, Trash2, Clock } from 'lucide-react';
import { useLeadNotes, useTeamMembers } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Avatar } from '@/components/Avatar';
import { formatDate, relativeTime } from '@/lib/constants';
import type { Lead } from '@/types';

interface LeadNotesPanelProps {
  lead: Lead;
  onClose: () => void;
}

export function LeadNotesPanel({ lead, onClose }: LeadNotesPanelProps) {
  const { notes, loading, addNote, deleteNote } = useLeadNotes(lead.id);
  const { members } = useTeamMembers();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  function actorName(actorId: string | null): string {
    if (!actorId) return 'System';
    if (actorId === profile?.user_id) return 'You';
    return members.find((m) => m.user_id === actorId)?.full_name ?? 'Team member';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    const result = await addNote(text, lead.agency_id, profile?.user_id ?? '');
    setBusy(false);
    if (!result) { toast('Failed to add note', 'error'); return; }
    setText('');
  }

  async function handleDelete(id: string) {
    const ok = await deleteNote(id);
    if (!ok) { toast('Failed to delete note', 'error'); return; }
    toast('Note deleted');
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="fixed top-0 right-0 z-50 h-screen w-full max-w-md bg-white shadow-2xl flex flex-col animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
              <StickyNote className="w-3.5 h-3.5" /> Notes
            </div>
            <h3 className="font-bold text-slate-900 truncate">{lead.full_name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add note */}
        <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <textarea
                className="input min-h-[70px] resize-y pr-12"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a note… (e.g. Called about 2BHK in Andheri, budget 80L-1Cr)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e);
                }}
              />
              <button
                type="submit"
                disabled={busy || !text.trim()}
                className="absolute bottom-3 right-3 p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Press ⌘/Ctrl + Enter to send</p>
          </form>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="text-center text-slate-400 text-sm py-8">Loading notes…</div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-3">
                <StickyNote className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1">No notes yet</p>
              <p className="text-xs text-slate-500 max-w-xs">Add a note above to keep a timestamped log of your interactions with this lead.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => {
                const name = actorName(note.actor_id);
                return (
                  <div key={note.id} className="group relative flex gap-3">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <Avatar name={name} size="sm" />
                      <div className="w-px flex-1 bg-slate-200 mt-2" />
                    </div>
                    {/* Note body */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900 truncate">{name}</span>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">{note.description}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span title={formatDate(note.created_at, { withTime: true })}>
                          {formatDate(note.created_at, { withTime: true })}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span>{relativeTime(note.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
