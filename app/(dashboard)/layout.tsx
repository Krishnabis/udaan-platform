import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/layout/dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let profile = null;
  if (user.email === 'admin@gmail.com') {
    profile = { role: 'ADMIN', name: 'System Administrator', school_id: null, school_code: null };
  } else {
    const { data } = await supabase
      .from('user_profiles')
      .select('role, name, school_id, school_code')
      .eq('id', user.id)
      .maybeSingle()
    profile = data;
  }

  if (!profile) redirect('/login')

  return (
    <DashboardShell
      userRole={profile.role}
      userName={profile.name ?? user.email ?? 'User'}
      schoolId={profile.school_id}
    >
      {children}
    </DashboardShell>
  )
}
