import { LEGACY_CATEGORY } from '../data/categories'
import { LEGACY_PHOTO } from '../data/photos'
import type { AppData, CategoryId, Photo } from '../types'

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
      if (data?.version !== 1) return null
      // Older saves used broader categories: carry them over to the current set.
      const photo = <T extends Photo | undefined>(ph: T): T => ((ph && LEGACY_PHOTO[ph.id]) || ph) as unknown as T
      return {
        ...data,
        expenses: data.expenses.map((e) => ({ ...e, category: (LEGACY_CATEGORY[e.category] ?? e.category) as CategoryId })),
        trips: data.trips.map((t) => ({ ...t, cover: photo(t.cover), journal: { ...t.journal, photos: t.journal.photos.map((x) => photo(x)) } })),
      }
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
