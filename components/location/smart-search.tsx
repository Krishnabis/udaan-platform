'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface LocationResult {
  id: string
  locality_code: string
  name: string
  block_name?: string
  district_name?: string
  state_name?: string
  sub_district_name?: string
}

interface SmartLocationSearchProps {
  onSelect: (location: LocationResult) => void
  placeholder?: string
  dark?: boolean
  value?: LocationResult | null
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export function SmartLocationSearch({ onSelect, placeholder = 'Search location (min 4 characters)...', dark = false, value }: SmartLocationSearchProps) {
  const [query, setQuery]         = useState(value?.name ?? '')
  const [results, setResults]     = useState<LocationResult[]>([])
  const [loading, setLoading]     = useState(false)
  const [open, setOpen]           = useState(false)
  const [selected, setSelected]   = useState<LocationResult | null>(value ?? null)
  const debouncedQuery            = useDebounce(query, 400)
  const containerRef              = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 4) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/locations/search?q=${encodeURIComponent(q)}&limit=12`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
      setOpen(true)
    } catch { setResults([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { search(debouncedQuery) }, [debouncedQuery, search])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(loc: LocationResult) {
    setSelected(loc)
    setQuery(loc.name)
    setOpen(false)
    onSelect(loc)
  }

  function handleClear() {
    setSelected(null)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  function getLocationPath(loc: LocationResult) {
    const parts = [loc.block_name, loc.district_name, loc.state_name].filter(Boolean)
    return parts.join(' › ')
  }

  return (
    <div ref={containerRef} className="relative w-full" id="location-search-container">
      <div className={cn(
        'flex items-center rounded-xl border transition-all duration-200',
        dark
          ? 'bg-white/10 border-white/20 focus-within:bg-white/15 focus-within:border-white/40'
          : 'bg-white border-gray-200 focus-within:border-blue-500 shadow-sm focus-within:shadow-md'
      )}>
        <span className="px-3 text-gray-400">🔍</span>
        <input
          id="location-search-input"
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(null) }}
          placeholder={placeholder}
          className={cn(
            'flex-1 py-3 pr-2 bg-transparent outline-none text-sm',
            dark ? 'text-white placeholder-white/50' : 'text-gray-900 placeholder-gray-400'
          )}
          autoComplete="off"
        />
        {loading && (
          <div className="px-3">
            <div className={cn('w-4 h-4 border-2 border-t-transparent rounded-full animate-spin',
              dark ? 'border-white/40' : 'border-blue-500/40')} />
          </div>
        )}
        {selected && !loading && (
          <button onClick={handleClear} id="location-search-clear"
            className={cn('px-3 text-lg', dark ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-gray-600')}>×</button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="py-1 max-h-80 overflow-y-auto">
            {results.map((loc) => (
              <button
                key={loc.id}
                id={`location-result-${loc.id}`}
                onClick={() => handleSelect(loc)}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">📍</span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{loc.name}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{getLocationPath(loc)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {open && !loading && query.length >= 4 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-50 px-4 py-6 text-center">
          <div className="text-2xl mb-2">🔍</div>
          <div className="text-gray-500 text-sm">No locations found for &ldquo;{query}&rdquo;</div>
        </div>
      )}
    </div>
  )
}
