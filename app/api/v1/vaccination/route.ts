import { createClient }      from '@/lib/supabase/server'
import { apiError, apiSuccess, rateLimit } from '@/lib/utils'
import { MarkVaccinatedSchema } from '@/lib/validation/schemas'
import { getProfile }          from '@/lib/auth/rbac'
import { headers }             from 'next/headers'

export async function POST(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return apiError('Too many requests', 429)

  const profile = await getProfile()
  if (!profile) return apiError('Unauthorized', 401)

  const body = await request.json()
  const parsed = MarkVaccinatedSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.issues[0].message)

  const { student_id, vaccination_date, vaccination_time, vaccination_venue } = parsed.data
  const supabase = await createClient()

  // Verify school user can access this student
  const { data: student } = await supabase.from('students').select('id, aadhar_no, school_id, gender, age').eq('id', student_id).single()
  if (!student) return apiError('Student not found', 404)
  if (profile.role !== 'ADMIN' && student.school_id !== profile.school_id) return apiError('Forbidden', 403)
  if (student.gender !== 'FEMALE') return apiError('HPV vaccination is for female students only')
  if (student.age < 14 || student.age > 15) return apiError('HPV vaccination is for age 14–15 only')

  const { data: vaxRecord, error: vaxErr } = await supabase.from('vaccination_records').insert({
    student_id,
    aadhar_no: student.aadhar_no,
    vaccination_date,
    vaccination_time,
    vaccination_venue,
    vaccinated_by: profile.id,
    school_id: student.school_id,
  }).select().single()
  if (vaxErr) return apiError(vaxErr.message, 500)

  // Update student HPV status
  await supabase.from('students').update({
    hpv_status: 'VACCINATED',
    hpv_vaccination_date: vaccination_date,
    hpv_vaccination_time: vaccination_time,
    hpv_vaccination_venue: vaccination_venue,
  }).eq('id', student_id)

  return apiSuccess(vaxRecord, 201)
}

export async function GET(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return apiError('Too many requests', 429)
  const profile = await getProfile()
  if (!profile) return apiError('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const tab = searchParams.get('tab') ?? 'pending' // 'pending' | 'vaccinated'
  const supabase = await createClient()

  let query = supabase.from('students')
    .select('id, aadhar_no, name, age, gender, hpv_status, hpv_vaccination_date, hpv_vaccination_venue, school_id, schools(school_name)')
    .eq('gender', 'FEMALE')
    .gte('age', 14).lte('age', 15)

  if (profile.role === 'SCHOOL_USER' && profile.school_id) {
    query = query.eq('school_id', profile.school_id)
  }

  if (tab === 'vaccinated') {
    query = query.eq('hpv_status', 'VACCINATED').order('hpv_vaccination_date', { ascending: false })
  } else {
    query = query.neq('hpv_status', 'VACCINATED').order('name')
  }

  const { data, error } = await query
  if (error) return apiError(error.message, 500)
  return apiSuccess(data)
}
