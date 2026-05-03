import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const uid = "77e40c0f-0f3c-4de1-969b-bde7ad80b018"
  
  const { data, error } = await supabase.from('user_profiles').upsert({
    id: uid,
    email: 'admin@gmail.com',
    name: 'System Administrator',
    role: 'ADMIN',
    is_active: true
  }, { onConflict: 'id' }).select()

  if (error) {
    return NextResponse.json({ success: false, error })
  }

  return NextResponse.json({ success: true, data })
}
