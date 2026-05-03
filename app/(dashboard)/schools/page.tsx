'use client'
import { ModulePage } from '@/components/modules/module-page'

interface School {
  id: string; school_code: string; school_name: string
  block_name?: string; school_management?: string; school_type?: string
  students_total: number; teachers_total: number; classrooms: number
}

const COLUMNS = [
  { key: 'school_code',       label: 'School Code' },
  { key: 'school_name',       label: 'School Name' },
  { key: 'block_name',        label: 'Block' },
  { key: 'school_management', label: 'Management' },
  { key: 'school_type',       label: 'Type' },
  { key: 'students_total',    label: 'Students' },
  { key: 'teachers_total',    label: 'Teachers' },
  { key: 'classrooms',        label: 'Classrooms' },
]

export default function SchoolsPage() {
  return <ModulePage<School>
    title="Schools" icon="🏫" apiPath="schools" csvPath="schools"
    columns={COLUMNS} searchPlaceholder="Search by school name, code, block..."
  />
}
