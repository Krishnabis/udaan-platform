import Papa from 'papaparse'

export interface ParseResult<T> {
  valid:  T[]
  errors: { row: number; error: string; data: Record<string, string> }[]
}

/** Parse a CSV File/Blob and return typed rows */
export async function parseCSV<T>(
  file: File,
  validator: (row: Record<string, string>) => T
): Promise<ParseResult<T>> {
  return new Promise((resolve) => {
    const valid:  T[]     = []
    const errors: ParseResult<T>['errors'] = []

    Papa.parse<Record<string, string>>(file, {
      header:         true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      transform:       (v) => (typeof v === 'string' ? v.trim() : v),
      complete(results) {
        results.data.forEach((row, i) => {
          try {
            valid.push(validator(row))
          } catch (err: unknown) {
            errors.push({
              row:   i + 2,
              error: err instanceof Error ? err.message : String(err),
              data:  row,
            })
          }
        })
        resolve({ valid, errors })
      },
      error(err) {
        resolve({ valid: [], errors: [{ row: 0, error: err.message, data: {} }] })
      },
    })
  })
}

/** Convert yes/no/true/false/1/0 → boolean */
export function toBool(v: string | undefined): boolean {
  if (!v) return false
  return ['yes', 'true', '1', 'y'].includes(v.toLowerCase().trim())
}

/** Safe integer parse */
export function toInt(v: string | undefined, fallback = 0): number {
  const n = parseInt(v ?? '', 10)
  return isNaN(n) ? fallback : n
}

/** Safe float parse */
export function toFloat(v: string | undefined): number | null {
  if (!v || v.trim() === '') return null
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

/** Normalise gender */
export function normaliseGender(v: string): 'MALE' | 'FEMALE' | 'OTHER' {
  const s = v.toLowerCase().trim()
  if (s === 'male'   || s === 'm' || s === 'boy')  return 'MALE'
  if (s === 'female' || s === 'f' || s === 'girl') return 'FEMALE'
  return 'OTHER'
}

/** Normalise HPV status */
export function normaliseHPVStatus(v: string): 'VACCINATED' | 'PENDING' | 'DUE' | 'NOT_ELIGIBLE' {
  const s = v.toLowerCase().trim()
  if (s === 'vaccinated' || s === 'done' || s === 'yes' || s === '1') return 'VACCINATED'
  if (s === 'due')         return 'DUE'
  if (s === 'not_eligible'|| s === 'not eligible') return 'NOT_ELIGIBLE'
  return 'PENDING'
}
