import type {
  LeadSource, LeadStatus, LeadScore,
  PropertyType, PropertyStatus, ListingType,
  DealStage, AppointmentType, AppointmentStatus,
  TaskPriority, TaskStatus, ActivityType,
  CampaignChannel, CampaignStatus, UserRole, AttendanceStatus, ContactType,
  IntegrationProvider, SocialPlatform, SocialPostStatus,
} from '@/types';

export const LEAD_SOURCES: LeadSource[] = [
  'portal', 'social', 'csv', 'form', 'chatbot', 'whatsapp', 'referral', 'website', 'other',
];

export const LEAD_STATUSES: LeadStatus[] = [
  'new', 'contacted', 'qualified', 'nurturing', 'converted', 'lost',
];

export const PROPERTY_TYPES: PropertyType[] = [
  'apartment', 'house', 'villa', 'commercial', 'land', 'office',
];

export const PROPERTY_STATUSES: PropertyStatus[] = [
  'available', 'sold', 'rented', 'reserved', 'off_market',
];

export const LISTING_TYPES: ListingType[] = ['sale', 'rent'];

export const DEAL_STAGES: DealStage[] = [
  'inquiry', 'viewing', 'negotiation', 'offer', 'closed', 'lost',
];

export const APPOINTMENT_TYPES: AppointmentType[] = [
  'viewing', 'call', 'office_meeting', 'video',
];

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'scheduled', 'completed', 'cancelled', 'no_show',
];

export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
export const TASK_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'completed'];

export const ACTIVITY_TYPES: ActivityType[] = [
  'call', 'email', 'sms', 'whatsapp', 'meeting', 'note', 'system',
];

export const CAMPAIGN_CHANNELS: CampaignChannel[] = ['email', 'sms'];
export const CAMPAIGN_STATUSES: CampaignStatus[] = ['draft', 'scheduled', 'sent'];

export const USER_ROLES: UserRole[] = ['admin', 'agent', 'client'];

export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['present', 'late', 'half_day', 'absent'];

export const AMENITY_OPTIONS = [
  'Swimming Pool', 'Gym', 'Parking', 'Garden', 'Security',
  'Elevator', 'Air Conditioning', 'Heating', 'Balcony', 'Terrace',
  'Furnished', 'Pet Friendly', 'Concierge', 'Playground', 'Storage',
  'Solar Panels', 'Smart Home', 'Fireplace', 'Sea View', 'City View',
];

export const CURRENCIES = ['INR'];

export function scoreCategory(score: number): LeadScore {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

export function formatCurrency(value: number | null | undefined, currency = 'INR'): string {
  if (value === null || value === undefined) return '—';
  const sym = '₹';
  return sym + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(value);
}

export function formatDate(date: string | null | undefined, opts?: { withTime?: boolean }): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  const dateStr = d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  if (opts?.withTime) {
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${dateStr}, ${timeStr}`;
  }
  return dateStr;
}

export function formatTime(date: string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function relativeTime(date: string | null | undefined): string {
  if (!date) return 'never';
  const d = new Date(date);
  const now = Date.now();
  const diff = now - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 4) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(day / 365)}y ago`;
}

export function isOverdue(date: string | null | undefined): boolean {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function avatarColor(seed: string): string {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
    'bg-violet-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500',
    'bg-teal-500', 'bg-indigo-500',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ---- label maps ----

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  portal: 'Property Portal', social: 'Social Media', csv: 'CSV Import',
  form: 'Web Form', chatbot: 'Chatbot', whatsapp: 'WhatsApp',
  referral: 'Referral', website: 'Website', other: 'Other',
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New', contacted: 'Contacted', qualified: 'Qualified',
  nurturing: 'Nurturing', converted: 'Converted', lost: 'Lost',
};

export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-cyan-100 text-cyan-700',
  qualified: 'bg-violet-100 text-violet-700',
  nurturing: 'bg-amber-100 text-amber-700',
  converted: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-slate-200 text-slate-600',
};

export const SCORE_STYLES: Record<LeadScore, string> = {
  hot: 'bg-red-100 text-red-700',
  warm: 'bg-amber-100 text-amber-700',
  cold: 'bg-sky-100 text-sky-700',
};

export const SCORE_DOT: Record<LeadScore, string> = {
  hot: 'bg-red-500', warm: 'bg-amber-500', cold: 'bg-sky-500',
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Apartment', house: 'House', villa: 'Villa',
  commercial: 'Commercial', land: 'Land', office: 'Office',
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  available: 'Available', sold: 'Sold', rented: 'Rented',
  reserved: 'Reserved', off_market: 'Off Market',
};

export const PROPERTY_STATUS_STYLES: Record<PropertyStatus, string> = {
  available: 'bg-emerald-100 text-emerald-700',
  sold: 'bg-slate-200 text-slate-600',
  rented: 'bg-blue-100 text-blue-700',
  reserved: 'bg-amber-100 text-amber-700',
  off_market: 'bg-slate-100 text-slate-500',
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  sale: 'For Sale', rent: 'For Rent',
};

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  inquiry: 'Inquiry', viewing: 'Viewing', negotiation: 'Negotiation',
  offer: 'Offer', closed: 'Closed', lost: 'Lost',
};

export const DEAL_STAGE_STYLES: Record<DealStage, string> = {
  inquiry: 'bg-blue-100 text-blue-700 border-blue-200',
  viewing: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  negotiation: 'bg-amber-100 text-amber-700 border-amber-200',
  offer: 'bg-violet-100 text-violet-700 border-violet-200',
  closed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  lost: 'bg-slate-200 text-slate-600 border-slate-300',
};

