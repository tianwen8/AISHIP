export type SanitizeOptions = {
  removeUndefined?: boolean
  removeNull?: boolean
  removeEmptyString?: boolean
}

// Recursively remove optional/empty fields from plain JSON-able objects
export function sanitizeJson<T>(value: T, opts: SanitizeOptions = {}): T {
  const { removeUndefined = true, removeNull = false, removeEmptyString = false } = opts

  if (Array.isArray(value)) {
    return value
      .map((v) => sanitizeJson(v, opts))
      .filter((v) => {
        if (removeUndefined && typeof v === 'undefined') return false
        if (removeNull && v === null) return false
        if (removeEmptyString && v === '') return false
        return true
      }) as unknown as T
  }

  if (value && typeof value === 'object') {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (removeUndefined && typeof v === 'undefined') continue
      if (removeNull && v === null) continue
      if (removeEmptyString && v === '') continue
      out[k] = sanitizeJson(v, opts)
    }
    return out as T
  }

  return value
}

