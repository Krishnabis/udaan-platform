'use client'
import { ModulePage } from '@/components/modules/module-page'

interface Location {
  id: string; locality_code: string; name: string
  block_name?: string; district_name?: string; state_name?: string; is_temp: boolean
}

const COLUMNS = [
  { key: 'locality_code', label: 'Locality Code' },
  { key: 'name',          label: 'Village / Mohalla' },
  { key: 'block_name',    label: 'Block' },
  { key: 'district_name', label: 'District' },
  { key: 'state_name',    label: 'State' },
  { key: 'is_temp',       label: 'Temp' },
]

export default function LocationsPage() {
  return <ModulePage<Location>
    title="Locations" icon="📍" apiPath="locations" csvPath="locations"
    columns={COLUMNS} searchPlaceholder="Search by village, block, district..."
  />
}
