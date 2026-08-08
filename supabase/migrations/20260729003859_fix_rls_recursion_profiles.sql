-- Fix infinite recursion in profiles RLS policy.
-- The profiles SELECT policy queried profiles in a subquery, triggering itself.
-- Solution: a SECURITY DEFINER helper that reads the user's agency_id bypassing RLS,
-- then use it in ALL policies instead of sub-selecting from profiles.

CREATE OR REPLACE FUNCTION public.get_user_agency_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
  RETURN (SELECT agency_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1);
END;
$func$;

-- Replace the recursive profiles SELECT policy
DROP POLICY IF EXISTS "profile_select_self_or_agency" ON profiles;
CREATE POLICY "profile_select_self_or_agency" ON profiles FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR (
      agency_id IS NOT NULL
      AND agency_id = public.get_user_agency_id()
    )
  );

-- Replace all agency-scoped policies on other tables to use the helper
-- (avoids any future recursion risk and is faster than a correlated subquery)

-- properties
DROP POLICY IF EXISTS "properties_select_agency" ON properties;
CREATE POLICY "properties_select_agency" ON properties FOR SELECT
  TO authenticated USING (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "properties_insert_agency" ON properties;
CREATE POLICY "properties_insert_agency" ON properties FOR INSERT
  TO authenticated WITH CHECK (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "properties_update_agency" ON properties;
CREATE POLICY "properties_update_agency" ON properties FOR UPDATE
  TO authenticated USING (agency_id = public.get_user_agency_id())
  WITH CHECK (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "properties_delete_agency" ON properties;
CREATE POLICY "properties_delete_agency" ON properties FOR DELETE
  TO authenticated USING (agency_id = public.get_user_agency_id());

-- leads
DROP POLICY IF EXISTS "leads_select_agency" ON leads;
CREATE POLICY "leads_select_agency" ON leads FOR SELECT
  TO authenticated USING (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "leads_insert_agency" ON leads;
CREATE POLICY "leads_insert_agency" ON leads FOR INSERT
  TO authenticated WITH CHECK (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "leads_update_agency" ON leads;
CREATE POLICY "leads_update_agency" ON leads FOR UPDATE
  TO authenticated USING (agency_id = public.get_user_agency_id())
  WITH CHECK (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "leads_delete_agency" ON leads;
CREATE POLICY "leads_delete_agency" ON leads FOR DELETE
  TO authenticated USING (agency_id = public.get_user_agency_id());

-- deals
DROP POLICY IF EXISTS "deals_select_agency" ON deals;
CREATE POLICY "deals_select_agency" ON deals FOR SELECT
  TO authenticated USING (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "deals_insert_agency" ON deals;
CREATE POLICY "deals_insert_agency" ON deals FOR INSERT
  TO authenticated WITH CHECK (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "deals_update_agency" ON deals;
CREATE POLICY "deals_update_agency" ON deals FOR UPDATE
  TO authenticated USING (agency_id = public.get_user_agency_id())
  WITH CHECK (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "deals_delete_agency" ON deals;
CREATE POLICY "deals_delete_agency" ON deals FOR DELETE
  TO authenticated USING (agency_id = public.get_user_agency_id());

-- appointments
DROP POLICY IF EXISTS "appts_select_agency" ON appointments;
CREATE POLICY "appts_select_agency" ON appointments FOR SELECT
  TO authenticated USING (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "appts_insert_agency" ON appointments;
CREATE POLICY "appts_insert_agency" ON appointments FOR INSERT
  TO authenticated WITH CHECK (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "appts_update_agency" ON appointments;
CREATE POLICY "appts_update_agency" ON appointments FOR UPDATE
  TO authenticated USING (agency_id = public.get_user_agency_id())
  WITH CHECK (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "appts_delete_agency" ON appointments;
CREATE POLICY "appts_delete_agency" ON appointments FOR DELETE
  TO authenticated USING (agency_id = public.get_user_agency_id());

-- tasks
DROP POLICY IF EXISTS "tasks_select_agency" ON tasks;
CREATE POLICY "tasks_select_agency" ON tasks FOR SELECT
  TO authenticated USING (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "tasks_insert_agency" ON tasks;
CREATE POLICY "tasks_insert_agency" ON tasks FOR INSERT
  TO authenticated WITH CHECK (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "tasks_update_agency" ON tasks;
CREATE POLICY "tasks_update_agency" ON tasks FOR UPDATE
  TO authenticated USING (agency_id = public.get_user_agency_id())
  WITH CHECK (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "tasks_delete_agency" ON tasks;
CREATE POLICY "tasks_delete_agency" ON tasks FOR DELETE
  TO authenticated USING (agency_id = public.get_user_agency_id());

-- activities
DROP POLICY IF EXISTS "acts_select_agency" ON activities;
CREATE POLICY "acts_select_agency" ON activities FOR SELECT
  TO authenticated USING (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "acts_insert_agency" ON activities;
CREATE POLICY "acts_insert_agency" ON activities FOR INSERT
  TO authenticated WITH CHECK (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "acts_delete_agency" ON activities;
CREATE POLICY "acts_delete_agency" ON activities FOR DELETE
  TO authenticated USING (agency_id = public.get_user_agency_id());

-- campaigns
DROP POLICY IF EXISTS "camp_select_agency" ON campaigns;
CREATE POLICY "camp_select_agency" ON campaigns FOR SELECT
  TO authenticated USING (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "camp_insert_agency" ON campaigns;
CREATE POLICY "camp_insert_agency" ON campaigns FOR INSERT
  TO authenticated WITH CHECK (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "camp_update_agency" ON campaigns;
CREATE POLICY "camp_update_agency" ON campaigns FOR UPDATE
  TO authenticated USING (agency_id = public.get_user_agency_id())
  WITH CHECK (agency_id = public.get_user_agency_id());
DROP POLICY IF EXISTS "camp_delete_agency" ON campaigns;
CREATE POLICY "camp_delete_agency" ON campaigns FOR DELETE
  TO authenticated USING (agency_id = public.get_user_agency_id());
