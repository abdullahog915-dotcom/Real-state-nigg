-- Role Escalation Protection
-- Migration: 018_protect_profile_role.sql
--
-- Closes a privilege-escalation hole in the profiles RLS:
-- the "Users can update own profile" policy (016_rls_policies.sql)
-- allows any authenticated user to UPDATE their own row, including the
-- `role` column — e.g. self-promoting to 'admin'.
--
-- This trigger preserves the existing role on self-updates unless the
-- acting session is already an admin. Admins keep full UPDATE power
-- through the "Admins can update all profiles" policy.
--
-- NOTE: is_admin() is defined in 016_rls_policies.sql (SECURITY DEFINER,
-- reads profiles by user_id). This migration must run after 016.

CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT is_admin() THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER protect_profile_role
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_escalation();

COMMENT ON FUNCTION prevent_role_escalation() IS
  'Blocks non-admin sessions from changing profiles.role on UPDATE';
