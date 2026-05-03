-- ============================================================
-- UDAAN Platform – Row Level Security Policies
-- Run AFTER schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE locations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools            ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_facilities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE students           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE unmapped_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: is_admin()
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'ADMIN' AND is_active = TRUE
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================
-- HELPER: get_user_school_id()
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM user_profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================
-- LOCATIONS – public read, admin write
-- ============================================================
DROP POLICY IF EXISTS "locations_select" ON locations;
CREATE POLICY "locations_select" ON locations
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "locations_insert" ON locations;
CREATE POLICY "locations_insert" ON locations
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "locations_update" ON locations;
CREATE POLICY "locations_update" ON locations
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "locations_delete" ON locations;
CREATE POLICY "locations_delete" ON locations
  FOR DELETE USING (is_admin());

-- ============================================================
-- SCHOOLS
-- ============================================================
DROP POLICY IF EXISTS "schools_select" ON schools;
CREATE POLICY "schools_select" ON schools
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "schools_insert" ON schools;
CREATE POLICY "schools_insert" ON schools
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "schools_update" ON schools;
CREATE POLICY "schools_update" ON schools
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "schools_delete" ON schools;
CREATE POLICY "schools_delete" ON schools
  FOR DELETE USING (is_admin());

-- ============================================================
-- HEALTH FACILITIES
-- ============================================================
DROP POLICY IF EXISTS "hf_select" ON health_facilities;
CREATE POLICY "hf_select" ON health_facilities
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "hf_insert" ON health_facilities;
CREATE POLICY "hf_insert" ON health_facilities
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "hf_update" ON health_facilities;
CREATE POLICY "hf_update" ON health_facilities
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "hf_delete" ON health_facilities;
CREATE POLICY "hf_delete" ON health_facilities
  FOR DELETE USING (is_admin());

-- ============================================================
-- STUDENTS
-- ============================================================
-- Admin: all; School user: only their school's students
DROP POLICY IF EXISTS "students_select" ON students;
CREATE POLICY "students_select" ON students
  FOR SELECT USING (
    is_admin()
    OR school_id = get_user_school_id()
  );

DROP POLICY IF EXISTS "students_insert" ON students;
CREATE POLICY "students_insert" ON students
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "students_update" ON students;
CREATE POLICY "students_update" ON students
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "students_delete" ON students;
CREATE POLICY "students_delete" ON students
  FOR DELETE USING (is_admin());

-- ============================================================
-- USER PROFILES
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_own" ON user_profiles;
CREATE POLICY "profiles_select_own" ON user_profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "profiles_insert" ON user_profiles;
CREATE POLICY "profiles_insert" ON user_profiles
  FOR INSERT WITH CHECK (is_admin() OR id = auth.uid());

DROP POLICY IF EXISTS "profiles_update" ON user_profiles;
CREATE POLICY "profiles_update" ON user_profiles
  FOR UPDATE USING (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "profiles_delete" ON user_profiles;
CREATE POLICY "profiles_delete" ON user_profiles
  FOR DELETE USING (is_admin());

-- ============================================================
-- UNMAPPED LOCATIONS
-- ============================================================
DROP POLICY IF EXISTS "unmapped_select" ON unmapped_locations;
CREATE POLICY "unmapped_select" ON unmapped_locations
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "unmapped_insert" ON unmapped_locations;
CREATE POLICY "unmapped_insert" ON unmapped_locations
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "unmapped_update" ON unmapped_locations;
CREATE POLICY "unmapped_update" ON unmapped_locations
  FOR UPDATE USING (is_admin());

-- ============================================================
-- VACCINATION RECORDS
-- ============================================================
DROP POLICY IF EXISTS "vax_select" ON vaccination_records;
CREATE POLICY "vax_select" ON vaccination_records
  FOR SELECT USING (
    is_admin()
    OR school_id = get_user_school_id()
  );

DROP POLICY IF EXISTS "vax_insert" ON vaccination_records;
CREATE POLICY "vax_insert" ON vaccination_records
  FOR INSERT WITH CHECK (
    is_admin()
    OR school_id = get_user_school_id()
  );

DROP POLICY IF EXISTS "vax_update" ON vaccination_records;
CREATE POLICY "vax_update" ON vaccination_records
  FOR UPDATE USING (is_admin());

-- ============================================================
-- AUDIT LOGS
-- ============================================================
DROP POLICY IF EXISTS "audit_select" ON audit_logs;
CREATE POLICY "audit_select" ON audit_logs
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "audit_insert" ON audit_logs;
CREATE POLICY "audit_insert" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
