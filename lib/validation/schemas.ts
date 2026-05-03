import { z } from 'zod'

// ── Location ──────────────────────────────────────────────
export const LocationSearchSchema = z.object({
  q: z.string().min(4).max(100),
  limit: z.coerce.number().min(1).max(50).default(10),
})

// ── Location CSV row ──────────────────────────────────────
export const LocationCSVRowSchema = z.object({
  'Locality Code':                             z.string().min(1),
  'Locality (Village / Mohalla) Name':         z.string().min(1),
  'Local Body Code':                           z.string().optional().default(''),
  'Local Body (Gram Sabha / Urban Ward) Name': z.string().optional().default(''),
  'Local Body Type':                           z.string().optional().default(''),
  'Sub District Code':                         z.string().optional().default(''),
  'Sub District Name':                         z.string().optional().default(''),
  'Development Block Code':                    z.string().optional().default(''),
  'Development Block Name':                    z.string().optional().default(''),
  'District Code':                             z.string().optional().default(''),
  'District Name':                             z.string().optional().default(''),
  'Region Code':                               z.string().optional().default(''),
  'Region Name':                               z.string().optional().default(''),
  'State Code':                                z.string().optional().default(''),
  'State Name':                                z.string().optional().default(''),
  'National Code':                             z.string().optional().default(''),
  'Nation Name':                               z.string().optional().default(''),
  'Lat.':                                      z.string().optional().default(''),
  'Long. ':                                    z.string().optional().default(''),
  'Alt.':                                      z.string().optional().default(''),
})

// ── School CSV row ────────────────────────────────────────
export const SchoolCSVRowSchema = z.object({
  'Block Code':          z.string().min(1),
  'Block Name':          z.string().optional().default(''),
  'Cluster Code':        z.string().optional().default(''),
  'Cluster Name':        z.string().optional().default(''),
  'School Code':         z.string().min(1),
  'School Name':         z.string().min(1),
  'Locality Code':       z.string().optional().default(''),
  'Address Locality:  Village Name': z.string().optional().default(''),
  'School Category':    z.string().optional().default(''),
  'School Management':  z.string().optional().default(''),
  'Setting':            z.string().optional().default(''),
  'Type':               z.string().optional().default(''),
  'Students_Boys':      z.string().optional().default('0'),
  'Students_Girls':     z.string().optional().default('0'),
  'Students_Total':     z.string().optional().default('0'),
  'Teachers_Male':      z.string().optional().default('0'),
  'Teachers_Female':    z.string().optional().default('0'),
  'Teachers_Total':     z.string().optional().default('0'),
  'Class rooms':        z.string().optional().default('0'),
})

// ── Health Facility CSV row ───────────────────────────────
export const HealthFacilityCSVRowSchema = z.object({
  'District':               z.string().optional().default(''),
  'Health_Block':           z.string().optional().default(''),
  'Health_Facility Cluster':z.string().optional().default(''),
  'Health_Facility Name':   z.string().min(1),
  'Facility Type':          z.string().optional().default(''),
  'Locality Code':          z.string().optional().default(''),
  'Address Locality':       z.string().optional().default(''),
  'LAT':                    z.string().optional().default(''),
  'LONG':                   z.string().optional().default(''),
  'CCP':                    z.string().optional().default(''),
  'HPV Vaccination Site':   z.string().optional().default(''),
  'Delivery Point':         z.string().optional().default(''),
  'FRU':                    z.string().optional().default(''),
  'SNCU':                   z.string().optional().default(''),
  'NBSU':                   z.string().optional().default(''),
  'MSUs':                   z.string().optional().default('0'),
  'NonMSUs':                z.string().optional().default('0'),
  'Ownership':              z.string().optional().default(''),
  'Emapnelments':           z.string().optional().default(''),
  'Health Facility ID':     z.string().optional().default(''),
  'Training Institute':     z.string().optional().default(''),
  'Pass Code (6 digit)':    z.string().optional().default(''),
})

// ── Student CSV row ───────────────────────────────────────
export const StudentCSVRowSchema = z.object({
  'School Code':  z.string().min(1),
  'School Name':  z.string().optional().default(''),
  'aadhar no':    z.string().min(1),
  'Name':         z.string().min(1),
  'gender':       z.string().optional().default(''),
  'age':          z.string().optional().default(''),
  'HPV status':   z.string().optional().default(''),
})

// ── User CSV row ──────────────────────────────────────────
export const UserCSVRowSchema = z.object({
  'School Code':  z.string().min(1),
  'School Name':  z.string().optional().default(''),
  'Type':         z.string().optional().default('SCHOOL_USER'),
  'ID':           z.string().optional().default(''),
  'NAME':         z.string().min(1),
  'NUMBER':       z.string().min(1),
  'MAIL ID':      z.string().email(),
})

// ── Vaccination record ────────────────────────────────────
export const MarkVaccinatedSchema = z.object({
  student_id:       z.string().uuid(),
  vaccination_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  vaccination_time: z.string().optional(),
  vaccination_venue:z.string().min(2).max(200),
})

// ── Pagination ────────────────────────────────────────────
export const PaginationSchema = z.object({
  page:  z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
})
