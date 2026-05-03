'use client'
import { useState, useEffect, useCallback } from 'react'

interface Student {
  id: string; aadhar_no: string; name: string; age: number; gender: string
  hpv_status: string; hpv_vaccination_date?: string; hpv_vaccination_venue?: string
  schools?: { school_name: string }
}

function VaccinationModal({
  student, onClose, onSuccess,
}: { student: Student; onClose: () => void; onSuccess: () => void }) {
  const [date, setDate]   = useState(new Date().toISOString().split('T')[0])
  const [time, setTime]   = useState('10:00')
  const [venue, setVenue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/v1/vaccination', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: student.id, vaccination_date: date, vaccination_time: time, vaccination_venue: venue }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Failed'); setLoading(false); return }
    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" id="vaccination-modal">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">💉</div>
          <h2 className="text-xl font-black text-gray-900">Mark as Vaccinated</h2>
          <p className="text-gray-500 text-sm mt-1">{student.name} · Age {student.age} · {student.aadhar_no}</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">⚠️ {error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="vax-date">Vaccination Date</label>
            <input id="vax-date" type="date" required value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="vax-time">Vaccination Time</label>
            <input id="vax-time" type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="vax-venue">Vaccination Venue *</label>
            <input id="vax-venue" type="text" required value={venue} onChange={e => setVenue(e.target.value)}
              placeholder="e.g. Primary Health Centre, Block XYZ"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">Cancel</button>
            <button id="vax-submit-btn" type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</> : '✅ Confirm Vaccination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Certificate({ student, onClose }: { student: Student; onClose: () => void }) {
  function handlePrint() { window.print() }
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" id="certificate-modal">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
        {/* Print controls */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">HPV Vaccination Certificate</h3>
          <div className="flex gap-3">
            <button id="print-certificate-btn" onClick={handlePrint}
              className="bg-blue-700 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-800 font-semibold">🖨️ Print / Download PDF</button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
        </div>
        {/* Certificate Content */}
        <div id="certificate-content" className="p-10">
          <div className="border-4 border-blue-900 rounded-2xl p-8 text-center">
            {/* Header */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-5xl">🇮🇳</div>
              <div>
                <div className="text-blue-900 font-black text-xl">Government of India</div>
                <div className="text-gray-600 text-sm">Ministry of Health & Family Welfare</div>
                <div className="text-orange-600 font-bold text-lg mt-1">UDAAN Platform</div>
              </div>
              <div className="text-5xl">💉</div>
            </div>

            <div className="bg-blue-900 text-white py-3 px-6 rounded-xl mb-8">
              <div className="text-xl font-black tracking-widest">HPV VACCINATION CERTIFICATE</div>
            </div>

            <p className="text-gray-600 mb-6 text-sm">This is to certify that the following student has received the HPV (Human Papillomavirus) vaccine as part of the national immunisation programme.</p>

            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left space-y-3">
              {[
                ['Student Name', student.name],
                ['Aadhar Number', student.aadhar_no],
                ['Age', `${student.age} years`],
                ['Gender', student.gender],
                ['School', (student.schools as {school_name: string} | undefined)?.school_name ?? '—'],
                ['Vaccination Date', student.hpv_vaccination_date ?? '—'],
                ['Vaccination Venue', student.hpv_vaccination_venue ?? '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <div className="w-44 text-gray-500 text-sm font-medium shrink-0">{label}:</div>
                  <div className="text-gray-900 font-semibold text-sm">{value}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-end mt-8">
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="border-t border-gray-400 pt-2 text-xs text-gray-500 w-40">Authorised Signatory</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Certificate ID</div>
                <div className="font-mono text-xs bg-gray-100 px-3 py-1 rounded">{student.id.slice(0, 8).toUpperCase()}</div>
                <div className="text-xs text-gray-400 mt-1">UDAAN · {new Date().getFullYear()}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏛️</div>
                <div className="border-t border-gray-400 pt-2 text-xs text-gray-500 w-40">Medical Officer</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VaccinationPage() {
  const [tab, setTab]       = useState<'pending' | 'vaccinated'>('pending')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState<Student | null>(null)
  const [certStudent, setCertStudent] = useState<Student | null>(null)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/vaccination?tab=${tab}`)
      setStudents(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [tab])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><span>💉</span> Vaccination Module</h1>
        <p className="text-gray-500 text-sm mt-1">HPV vaccination tracking for girls aged 14–15</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-sm border border-gray-100 w-fit">
        {[
          { key: 'pending',    label: '⏳ Not Vaccinated' },
          { key: 'vaccinated', label: '✅ Vaccinated' },
        ].map(t => (
          <button key={t.key} id={`tab-${t.key}`}
            onClick={() => { setTab(t.key as 'pending' | 'vaccinated') }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key ? 'bg-blue-700 text-white shadow' : 'text-gray-500 hover:bg-gray-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Student List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading
          ? <div className="p-8 text-center text-gray-400">Loading students...</div>
          : students.length === 0
            ? <div className="p-12 text-center">
                <div className="text-4xl mb-3">{tab === 'pending' ? '🎉' : '📋'}</div>
                <div className="text-gray-500">{tab === 'pending' ? 'All eligible girls are vaccinated!' : 'No vaccination records yet.'}</div>
              </div>
            : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Name','Aadhar No','Age','School',tab === 'vaccinated' ? 'Date' : 'Status','Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map(s => (
                    <tr key={s.id} className="table-row-hover">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.aadhar_no}</td>
                      <td className="px-4 py-3 text-gray-700">{s.age}</td>
                      <td className="px-4 py-3 text-gray-500 truncate max-w-[180px]">{(s.schools as {school_name: string} | undefined)?.school_name ?? '—'}</td>
                      <td className="px-4 py-3">
                        {tab === 'vaccinated'
                          ? <span className="text-gray-600 text-xs">{s.hpv_vaccination_date ?? '—'}</span>
                          : <span className="badge-orange px-2 py-0.5 rounded-full text-xs">{s.hpv_status}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {tab === 'pending'
                          ? <button id={`mark-vax-${s.id}`} onClick={() => setModal(s)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                              💉 Mark Vaccinated
                            </button>
                          : <button id={`download-cert-${s.id}`} onClick={() => setCertStudent(s)}
                              className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                              📄 Certificate
                            </button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
      </div>

      {modal && (
        <VaccinationModal student={modal} onClose={() => setModal(null)} onSuccess={() => { setModal(null); fetchStudents() }} />
      )}
      {certStudent && (
        <Certificate student={certStudent} onClose={() => setCertStudent(null)} />
      )}
    </div>
  )
}
