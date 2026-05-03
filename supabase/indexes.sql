-- ============================================================
-- UDAAN Platform – Performance Indexes
-- Run AFTER schema.sql
-- ============================================================

-- Locations: full-text + trigram for fuzzy search
CREATE INDEX IF NOT EXISTS idx_locations_search_vector ON locations USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_locations_name_trgm     ON locations USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_locations_block_code    ON locations(block_code);
CREATE INDEX IF NOT EXISTS idx_locations_district_code ON locations(district_code);
CREATE INDEX IF NOT EXISTS idx_locations_state_code    ON locations(state_code);
CREATE INDEX IF NOT EXISTS idx_locations_locality_code ON locations(locality_code);
CREATE INDEX IF NOT EXISTS idx_locations_is_temp       ON locations(is_temp);

-- Schools
CREATE INDEX IF NOT EXISTS idx_schools_locality_code  ON schools(locality_code);
CREATE INDEX IF NOT EXISTS idx_schools_location_id    ON schools(location_id);
CREATE INDEX IF NOT EXISTS idx_schools_block_code     ON schools(block_code);
CREATE INDEX IF NOT EXISTS idx_schools_school_code    ON schools(school_code);

-- Health Facilities
CREATE INDEX IF NOT EXISTS idx_hf_locality_code       ON health_facilities(locality_code);
CREATE INDEX IF NOT EXISTS idx_hf_location_id         ON health_facilities(location_id);
CREATE INDEX IF NOT EXISTS idx_hf_is_hpv_site         ON health_facilities(is_hpv_site);
CREATE INDEX IF NOT EXISTS idx_hf_health_block        ON health_facilities(health_block);

-- Students
CREATE INDEX IF NOT EXISTS idx_students_school_id     ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school_code   ON students(school_code);
CREATE INDEX IF NOT EXISTS idx_students_gender        ON students(gender);
CREATE INDEX IF NOT EXISTS idx_students_age           ON students(age);
CREATE INDEX IF NOT EXISTS idx_students_hpv_status    ON students(hpv_status);
CREATE INDEX IF NOT EXISTS idx_students_location_id   ON students(location_id);
-- Composite for HPV analytics (girls 14-15)
CREATE INDEX IF NOT EXISTS idx_students_hpv_analytics ON students(gender, age, hpv_status) WHERE gender = 'FEMALE';

-- User Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role          ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_school_id     ON user_profiles(school_id);

-- Vaccination Records
CREATE INDEX IF NOT EXISTS idx_vax_student_id         ON vaccination_records(student_id);
CREATE INDEX IF NOT EXISTS idx_vax_school_id          ON vaccination_records(school_id);
CREATE INDEX IF NOT EXISTS idx_vax_date               ON vaccination_records(vaccination_date);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_table            ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_user             ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created          ON audit_logs(created_at DESC);
