-- Helper function to promote a user to admin.
-- Run from Supabase SQL Editor:
--   SELECT make_admin('user-email@example.com');

CREATE OR REPLACE FUNCTION make_admin(user_email TEXT)
RETURNS void AS $$
DECLARE
  uid UUID;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = user_email;
  
  IF uid IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Remove existing roles and set admin
  DELETE FROM public.user_roles WHERE user_id = uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin');
  
  RAISE NOTICE 'User % is now admin', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper to promote a user to instructor.
-- Run from Supabase SQL Editor:
--   SELECT make_instructor('user-email@example.com');

CREATE OR REPLACE FUNCTION make_instructor(user_email TEXT)
RETURNS void AS $$
DECLARE
  uid UUID;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = user_email;
  
  IF uid IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  DELETE FROM public.user_roles WHERE user_id = uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'instructor');
  
  RAISE NOTICE 'User % is now instructor', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
