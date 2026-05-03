import { createClient }  from '@/lib/supabase/server'
import { apiError, apiSuccess, rateLimit } from '@/lib/utils'
import { PaginationSchema } from '@/lib/validation/schemas'
import { headers } from 'next/headers'
import { getProfile } from '@/lib/auth/rbac'

export async function GET(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return apiError('Too many requests', 429)
  const { searchParams } = new URL(request.url)
  const { page, limit } = PaginationSchema.parse({ page: searchParams.get('page'), limit: searchParams.get('limit') })
  const q = searchParams.get('q') ?? ''
  const from = (page - 1) * limit
  const supabase = await createClient()
  const profile = await getProfile()
  let query = supabase.from('students')
    .select('*, schools(school_name)', { count: 'exact' })
    .order('name').range(from, from + limit - 1)
  if (profile?.role === 'SCHOOL_USER' && profile.school_id) {
    query = query.eq('school_id', profile.school_id)
  }
  if (q) query = query.or(`name.ilike.%${q}%,aadhar_no.ilike.%${q}%`)
  const { data, error, count } = await query
  if (error) return apiError(error.message, 500)
  return apiSuccess({ data, count, page, limit })
}

export async function DELETE(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return apiError('Too many requests', 429)
  const profile = await getProfile()
  if (profile?.role !== 'ADMIN') return apiError('Forbidden', 403)
  const { id } = await request.json()
  if (!id) return apiError('id required')
  const supabase = await createClient()
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) return apiError(error.message, 500)
  return apiSuccess({ success: true })
}
