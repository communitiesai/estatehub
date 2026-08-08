/*
# Real Estate CRM - Core Schema

Creates agency-scoped tables for a multi-tenant Real Estate CRM.
All tables are created first, then RLS + policies are applied at the end
so cross-table policy subqueries resolve.

## Tables
1. agencies - agencies (tenants)
2. profiles - extends auth.users with role + agency membership
3. properties - real estate listings
4. leads - prospective clients
5. deals - pipeline opportunities
6. appointments - scheduled meetings
7. tasks - follow-ups and to-dos
8. activities - communication & activity log
9. campaigns - email/SMS outreach

## Security
- RLS enabled on all tables; agency-scoped policies via profiles join.
- Auto-create profile + agency on signup via trigger.
*/

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============ TABLES (created first so policy subqueries resolve) ============

CREATE TABLE IF NOT EXISTS agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  plan text NOT NULL DEFAULT 'starter',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('admin','agent','client')),
  avatar_url text,
  phone text,
  title text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'house' CHECK (type IN ('apartment','house','villa','commercial','land','office')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','sold','rented','reserved','off_market')),
  listing_type text NOT NULL DEFAULT 'sale' CHECK (listing_type IN ('sale','rent')),
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  bedrooms int DEFAULT 0,
  bathrooms int DEFAULT 0,
  area_sqft numeric,
  plot_sqft numeric,
  location text,
  city text,
  state text,
  country text,
  address text,
  lat numeric,
  lng numeric,
  amenities text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  video_url text,
  virtual_tour_url text,
  year_built int,
  parking int DEFAULT 0,
  furnished boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  views int NOT NULL DEFAULT 0,
  inquiries int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  source text NOT NULL DEFAULT 'website' CHECK (source IN ('portal','social','csv','form','chatbot','whatsapp','referral','website','other')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','nurturing','converted','lost')),
  score int NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  tags text[] NOT NULL DEFAULT '{}',
  budget_min numeric,
  budget_max numeric,
  currency text NOT NULL DEFAULT 'USD',
  notes text,
  last_contacted_at timestamptz,
  interested_property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  stage text NOT NULL DEFAULT 'inquiry' CHECK (stage IN ('inquiry','viewing','negotiation','offer','closed','lost')),
  value numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  close_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  location text,
  type text NOT NULL DEFAULT 'viewing' CHECK (type IN ('viewing','call','office_meeting','video')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','no_show')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  due_at timestamptz,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'note' CHECK (type IN ('call','email','sms','whatsapp','meeting','note','system')),
  description text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  name text NOT NULL,
  channel text NOT NULL DEFAULT 'email' CHECK (channel IN ('email','sms')),
  subject text,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sent')),
  audience text[] NOT NULL DEFAULT '{}',
  sent_count int NOT NULL DEFAULT 0,
  open_count int NOT NULL DEFAULT 0,
  click_count int NOT NULL DEFAULT 0,
  scheduled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_properties_agency ON properties(agency_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_leads_agency ON leads(agency_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_deals_agency ON deals(agency_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_assigned ON deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_lead ON deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_appts_agency ON appointments(agency_id);
CREATE INDEX IF NOT EXISTS idx_appts_assigned ON appointments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_appts_start ON appointments(start_at);
CREATE INDEX IF NOT EXISTS idx_tasks_agency ON tasks(agency_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_acts_agency ON activities(agency_id);
CREATE INDEX IF NOT EXISTS idx_acts_lead ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_acts_created ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_camp_agency ON campaigns(agency_id);

-- ============ RLS ENABLE ============
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- ============ RLS helper function (must exist before policies) ============
-- SECURITY DEFINER bypasses RLS so we can read the caller's agency_id
-- without triggering a recursive policy on profiles.
CREATE OR REPLACE FUNCTION get_user_agency_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
  RETURN (SELECT agency_id FROM profiles WHERE user_id = auth.uid() LIMIT 1);
END;
$func$;

-- ============ POLICIES (all tables now exist) ============

-- agencies
DROP POLICY IF EXISTS "agency_select_members" ON agencies;
CREATE POLICY "agency_select_members" ON agencies FOR SELECT
  TO authenticated USING (
    id = get_user_agency_id()
  );
DROP POLICY IF EXISTS "agency_update_members" ON agencies;
CREATE POLICY "agency_update_members" ON agencies FOR UPDATE
  TO authenticated USING (
    id = get_user_agency_id()
  ) WITH CHECK (
    id = get_user_agency_id()
  );

-- profiles
DROP POLICY IF EXISTS "profile_select_self_or_agency" ON profiles;
CREATE POLICY "profile_select_self_or_agency" ON profiles FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR (
      agency_id IS NOT NULL
      AND agency_id = get_user_agency_id()
    )
  );
DROP POLICY IF EXISTS "profile_insert_self" ON profiles;
CREATE POLICY "profile_insert_self" ON profiles FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "profile_update_self" ON profiles;
CREATE POLICY "profile_update_self" ON profiles FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- properties
DROP POLICY IF EXISTS "properties_select_agency" ON properties;
CREATE POLICY "properties_select_agency" ON properties FOR SELECT
  TO authenticated USING (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "properties_insert_agency" ON properties;
CREATE POLICY "properties_insert_agency" ON properties FOR INSERT
  TO authenticated WITH CHECK (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "properties_update_agency" ON properties;
CREATE POLICY "properties_update_agency" ON properties FOR UPDATE
  TO authenticated USING (agency_id = get_user_agency_id())
  WITH CHECK (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "properties_delete_agency" ON properties;
CREATE POLICY "properties_delete_agency" ON properties FOR DELETE
  TO authenticated USING (agency_id = get_user_agency_id());

-- leads
DROP POLICY IF EXISTS "leads_select_agency" ON leads;
CREATE POLICY "leads_select_agency" ON leads FOR SELECT
  TO authenticated USING (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "leads_insert_agency" ON leads;
CREATE POLICY "leads_insert_agency" ON leads FOR INSERT
  TO authenticated WITH CHECK (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "leads_update_agency" ON leads;
CREATE POLICY "leads_update_agency" ON leads FOR UPDATE
  TO authenticated USING (agency_id = get_user_agency_id())
  WITH CHECK (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "leads_delete_agency" ON leads;
CREATE POLICY "leads_delete_agency" ON leads FOR DELETE
  TO authenticated USING (agency_id = get_user_agency_id());

-- deals
DROP POLICY IF EXISTS "deals_select_agency" ON deals;
CREATE POLICY "deals_select_agency" ON deals FOR SELECT
  TO authenticated USING (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "deals_insert_agency" ON deals;
CREATE POLICY "deals_insert_agency" ON deals FOR INSERT
  TO authenticated WITH CHECK (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "deals_update_agency" ON deals;
CREATE POLICY "deals_update_agency" ON deals FOR UPDATE
  TO authenticated USING (agency_id = get_user_agency_id())
  WITH CHECK (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "deals_delete_agency" ON deals;
CREATE POLICY "deals_delete_agency" ON deals FOR DELETE
  TO authenticated USING (agency_id = get_user_agency_id());

-- appointments
DROP POLICY IF EXISTS "appts_select_agency" ON appointments;
CREATE POLICY "appts_select_agency" ON appointments FOR SELECT
  TO authenticated USING (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "appts_insert_agency" ON appointments;
CREATE POLICY "appts_insert_agency" ON appointments FOR INSERT
  TO authenticated WITH CHECK (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "appts_update_agency" ON appointments;
CREATE POLICY "appts_update_agency" ON appointments FOR UPDATE
  TO authenticated USING (agency_id = get_user_agency_id())
  WITH CHECK (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "appts_delete_agency" ON appointments;
CREATE POLICY "appts_delete_agency" ON appointments FOR DELETE
  TO authenticated USING (agency_id = get_user_agency_id());

-- tasks
DROP POLICY IF EXISTS "tasks_select_agency" ON tasks;
CREATE POLICY "tasks_select_agency" ON tasks FOR SELECT
  TO authenticated USING (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "tasks_insert_agency" ON tasks;
CREATE POLICY "tasks_insert_agency" ON tasks FOR INSERT
  TO authenticated WITH CHECK (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "tasks_update_agency" ON tasks;
CREATE POLICY "tasks_update_agency" ON tasks FOR UPDATE
  TO authenticated USING (agency_id = get_user_agency_id())
  WITH CHECK (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "tasks_delete_agency" ON tasks;
CREATE POLICY "tasks_delete_agency" ON tasks FOR DELETE
  TO authenticated USING (agency_id = get_user_agency_id());

-- activities
DROP POLICY IF EXISTS "acts_select_agency" ON activities;
CREATE POLICY "acts_select_agency" ON activities FOR SELECT
  TO authenticated USING (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "acts_insert_agency" ON activities;
CREATE POLICY "acts_insert_agency" ON activities FOR INSERT
  TO authenticated WITH CHECK (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "acts_delete_agency" ON activities;
CREATE POLICY "acts_delete_agency" ON activities FOR DELETE
  TO authenticated USING (agency_id = get_user_agency_id());

-- campaigns
DROP POLICY IF EXISTS "camp_select_agency" ON campaigns;
CREATE POLICY "camp_select_agency" ON campaigns FOR SELECT
  TO authenticated USING (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "camp_insert_agency" ON campaigns;
CREATE POLICY "camp_insert_agency" ON campaigns FOR INSERT
  TO authenticated WITH CHECK (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "camp_update_agency" ON campaigns;
CREATE POLICY "camp_update_agency" ON campaigns FOR UPDATE
  TO authenticated USING (agency_id = get_user_agency_id())
  WITH CHECK (agency_id = get_user_agency_id());
DROP POLICY IF EXISTS "camp_delete_agency" ON campaigns;
CREATE POLICY "camp_delete_agency" ON campaigns FOR DELETE
  TO authenticated USING (agency_id = get_user_agency_id());

-- ============ updated_at triggers ============
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_touch ON leads;
CREATE TRIGGER leads_touch BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
DROP TRIGGER IF EXISTS properties_touch ON properties;
CREATE TRIGGER properties_touch BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
DROP TRIGGER IF EXISTS deals_touch ON deals;
CREATE TRIGGER deals_touch BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============ Auto-create profile + agency on signup ============
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
DECLARE
  new_agency_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = NEW.id) THEN
    INSERT INTO agencies (name, plan)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'agency_name', (NEW.email || '''s Agency')), 'starter')
    RETURNING id INTO new_agency_id;

    INSERT INTO profiles (user_id, agency_id, full_name, role)
    VALUES (
      NEW.id,
      new_agency_id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      'admin'
    );
  END IF;
  RETURN NEW;
END;
$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();