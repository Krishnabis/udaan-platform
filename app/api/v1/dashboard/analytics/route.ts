import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess, rateLimit } from '@/lib/utils'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return apiError('Too many requests', 429)

  const { searchParams } = new URL(request.url)
  const locationCode = searchParams.get('location_code') ?? ''

  const supabase = await createClient()

  // HPV Sites count
  let hpvSitesQuery = supabase
    .from('health_facilities')
    .select('id', { count: 'exact', head: true })
    .eq('is_hpv_site', true)

  // Total schools
  let schoolsQuery = supabase
    .from('schools')
    .select('id', { count: 'exact', head: true })

  // Students analytics
  let studentsQuery = supabase
    .from('students')
    .select('id, gender, age, hpv_status, is_school_going', { count: 'exact' })

  // Users by role
  const { data: users } = await supabase
    .from('user_profiles')
    .select('role')

  // Geography stats
  const { data: geoStats } = await supabase
    .from('locations')
    .select('district_code, block_code, state_code')

  if (locationCode) {
    // Filter by location scope
    const { data: locScope } = await supabase
      .rpc('get_locations_in_scope', { p_locality_code: locationCode })
    const scopeIds = (locScope ?? []).map((r: { id: string }) => r.id)

    if (scopeIds.length) {
      hpvSitesQuery = hpvSitesQuery.in('location_id', scopeIds) as typeof hpvSitesQuery
      schoolsQuery  = schoolsQuery.in('location_id', scopeIds)  as typeof schoolsQuery
      studentsQuery = studentsQuery.in('location_id', scopeIds)  as typeof studentsQuery
    }
  }

  const [
    { count: hpvSites },
    { count: totalSchools },
    { data: students, count: totalStudents },
  ] = await Promise.all([hpvSitesQuery, schoolsQuery, studentsQuery])

  const allStudents = students ?? []
  const girls1415   = allStudents.filter(s => s.gender === 'FEMALE' && s.age >= 14 && s.age <= 15)
  const vaccinated  = girls1415.filter(s => s.hpv_status === 'VACCINATED')
  const due         = girls1415.filter(s => s.hpv_status !== 'VACCINATED')
  const schoolGoing = allStudents.filter(s => s.is_school_going)
  const boys        = schoolGoing.filter(s => s.gender === 'MALE').length
  const girls       = schoolGoing.filter(s => s.gender === 'FEMALE').length

  const districts = new Set(geoStats?.map(g => g.district_code).filter(Boolean)).size
  const blocks    = new Set(geoStats?.map(g => g.block_code).filter(Boolean)).size

  const adminCount  = users?.filter(u => u.role === 'ADMIN').length ?? 0
  const schoolUsers = users?.filter(u => u.role === 'SCHOOL_USER').length ?? 0

  return apiSuccess({
    hpv_sites:      hpvSites ?? 0,
    hpv_coverage: {
      vaccinated:   vaccinated.length,
      total_eligible: girls1415.length,
      percent: girls1415.length ? +((vaccinated.length / girls1415.length) * 100).toFixed(1) : 0,
    },
    total_due:      due.length,
    students: {
      total:        totalStudents ?? 0,
      school_going: schoolGoing.length,
      out_of_school: allStudents.filter(s => !s.is_school_going).length,
      boys_pct: schoolGoing.length ? +((boys / schoolGoing.length) * 100).toFixed(1) : 0,
      girls_pct: schoolGoing.length ? +((girls / schoolGoing.length) * 100).toFixed(1) : 0,
      hpv_vaccinated_girls_1415: vaccinated.length,
    },
    schools:  { total: totalSchools ?? 0 },
    users:    { admin: adminCount, school_user: schoolUsers, total: (adminCount + schoolUsers) },
    geography:{ districts, blocks },
  })
}
