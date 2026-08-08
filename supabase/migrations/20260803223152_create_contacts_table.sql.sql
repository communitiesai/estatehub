/*
# Contacts directory

Adds a `contacts` table for managing business contacts that are NOT
sales leads — vendors, service providers, lawyers, bankers, contractors,
past clients, partners, etc.

1. New Tables
- `contacts`
  - `id` uuid PK
  - `agency_id` uuid FK -> agencies (cascade)
  - `full_name` text NOT NULL
  - `email` text
  - `phone` text
  - `company` text — organization the contact belongs to
  - `role` text — job title or relationship label
  - `type` text — contact category: 'vendor','client','partner','service_provider','contractor','other' (default 'other')
  - `address` text
  - `city` text
  - `notes` text
  - `tags` text[] default '{}'
  - `is_favorite` boolean default false — pinned/starred contacts
  - `created_by` uuid FK -> profiles (set null on delete)
  - `created_at` timestamptz default now()
  - `updated_at` timestamptz default now()
2. Indexes
- (agency_id) for agency-scoped queries
- (type) for category filtering
- (company) for company grouping
3. Security
- RLS enabled; agency-scoped CRUD via get_user_agency_id()
- 4 separate policies (select/insert/update/delete) TO authenticated
4. Notes
- Contacts are separate from leads — leads are prospective buyers in the
  sales pipeline; contacts are the agency's business network.
*/

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  company text,
  role text,
  type text NOT NULL DEFAULT 'other' CHECK (type IN ('vendor','client','partner','service_provider','contractor','other')),
  address text,
  city text,
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  is_favorite boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES profiles(user_id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_agency ON contacts(agency_id);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_select_agency" ON contacts;
CREATE POLICY "contacts_select_agency" ON contacts FOR SELECT
  TO authenticated USING (agency_id = get_user_agency_id());

DROP POLICY IF EXISTS "contacts_insert_agency" ON contacts;
CREATE POLICY "contacts_insert_agency" ON contacts FOR INSERT
  TO authenticated WITH CHECK (agency_id = get_user_agency_id());

DROP POLICY IF EXISTS "contacts_update_agency" ON contacts;
CREATE POLICY "contacts_update_agency" ON contacts FOR UPDATE
  TO authenticated USING (agency_id = get_user_agency_id())
  WITH CHECK (agency_id = get_user_agency_id());

DROP POLICY IF EXISTS "contacts_delete_agency" ON contacts;
CREATE POLICY "contacts_delete_agency" ON contacts FOR DELETE
  TO authenticated USING (agency_id = get_user_agency_id());

DROP TRIGGER IF EXISTS contacts_touch ON contacts;
CREATE TRIGGER contacts_touch BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
