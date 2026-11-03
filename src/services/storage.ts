import type { AppData } from '../types'

/**
 * Persistence boundary. Everything the UI reads and writes goes through a repository
 * with this shape, so a remote API can replace localStorage without touching screens.
 */
export interface Repository {
  load(): AppData | null
  save(data: AppData): void
  clear(): void
}

const KEY = 'tripmate:data:v1'

export const localRepository: Repository = {
  load() {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return null
      const data = JSON.parse(raw) as AppData
      return data?.version === 1 ? data : null
    } catch {
      return null
    }
  },
  save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch (err) {
      // Quota is the realistic failure (large receipt images). Surface it to the caller.
      throw new Error('Could not save on this device. Storage may be full.', { cause: err })
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  },
}
