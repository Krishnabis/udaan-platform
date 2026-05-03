import { createClient } from '@supabase/supabase-js'
import { apiError, apiSuccess } from '@/lib/utils'

export async function POST(request: Request) {
  const secret = process.env.SETUP_SECRET
  if (!secret) return apiError('Setup already complete or SETUP_SECRET not configured', 403)

  const { setup_secret, name } = await request.json()
  if (setup_secret !== secret) return apiError('Invalid setup secret', 403)

  const ADMIN_EMAIL    = 'admin@gmail.com'
  const ADMIN_PASSWORD = 'admin123'

  // Requires service_role key to bypass signup restrictions
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // First check if user already exists
  let uid: string | undefined
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) return apiError(`Failed to list users: ${listErr.message}`, 500)
  
  const existingUser = listData.users.find(u => u.email === ADMIN_EMAIL)
  
  if (existingUser) {
    uid = existingUser.id
  } else {
    // Create new admin user
    const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: name ?? 'System Administrator' }
    })
    if (createErr) return apiError(`Failed to create user: ${createErr.message}`, 500)
    uid = createData.user.id
  }

  // Upsert profile with ADMIN role
  const { error: profileErr } = await supabase.from('user_profiles').upsert({
    id:        uid,
    email:     ADMIN_EMAIL,
    name:      name ?? 'System Administrator',
    role:      'ADMIN',
    is_active: true,
  }, { onConflict: 'id' })

  if (profileErr) return apiError(`Failed to create admin profile: ${profileErr.message}`, 500)

  return apiSuccess({
    message: 'Admin user created successfully',
    uid,
    next_step: 'Remove SETUP_SECRET from .env.local now.',
  })
}
