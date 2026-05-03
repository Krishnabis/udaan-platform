'use client'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { SmartLocationSearch } from '@/components/location/smart-search'
import { formatNumber } from '@/lib/utils'

const PILLARS = [
  { icon: '🧒', title: 'Universal Child Identification', desc: 'Identify and register every child so that no child is left behind.' },
  { icon: '🏥', title: 'Delivery of Quality Services', desc: 'Ensure timely delivery of health, nutrition and education services.' },
  { icon: '📣', title: 'Awareness & Community Engagement', desc: 'Create awareness and encourage community participation for positive behaviour change.' },
  { icon: '✅', title: 'Access and Accountability', desc: 'Ensure easy access to services and strengthen accountability through real-time monitoring.' },
  { icon: '🌟', title: 'Nurturing Full Potential', desc: 'Support every child to reach their full potential and build a better future.' },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/dashboard/analytics')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Government Header ── */}
      <div className="bg-white border-b border-gray-200 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-600">
          <span>Government of India — Ministry of Health &amp; Family Welfare</span>
          <span>Technology Support: ImpactCode Social Development Organisation</span>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-sm' : ''} bg-white border-b border-gray-200`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* UDAAN Logo */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center">
                <span className="text-2xl font-black text-blue-600">U</span>
              </div>
              <div>
                <div className="text-gray-900 font-black text-xl leading-none tracking-wide">UDAAN</div>
                <div className="text-orange-500 text-xs font-bold">For Every Child</div>
                <div className="text-blue-600 text-[10px] font-medium">Better Health, Better Life</div>
              </div>
            </div>
            {/* Gov logos */}
            <div className="hidden md:flex items-center gap-4 border-l border-gray-200 ml-4 pl-4">
              {['🏛️ Ministry of Health', '📚 Ministry of Education', '👩 Ministry of Women & Child'].map(m => (
                <div key={m} className="text-gray-500 text-[10px] text-center leading-tight max-w-[80px]">{m}</div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
              <span className="text-gray-600 text-xs">🏆 POSHAN Abhiyaan</span>
            </div>
            <Link href="/login" id="header-login-btn"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg transition-all duration-200 text-sm shadow-sm hover:shadow-orange-500/30">
              Login →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="bg-white text-gray-900 pb-16 pt-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-green-700 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                Live Platform · Real-time Data
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4">
                <span className="text-gray-900">UDAAN</span>
              </h1>
              <p className="text-2xl font-bold text-orange-500 mb-2">For Every Child</p>
              <p className="text-xl text-blue-600 mb-6 font-medium">Better Health, Better Life</p>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                A unified digital platform to ensure every child has access to quality health, education and nutrition services.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                {['🧒 Identify Every Child','🏥 Serve Every Child','💪 Empower Every Child','🔄 Transform Every Life'].map(t => (
                  <span key={t} className="bg-blue-50 border border-blue-100 rounded-full px-4 py-2 text-sm text-blue-700 font-medium">{t}</span>
                ))}
              </div>
              {/* Smart Search */}
              <div className="max-w-lg">
                <p className="text-gray-500 text-sm mb-2 font-medium">Search your location to explore local data:</p>
                <SmartLocationSearch
                  onSelect={(loc) => { window.location.href = `/login?location=${loc.locality_code}` }}
                  placeholder="Type your district, block or village name..."
                  dark={false}
                />
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                  <div className="text-center">
                    <div className="text-8xl mb-4">💉</div>
                    <div className="text-gray-900 font-bold text-xl">HPV Vaccine</div>
                    <div className="text-orange-500 font-medium text-sm mt-1">Protecting her today for a healthier tomorrow</div>
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
                      <div className="text-green-600 text-3xl font-black">{loading ? '...' : `${data?.hpv_coverage?.percent ?? 0}%`}</div>
                      <div className="text-gray-600 text-sm font-medium">Coverage Achieved</div>
                      <div className="text-gray-400 text-xs mt-1">Target: 100%</div>
                    </div>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-orange-500 text-white text-xs rounded-xl px-3 py-2 font-bold shadow-lg">
                  {loading ? '...' : formatNumber(data?.hpv_sites ?? 0)} Sites
                </div>
                <div className="absolute -bottom-4 -left-4 bg-green-600 text-white text-xs rounded-xl px-3 py-2 font-bold shadow-lg">
                  {loading ? '...' : formatNumber(data?.hpv_coverage?.vaccinated ?? 0)} Vaccinated
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm card-hover text-center">
              <div className="text-3xl mb-2">👧</div>
              <div className="text-2xl font-black text-gray-900">{loading ? '...' : formatNumber(data?.students?.total ?? 0)}</div>
              <div className="text-gray-500 text-sm mt-1 font-medium">Children Registered</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm card-hover text-center">
              <div className="text-3xl mb-2">💉</div>
              <div className="text-2xl font-black text-gray-900">{loading ? '...' : formatNumber(data?.hpv_sites ?? 0)}</div>
              <div className="text-gray-500 text-sm mt-1 font-medium">HPV Vaccination Sites</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm card-hover text-center">
              <div className="text-3xl mb-2">🏫</div>
              <div className="text-2xl font-black text-gray-900">{loading ? '...' : formatNumber(data?.schools?.total ?? 0)}</div>
              <div className="text-gray-500 text-sm mt-1 font-medium">Schools Registered</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm card-hover text-center">
              <div className="text-3xl mb-2">🌍</div>
              <div className="text-2xl font-black text-gray-900">{loading ? '...' : formatNumber(data?.geography?.districts ?? 0)}</div>
              <div className="text-gray-500 text-sm mt-1 font-medium">Districts Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HPV Analytics ── */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-3xl">💉</span> HPV Vaccination Analytics
          </h2>
          <p className="text-gray-500 mb-8 font-medium">Real-time vaccination data across all locations</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6 shadow-sm border border-blue-100 card-hover">
              <div className="text-4xl mb-3">🏥</div>
              <div className="text-3xl font-black text-blue-900">{loading ? '...' : formatNumber(data?.hpv_sites ?? 0)}</div>
              <div className="text-gray-600 mt-1 font-medium">HPV Vaccination Sites</div>
              <div className="text-blue-600 text-sm mt-2 font-semibold">Total Registered Sites</div>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 shadow-sm border border-green-100 card-hover">
              <div className="text-4xl mb-3">📊</div>
              <div className="text-3xl font-black text-green-700">{loading ? '...' : `${data?.hpv_coverage?.percent ?? 0}%`}</div>
              <div className="text-gray-600 mt-1 font-medium">HPV Vaccination Coverage</div>
              <div className="w-full bg-white rounded-full h-2 mt-3 border border-gray-200">
                <div className="bg-green-500 h-2 rounded-full transition-all duration-700" style={{ width: `${data?.hpv_coverage?.percent ?? 0}%` }} />
              </div>
              <div className="text-xs text-gray-500 mt-2 font-medium">Coverage Achieved · Target: 100%</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-6 shadow-sm border border-orange-100 card-hover">
              <div className="text-4xl mb-3">👧</div>
              <div className="text-3xl font-black text-orange-700">{loading ? '...' : formatNumber(data?.total_due ?? 0)}</div>
              <div className="text-gray-600 mt-1 font-medium">Total 14–15 Year Girls</div>
              <div className="text-orange-600 text-sm mt-2 font-semibold">Due for Vaccination</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── UDAAN Framework ── */}
      <section className="py-14 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-2xl font-black text-gray-800 mb-2">
            ── UDAAN FRAMEWORK – 5 PILLARS ──
          </h2>
          <p className="text-center text-gray-500 mb-10 font-medium">The foundation of our mission for every child</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {PILLARS.map((p, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 text-center card-hover shadow-sm">
                <div className="text-4xl mb-3">{p.icon}</div>
                <div className="font-bold text-gray-900 text-sm mb-2">{p.title}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Ready to Access the Dashboard?</h2>
          <p className="text-gray-600 mb-8 font-medium">Login to view real-time analytics, manage health facilities, schools, and student vaccination records.</p>
          <Link href="/login" id="cta-login-btn"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-md hover:shadow-blue-500/30">
            Access Dashboard →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-100 text-gray-600 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 font-medium">
          <div className="text-sm">© {new Date().getFullYear()} UDAAN. All rights reserved.</div>
          <div className="text-sm">Technology Support: ImpactCode Social Development Organisation</div>
        </div>
      </footer>
    </div>
  )
}
