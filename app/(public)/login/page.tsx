'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (authErr) { setError(authErr.message); setLoading(false); return }

    // Fetch role to redirect appropriately
    const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role === 'ADMIN') router.push('/dashboard')
    else router.push('/vaccination')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <Link href="/" className="flex items-center gap-3 w-fit max-w-7xl mx-auto">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-black text-lg">U</span>
          </div>
          <div>
            <div className="text-gray-900 font-black text-lg leading-none">UDAAN</div>
            <div className="text-orange-500 font-bold text-xs">For Every Child</div>
          </div>
        </Link>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            {/* Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900">Welcome Back</h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">Sign in to UDAAN Dashboard</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-red-700 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Signing in...</>
                ) : 'Sign In →'}
              </button>
            </form>

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-800 mb-2">Login Credentials:</p>
              <div className="text-xs text-blue-700 space-y-1 font-medium">
                <div><strong>Admin:</strong> admin@gmail.com / admin123</div>
                <div><strong>School User:</strong> Your registered email &amp; number</div>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6 font-medium">
            © {new Date().getFullYear()} UDAAN Platform · Secure Government Login
          </p>
        </div>
      </div>
    </div>
  )
}
