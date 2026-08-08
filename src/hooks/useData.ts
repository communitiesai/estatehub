import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Lead, Property, Deal, Appointment, Task, Activity, Campaign, Profile, Attendance, Contact, Integration, IntegrationProvider, SocialPost, SocialPlatform, SocialPostStatus } from '@/types';

function useAgencyId() {
  const { profile } = useAuth();
  return profile?.agency_id ?? null;
}

export function useLeads() {
  const agencyId = useAgencyId();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!agencyId) { setLeads([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setLeads((data ?? []) as Lead[]);
    setLoading(false);
  }, [agencyId]);

  useEffect(() => { load(); }, [load]);

  return { leads, loading, error, reload: load, setLeads };
}

export function useProperties() {
  const agencyId = useAgencyId();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!agencyId) { setProperties([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setProperties((data ?? []) as Property[]);
    setLoading(false);
  }, [agencyId]);

  useEffect(() => { load(); }, [load]);

  return { properties, loading, error, reload: load, setProperties };
}

export function useDeals() {
  const agencyId = useAgencyId();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!agencyId) { setDeals([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setDeals((data ?? []) as Deal[]);
    setLoading(false);
  }, [agencyId]);

  useEffect(() => { load(); }, [load]);

  return { deals, loading, error, reload: load, setDeals };
}

export function useAppointments() {
  const agencyId = useAgencyId();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!agencyId) { setAppointments([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('agency_id', agencyId)
      .order('start_at', { ascending: true });
    if (error) setError(error.message);
    else setAppointments((data ?? []) as Appointment[]);
    setLoading(false);
  }, [agencyId]);

  useEffect(() => { load(); }, [load]);

  return { appointments, loading, error, reload: load, setAppointments };
}

export function useTasks() {
  const agencyId = useAgencyId();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!agencyId) { setTasks([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('agency_id', agencyId)
      .order('due_at', { ascending: true, nullsFirst: false });
    if (error) setError(error.message);
    else setTasks((data ?? []) as Task[]);
    setLoading(false);
  }, [agencyId]);

  useEffect(() => { load(); }, [load]);

  return { tasks, loading, error, reload: load, setTasks };
}

export function useActivities(limit = 50) {
  const agencyId = useAgencyId();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!agencyId) { setActivities([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) setError(error.message);
    else setActivities((data ?? []) as Activity[]);
    setLoading(false);
  }, [agencyId, limit]);

  useEffect(() => { load(); }, [load]);

  return { activities, loading, error, reload: load };
}

export function useCampaigns() {
  const agencyId = useAgencyId();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!agencyId) { setCampaigns([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setCampaigns((data ?? []) as Campaign[]);
    setLoading(false);
  }, [agencyId]);

  useEffect(() => { load(); }, [load]);

  return { campaigns, loading, error, reload: load, setCampaigns };
}

export function useLeadNotes(leadId: string | null) {
  const [notes, setNotes] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!leadId) { setNotes([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('lead_id', leadId)
      .eq('type', 'note')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setNotes((data ?? []) as Activity[]);
    setLoading(false);
  }, [leadId]);

  useEffect(() => { load(); }, [load]);

  const addNote = useCallback(async (text: string, agencyId: string, actorId: string) => {
    if (!leadId || !text.trim()) return null;
    const { data, error } = await supabase
      .from('activities')
      .insert({
        agency_id: agencyId,
        lead_id: leadId,
        actor_id: actorId,
        type: 'note',
        description: text.trim(),
      })
      .select('*')
      .maybeSingle();
    if (error) return null;
    const activity = data as Activity | null;
    if (activity) setNotes((prev) => [activity, ...prev]);
    return activity;
  }, [leadId]);

  const deleteNote = useCallback(async (id: string) => {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) return false;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    return true;
  }, []);

  return { notes, loading, error, addNote, deleteNote, reload: load };
}

