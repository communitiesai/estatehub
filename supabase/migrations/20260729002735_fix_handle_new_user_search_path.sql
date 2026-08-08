-- Fix: SECURITY DEFINER functions need an explicit search_path
-- otherwise Supabase rejects the trigger with "Database error querying schema"

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;
