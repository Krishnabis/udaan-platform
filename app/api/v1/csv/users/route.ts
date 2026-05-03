import { createAdminClient } from '@/lib/supabase/admin'
import { apiError, apiSuccess, rateLimit } from '@/lib/utils'
import { UserCSVRowSchema } from '@/lib/validation/schemas'
import { getProfile } from '@/lib/auth/rbac'
import { headers } from 'next/headers'
import Papa from 'papaparse'

export async function POST(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip, 5)) return apiError('Too many requests', 429)
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
  const { data: schools } = await admin.from('schools').select('school_code, id, location_id')
  const schoolMap = new Map((schools ?? []).map(s => [s.school_code, { id: s.id, location_id: s.location_id }]))

  const results: object[] = []
  const errors: object[]  = []

  for (const [i, row] of rows.entries()) {
    const p = UserCSVRowSchema.safeParse(row)
    if (!p.success) { errors.push({ row: i + 2, error: p.error.issues[0].message }); continue }
    const d = p.data
    const school = schoolMap.get(d['School Code'])

    // Create Supabase Auth user (email = MAIL ID, password = NUMBER)
    const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
      email:             d['MAIL ID'],
      password:          d['NUMBER'],
      email_confirm:     true,
      user_metadata:     { name: d['NAME'] },
    })

    if (authErr && !authErr.message.includes('already been registered')) {
      errors.push({ row: i + 2, error: authErr.message }); continue
    }

    const uid = authUser?.user?.id
    if (!uid) { errors.push({ row: i + 2, error: 'Could not create auth user' }); continue }

    // Upsert profile
    await admin.from('user_profiles').upsert({
      id:          uid,
      email:       d['MAIL ID'],
      name:        d['NAME'],
      employee_id: d['ID'],
      role:        'SCHOOL_USER',
      school_code: d['School Code'],
      school_id:   school?.id ?? null,
      location_id: school?.location_id ?? null,
      is_active:   true,
    }, { onConflict: 'id' })

    results.push({ email: d['MAIL ID'], status: 'created' })
  }

  return apiSuccess({ created: results.length, errors, total: rows.length }, 201)
}
