import { createClient } from '@supabase/supabase-js'
const url = 'https://lgxjhcimmwerqzgptbwi.supabase.co'
const supabase = createClient(url, 'your_service_role_key_here')

async function test() {
  const { data, error } = await supabase.auth.admin.listUsers()
  console.log('Error:', error)
}

test()
