import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'ADMIN' | 'SCHOOL_USER'

export interface UserProfile {
  id: string
  email: string
  name: string | null
  role: UserRole
  school_id: string | null
  school_code: string | null
  location_id: string | null
  is_active: boolean
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data as UserProfile | null
}

export async function requireAuth() {
  const user = await getSession()
  if (!user) redirect('/login')
  return user
}

export async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || profile.role !== 'ADMIN') redirect('/dashboard')
  return profile
}

export function isAdmin(profile: UserProfile | null) {
  return profile?.role === 'ADMIN'
}

export function canAccessSchool(profile: UserProfile | null, schoolId: string) {
  if (!profile) return false
  if (profile.role === 'ADMIN') return true
  return profile.school_id === schoolId
}
