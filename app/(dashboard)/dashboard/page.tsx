'use client'
import { useEffect, useState, useCallback } from 'react'
import { SmartLocationSearch } from '@/components/location/smart-search'
import { useLocation } from '@/components/location/location-context'
import { formatNumber, formatPercent } from '@/lib/utils'

interface Analytics {
  hpv_sites: number
  hpv_coverage: { vaccinated: number; total_eligible: number; percent: number }
  total_due: number
  students: {
    total: number; school_going: number; out_of_school: number
    boys_pct: number; girls_pct: number; hpv_vaccinated_girls_1415: number
  }
  schools: { total: number }
  users: { admin: number; school_user: number; total: number }
  geography: { districts: number; blocks: number }
}

function StatCard({ icon, value, label, sub, color = 'blue' }: {
  icon: string; value: string | number; label: string; sub?: string; color?: string
}) {
  const styles: Record<string, string> = {
    blue:   'bg-blue-50 border-blue-100 text-blue-900',
    green:  'bg-green-50 border-green-100 text-green-900',
    orange: 'bg-orange-50 border-orange-100 text-orange-900',
    purple: 'bg-purple-50 border-purple-100 text-purple-900',
    teal:   'bg-teal-50 border-teal-100 text-teal-900',
  }
  const subStyles: Record<string, string> = {
    blue:   'text-blue-500',
    green:  'text-green-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500',
    teal:   'text-teal-500',
  }
  return (
    <div className={`${styles[color] ?? styles.blue} border rounded-2xl p-5 card-hover`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-black">{typeof value === 'number' ? formatNumber(value) : value}</div>
      <div className="text-gray-700 text-sm mt-1 font-medium">{label}</div>
      {sub && <div className={`${subStyles[color] ?? subStyles.blue} text-xs mt-1 font-medium`}>{sub}</div>}
    </div>
  )
}

function Shimmer() {
  return <div className="shimmer rounded-2xl h-32"/>
}

export default function DashboardPage() {
  const { selectedLocation, setSelectedLocation } = useLocation()
  const [data, setData]     = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async (locationCode?: string) => {
    setLoading(true)
    try {
      const url = locationCode
        ? `/api/v1/dashboard/analytics?location_code=${encodeURIComponent(locationCode)}`
        : '/api/v1/dashboard/analytics'
      const res = await fetch(url)
      const json = await res.json()
      setData(json)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAnalytics(selectedLocation?.locality_code) }, [selectedLocation, fetchAnalytics])

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {selectedLocation
              ? `Showing data for: ${selectedLocation.name} (${selectedLocation.district_name ?? ''})`
              : 'Showing national data — select a location to filter'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
          <span className="text-xs text-gray-500">Live Data</span>
        </div>
      </div>

      {/* Smart Location Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>📍</span> Filter by Location
        </h2>
        <SmartLocationSearch
          onSelect={(loc) => setSelectedLocation(loc)}
          value={selectedLocation}
          placeholder="Search by village, block, district... (min 4 chars)"
        />
        {selectedLocation && (
          <button onClick={() => setSelectedLocation(null)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline">
            Clear filter → show all India
          </button>
        )}
      </div>

      {/* HPV Analytics */}
      <section>
        <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
          <span>💉</span> HPV Vaccination Analytics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {loading ? <><Shimmer/><Shimmer/><Shimmer/></> : (
            <>
              <StatCard icon="🏥" value={data?.hpv_sites ?? 0} label="HPV Vaccination Sites" sub="Total Registered Sites" color="blue" />
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-3xl font-black text-green-600">{data?.hpv_coverage.percent ?? 0}%</div>
                <div className="text-gray-700 font-medium text-sm mt-1">HPV Vaccination Coverage</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${data?.hpv_coverage.percent ?? 0}%` }} />
                </div>
                <div className="text-xs text-gray-400 mt-1.5 flex justify-between">
                  <span>{formatNumber(data?.hpv_coverage.vaccinated ?? 0)} vaccinated</span>
                  <span>of {formatNumber(data?.hpv_coverage.total_eligible ?? 0)}</span>
                </div>
              </div>
              <StatCard icon="👧" value={data?.total_due ?? 0} label="Total Due for Vaccination" sub="Girls aged 14–15" color="orange" />
            </>
          )}
        </div>
      </section>

      {/* Quick Insights */}
      <section>
        <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
          <span>📈</span> Quick Insights
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? [1,2,3,4].map(i => <Shimmer key={i}/>) : (
            <>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center card-hover">
                <div className="text-3xl mb-1">👶</div>
                <div className="text-2xl font-black text-gray-900">{formatNumber(data?.students.total ?? 0)}</div>
                <div className="text-gray-500 text-xs mt-1">Total Students</div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
                <div className="text-2xl mb-1">🏫</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">School Going</span>
                    <span className="font-bold text-green-600">{formatNumber(data?.students.school_going ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Out of School</span>
                    <span className="font-bold text-orange-600">{formatNumber(data?.students.out_of_school ?? 0)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
                <div className="text-2xl mb-2">⚧️</div>
                <div className="text-sm font-medium text-gray-700 mb-2">Gender (School Going)</div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-blue-100 rounded-lg p-2 text-center">
                    <div className="font-black text-blue-700">{data?.students.boys_pct ?? 0}%</div>
                    <div className="text-xs text-blue-600">Boys</div>
                  </div>
                  <div className="flex-1 bg-pink-100 rounded-lg p-2 text-center">
                    <div className="font-black text-pink-700">{data?.students.girls_pct ?? 0}%</div>
                    <div className="text-xs text-pink-600">Girls</div>
                  </div>
                </div>
              </div>
              <StatCard icon="💉" value={data?.students.hpv_vaccinated_girls_1415 ?? 0} label="HPV Vaccinated (14–15 Girls)" color="green"/>
            </>
          )}
        </div>
      </section>

      {/* Bottom Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* School Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2"><span>🏫</span> School Analytics</h3>
          {loading ? <Shimmer/> : (
            <div className="text-center">
              <div className="text-4xl font-black text-blue-700">{formatNumber(data?.schools.total ?? 0)}</div>
              <div className="text-gray-500 text-sm mt-1">Total Schools Registered</div>
            </div>
          )}
        </div>

        {/* User Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2"><span>👥</span> User Analytics</h3>
          {loading ? <Shimmer/> : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Administrators</span>
                <span className="font-black text-orange-600">{data?.users.admin ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">School Users</span>
                <span className="font-black text-blue-600">{formatNumber(data?.users.school_user ?? 0)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-gray-700 font-semibold text-sm">Total Users</span>
                <span className="font-black text-gray-900">{formatNumber(data?.users.total ?? 0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Geography */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2"><span>🌍</span> Geography</h3>
          {loading ? <Shimmer/> : (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Districts', value: data?.geography.districts ?? 0, icon: '🏙️' },
                { label: 'Blocks', value: data?.geography.blocks ?? 0, icon: '🏘️' },
              ].map(g => (
                <div key={g.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-2xl">{g.icon}</div>
                  <div className="text-xl font-black text-gray-900">{formatNumber(g.value)}</div>
                  <div className="text-gray-500 text-xs">{g.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
