'use client'
import { ModulePage } from '@/components/modules/module-page'

interface Facility {
  id: string; facility_id?: string; name: string
  facility_type?: string; health_block?: string; district?: string
  is_hpv_site: boolean; ownership?: string
}

const COLUMNS = [
  { key: 'facility_id',   label: 'Facility ID' },
  { key: 'name',          label: 'Facility Name' },
  { key: 'facility_type', label: 'Type' },
  { key: 'health_block',  label: 'Health Block' },
  { key: 'district',      label: 'District' },
  { key: 'is_hpv_site',   label: 'HPV Site' },
  { key: 'ownership',     label: 'Ownership' },
]

export default function HealthFacilitiesPage() {
  return <ModulePage<Facility>
    title="Health Facilities" icon="🏥" apiPath="health-facilities" csvPath="health-facilities"
    columns={COLUMNS} searchPlaceholder="Search by name, block, district..."
  />
}
