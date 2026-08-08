/*
# Harden SECURITY DEFINER functions

1. Security Changes
- `touch_updated_at()`: add `SET search_path = public` to fix mutable search_path warning.
- `handle_new_user()`: revoke EXECUTE from anon + authenticated — it is a trigger
  function on auth.users and must never be callable via the REST RPC endpoint.
- `get_user_agency_id()`: revoke EXECUTE from anon — used inside RLS policies
  scoped to authenticated, so anon must never call it directly.
- `is_agency_admin()`: revoke EXECUTE from anon — same reasoning.
2. Notes
- No data changes, no schema changes. Only function attributes + grants.
- authenticated can still call get_user_agency_id() and is_agency_admin()
  because RLS policies reference them; that is intentional.
*/

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION get_user_agency_id() FROM anon;
REVOKE EXECUTE ON FUNCTION is_agency_admin() FROM anon;
