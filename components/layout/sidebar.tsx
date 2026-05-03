'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface NavItem {
  href:  string
  label: string
  icon:  string
  admin?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',          label: 'Dashboard',         icon: '📊' },
  { href: '/locations',          label: 'Locations',         icon: '📍' },
  { href: '/schools',            label: 'Schools',           icon: '🏫' },
  { href: '/health-facilities',  label: 'Health Facilities', icon: '🏥' },
  { href: '/students',           label: 'Students',          icon: '🎓' },
  { href: '/vaccination',        label: 'Vaccination',       icon: '💉' },
  { href: '/users',              label: 'Users',             icon: '👥', admin: true },
]

interface SidebarProps {
  userRole: string
  userName: string
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const items = NAV_ITEMS.filter(item => !item.admin || userRole === 'ADMIN')

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-black text-lg">U</span>
          </div>
          <div>
            <div className="text-gray-900 font-black text-lg leading-none">UDAAN</div>
            <div className="text-orange-500 font-medium text-xs mt-0.5">For Every Child</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
          <div className="text-gray-900 font-semibold text-sm truncate">{userName}</div>
          <div className={cn('text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-0.5 mt-1.5 inline-block',
            userRole === 'ADMIN' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700')}>
            {userRole === 'ADMIN' ? '🛡️ Administrator' : '🏫 School User'}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} id={`nav-${item.label.toLowerCase().replace(/\s+/g,'-')}`}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150',
                active
                  ? 'bg-blue-50 text-blue-700 sidebar-active'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              )}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
              {active && <span className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"/>}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button id="logout-btn" onClick={handleLogout} disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150 text-sm font-semibold">
          <span className="text-lg">🚪</span>
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}
