import { createAdminClient } from '@/lib/supabase/admin'
import { apiError, apiSuccess, rateLimit, toInt } from '@/lib/utils'
import { SchoolCSVRowSchema } from '@/lib/validation/schemas'
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
  const valid: object[] = []
  const errors: object[] = []
  const unmapped: object[] = []
  const CHUNK = 500

  // Pre-fetch all known locality codes for fast lookup
  const { data: locs } = await admin.from('locations').select('locality_code, id')
  const locMap = new Map((locs ?? []).map(l => [l.locality_code, l.id]))

  for (const [i, row] of rows.entries()) {
    const p = SchoolCSVRowSchema.safeParse(row)
    if (!p.success) { errors.push({ row: i + 2, error: p.error.issues[0].message }); continue }
    const d = p.data
    const localityCode = d['Locality Code']
    const locationId   = locMap.get(localityCode) ?? null

    if (localityCode && !locationId) {
      unmapped.push({
        locality_code: localityCode,
        source_table: 'schools',
        source_code:  d['School Code'],
        source_name:  d['School Name'],
      })
    }

    valid.push({
      school_code:       d['School Code'],
      school_name:       d['School Name'],
      locality_code:     localityCode || null,
      location_id:       locationId,
      block_code:        d['Block Code'],
      block_name:        d['Block Name'],
      cluster_code:      d['Cluster Code'],
      cluster_name:      d['Cluster Name'],
      address_locality:  d['Address Locality:  Village Name'],
      school_category:   d['School Category'],
      school_management: d['School Management'],
      setting:           d['Setting'],
      school_type:       d['Type'],
      students_boys:     toInt(d['Students_Boys']),
      students_girls:    toInt(d['Students_Girls']),
      students_total:    toInt(d['Students_Total']),
      teachers_male:     toInt(d['Teachers_Male']),
      teachers_female:   toInt(d['Teachers_Female']),
      teachers_total:    toInt(d['Teachers_Total']),
      classrooms:        toInt(d['Class rooms']),
    })
  }

  let inserted = 0
  for (let i = 0; i < valid.length; i += CHUNK) {
    const { error } = await admin.from('schools').upsert(valid.slice(i, i + CHUNK), { onConflict: 'school_code' })
    if (!error) inserted += Math.min(CHUNK, valid.length - i)
    else errors.push({ row: `batch-${i}`, error: error.message })
  }

  if (unmapped.length) {
    await admin.from('unmapped_locations').upsert(unmapped as Parameters<typeof admin.from>[], { ignoreDuplicates: true })
  }

  return apiSuccess({ inserted, errors, unmapped: unmapped.length, total: rows.length }, 201)
}
