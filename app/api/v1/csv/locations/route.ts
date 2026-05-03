import { createAdminClient } from '@/lib/supabase/admin'
import { apiError, apiSuccess, rateLimit, toFloat } from '@/lib/utils'
import { LocationCSVRowSchema } from '@/lib/validation/schemas'
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
  const { data: rows, errors: parseErrors } = Papa.parse<Record<string, string>>(text, {
    header: true, skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => (typeof v === 'string' ? v.trim() : v),
  })

  const valid: object[]  = []
  const errors: object[] = []
  const CHUNK = 500

  for (const [i, row] of rows.entries()) {
    const p = LocationCSVRowSchema.safeParse(row)
    if (!p.success) { errors.push({ row: i + 2, error: p.error.issues[0].message }); continue }
    const d = p.data
    valid.push({
      locality_code:     d['Locality Code'],
      name:              d['Locality (Village / Mohalla) Name'],
      local_body_code:   d['Local Body Code'],
      local_body_name:   d['Local Body (Gram Sabha / Urban Ward) Name'],
      local_body_type:   d['Local Body Type'],
      sub_district_code: d['Sub District Code'],
      sub_district_name: d['Sub District Name'],
      block_code:        d['Development Block Code'],
      block_name:        d['Development Block Name'],
      district_code:     d['District Code'],
      district_name:     d['District Name'],
      region_code:       d['Region Code'],
      region_name:       d['Region Name'],
      state_code:        d['State Code'],
      state_name:        d['State Name'],
      national_code:     d['National Code'],
      nation_name:       d['Nation Name'],
      lat:               toFloat(d['Lat.']),
      lng:               toFloat(d['Long.']),
      alt:               toFloat(d['Alt.']),
    })
  }

  const admin = createAdminClient()
  let inserted = 0
  for (let i = 0; i < valid.length; i += CHUNK) {
    const { error } = await admin.from('locations').upsert(valid.slice(i, i + CHUNK), { onConflict: 'locality_code' })
    if (!error) inserted += Math.min(CHUNK, valid.length - i)
    else errors.push({ row: `batch-${i}`, error: error.message })
  }

  return apiSuccess({ inserted, errors, total: rows.length }, 201)
}
