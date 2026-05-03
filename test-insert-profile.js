import { createClient } from '@supabase/supabase-js'

const url = 'https://lgxjhcimmwerqzgptbwi.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneGpoY2ltbXdlcnF6Z3B0YndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NzcwODEsImV4cCI6MjA5MzM1MzA4MX0.yz0nxo7YlnH5PllVaGaTVf3CrZbJ-nJGKKBtwqirBB8'

const supabase = createClient(url, anonKey)

async function fixProfile() {
  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email: 'admin@gmail.com',
    password: 'admin123'
  })
  if (error) {
    console.error('Login error:', error.message)
    return
  }
  
  const uid = session.user.id
  console.log('Logged in as:', uid)

  const { data: profile, error: profileErr } = await supabase
    .from('user_profiles')
    .upsert({
      id: uid,
      email: 'admin@gmail.com',
      name: 'System Administrator',
      role: 'ADMIN',
      is_active: true
    })
    .select()

  if (profileErr) {
    console.error('Insert error:', profileErr.message)
  } else {
    console.log('Profile created successfully:', profile)
  }
}

fixProfile()
