import { createClient } from '@supabase/supabase-js'

const url = 'https://lgxjhcimmwerqzgptbwi.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneGpoY2ltbXdlcnF6Z3B0YndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NzcwODEsImV4cCI6MjA5MzM1MzA4MX0.yz0nxo7YlnH5PllVaGaTVf3CrZbJ-nJGKKBtwqirBB8'

const supabase = createClient(url, anonKey)

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@gmail.com',
    password: 'admin123'
  })
  if (error) {
    console.error('Login error:', error.message)
    return
  }
  console.log('Logged in as:', data.user.id)

  const { data: profile, error: profileErr } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', data.user.id)

  if (profileErr) {
    console.error('Profile fetch error:', profileErr.message)
  } else {
    console.log('Profiles returned:', profile)
  }
}

test()