export function useTeamMembers() {

  const agencyId = useAgencyId();
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!agencyId) { setMembers([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('active', true)
      .order('full_name', { ascending: true });
    if (error) setError(error.message);
    else setMembers((data ?? []) as Profile[]);
    setLoading(false);
  }, [agencyId]);

  useEffect(() => { load(); }, [load]);

  return { members, loading, error, reload: load };
}

export function useAttendance() {
  const agencyId = useAgencyId();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!agencyId) { setRecords([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('agency_id', agencyId)
      .order('date', { ascending: false })
      .order('check_in_at', { ascending: false });
    if (error) setError(error.message);
    else setRecords((data ?? []) as Attendance[]);
    setLoading(false);
  }, [agencyId]);

  useEffect(() => { load(); }, [load]);

  return { records, loading, error, reload: load };
}

export function useContacts() {
  const agencyId = useAgencyId();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!agencyId) { setContacts([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('agency_id', agencyId)
      .order('is_favorite', { ascending: false })
      .order('full_name', { ascending: true });
    if (error) setError(error.message);
    else setContacts((data ?? []) as Contact[]);
    setLoading(false);
  }, [agencyId]);

  useEffect(() => { load(); }, [load]);

  return { contacts, loading, error, reload: load, setContacts };
}

export function useIntegrations() {
  const agencyId = useAgencyId();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!agencyId) { setIntegrations([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: true });
    if (error) setError(error.message);
    else setIntegrations((data ?? []) as Integration[]);
    setLoading(false);
  }, [agencyId]);

  useEffect(() => { load(); }, [load]);

  const upsert = useCallback(async (provider: IntegrationProvider, patch: Partial<Integration>) => {
    if (!agencyId) return null;
    const { data, error } = await supabase
      .from('integrations')
      .upsert({ agency_id: agencyId, provider, ...patch }, { onConflict: 'agency_id,provider' })
      .select('*')
      .maybeSingle();
    if (error) { setError(error.message); return null; }
    const updated = data as Integration | null;
    if (updated) {
      setIntegrations((prev) => {
        const idx = prev.findIndex((i) => i.provider === provider);
        if (idx >= 0) { const copy = [...prev]; copy[idx] = updated; return copy; }
        return [...prev, updated];
      });
    }
    return updated;
  }, [agencyId]);

  const remove = useCallback(async (provider: IntegrationProvider) => {
    if (!agencyId) return;
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('agency_id', agencyId)
      .eq('provider', provider);
    if (error) { setError(error.message); return; }
    setIntegrations((prev) => prev.filter((i) => i.provider !== provider));
  }, [agencyId]);

  return { integrations, loading, error, reload: load, upsert, remove };
}

export function useSocialPosts() {
  const agencyId = useAgencyId();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!agencyId) { setPosts([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setPosts((data ?? []) as SocialPost[]);
    setLoading(false);
  }, [agencyId]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (post: {
    content: string;
    platforms: SocialPlatform[];
    image_url?: string | null;
    link_url?: string | null;
    property_id?: string | null;
    status?: SocialPostStatus;
    scheduled_at?: string | null;
  }) => {
    if (!agencyId) return null;
    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        agency_id: agencyId,
        content: post.content,
        platforms: post.platforms,
        image_url: post.image_url ?? null,
        link_url: post.link_url ?? null,
        property_id: post.property_id ?? null,
        status: post.status ?? 'draft',
        scheduled_at: post.scheduled_at ?? null,
      })
      .select('*')
      .maybeSingle();
    if (error) { setError(error.message); return null; }
    const created = data as SocialPost | null;
    if (created) setPosts((prev) => [created, ...prev]);
    return created;
  }, [agencyId]);

  const update = useCallback(async (id: string, patch: Partial<SocialPost>) => {
    const { data, error } = await supabase
      .from('social_posts')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) { setError(error.message); return null; }
    const updated = data as SocialPost | null;
    if (updated) setPosts((prev) => prev.map((p) => p.id === id ? updated : p));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('social_posts').delete().eq('id', id);
    if (error) { setError(error.message); return false; }
    setPosts((prev) => prev.filter((p) => p.id !== id));
    return true;
  }, []);

  return { posts, loading, error, reload: load, create, update, remove };
}
