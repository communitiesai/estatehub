import { useState, useMemo, type FormEvent } from 'react';
import {
  Plus, Search, Filter, Home, MapPin, Bed, Bath, Maximize, Car, X,
  Edit3, Trash2, Star, Eye, MessageSquare, Play, Video, ArrowLeft,
  CheckSquare, Square, Map as MapIcon,
} from 'lucide-react';
import { useProperties, useTeamMembers } from '@/hooks/useData';
import { PropertyMap } from '@/components/PropertyMap';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/lib/supabase';
import {
  PROPERTY_TYPES, PROPERTY_STATUSES, LISTING_TYPES,
  PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_STATUS_STYLES,
  LISTING_TYPE_LABELS, AMENITY_OPTIONS, CURRENCIES, formatCurrency, formatDate,
} from '@/lib/constants';
import type { Property, PropertyType, PropertyStatus, ListingType } from '@/types';

const PROPERTY_IMAGES = [
  'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/32870/pexels-photo-32870.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2462015/pexels-photo-2462015.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export function PropertiesPage() {
  const { properties, loading, reload } = useProperties();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all');
  const [listingFilter, setListingFilter] = useState<ListingType | 'all'>('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [bedsMin, setBedsMin] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid');

  const [editing, setEditing] = useState<Property | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (listingFilter !== 'all' && p.listing_type !== listingFilter) return false;
      if (priceMin && p.price < Number(priceMin)) return false;
      if (priceMax && p.price > Number(priceMax)) return false;
      if (bedsMin && p.bedrooms < Number(bedsMin)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          (p.location?.toLowerCase().includes(q) ?? false) ||
          (p.city?.toLowerCase().includes(q) ?? false) ||
          (p.address?.toLowerCase().includes(q) ?? false) ||
          p.amenities.some((a) => a.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [properties, search, typeFilter, statusFilter, listingFilter, priceMin, priceMax, bedsMin]);

  const detail = detailId ? properties.find((p) => p.id === detailId) : null;

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from('properties').delete().eq('id', deleteId);
    if (error) { toast(error.message, 'error'); return; }
    toast('Property deleted');
    reload();
  }

  async function toggleFeatured(p: Property) {
    const { error } = await supabase.from('properties').update({ featured: !p.featured }).eq('id', p.id);
    if (error) { toast(error.message, 'error'); return; }
    reload();
  }

  if (detail) {
    return <PropertyDetail property={detail} onBack={() => setDetailId(null)} onEdit={() => { setEditing(detail); setDetailId(null); setShowForm(true); }} />;
  }

  return (
    <div className="space-y-5" onClick={() => {}}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search by title, location, city, amenities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setShowFilters((f) => !f)}>
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <div className="flex rounded-lg border border-slate-300 overflow-hidden">
            <button onClick={() => setView('grid')} className={`px-3 py-2.5 text-sm ${view === 'grid' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`} title="Grid view">
              Grid
            </button>
            <button onClick={() => setView('list')} className={`px-3 py-2.5 text-sm ${view === 'list' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`} title="List view">
              List
            </button>
            <button onClick={() => setView('map')} className={`px-3 py-2.5 text-sm flex items-center gap-1 ${view === 'map' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`} title="Map view">
              <MapIcon className="w-4 h-4" /> Map
            </button>
          </div>
          <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="card p-4 animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as PropertyType | 'all')}>
                <option value="all">All types</option>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | 'all')}>
                <option value="all">All statuses</option>
                {PROPERTY_STATUSES.map((s) => <option key={s} value={s}>{PROPERTY_STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Listing</label>
              <select className="input" value={listingFilter} onChange={(e) => setListingFilter(e.target.value as ListingType | 'all')}>
                <option value="all">All</option>
                {LISTING_TYPES.map((l) => <option key={l} value={l}>{LISTING_TYPE_LABELS[l]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Min price</label>
              <input className="input" type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Max price</label>
              <input className="input" type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="∞" />
            </div>
            <div>
              <label className="label">Min beds</label>
              <select className="input" value={bedsMin} onChange={(e) => setBedsMin(e.target.value)}>
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
          </div>
          {(typeFilter !== 'all' || statusFilter !== 'all' || listingFilter !== 'all' || priceMin || priceMax || bedsMin) && (
            <button className="btn-ghost mt-3" onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setListingFilter('all'); setPriceMin(''); setPriceMax(''); setBedsMin(''); }}>
              <X className="w-4 h-4" /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-slate-500">
        {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'}`}
      </div>

      {/* Grid/List */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400 text-sm">Loading properties…</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Home className="w-6 h-6" />}
            title={properties.length === 0 ? 'No properties yet' : 'No properties match your filters'}
            description={properties.length === 0 ? 'Add your first property listing to get started.' : 'Try adjusting your search or filters.'}
            action={properties.length === 0 ? (
              <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
                <Plus className="w-4 h-4" /> Add Property
              </button>
            ) : undefined}
          />
        </div>
      ) : view === 'map' ? (
        <div className="card overflow-hidden">
          <PropertyMap
            properties={filtered}
            onPropertyClick={(id) => setDetailId(id)}
            className="h-[600px]"
          />
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} onClick={() => setDetailId(p.id)} onToggleFeatured={() => toggleFeatured(p)} />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600">Property</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Type</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Price</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Beds/Baths</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Views</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setDetailId(p.id)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {p.images[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate flex items-center gap-1">
                            {p.featured && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                            {p.title}
                          </div>
                          <div className="text-xs text-slate-400 truncate">{p.city ? `${p.city}` : '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{PROPERTY_TYPE_LABELS[p.type]}</td>
                    <td className="px-4 py-3"><span className={`badge ${PROPERTY_STATUS_STYLES[p.status]}`}>{PROPERTY_STATUS_LABELS[p.status]}</span></td>
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{formatCurrency(p.price, p.currency)}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600">{p.bedrooms}bd / {p.bathrooms}ba</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-500">{p.views}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <PropertyForm
          property={editing}
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
        title="Delete property?"
        message="This will permanently remove the property listing and cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function PropertyCard({ property: p, onClick, onToggleFeatured }: { property: Property; onClick: () => void; onToggleFeatured: () => void }) {
  return (
    <div className="card overflow-hidden group cursor-pointer hover:shadow-md transition-all" onClick={onClick}>
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {p.images[0] ? (
          <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300"><Home className="w-12 h-12" /></div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`badge ${PROPERTY_STATUS_STYLES[p.status]} shadow-sm`}>{PROPERTY_STATUS_LABELS[p.status]}</span>
          <span className="badge bg-white/90 text-slate-700 shadow-sm">{LISTING_TYPE_LABELS[p.listing_type]}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFeatured(); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white"
        >
          <Star className={`w-4 h-4 ${p.featured ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
        </button>
        {p.images.length > 1 && (
          <div className="absolute bottom-3 right-3 badge bg-black/60 text-white">{p.images.length} photos</div>
        )}
        {p.virtual_tour_url && (
          <div className="absolute bottom-3 left-3 badge bg-black/60 text-white"><Play className="w-3 h-3" /> Tour</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-slate-900 leading-tight line-clamp-1">{p.title}</h3>
        </div>
        <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{[p.location, p.city].filter(Boolean).join(', ') || '—'}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
          {p.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{p.bedrooms}</span>}
          {p.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{p.bathrooms}</span>}
          {p.area_sqft && <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" />{Number(p.area_sqft).toLocaleString()}</span>}
          {p.parking > 0 && <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" />{p.parking}</span>}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="font-bold text-lg text-slate-900">{formatCurrency(p.price, p.currency)}</div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{p.views}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{p.inquiries}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Property Detail ============

function PropertyDetail({ property: p, onBack, onEdit }: { property: Property; onBack: () => void; onEdit: () => void }) {
  const [activeImage, setActiveImage] = useState(0);
  const images = p.images.length > 0 ? p.images : ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back to properties</button>
        <button onClick={onEdit} className="btn-secondary"><Edit3 className="w-4 h-4" /> Edit</button>
      </div>

      {/* Gallery */}
      <div className="card overflow-hidden">
        <div className="h-80 sm:h-[420px] bg-slate-100 relative">
          <img src={images[activeImage]} alt={p.title} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`badge ${PROPERTY_STATUS_STYLES[p.status]} shadow-sm`}>{PROPERTY_STATUS_LABELS[p.status]}</span>
            <span className="badge bg-white/90 text-slate-700 shadow-sm">{PROPERTY_TYPE_LABELS[p.type]}</span>
            {p.featured && <span className="badge bg-amber-100 text-amber-700 shadow-sm"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Featured</span>}
          </div>
          {p.virtual_tour_url && (
            <a href={p.virtual_tour_url} target="_blank" rel="noopener" className="absolute bottom-4 right-4 btn-primary">
              <Play className="w-4 h-4" /> Virtual Tour
            </a>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${activeImage === i ? 'border-slate-900' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{p.title}</h2>
            <div className="flex items-center gap-2 text-slate-500 mb-4">
              <MapPin className="w-4 h-4" />
              <span>{[p.address, p.city, p.state, p.country].filter(Boolean).join(', ') || '—'}</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-4">{formatCurrency(p.price, p.currency)}</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100">
              {[
                { icon: Bed, label: 'Bedrooms', value: p.bedrooms },
                { icon: Bath, label: 'Bathrooms', value: p.bathrooms },
                { icon: Maximize, label: 'Area (sqft)', value: p.area_sqft ? Number(p.area_sqft).toLocaleString() : '—' },
                { icon: Car, label: 'Parking', value: p.parking },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                  <div className="font-bold text-slate-900">{value}</div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              ))}
            </div>

            {p.description && (
              <div className="mt-4">
                <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{p.description}</p>
              </div>
            )}
          </div>

          {/* Amenities */}
          {p.amenities.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {p.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {p.video_url && (
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><Video className="w-5 h-5" /> Video Tour</h3>
              <a href={p.video_url} target="_blank" rel="noopener" className="btn-secondary">Watch video</a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Property Details</h3>
            <dl className="space-y-2.5 text-sm">
              {[
                ['Type', PROPERTY_TYPE_LABELS[p.type]],
                ['Listing', LISTING_TYPE_LABELS[p.listing_type]],
                ['Year built', p.year_built ?? '—'],
                ['Furnished', p.furnished ? 'Yes' : 'No'],
                ['Plot size', p.plot_sqft ? `${Number(p.plot_sqft).toLocaleString()} sqft` : '—'],
                ['Listed', formatDate(p.created_at)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Performance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-600"><Eye className="w-4 h-4 text-slate-400" /> Views</span>
                <span className="font-bold text-slate-900">{p.views}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-600"><MessageSquare className="w-4 h-4 text-slate-400" /> Inquiries</span>
                <span className="font-bold text-slate-900">{p.inquiries}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Property Form ============

interface PropertyFormProps {
  property: Property | null;
  agencyId: string;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}

function PropertyForm({ property: p, agencyId, userId, onClose, onSaved }: PropertyFormProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: p?.title ?? '',
    description: p?.description ?? '',
    type: p?.type ?? ('house' as PropertyType),
    status: p?.status ?? ('available' as PropertyStatus),
    listing_type: p?.listing_type ?? ('sale' as ListingType),
    price: p?.price ?? '',
    currency: p?.currency ?? 'INR',
    bedrooms: p?.bedrooms ?? 0,
    bathrooms: p?.bathrooms ?? 0,
    area_sqft: p?.area_sqft ?? '',
    plot_sqft: p?.plot_sqft ?? '',
    location: p?.location ?? '',
    city: p?.city ?? '',
    state: p?.state ?? '',
    country: p?.country ?? '',
    address: p?.address ?? '',
    lat: p?.lat != null ? String(p.lat) : '',
    lng: p?.lng != null ? String(p.lng) : '',
    year_built: p?.year_built ?? '',
    parking: p?.parking ?? 0,
    furnished: p?.furnished ?? false,
    featured: p?.featured ?? false,
    video_url: p?.video_url ?? '',
    virtual_tour_url: p?.virtual_tour_url ?? '',
    images: p?.images ?? [],
    amenities: p?.amenities ?? [],
  });

  function toggleAmenity(a: string) {
    setForm({
      ...form,
      amenities: form.amenities.includes(a)
        ? form.amenities.filter((x) => x !== a)
        : [...form.amenities, a],
    });
  }

  function addImage(url: string) {
    if (url.trim() && !form.images.includes(url.trim())) {
      setForm({ ...form, images: [...form.images, url.trim()] });
    }
  }

  function removeImage(url: string) {
    setForm({ ...form, images: form.images.filter((i) => i !== url) });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast('Title is required', 'error'); return; }
    setBusy(true);
    const payload = {
      agency_id: agencyId,
      created_by: p ? p.created_by : userId,
      title: form.title,
      description: form.description || null,
      type: form.type,
      status: form.status,
      listing_type: form.listing_type,
      price: Number(form.price) || 0,
      currency: form.currency,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area_sqft: form.area_sqft ? Number(form.area_sqft) : null,
      plot_sqft: form.plot_sqft ? Number(form.plot_sqft) : null,
      location: form.location || null,
      city: form.city || null,
      state: form.state || null,
      country: form.country || null,
      address: form.address || null,
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      year_built: form.year_built ? Number(form.year_built) : null,
      parking: Number(form.parking) || 0,
      furnished: form.furnished,
      featured: form.featured,
      video_url: form.video_url || null,
      virtual_tour_url: form.virtual_tour_url || null,
      images: form.images,
      amenities: form.amenities,
    };

    const { error } = p
      ? await supabase.from('properties').update(payload).eq('id', p.id)
      : await supabase.from('properties').insert(payload);

    setBusy(false);
    if (error) { toast(error.message, 'error'); return; }
    toast(p ? 'Property updated' : 'Property added');
    onSaved();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={p ? 'Edit Property' : 'Add New Property'}
      size="xl"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Saving…' : p ? 'Save changes' : 'Add property'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Modern Villa with Pool" required />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[80px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the property…" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PropertyType })}>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PropertyStatus })}>
              {PROPERTY_STATUSES.map((s) => <option key={s} value={s}>{PROPERTY_STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Listing</label>
            <select className="input" value={form.listing_type} onChange={(e) => setForm({ ...form, listing_type: e.target.value as ListingType })}>
              {LISTING_TYPES.map((l) => <option key={l} value={l}>{LISTING_TYPE_LABELS[l]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Price *</label>
            <input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" required />
          </div>
          <div>
            <label className="label">Bedrooms</label>
            <input className="input" type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="label">Bathrooms</label>
            <input className="input" type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="label">Parking</label>
            <input className="input" type="number" value={form.parking} onChange={(e) => setForm({ ...form, parking: Number(e.target.value) || 0 })} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Area (sqft)</label>
            <input className="input" type="number" value={form.area_sqft} onChange={(e) => setForm({ ...form, area_sqft: e.target.value })} />
          </div>
          <div>
            <label className="label">Plot (sqft)</label>
            <input className="input" type="number" value={form.plot_sqft} onChange={(e) => setForm({ ...form, plot_sqft: e.target.value })} />
          </div>
          <div>
            <label className="label">Year built</label>
            <input className="input" type="number" value={form.year_built} onChange={(e) => setForm({ ...form, year_built: e.target.value })} />
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.furnished} onChange={(e) => setForm({ ...form, furnished: e.target.checked })} className="w-4 h-4 accent-slate-900" />
              Furnished
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-slate-900" />
              Featured
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Downtown" />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Miami" />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="FL" />
          </div>
          <div>
            <label className="label">Country</label>
            <input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="USA" />
          </div>
        </div>

        <div>
          <label className="label">Address</label>
          <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Latitude</label>
            <input className="input" type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="19.0760" />
          </div>
          <div>
            <label className="label">Longitude</label>
            <input className="input" type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} placeholder="72.8777" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Video URL</label>
            <input className="input" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/…" />
          </div>
          <div>
            <label className="label">Virtual tour URL</label>
            <input className="input" value={form.virtual_tour_url} onChange={(e) => setForm({ ...form, virtual_tour_url: e.target.value })} placeholder="https://matterport.com/…" />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="label">Property photos</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.images.map((img) => (
              <div key={img} className="relative w-24 h-20 rounded-lg overflow-hidden group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(img)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            {form.images.length < 10 && (
              <button
                type="button"
                onClick={() => { const avail = PROPERTY_IMAGES.find((i) => !form.images.includes(i)); if (avail) addImage(avail); }}
                className="w-24 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Paste image URL…"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = (e.target as HTMLInputElement).value; addImage(v); (e.target as HTMLInputElement).value = ''; } }}
            />
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="label">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`badge px-3 py-1.5 cursor-pointer transition-all ${form.amenities.includes(a) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {form.amenities.includes(a) ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                {a}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
