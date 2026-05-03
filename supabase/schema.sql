-- ============================================================
-- UDAAN Platform – Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role       AS ENUM ('ADMIN','SCHOOL_USER');
  CREATE TYPE hpv_status_type AS ENUM ('VACCINATED','PENDING','DUE','NOT_ELIGIBLE');
  CREATE TYPE gender_type     AS ENUM ('MALE','FEMALE','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- LOCATIONS (Master – flat hierarchy from CSV)
-- ============================================================
CREATE TABLE IF NOT EXISTS locations (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  locality_code     TEXT        UNIQUE,
  name              TEXT        NOT NULL,
  local_body_code   TEXT,
  local_body_name   TEXT,
  local_body_type   TEXT,
  sub_district_code TEXT,
  sub_district_name TEXT,
  block_code        TEXT,
  block_name        TEXT,
  district_code     TEXT,
  district_name     TEXT,
  region_code       TEXT,
  region_name       TEXT,
  state_code        TEXT,
  state_name        TEXT,
  national_code     TEXT,
  nation_name       TEXT,
  lat               NUMERIC(10,6),
  lng               NUMERIC(10,6),
  alt               NUMERIC(10,2),
  is_temp           BOOLEAN     DEFAULT FALSE,
  search_vector     TSVECTOR,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCHOOLS
-- ============================================================
CREATE TABLE IF NOT EXISTS schools (
  id               UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_code      TEXT  UNIQUE NOT NULL,
  school_name      TEXT  NOT NULL,
  locality_code    TEXT  REFERENCES locations(locality_code) ON DELETE SET NULL,
  location_id      UUID  REFERENCES locations(id) ON DELETE SET NULL,
  block_code       TEXT,
  block_name       TEXT,
  cluster_code     TEXT,
  cluster_name     TEXT,
  address_locality TEXT,
  school_category  TEXT,
  school_management TEXT,
  setting          TEXT,
  school_type      TEXT,
  students_boys    INTEGER DEFAULT 0,
  students_girls   INTEGER DEFAULT 0,
  students_total   INTEGER DEFAULT 0,
  teachers_male    INTEGER DEFAULT 0,
  teachers_female  INTEGER DEFAULT 0,
  teachers_total   INTEGER DEFAULT 0,
  classrooms       INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HEALTH FACILITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS health_facilities (
  id                   UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id          TEXT  UNIQUE,
  name                 TEXT  NOT NULL,
  locality_code        TEXT  REFERENCES locations(locality_code) ON DELETE SET NULL,
  location_id          UUID  REFERENCES locations(id) ON DELETE SET NULL,
  district             TEXT,
  health_block         TEXT,
  cluster              TEXT,
  facility_type        TEXT,
  address_locality     TEXT,
  lat                  NUMERIC(10,6),
  lng                  NUMERIC(10,6),
  ccp                  TEXT,
  is_hpv_site          BOOLEAN DEFAULT FALSE,
  is_delivery_point    BOOLEAN DEFAULT FALSE,
  is_fru               BOOLEAN DEFAULT FALSE,
  has_sncu             BOOLEAN DEFAULT FALSE,
  has_nbsu             BOOLEAN DEFAULT FALSE,
  msu_count            INTEGER DEFAULT 0,
  non_msu_count        INTEGER DEFAULT 0,
  ownership            TEXT,
  empanelments         TEXT,
  is_training_institute BOOLEAN DEFAULT FALSE,
  pass_code            TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id                     UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  aadhar_no              TEXT             UNIQUE NOT NULL,
  name                   TEXT             NOT NULL,
  school_code            TEXT             REFERENCES schools(school_code) ON DELETE SET NULL,
  school_id              UUID             REFERENCES schools(id) ON DELETE SET NULL,
  location_id            UUID             REFERENCES locations(id) ON DELETE SET NULL,
  gender                 gender_type,
  age                    INTEGER,
  hpv_status             hpv_status_type  DEFAULT 'PENDING',
  hpv_vaccination_date   DATE,
  hpv_vaccination_time   TEXT,
  hpv_vaccination_venue  TEXT,
  is_school_going        BOOLEAN          DEFAULT TRUE,
  created_at             TIMESTAMPTZ      DEFAULT NOW(),
  updated_at             TIMESTAMPTZ      DEFAULT NOW()
);

-- ============================================================
-- USER PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        UNIQUE NOT NULL,
  name        TEXT,
  employee_id TEXT,
  role        user_role   DEFAULT 'SCHOOL_USER',
  school_code TEXT        REFERENCES schools(school_code) ON DELETE SET NULL,
  school_id   UUID        REFERENCES schools(id) ON DELETE SET NULL,
  location_id UUID        REFERENCES locations(id) ON DELETE SET NULL,
  is_active   BOOLEAN     DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UNMAPPED LOCATIONS (CSV import mismatches)
-- ============================================================
CREATE TABLE IF NOT EXISTS unmapped_locations (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  locality_code    TEXT        NOT NULL,
  source_table     TEXT        NOT NULL,
  source_code      TEXT        NOT NULL,
  source_name      TEXT,
  resolved         BOOLEAN     DEFAULT FALSE,
  temp_location_id UUID        REFERENCES locations(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VACCINATION RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS vaccination_records (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id         UUID        REFERENCES students(id) ON DELETE CASCADE,
  aadhar_no          TEXT        NOT NULL,
  vaccination_date   DATE        NOT NULL,
  vaccination_time   TEXT,
  vaccination_venue  TEXT        NOT NULL,
  vaccinated_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  school_id          UUID        REFERENCES schools(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  action     TEXT        NOT NULL,
  table_name TEXT        NOT NULL,
  record_id  TEXT,
  old_data   JSONB,
  new_data   JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEARCH VECTOR TRIGGER (Locations full-text search)
-- ============================================================
CREATE OR REPLACE FUNCTION update_location_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', unaccent(COALESCE(NEW.name,''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(COALESCE(NEW.local_body_name,''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(COALESCE(NEW.sub_district_name,''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(COALESCE(NEW.block_name,''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(COALESCE(NEW.district_name,''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(COALESCE(NEW.state_name,''))), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_location_search_vector ON locations;
CREATE TRIGGER trg_location_search_vector
  BEFORE INSERT OR UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_location_search_vector();

-- ============================================================
-- AUTO-UPDATE location_id on schools / health_facilities
-- ============================================================
CREATE OR REPLACE FUNCTION sync_location_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.locality_code IS NOT NULL THEN
    SELECT id INTO NEW.location_id FROM locations WHERE locality_code = NEW.locality_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_school_location ON schools;
CREATE TRIGGER trg_school_location
  BEFORE INSERT OR UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION sync_location_id();

DROP TRIGGER IF EXISTS trg_facility_location ON health_facilities;
CREATE TRIGGER trg_facility_location
  BEFORE INSERT OR UPDATE ON health_facilities
  FOR EACH ROW EXECUTE FUNCTION sync_location_id();

-- ============================================================
-- AUTO-UPDATE student location_id via school
-- ============================================================
CREATE OR REPLACE FUNCTION sync_student_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.school_id IS NOT NULL THEN
    SELECT location_id INTO NEW.location_id FROM schools WHERE id = NEW.school_id;
  ELSIF NEW.school_code IS NOT NULL THEN
    SELECT s.location_id INTO NEW.location_id FROM schools s WHERE s.school_code = NEW.school_code;
    SELECT s.id INTO NEW.school_id FROM schools s WHERE s.school_code = NEW.school_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_student_location ON students;
CREATE TRIGGER trg_student_location
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION sync_student_location();

-- ============================================================
-- UPDATED_AT trigger
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_updated_locations    BEFORE UPDATE ON locations          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_schools      BEFORE UPDATE ON schools            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_facilities   BEFORE UPDATE ON health_facilities  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_students     BEFORE UPDATE ON students           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_updated_profiles     BEFORE UPDATE ON user_profiles      FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- LOCATION SUBTREE FUNCTION (for hierarchy-filtered analytics)
-- ============================================================
CREATE OR REPLACE FUNCTION get_locations_in_scope(p_locality_code TEXT)
RETURNS TABLE(id UUID) AS $$
BEGIN
  IF p_locality_code IS NULL OR p_locality_code = '' THEN
    RETURN QUERY SELECT l.id FROM locations l;
  ELSE
    RETURN QUERY
      SELECT l.id FROM locations l
      WHERE  l.locality_code  = p_locality_code
          OR l.block_code     = (SELECT block_code     FROM locations WHERE locality_code = p_locality_code LIMIT 1)
          OR l.district_code  = (SELECT district_code  FROM locations WHERE locality_code = p_locality_code LIMIT 1)
          OR l.state_code     = (SELECT state_code     FROM locations WHERE locality_code = p_locality_code LIMIT 1);
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;
