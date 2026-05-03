'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { formatNumber } from '@/lib/utils'

interface Column<T> { key: keyof T | string; label: string; render?: (row: T) => React.ReactNode }

interface ModulePageProps<T extends { id: string }> {
  title:      string
  icon:       string
  apiPath:    string
  csvPath:    string
  columns:    Column<T>[]
  searchPlaceholder?: string
  adminOnly?: boolean
  onEdit?: (row: T) => void
}

export function ModulePage<T extends { id: string }>({
  title, icon, apiPath, csvPath, columns, searchPlaceholder, adminOnly, onEdit
}: ModulePageProps<T>) {
  const [data, setData]       = useState<T[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [csvStatus, setCsvStatus] = useState<{ type: 'success'|'error'|'idle'; msg: string }>({ type: 'idle', msg: '' })
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const LIMIT = 25

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (search) params.set('q', search)
      const res = await fetch(`/api/v1/${apiPath}?${params}`)
      const json = await res.json()
      setData(json.data ?? [])
      setTotal(json.count ?? 0)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [apiPath, page, search])

  useEffect(() => { fetchData() }, [fetchData])

  // Debounce search
  useEffect(() => { const t = setTimeout(fetchData, 400); return () => clearTimeout(t) }, [search]) // eslint-disable-line

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this record?')) return
    setDeleting(id)
    await fetch(`/api/v1/${apiPath}`, { method: 'DELETE', body: JSON.stringify({ id }), headers: { 'Content-Type': 'application/json' } })
    fetchData()
    setDeleting(null)
  }

  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setCsvStatus({ type: 'idle', msg: '' })
    const form = new FormData()
    form.append('file', file)
    try {
      const res  = await fetch(`/api/v1/csv/${csvPath}`, { method: 'POST', body: form })
      const json = await res.json()
      if (res.ok) {
        setCsvStatus({ type: 'success', msg: `✅ Imported ${json.inserted} records. ${json.errors?.length ? `${json.errors.length} errors.` : ''} ${json.unmapped ? `${json.unmapped} unmapped locations.` : ''}` })
        fetchData()
      } else {
        setCsvStatus({ type: 'error', msg: `❌ ${json.error ?? 'Import failed'}` })
      }
    } catch (err) {
      setCsvStatus({ type: 'error', msg: '❌ Upload failed. Check console.' })
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const totalPages = Math.ceil(total / LIMIT)

  function getCellValue(row: T, col: Column<T>): React.ReactNode {
    if (col.render) return col.render(row)
    const val = (row as Record<string, unknown>)[col.key as string]
    if (val === null || val === undefined) return <span className="text-gray-300">—</span>
    if (typeof val === 'boolean') return val ? <span className="badge-green px-2 py-0.5 rounded-full text-xs">Yes</span> : <span className="badge-gray px-2 py-0.5 rounded-full text-xs">No</span>
    return String(val)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><span>{icon}</span>{title}</h1>
          <p className="text-gray-500 text-sm mt-1">{formatNumber(total)} records total</p>
        </div>
        {/* CSV Upload */}
        <div className="flex items-center gap-3">
          <label id={`${csvPath}-csv-upload-label`}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all
              ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-blue-700 hover:bg-blue-800 text-white shadow-md hover:shadow-blue-300/30'}`}>
            {uploading ? '⏳ Uploading...' : '⬆️ Upload CSV'}
            <input ref={fileRef} id={`${csvPath}-csv-input`} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* CSV Status */}
      {csvStatus.type !== 'idle' && (
        <div className={`rounded-xl p-4 text-sm ${csvStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {csvStatus.msg}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-blue-500 transition-colors">
          <span className="text-gray-400">🔍</span>
          <input
            id={`${csvPath}-search-input`}
            type="search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder={searchPlaceholder ?? `Search ${title}...`}
            className="flex-1 outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {columns.map(col => (
                  <th key={col.key as string} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      {[...columns, { key: 'act' }].map((c, j) => (
                        <td key={j} className="px-4 py-3"><div className="shimmer h-4 rounded w-3/4"/></td>
                      ))}
                    </tr>
                  ))
                : data.length === 0
                  ? <tr><td colSpan={columns.length + 1} className="px-4 py-12 text-center text-gray-400">No records found</td></tr>
                  : data.map(row => (
                      <tr key={row.id} className="table-row-hover transition-colors">
                        {columns.map(col => (
                          <td key={col.key as string} className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-xs truncate">
                            {getCellValue(row, col)}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right space-x-3">
                          {onEdit && (
                            <button
                              id={`edit-${row.id}`}
                              onClick={() => onEdit(row)}
                              className="text-blue-500 hover:text-blue-700 text-xs font-medium transition-colors">
                              ✏️ Edit
                            </button>
                          )}
                          <button
                            id={`delete-${row.id}`}
                            onClick={() => handleDelete(row.id)}
                            disabled={deleting === row.id}
                            className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors disabled:opacity-50">
                            {deleting === row.id ? '...' : '🗑️ Delete'}
                          </button>
                        </td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages} · {formatNumber(total)} records
            </span>
            <div className="flex gap-2">
              <button id="prev-page-btn" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition">← Prev</button>
              <button id="next-page-btn" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
