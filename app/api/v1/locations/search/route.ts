import { createClient }  from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { LocationSearchSchema } from '@/lib/validation/schemas'
import { apiError, apiSuccess, rateLimit } from '@/lib/utils'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip, 120)) return apiError('Too many requests', 429)

  const { searchParams } = new URL(request.url)
  const parsed = LocationSearchSchema.safeParse({
    q: searchParams.get('q') ?? '',
    limit: searchParams.get('limit') ?? '10',
  })
  if (!parsed.success) return apiError(parsed.error.issues[0].message)

  const { q, limit } = parsed.data
  const supabase = await createClient()

  // Fuzzy + full-text search across all hierarchy levels
  const { data, error } = await supabase.rpc('search_locations', {
    p_query: q,
    p_limit: limit,
  })

  if (error) {
    // Fallback: ilike search if RPC not yet deployed
    const { data: fallback, error: fe } = await supabase
      .from('locations')
      .select('id, locality_code, name, local_body_name, sub_district_name, block_name, district_name, state_name')
      .or(`name.ilike.%${q}%,block_name.ilike.%${q}%,district_name.ilike.%${q}%,sub_district_name.ilike.%${q}%`)
      .limit(limit)
    if (fe) return apiError('Search failed', 500)
    return apiSuccess(fallback)
  }

  return apiSuccess(data)
}
