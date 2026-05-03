import { createAdminClient } from '@/lib/supabase/admin'
import { apiError, apiSuccess, rateLimit, toInt, normaliseGender, normaliseHPVStatus } from '@/lib/utils'
import { StudentCSVRowSchema } from '@/lib/validation/schemas'
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
  // Pre-fetch school lookup: code → {id, location_id}
  const { data: schools } = await admin.from('schools').select('school_code, id, location_id')
  const schoolMap = new Map((schools ?? []).map(s => [s.school_code, { id: s.id, location_id: s.location_id }]))

  const valid: object[] = []
  const errors: object[] = []
  const CHUNK = 500

  for (const [i, row] of rows.entries()) {
    const p = StudentCSVRowSchema.safeParse(row)
    if (!p.success) { errors.push({ row: i + 2, error: p.error.issues[0].message }); continue }
    const d = p.data
    const school = schoolMap.get(d['School Code'])
    valid.push({
      aadhar_no:   d['aadhar no'],
      name:        d['Name'],
      school_code: d['School Code'],
      school_id:   school?.id ?? null,
      location_id: school?.location_id ?? null,
      gender:      normaliseGender(d['gender']),
      age:         toInt(d['age']),
      hpv_status:  normaliseHPVStatus(d['HPV status']),
      is_school_going: true,
    })
  }

  let inserted = 0
  for (let i = 0; i < valid.length; i += CHUNK) {
    const { error } = await admin.from('students').upsert(valid.slice(i, i + CHUNK), { onConflict: 'aadhar_no' })
    if (!error) inserted += Math.min(CHUNK, valid.length - i)
    else errors.push({ row: `batch-${i}`, error: error.message })
  }

  return apiSuccess({ inserted, errors, total: rows.length }, 201)
}
