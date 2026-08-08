/*
# Attendance tracking

1. New Tables
- `attendance`
  - `id` uuid PK
  - `agency_id` uuid FK -> agencies (cascade)
  - `user_id` uuid FK -> profiles (set null on delete)
  - `date` date NOT NULL — the working day (one check-in per user per day enforced)
  - `check_in_at` timestamptz NOT NULL
  - `check_out_at` timestamptz NULL (null = still checked in)
  - `status` text: 'present' | 'late' | 'half_day' | 'absent' (default 'present')
  - `note` text NULL
  - `created_at` timestamptz default now()
  - `updated_at` timestamptz default now()
2. Indexes
- (user_id, date) unique — one record per user per day
- (agency_id, date) for agency daily views
3. Security
- RLS enabled; agency-scoped CRUD (same pattern as other tables)
- 4 separate policies (select/insert/update/delete) TO authenticated
4. Notes
- `user_id` defaults to auth.uid() so a user can insert their own
  attendance row without passing their id.
*/

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(user_id) ON DELETE SET NULL DEFAULT auth.uid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  check_in_at timestamptz NOT NULL DEFAULT now(),
  check_out_at timestamptz,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','late','half_day','absent')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_agency_date ON attendance(agency_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "att_select_agency" ON attendance;
CREATE POLICY "att_select_agency" ON attendance FOR SELECT
  TO authenticated USING (agency_id = get_user_agency_id());

DROP POLICY IF EXISTS "att_insert_agency" ON attendance;
CREATE POLICY "att_insert_agency" ON attendance FOR INSERT
  TO authenticated WITH CHECK (agency_id = get_user_agency_id());

DROP POLICY IF EXISTS "att_update_agency" ON attendance;
CREATE POLICY "att_update_agency" ON attendance FOR UPDATE
  TO authenticated USING (agency_id = get_user_agency_id())
  WITH CHECK (agency_id = get_user_agency_id());

DROP POLICY IF EXISTS "att_delete_agency" ON attendance;
CREATE POLICY "att_delete_agency" ON attendance FOR DELETE
  TO authenticated USING (agency_id = get_user_agency_id());

DROP TRIGGER IF EXISTS attendance_touch ON attendance;
CREATE TRIGGER attendance_touch BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
