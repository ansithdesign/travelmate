export interface Place {
  name: string
  region: string
}

/**
 * Worldwide city search. Uses the free Open-Meteo geocoding service (built on
 * the GeoNames database of cities, towns and villages). It needs no key. If the
 * device is offline or the service is down, callers fall back to the built-in list.
 */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10&language=en&format=json`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Place search failed (${res.status})`)
  const json = (await res.json()) as { results?: { name: string; admin1?: string; country?: string }[] }
  const seen = new Set<string>()
  const out: Place[] = []
  for (const r of json.results ?? []) {
    const region = [r.admin1, r.country].filter(Boolean).join(', ')
    const key = `${r.name}|${region}`.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ name: r.name, region })
  }
  return out
}
