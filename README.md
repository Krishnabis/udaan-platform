# UDAAN Platform – README & Deployment Guide

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- A Supabase project (free tier is fine)

### 2. Run the Database Schema

In Supabase Dashboard → SQL Editor, run these files **in order**:
1. `supabase/schema.sql` — Tables, triggers, enums
2. `supabase/rls_policies.sql` — Row Level Security
3. `supabase/indexes.sql` — Performance indexes
4. `supabase/seed.sql` — Optional sample data

### 3. Create Admin User

After running the schema, create the admin user via the setup endpoint:

```bash
# Add to .env.local first:
SETUP_SECRET=any_random_secret_here

# Then call:
curl -X POST http://localhost:3000/api/v1/setup \
  -H "Content-Type: application/json" \
  -d '{"setup_secret":"any_random_secret_here","name":"System Administrator"}'
```

**Important:** Remove `SETUP_SECRET` from `.env.local` after first use.

### 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Where to find |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |

### 5. Run Locally

```bash
cd udaan-platform
npm install
npm run dev
# Open http://localhost:3000
```

---

## 📦 Deploy to Vercel

### Option A: Vercel CLI
```bash
npm i -g vercel
cd udaan-platform
vercel --prod
```

### Option B: GitHub Integration
1. Push `udaan-platform/` folder to GitHub
2. Go to vercel.com → New Project → Import repo
3. Add all environment variables in Vercel dashboard
4. Deploy

**Important Vercel settings:**
- Root Directory: `udaan-platform`
- Build Command: `npm run build`
- Output Directory: `.next`

---

## 🔐 Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@gmail.com | admin123 |
| School User | MAIL ID (from CSV) | NUMBER (from CSV) |

---

## 📂 CSV Upload Guide

Upload CSVs in this order (dependencies!):

1. **Locations** (`/locations` → Upload CSV)
   - Required first — all other modules depend on locality codes

2. **Schools** (`/schools` → Upload CSV)
   - Requires locations to be loaded first
   - Unmapped locality codes go to `unmapped_locations` table

3. **Health Facilities** (`/health-facilities` → Upload CSV)
   - Requires locations

4. **Students** (`/students` → Upload CSV)
   - Requires schools

5. **Users** (`/users` → Upload CSV) ← Admin only
   - Requires schools
   - Creates Supabase Auth accounts (email = MAIL ID, password = NUMBER)

### Unmapped Locations
If a school/facility has a locality code not in the locations table:
- It is stored in `unmapped_locations`
- Admin can create a temporary location via the UI

---

## 🗄️ Database Tables

| Table | Purpose |
|---|---|
| `locations` | Master location hierarchy (flat + searchable) |
| `schools` | School registry linked to locations |
| `health_facilities` | Health facilities with HPV site flag |
| `students` | Students linked to schools (aadhar as unique key) |
| `user_profiles` | Platform users extending Supabase Auth |
| `vaccination_records` | HPV vaccination event log |
| `unmapped_locations` | CSV import location mismatches |
| `audit_logs` | All write operations |

---

## 🔒 Security Features

- ✅ Supabase Row Level Security on all tables
- ✅ JWT authentication via Supabase Auth
- ✅ Role-based access (Admin / School User)
- ✅ Proxy (middleware) auth guard on all protected routes
- ✅ Zod input validation on all API endpoints
- ✅ Rate limiting (100 req/min per IP)
- ✅ Security headers (CSP, X-Frame-Options, HSTS)
- ✅ Service role key never exposed to browser
- ✅ SQL injection impossible (parameterized queries via Supabase client)

---

## 🏗️ Architecture

```
app/
  (public)/          → Landing page, Login
  (dashboard)/       → Protected pages (auth required)
    dashboard/       → Analytics dashboard
    locations/       → Location module
    schools/         → School module
    health-facilities/
    students/
    vaccination/     → HPV vaccination module
    users/           → Admin only
  api/v1/            → Secure API routes
    locations/search → Fuzzy search (debounced, pg_trgm)
    dashboard/analytics
    csv/*            → Bulk CSV ingestion
    vaccination      → Mark vaccinated + certificate
    setup            → One-time admin creation

lib/
  supabase/          → Browser, server, admin clients
  auth/              → RBAC utilities
  validation/        → Zod schemas (all CSV columns)
  csv/               → Parse utilities
  utils.ts           → Helpers, rate limiter

supabase/
  schema.sql         → Full DB schema + triggers
  rls_policies.sql   → Row Level Security
  indexes.sql        → Performance indexes
  seed.sql           → Sample data
```

---

## 🌟 Key Features

### Smart Location Search
- Triggers after 4 characters (debounced 400ms)
- Uses PostgreSQL `pg_trgm` fuzzy matching + full-text search
- Returns hierarchical results: Village, Block, District, State
- Filters entire dashboard on selection

### HPV Analytics (location-scoped)
- HPV Vaccination Sites count
- Coverage % (vaccinated/total eligible girls 14-15)
- Total due for vaccination
- All filtered by selected location's scope (same block/district/state)

### Vaccination Module
- Tab 1: Pending girls (age 14-15) → Mark Vaccinated popup
- Tab 2: Vaccinated list → Printable certificate

### CSV Ingestion
- Batch upsert (500 rows/batch) for lakhs of records
- Validates every row with Zod schemas
- Reports success count + error rows + unmapped locations

---

## ⚡ Performance

- GIN index on location `search_vector` for full-text search
- Trigram index for fuzzy matching
- Composite index on students (gender, age, hpv_status)
- Batch CSV inserts in 500-row chunks
- Server-side rendering for dashboard analytics
- Debounced search (400ms)
