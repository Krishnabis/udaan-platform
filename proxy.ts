import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/api/v1/setup']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith('/api/v1/setup'))) {
    return NextResponse.next()
  }

  // In-memory rate limit (per IP, 120 req/min)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const rateLimitKey = `rl:${ip}`
  // Note: for production use Upstash Redis via @upstash/ratelimit
  // Here we rely on the lib/utils rateLimit for API routes individually

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()             { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users trying to access protected pages
  if (!user && pathname.startsWith('/dashboard') ||
      !user && pathname.startsWith('/locations')  ||
      !user && pathname.startsWith('/schools')    ||
      !user && pathname.startsWith('/health-facilities') ||
      !user && pathname.startsWith('/students')   ||
      !user && pathname.startsWith('/users')      ||
      !user && pathname.startsWith('/vaccination')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect unauthenticated API calls
  if (!user && pathname.startsWith('/api/v1/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
