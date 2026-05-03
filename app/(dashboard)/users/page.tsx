'use client'
import { ModulePage } from '@/components/modules/module-page'

interface UserProfile {
  id: string; email: string; name?: string; employee_id?: string; role: string; school_code?: string; is_active: boolean
}

const COLUMNS = [
  { key: 'employee_id', label: 'Employee ID' },
  { key: 'name',        label: 'Name' },
  { key: 'email',       label: 'Email' },
  { key: 'school_code', label: 'School Code' },
  {
    key: 'role', label: 'Role',
    render: (row: UserProfile) => (
      <span className={`${row.role === 'ADMIN' ? 'badge-orange' : 'badge-blue'} px-2 py-0.5 rounded-full text-xs font-medium`}>
        {row.role}
      </span>
    )
  },
  { key: 'is_active', label: 'Active' },
]

export default function UsersPage() {
  return <ModulePage<UserProfile>
    title="Users" icon="👥" apiPath="users" csvPath="users"
    columns={COLUMNS} searchPlaceholder="Search by name or email..."
    adminOnly
  />
}
