import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { formatCurrency, PROPERTY_STATUS_STYLES, PROPERTY_STATUS_LABELS } from '@/lib/constants';
import type { Property } from '@/types';

// Fix default marker icon for Leaflet in bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Price-colored marker icons
const priceIcons: Record<string, L.DivIcon> = {};
function getPriceIcon(status: string): L.DivIcon {
  if (!priceIcons[status]) {
    const colors: Record<string, string> = {
      available: '#10b981',
      reserved: '#f59e0b',
      sold: '#ef4444',
      rented: '#8b5cf6',
      off_market: '#94a3b8',
    };
    const color = colors[status] ?? '#0f172a';
    priceIcons[status] = L.divIcon({
      className: 'property-marker',
      html: `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(45deg)"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });
  }
  return priceIcons[status];
}

function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    const valid = properties.filter((p) => p.lat != null && p.lng != null);
    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.setView([valid[0].lat!, valid[0].lng!], 13);
    } else {
      const bounds = L.latLngBounds(valid.map((p) => [p.lat!, p.lng!]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    done.current = true;
  }, [properties, map]);

  return null;
}

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (id: string) => void;
  className?: string;
}

export function PropertyMap({ properties, onPropertyClick, className }: PropertyMapProps) {
  const mapped = properties.filter((p) => p.lat != null && p.lng != null);
  const center: [number, number] = mapped.length > 0 ? [mapped[0].lat!, mapped[0].lng!] : [20, 0];

  return (
    <div className={className ?? 'h-[500px]'} style={{ position: 'relative' }}>
      <MapContainer center={center} zoom={12} className="w-full h-full rounded-xl z-0" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds properties={properties} />
        {mapped.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat!, p.lng!]}
            icon={getPriceIcon(p.status)}
          >
            <Popup>
              <div className="min-w-[200px]">
                {p.images[0] && (
                  <img src={p.images[0]} alt={p.title} className="w-full h-24 object-cover rounded mb-2" />
                )}
                <div className="font-semibold text-slate-900 text-sm leading-tight mb-1">{p.title}</div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                  <MapPin className="w-3 h-3" />
                  {[p.location, p.city].filter(Boolean).join(', ') || '—'}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                  {p.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" />{p.bedrooms}</span>}
                  {p.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" />{p.bathrooms}</span>}
                  {p.area_sqft && <span className="flex items-center gap-0.5"><Maximize className="w-3 h-3" />{Number(p.area_sqft).toLocaleString()}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{formatCurrency(p.price, p.currency)}</span>
                  <span className={`badge text-xs ${PROPERTY_STATUS_STYLES[p.status]}`}>{PROPERTY_STATUS_LABELS[p.status]}</span>
                </div>
                {onPropertyClick && (
                  <button
                    onClick={() => onPropertyClick(p.id)}
                    className="mt-2 w-full text-xs bg-slate-900 text-white rounded-lg py-1.5 hover:bg-slate-800 transition-colors"
                  >
                    View details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export { defaultIcon as leafletDefaultIcon };
