/*
# Revoke PUBLIC execute on SECURITY DEFINER functions

1. Security Changes
- `handle_new_user()`: REVOKE EXECUTE FROM PUBLIC — trigger-only function,
  must never be callable via REST RPC by any role.
- `get_user_agency_id()`: REVOKE EXECUTE FROM PUBLIC, GRANT to authenticated
  only — used inside RLS policies which run as the caller, so authenticated
  needs it but anon must never call it directly.
- `is_agency_admin()`: REVOKE EXECUTE FROM PUBLIC, GRANT to authenticated only.
2. Notes
- No data or schema changes. Only EXECUTE grants adjusted.
*/

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_user_agency_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_agency_id() TO authenticated;
REVOKE EXECUTE ON FUNCTION is_agency_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_agency_admin() TO authenticated;
