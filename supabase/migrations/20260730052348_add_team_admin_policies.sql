/*
# Team management — admin-scoped profile policies

## Purpose
Currently the profiles table only allows a user to SELECT/UPDATE their own row.
This blocks the Team page: an admin cannot edit another member's role, title,
phone, or active status, and the existing `profile_insert_self` policy requires
`user_id = auth.uid()` so the frontend cannot insert a profile for a newly
invited teammate either.

## Changes
1. RLS policies on `profiles`:
   - Add `profile_update_admin` — allows an admin (role = 'admin' in the same
     agency) to UPDATE any profile belonging to their agency. Keeps the existing
     `profile_update_self` policy so self-edits still work.
   - Add `profile_insert_admin` — allows an admin to INSERT a profile row into
     their own agency (used by the invite edge function's service-role writes
     are unaffected; this covers any anon-key admin path).
2. A helper function `is_agency_admin()` that checks the caller's role, used by
   the new policies.

## Security
- No new tables, no column changes, no data loss.
- Admin power is scoped to the caller's own agency only.
- Self-edit policies are untouched.
*/

-- Helper: is the current user an admin of their agency?
CREATE OR REPLACE FUNCTION is_agency_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
END;
$func$;

-- Allow admins to update any profile in their agency
DROP POLICY IF EXISTS "profile_update_admin" ON profiles;
CREATE POLICY "profile_update_admin" ON profiles FOR UPDATE
  TO authenticated
  USING (
    is_agency_admin()
    AND agency_id = get_user_agency_id()
  )
  WITH CHECK (
    is_agency_admin()
    AND agency_id = get_user_agency_id()
  );

-- Allow admins to insert profiles into their own agency
DROP POLICY IF EXISTS "profile_insert_admin" ON profiles;
CREATE POLICY "profile_insert_admin" ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    is_agency_admin()
    AND agency_id = get_user_agency_id()
  );