export const DEAL_STAGE_COLORS: Record<DealStage, string> = {
  inquiry: 'bg-blue-500', viewing: 'bg-cyan-500',
  negotiation: 'bg-amber-500', offer: 'bg-violet-500',
  closed: 'bg-emerald-500', lost: 'bg-slate-400',
};

export const APPT_TYPE_LABELS: Record<AppointmentType, string> = {
  viewing: 'Property Viewing', call: 'Phone Call',
  office_meeting: 'Office Meeting', video: 'Video Call',
};

export const APPT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled', completed: 'Completed',
  cancelled: 'Cancelled', no_show: 'No Show',
};

export const APPT_STATUS_STYLES: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-200 text-slate-600',
  no_show: 'bg-red-100 text-red-700',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low', medium: 'Medium', high: 'High',
};

export const TASK_PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending', in_progress: 'In Progress', completed: 'Completed',
};

export const TASK_STATUS_STYLES: Record<TaskStatus, string> = {
  pending: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  call: 'Call', email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp',
  meeting: 'Meeting', note: 'Note', system: 'System',
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft', scheduled: 'Scheduled', sent: 'Sent',
};

export const CAMPAIGN_STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  scheduled: 'bg-blue-100 text-blue-700',
  sent: 'bg-emerald-100 text-emerald-700',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin', agent: 'Agent', client: 'Client',
};

export const USER_ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-slate-900 text-white',
  agent: 'bg-blue-100 text-blue-700',
  client: 'bg-emerald-100 text-emerald-700',
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present', late: 'Late', half_day: 'Half Day', absent: 'Absent',
};

export const ATTENDANCE_STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-100 text-emerald-700',
  late: 'bg-amber-100 text-amber-700',
  half_day: 'bg-blue-100 text-blue-700',
  absent: 'bg-red-100 text-red-700',
};

export const CONTACT_TYPES: ContactType[] = [
  'vendor', 'client', 'partner', 'service_provider', 'contractor', 'other',
];

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  vendor: 'Vendor', client: 'Client', partner: 'Partner',
  service_provider: 'Service Provider', contractor: 'Contractor', other: 'Other',
};

export const CONTACT_TYPE_STYLES: Record<ContactType, string> = {
  vendor: 'bg-blue-100 text-blue-700',
  client: 'bg-emerald-100 text-emerald-700',
  partner: 'bg-cyan-100 text-cyan-700',
  service_provider: 'bg-amber-100 text-amber-700',
  contractor: 'bg-orange-100 text-orange-700',
  other: 'bg-slate-100 text-slate-600',
};

export const INTEGRATION_PROVIDERS: IntegrationProvider[] = [
  'meta_ads', 'google_ads', 'whatsapp', 'gmail',
  'outlook', 'gcal', 'zoom', 'gmeet', 'stripe', 'storage',
];

export const INTEGRATION_LABELS: Record<IntegrationProvider, string> = {
  meta_ads: 'Meta Ads (Facebook & Instagram)',
  google_ads: 'Google Ads',
  whatsapp: 'WhatsApp Business',
  gmail: 'Gmail',
  outlook: 'Outlook',
  gcal: 'Google Calendar',
  zoom: 'Zoom',
  gmeet: 'Google Meet',
  stripe: 'Stripe',
  storage: 'Cloud Storage',
};

export const INTEGRATION_DESCRIPTIONS: Record<IntegrationProvider, string> = {
  meta_ads: 'Track Facebook & Instagram ad performance, import leads from Lead Forms',
  google_ads: 'Sync Google Ads campaigns, track spend and lead conversions',
  whatsapp: 'Auto-capture inquiries and send messages via WhatsApp Business API',
  gmail: 'Sync emails and track conversations with leads',
  outlook: 'Sync calendar and emails from Outlook',
  gcal: 'Sync appointments and reminders with Google Calendar',
  zoom: 'Schedule video meetings with clients',
  gmeet: 'Create Google Meet links for appointments',
  stripe: 'Accept booking fees and payments online',
  storage: 'Store agreements, KYC, and documents in the cloud',
};

export const INTEGRATION_CATEGORIES: Record<IntegrationProvider, string> = {
  meta_ads: 'Advertising',
  google_ads: 'Advertising',
  whatsapp: 'Messaging',
  gmail: 'Email',
  outlook: 'Email',
  gcal: 'Calendar',
  zoom: 'Video',
  gmeet: 'Video',
  stripe: 'Payments',
  storage: 'Storage',
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = ['facebook', 'instagram', 'twitter', 'linkedin', 'whatsapp', 'email'];

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  email: 'Email',
};

export const SOCIAL_PLATFORM_COLORS: Record<SocialPlatform, string> = {
  facebook: 'bg-blue-100 text-blue-700',
  instagram: 'bg-pink-100 text-pink-700',
  twitter: 'bg-sky-100 text-sky-700',
  linkedin: 'bg-indigo-100 text-indigo-700',
  whatsapp: 'bg-emerald-100 text-emerald-700',
  email: 'bg-violet-100 text-violet-700',
};

export const SOCIAL_POST_STATUSES: SocialPostStatus[] = ['draft', 'scheduled', 'published', 'failed'];

export const SOCIAL_POST_STATUS_LABELS: Record<SocialPostStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  failed: 'Failed',
};

export const SOCIAL_POST_STATUS_STYLES: Record<SocialPostStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  scheduled: 'bg-blue-100 text-blue-700',
  published: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
};
