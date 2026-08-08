import { useState, useMemo, type FormEvent } from 'react';
import {
  Plus, Search, MoreHorizontal, Trash2, Edit3, Phone, Mail, Star,
  Building, MapPin, Contact as ContactIcon, X, Users, Briefcase,
} from 'lucide-react';
import { useContacts } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/lib/supabase';
import {
  CONTACT_TYPES, CONTACT_TYPE_LABELS, CONTACT_TYPE_STYLES,
  relativeTime,
} from '@/lib/constants';
import type { Contact, ContactType } from '@/types';

const TYPE_ICONS: Record<ContactType, typeof Briefcase> = {
  vendor: Briefcase, client: Users, partner: Users,
  service_provider: Briefcase, contractor: Briefcase, other: ContactIcon,
};

export function ContactsPage() {
  const { contacts, loading, reload } = useContacts();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContactType | 'all'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (favoritesOnly && !c.is_favorite) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.full_name.toLowerCase().includes(q) ||
          (c.email?.toLowerCase().includes(q) ?? false) ||
          (c.phone?.includes(q) ?? false) ||
          (c.company?.toLowerCase().includes(q) ?? false) ||
          (c.role?.toLowerCase().includes(q) ?? false) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [contacts, search, typeFilter, favoritesOnly]);

  const stats = useMemo(() => ({
    total: contacts.length,
    favorites: contacts.filter((c) => c.is_favorite).length,
    vendors: contacts.filter((c) => c.type === 'vendor').length,
    clients: contacts.filter((c) => c.type === 'client').length,
    partners: contacts.filter((c) => c.type === 'partner').length,
  }), [contacts]);

  async function handleToggleFavorite(c: Contact) {
    const { error } = await supabase
      .from('contacts')
      .update({ is_favorite: !c.is_favorite })
      .eq('id', c.id);
    if (error) { toast(error.message, 'error'); return; }
    reload();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from('contacts').delete().eq('id', deleteId);
    if (error) { toast(error.message, 'error'); return; }
    toast('Contact deleted');
    setDeleteId(null);
    reload();
  }

  return (
    <div className="space-y-5" onClick={() => setMenuId(null)}>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-900' },
          { label: 'Favorites', value: stats.favorites, color: 'text-amber-600' },
          { label: 'Vendors', value: stats.vendors, color: 'text-blue-600' },
          { label: 'Clients', value: stats.clients, color: 'text-emerald-600' },
          { label: 'Partners', value: stats.partners, color: 'text-cyan-600' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search contacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-auto"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ContactType | 'all')}
          >
            <option value="all">All types</option>
            {CONTACT_TYPES.map((t) => <option key={t} value={t}>{CONTACT_TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${
              favoritesOnly
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => setFavoritesOnly((f) => !f)}
          >
            <Star className={`w-4 h-4 ${favoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            Favorites
          </button>
          <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </div>
      </div>

      {(search || typeFilter !== 'all' || favoritesOnly) && (
        <button
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
          onClick={() => { setSearch(''); setTypeFilter('all'); setFavoritesOnly(false); }}
        >
          <X className="w-3.5 h-3.5" /> Clear filters
        </button>
      )}

      {/* Grid */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400 text-sm">Loading contacts…</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<ContactIcon className="w-6 h-6" />}
            title={contacts.length === 0 ? 'No contacts yet' : 'No contacts match your filters'}
            description={contacts.length === 0 ? 'Add vendors, clients, partners, and service providers to your contact directory.' : 'Try adjusting your search or filters.'}
            action={contacts.length === 0 ? (
              <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
                <Plus className="w-4 h-4" /> Add Contact
              </button>
            ) : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const Icon = TYPE_ICONS[c.type];
            return (
              <div
                key={c.id}
                className="card p-5 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={c.full_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 truncate">{c.full_name}</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(c); }}
                        className="flex-shrink-0 text-slate-300 hover:text-amber-400 transition-colors"
                      >
                        <Star className={`w-4 h-4 ${c.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </div>
                    {c.role && <p className="text-xs text-slate-500 truncate">{c.role}</p>}
                    {c.company && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <Building className="w-3 h-3" /> {c.company}
                      </p>
                    )}
                  </div>
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setMenuId(menuId === c.id ? null : c.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuId === c.id && (
                      <div className="absolute right-0 top-full mt-1 w-36 card p-1.5 z-20 animate-scaleIn">
                        <button
                          onClick={() => { setEditing(c); setShowForm(true); setMenuId(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md"
                        >
                          <Edit3 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => { setDeleteId(c.id); setMenuId(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className={`badge ${CONTACT_TYPE_STYLES[c.type]} flex items-center gap-1`}>
                    <Icon className="w-3 h-3" /> {CONTACT_TYPE_LABELS[c.type]}
                  </span>
                  {c.tags.slice(0, 2).map((t) => (
                    <span key={t} className="badge bg-slate-100 text-slate-500">{t}</span>
                  ))}
                  {c.tags.length > 2 && (
                    <span className="badge bg-slate-100 text-slate-400">+{c.tags.length - 2}</span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors truncate"
                    >
                      <Mail className="w-3.5 h-3.5" /> <span className="truncate">{c.email}</span>
                    </a>
                  )}
                  {c.phone && (
                    <a
                      href={`tel:${c.phone}`}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition-colors ml-auto flex-shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5" /> {c.phone}
                    </a>
                  )}
                </div>

                {(c.city || c.notes) && (
                  <div className="mt-2 space-y-1">
                    {c.city && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {c.city}
                      </p>
                    )}
                    {c.notes && (
                      <p className="text-xs text-slate-400 line-clamp-2">{c.notes}</p>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-slate-300 mt-3">Added {relativeTime(c.created_at)}</p>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <ContactForm
          contact={editing}
          agencyId={profile?.agency_id ?? ''}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); reload(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete contact?"
        message="This will permanently remove the contact from your directory."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

interface ContactFormProps {
  contact: Contact | null;
  agencyId: string;
  onClose: () => void;
  onSaved: () => void;
}

function ContactForm({ contact: c, agencyId, onClose, onSaved }: ContactFormProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    full_name: c?.full_name ?? '',
    email: c?.email ?? '',
    phone: c?.phone ?? '',
    company: c?.company ?? '',
    role: c?.role ?? '',
    type: c?.type ?? ('other' as ContactType),
    address: c?.address ?? '',
    city: c?.city ?? '',
    notes: c?.notes ?? '',
    tags: c?.tags ?? [] as string[],
    is_favorite: c?.is_favorite ?? false,
  });

  function addTag() {
    const t = tagInput.trim();
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
    if (!form.full_name.trim()) { toast('Name is required', 'error'); return; }
    setBusy(true);
    const payload = {
      agency_id: agencyId,
      full_name: form.full_name.trim(),
      email: form.email || null,
      phone: form.phone || null,
      company: form.company || null,
      role: form.role || null,
      type: form.type,
      address: form.address || null,
      city: form.city || null,
      notes: form.notes || null,
      tags: form.tags,
      is_favorite: form.is_favorite,
    };

    const { error } = c
      ? await supabase.from('contacts').update(payload).eq('id', c.id)
      : await supabase.from('contacts').insert(payload);

    setBusy(false);
    if (error) { toast(error.message, 'error'); return; }
    toast(c ? 'Contact updated' : 'Contact added');
    onSaved();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={c ? 'Edit Contact' : 'Add Contact'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Saving…' : c ? 'Save changes' : 'Add contact'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="John Smith" required />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ContactType })}>
              {CONTACT_TYPES.map((t) => <option key={t} value={t}>{CONTACT_TYPE_LABELS[t]}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555-0100" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Company</label>
            <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" />
          </div>
          <div>
            <label className="label">Role / Title</label>
            <input className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Mortgage Broker" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">City</label>
            <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" />
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address" />
          </div>
        </div>

        <div>
          <label className="label">Tags</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="Type a tag and press Enter…"
            />
            <button type="button" className="btn-secondary" onClick={addTag}>Add</button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.tags.map((t) => (
                <span key={t} className="badge bg-slate-100 text-slate-600 flex items-center gap-1">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="text-slate-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-[70px] resize-y" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Background, relationship notes…" />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_favorite}
            onChange={(e) => setForm({ ...form, is_favorite: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
          />
          <span className="text-sm text-slate-700 flex items-center gap-1">
            <Star className={`w-4 h-4 ${form.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            Mark as favorite
          </span>
        </label>
      </form>
    </Modal>
  );
}
