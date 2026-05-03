'use client'
import { ModulePage } from '@/components/modules/module-page'

interface Location {
  id: string;
  locality_code: string; name: string;
  local_body_code?: string; local_body_name?: string; local_body_type?: string;
  sub_district_code?: string; sub_district_name?: string;
  block_code?: string; block_name?: string;
  district_code?: string; district_name?: string;
  region_code?: string; region_name?: string;
  state_code?: string; state_name?: string;
  national_code?: string; nation_name?: string;
  lat?: number; lng?: number; alt?: number;
  is_temp: boolean;
}

const COLUMNS = [
  { key: 'locality_code',     label: 'Locality Code' },
  { key: 'name',              label: 'Village / Mohalla' },
  { key: 'local_body_code',   label: 'Local Body Code' },
  { key: 'local_body_name',   label: 'Local Body Name' },
  { key: 'local_body_type',   label: 'Local Body Type' },
  { key: 'sub_district_code', label: 'Sub Dist. Code' },
  { key: 'sub_district_name', label: 'Sub Dist. Name' },
  { key: 'block_code',        label: 'Block Code' },
  { key: 'block_name',        label: 'Block Name' },
  { key: 'district_code',     label: 'District Code' },
  { key: 'district_name',     label: 'District Name' },
  { key: 'region_code',       label: 'Region Code' },
  { key: 'region_name',       label: 'Region Name' },
  { key: 'state_code',        label: 'State Code' },
  { key: 'state_name',        label: 'State Name' },
  { key: 'national_code',     label: 'Nation Code' },
  { key: 'nation_name',       label: 'Nation Name' },
  { key: 'lat',               label: 'Lat' },
  { key: 'lng',               label: 'Lng' },
  { key: 'alt',               label: 'Alt' },
  { key: 'is_temp',           label: 'Temp' },
]

export default function LocationsPage() {
  return <ModulePage<Location>
    title="Locations" icon="📍" apiPath="locations" csvPath="locations"
    columns={COLUMNS} searchPlaceholder="Search by village, block, district..."
    onEdit={(row) => alert(`Edit feature coming soon for ${row.name}!`)}
  />
}
