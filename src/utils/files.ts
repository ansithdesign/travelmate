/**
 * Stores attached files (tickets, PDFs, photos) as blobs in IndexedDB, keeping the
 * main trip data small. If the browser blocks IndexedDB the files stay in memory
 * for the session and the caller is told so.
 */
const DB = 'tripmate-files'
const STORE = 'blobs'
const memory = new Map<string, Blob>()
let persistent = true

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    } catch (e) {
      reject(e)
    }
  })
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = fn(tx.objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Returns false when the file could only be kept for this session. */
export async function putFile(id: string, blob: Blob): Promise<boolean> {
  memory.set(id, blob)
  try {
    await run('readwrite', (s) => s.put(blob, id))
    return true
  } catch {
    persistent = false
    return false
  }
}

export async function getFile(id: string): Promise<Blob | null> {
  const m = memory.get(id)
  if (m) return m
  try {
    return ((await run('readonly', (s) => s.get(id))) as Blob | undefined) ?? null
  } catch {
    return null
  }
}

export async function deleteFile(id: string): Promise<void> {
  memory.delete(id)
  try {
    await run('readwrite', (s) => s.delete(id))
  } catch {
    /* nothing stored */
  }
}

export const filesArePersistent = () => persistent

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Open a stored file in a new tab, or save it. */
export async function openStored(id: string, fileName: string, download = false): Promise<boolean> {
  const blob = await getFile(id)
  if (!blob) return false
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  if (download) a.download = fileName
  else {
    a.target = '_blank'
    a.rel = 'noreferrer'
  }
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return true
}
