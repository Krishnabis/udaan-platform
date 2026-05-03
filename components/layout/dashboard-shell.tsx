'use client'
import { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { LocationProvider } from '@/components/location/location-context'

interface DashboardShellProps {
  children:  ReactNode
  userRole:  string
  userName:  string
  schoolId?: string | null
}

export function DashboardShell({ children, userRole, userName }: DashboardShellProps) {
  return (
    <LocationProvider>
      <div className="flex min-h-screen">
        <Sidebar userRole={userRole} userName={userName} />
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </LocationProvider>
  )
}
