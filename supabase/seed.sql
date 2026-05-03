-- ============================================================
-- UDAAN Platform – Seed Data
-- NOTE: Run AFTER schema.sql and rls_policies.sql
--
-- Step 1: Create admin user in Supabase Auth Dashboard OR via
--         the /api/v1/setup endpoint (see README).
-- Step 2: Replace 'ADMIN_AUTH_UUID' below with the UUID from auth.users.
-- ============================================================

-- Insert admin profile (replace UUID after creating auth user)
-- INSERT INTO user_profiles (id, email, name, role, is_active)
-- VALUES (
--   'ADMIN_AUTH_UUID',
--   'admin@gmail.com',
--   'System Administrator',
--   'ADMIN',
--   TRUE
-- )
-- ON CONFLICT (id) DO NOTHING;

-- Sample test location (Uttarakhand – Dehradun)
INSERT INTO locations (
  locality_code, name, local_body_name, local_body_type,
  sub_district_name, block_code, block_name,
  district_code, district_name, state_code, state_name,
  national_code, nation_name, lat, lng
) VALUES (
  'UK01001001', 'Dehradun Village', 'Dehradun Gram Sabha', 'Gram Sabha',
  'Dehradun', 'UK01001', 'Dehradun', 'UK01', 'Dehradun',
  'UK', 'Uttarakhand', 'IN', 'India', 30.3165, 78.0322
) ON CONFLICT (locality_code) DO NOTHING;
