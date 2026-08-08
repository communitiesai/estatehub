/*
# Social media posts table for marketing scheduling

Stores scheduled/published social media posts per agency.
Supports Facebook, Instagram, Twitter/X, LinkedIn, WhatsApp, and email.

1. New Table
- `social_posts`
  - `id` uuid PK
  - `agency_id` uuid FK -> agencies (cascade)
  - `created_by` uuid FK -> profiles (set null on delete)
  - `content` text NOT NULL — post caption / body
  - `platforms` text[] NOT NULL DEFAULT '{}' — array of platform names
  - `image_url` text — optional image URL
  - `link_url` text — optional link to share
  - `property_id` uuid FK -> properties (set null on delete) — linked listing
  - `status` text NOT NULL DEFAULT 'draft' — draft | scheduled | published | failed
  - `scheduled_at` timestamptz — when to publish
  - `published_at` timestamptz — when actually published
  - `metrics` jsonb DEFAULT '{}' — post-level metrics (likes, comments, shares, reach)
  - `created_at` timestamptz DEFAULT now()
  - `updated_at` timestamptz DEFAULT now()

2. Indexes
- (agency_id) for agency-scoped queries
- (agency_id, status) for filtering by status
- (agency_id, scheduled_at) for calendar views

3. Security
- RLS enabled; agency-scoped CRUD via get_user_agency_id()
- 4 separate policies (select/insert/update/delete) TO authenticated
*/

CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(user_id) ON DELETE SET NULL DEFAULT auth.uid(),
  content text NOT NULL,
  platforms text[] NOT NULL DEFAULT '{}',
  image_url text,
  link_url text,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_posts_agency ON social_posts(agency_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_agency_status ON social_posts(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_social_posts_agency_scheduled ON social_posts(agency_id, scheduled_at);

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "social_posts_select_agency" ON social_posts;
CREATE POLICY "social_posts_select_agency" ON social_posts FOR SELECT
  TO authenticated USING (agency_id = get_user_agency_id());

DROP POLICY IF EXISTS "social_posts_insert_agency" ON social_posts;
CREATE POLICY "social_posts_insert_agency" ON social_posts FOR INSERT
  TO authenticated WITH CHECK (agency_id = get_user_agency_id());

DROP POLICY IF EXISTS "social_posts_update_agency" ON social_posts;
CREATE POLICY "social_posts_update_agency" ON social_posts FOR UPDATE
  TO authenticated USING (agency_id = get_user_agency_id())
  WITH CHECK (agency_id = get_user_agency_id());

DROP POLICY IF EXISTS "social_posts_delete_agency" ON social_posts;
CREATE POLICY "social_posts_delete_agency" ON social_posts FOR DELETE
  TO authenticated USING (agency_id = get_user_agency_id());

DROP TRIGGER IF EXISTS social_posts_touch ON social_posts;
CREATE TRIGGER social_posts_touch BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
