'use client'
import { ModulePage } from '@/components/modules/module-page'

interface Student {
  id: string; aadhar_no: string; name: string
  gender?: string; age?: number; hpv_status?: string
  school_code?: string; is_school_going: boolean
}

const COLUMNS = [
  { key: 'aadhar_no',     label: 'Aadhar No' },
  { key: 'name',          label: 'Name' },
  { key: 'school_code',   label: 'School Code' },
  { key: 'gender',        label: 'Gender' },
  { key: 'age',           label: 'Age' },
  {
    key: 'hpv_status', label: 'HPV Status',
    render: (row: Student) => {
      const map: Record<string, string> = {
        VACCINATED: 'badge-green', PENDING: 'badge-orange', DUE: 'badge-red', NOT_ELIGIBLE: 'badge-gray'
      }
      return <span className={`${map[row.hpv_status ?? ''] ?? 'badge-gray'} px-2 py-0.5 rounded-full text-xs font-medium`}>{row.hpv_status ?? '—'}</span>
    }
  },
  { key: 'is_school_going', label: 'School Going' },
]

export default function StudentsPage() {
  return <ModulePage<Student>
    title="Students" icon="🎓" apiPath="students" csvPath="students"
    columns={COLUMNS} searchPlaceholder="Search by name or aadhar..."
  />
}
