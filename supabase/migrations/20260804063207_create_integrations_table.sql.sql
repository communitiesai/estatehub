/*
# Integrations table for production ad & messaging integrations

Stores third-party integration connection state and credentials per agency.
Supports Meta (Facebook/Instagram Ads), Google Ads, WhatsApp, Gmail, etc.

1. New Tables
- `integrations`
  - `id` uuid PK
  - `agency_id` uuid FK -> agencies (cascade)
  - `provider` text NOT NULL — e.g. 'meta_ads', 'google_ads', 'whatsapp', 'gmail'
  - `connected` boolean default false
  - `account_name` text — display name of connected account
  - `account_id` text — platform account/page ID
  - `access_token` text — encrypted token (stored as text, used by edge functions)
  - `refresh_token` text — for OAuth providers that issue refresh tokens
  - `token_expires_at` timestamptz — token expiry
  - `metadata` jsonb default '{}' — provider-specific config (pixel ID, conversion API, etc.)
  - `created_by` uuid FK -> profiles (set null on delete)
  - `created_at` timestamptz default now()
  - `updated_at` timestamptz default now()
  - UNIQUE constraint on (agency_id, provider) so each agency has one config per provider

2. Indexes
- (agency_id) for agency-scoped queries
- (agency_id, provider) unique for upserts

3. Security
- RLS enabled; agency-scoped CRUD via get_user_agency_id()
- 4 separate policies (select/insert/update/delete) TO authenticated
- Tokens are only readable/writable by agency members

4. Notes
- Tokens are stored in the database and only accessed by edge functions
  running with the service role key (which bypasses RLS). The browser
  client can read connection status but the edge function handles actual
  API calls using the stored tokens.
*/

CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  provider text NOT NULL,
  connected boolean NOT NULL DEFAULT false,
  account_name text,
  account_id text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES profiles(user_id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agency_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_integrations_agency ON integrations(agency_id);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "integrations_select_agency" ON integrations;
CREATE POLICY "integrations_select_agency" ON integrations FOR SELECT
  TO authenticated USING (agency_id = get_user_agency_id());

DROP POLICY IF EXISTS "integrations_insert_agency" ON integrations;
CREATE POLICY "integrations_insert_agency" ON integrations FOR INSERT
  TO authenticated WITH CHECK (agency_id = get_user_agency_id());

DROP POLICY IF EXISTS "integrations_update_agency" ON integrations;
CREATE POLICY "integrations_update_agency" ON integrations FOR UPDATE
  TO authenticated USING (agency_id = get_user_agency_id())
  WITH CHECK (agency_id = get_user_agency_id());

DROP POLICY IF EXISTS "integrations_delete_agency" ON integrations;
CREATE POLICY "integrations_delete_agency" ON integrations FOR DELETE
  TO authenticated USING (agency_id = get_user_agency_id());

DROP TRIGGER IF EXISTS integrations_touch ON integrations;
CREATE TRIGGER integrations_touch BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
