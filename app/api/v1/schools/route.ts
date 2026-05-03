import { createClient }       from '@/lib/supabase/server'
import { createAdminClient }  from '@/lib/supabase/admin'
import { apiError, apiSuccess, rateLimit } from '@/lib/utils'
import { PaginationSchema }   from '@/lib/validation/schemas'
import { headers }            from 'next/headers'

export async function GET(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return apiError('Too many requests', 429)
  const { searchParams } = new URL(request.url)
  const { page, limit } = PaginationSchema.parse({ page: searchParams.get('page'), limit: searchParams.get('limit') })
  const q = searchParams.get('q') ?? ''
  const from = (page - 1) * limit
  const supabase = await createClient()
  let query = supabase.from('schools').select('*, locations(name, district_name, block_name)', { count: 'exact' }).order('school_name').range(from, from + limit - 1)
  if (q) query = query.or(`school_name.ilike.%${q}%,school_code.ilike.%${q}%,block_name.ilike.%${q}%`)
  const { data, error, count } = await query
  if (error) return apiError(error.message, 500)
  return apiSuccess({ data, count, page, limit })
}

export async function DELETE(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return apiError('Too many requests', 429)
  const { id } = await request.json()
  if (!id) return apiError('id required')
  const supabase = await createClient()
  const { error } = await supabase.from('schools').delete().eq('id', id)
  if (error) return apiError(error.message, 500)
  return apiSuccess({ success: true })
}
