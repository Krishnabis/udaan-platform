import { createAdminClient } from '@/lib/supabase/admin'
import { apiError, apiSuccess, rateLimit, toFloat, toInt, toBool } from '@/lib/utils'
import { HealthFacilityCSVRowSchema } from '@/lib/validation/schemas'
import { getProfile } from '@/lib/auth/rbac'
import { headers } from 'next/headers'
import Papa from 'papaparse'

export async function POST(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip, 10)) return apiError('Too many requests', 429)
  const profile = await getProfile()
  if (profile?.role !== 'ADMIN') return apiError('Forbidden', 403)

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return apiError('No file uploaded')

  const text = await file.text()
  const { data: rows } = Papa.parse<Record<string, string>>(text, {
    header: true, skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => (typeof v === 'string' ? v.trim() : v),
  })

  const admin = createAdminClient()
  const { data: locs } = await admin.from('locations').select('locality_code, id')
  const locMap = new Map((locs ?? []).map(l => [l.locality_code, l.id]))

  const valid: object[] = []
  const errors: object[] = []
  const unmapped: object[] = []
  const CHUNK = 500

  for (const [i, row] of rows.entries()) {
    const p = HealthFacilityCSVRowSchema.safeParse(row)
    if (!p.success) { errors.push({ row: i + 2, error: p.error.issues[0].message }); continue }
    const d = p.data
    const localityCode = d['Locality Code']
    const locationId   = locMap.get(localityCode) ?? null
    if (localityCode && !locationId) {
      unmapped.push({ locality_code: localityCode, source_table: 'health_facilities', source_code: d['Health Facility ID'], source_name: d['Health_Facility Name'] })
    }
    valid.push({
      facility_id:           d['Health Facility ID'] || null,
      name:                  d['Health_Facility Name'],
      locality_code:         localityCode || null,
      location_id:           locationId,
      district:              d['District'],
      health_block:          d['Health_Block'],
      cluster:               d['Health_Facility Cluster'],
      facility_type:         d['Facility Type'],
      address_locality:      d['Address Locality'],
      lat:                   toFloat(d['LAT']),
      lng:                   toFloat(d['LONG']),
      ccp:                   d['CCP'],
      is_hpv_site:           toBool(d['HPV Vaccination Site']),
      is_delivery_point:     toBool(d['Delivery Point']),
      is_fru:                toBool(d['FRU']),
      has_sncu:              toBool(d['SNCU']),
      has_nbsu:              toBool(d['NBSU']),
      msu_count:             toInt(d['MSUs']),
      non_msu_count:         toInt(d['NonMSUs']),
      ownership:             d['Ownership'],
      empanelments:          d['Emapnelments'],
      is_training_institute: toBool(d['Training Institute']),
      pass_code:             d['Pass Code (6 digit)'],
    })
  }

  let inserted = 0
  for (let i = 0; i < valid.length; i += CHUNK) {
    const { error } = await admin.from('health_facilities').upsert(valid.slice(i, i + CHUNK), { onConflict: 'facility_id' })
    if (!error) inserted += Math.min(CHUNK, valid.length - i)
    else errors.push({ row: `batch-${i}`, error: error.message })
  }
  if (unmapped.length) await admin.from('unmapped_locations').insert(unmapped)

  return apiSuccess({ inserted, errors, unmapped: unmapped.length, total: rows.length }, 201)
}
