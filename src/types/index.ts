export type UserRole = 'admin' | 'agent' | 'client';

export type LeadSource =
  | 'portal' | 'social' | 'csv' | 'form' | 'chatbot'
  | 'whatsapp' | 'referral' | 'website' | 'other';

export type LeadStatus =
  | 'new' | 'contacted' | 'qualified' | 'nurturing' | 'converted' | 'lost';

export type LeadScore = 'hot' | 'warm' | 'cold';

export type PropertyType =
  | 'apartment' | 'house' | 'villa' | 'commercial' | 'land' | 'office';

export type PropertyStatus =
  | 'available' | 'sold' | 'rented' | 'reserved' | 'off_market';

export type ListingType = 'sale' | 'rent';

export type DealStage =
  | 'inquiry' | 'viewing' | 'negotiation' | 'offer' | 'closed' | 'lost';

export type AppointmentType =
  | 'viewing' | 'call' | 'office_meeting' | 'video';

export type AppointmentStatus =
  | 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type ActivityType =
  | 'call' | 'email' | 'sms' | 'whatsapp' | 'meeting' | 'note' | 'system';

export type CampaignChannel = 'email' | 'sms';
export type CampaignStatus = 'draft' | 'scheduled' | 'sent';

export interface Agency {
  id: string;
  name: string;
  logo_url: string | null;
  plan: string;
  created_at: string;
}

export interface Profile {
  user_id: string;
  agency_id: string | null;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  title: string | null;
  active: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  agency_id: string;
  assigned_to: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  tags: string[];
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  notes: string | null;
  last_contacted_at: string | null;
  interested_property_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  agency_id: string;
  created_by: string | null;
  title: string;
  description: string | null;
  type: PropertyType;
  status: PropertyStatus;
  listing_type: ListingType;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number | null;
  plot_sqft: number | null;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  amenities: string[];
  images: string[];
  video_url: string | null;
  virtual_tour_url: string | null;
  year_built: number | null;
  parking: number;
  furnished: boolean;
  featured: boolean;
  views: number;
  inquiries: number;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  agency_id: string;
  lead_id: string;
  property_id: string | null;
  assigned_to: string | null;
  stage: DealStage;
  value: number;
  currency: string;
  close_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  agency_id: string;
  lead_id: string | null;
  property_id: string | null;
  assigned_to: string | null;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  location: string | null;
  type: AppointmentType;
  status: AppointmentStatus;
  created_at: string;
}

export interface Task {
  id: string;
  agency_id: string;
  lead_id: string | null;
  deal_id: string | null;
  property_id: string | null;
  assigned_to: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  agency_id: string;
  lead_id: string | null;
  deal_id: string | null;
  property_id: string | null;
  actor_id: string | null;
  type: ActivityType;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Campaign {
  id: string;
  agency_id: string;
  created_by: string | null;
  name: string;
  channel: CampaignChannel;
  subject: string | null;
  content: string;
  status: CampaignStatus;
  audience: string[];
  sent_count: number;
  open_count: number;
  click_count: number;
  scheduled_at: string | null;
  created_at: string;
}

export type ContactType =
  | 'vendor' | 'client' | 'partner' | 'service_provider' | 'contractor' | 'other';

export interface Contact {
  id: string;
  agency_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  type: ContactType;
  address: string | null;
  city: string | null;
  notes: string | null;
  tags: string[];
  is_favorite: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type IntegrationProvider =
  | 'meta_ads' | 'google_ads' | 'whatsapp' | 'gmail'
  | 'outlook' | 'gcal' | 'zoom' | 'gmeet' | 'stripe' | 'storage';

export interface Integration {
  id: string;
  agency_id: string;
  provider: IntegrationProvider;
  connected: boolean;
  account_name: string | null;
  account_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  platform: 'meta' | 'google';
  status: 'active' | 'paused' | 'ended';
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
}

export type SocialPlatform = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'whatsapp' | 'email';
export type SocialPostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface SocialPost {
  id: string;
  agency_id: string;
  created_by: string | null;
  content: string;
  platforms: SocialPlatform[];
  image_url: string | null;
  link_url: string | null;
  property_id: string | null;
  status: SocialPostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  metrics: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'absent';

export interface Attendance {
  id: string;
  agency_id: string;
  user_id: string | null;
  date: string;
  check_in_at: string;
  check_out_at: string | null;
  status: AttendanceStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadWithProfile extends Lead {
  assigned_profile?: Profile | null;
}

export interface DealWithRelations extends Deal {
  lead?: Lead | null;
  property?: Property | null;
  assigned_profile?: Profile | null;
}
