import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess, rateLimit } from '@/lib/utils'
import { PaginationSchema } from '@/lib/validation/schemas'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return apiError('Too many requests', 429)

  const { searchParams } = new URL(request.url)
  const { page, limit } = PaginationSchema.parse({
    page: searchParams.get('page'), limit: searchParams.get('limit'),
  })
  const from = (page - 1) * limit

  const supabase = await createClient()
  const { data, error, count } = await supabase
    .from('locations')
    .select('*', { count: 'exact' })
    .order('name')
    .range(from, from + limit - 1)

  if (error) return apiError(error.message, 500)
  return apiSuccess({ data, count, page, limit })
}

export async function DELETE(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return apiError('Too many requests', 429)

  const { id } = await request.json()
  if (!id) return apiError('id required')

  const supabase = await createClient()
  const { error } = await supabase.from('locations').delete().eq('id', id)
  if (error) return apiError(error.message, 500)
  return apiSuccess({ success: true })
}
