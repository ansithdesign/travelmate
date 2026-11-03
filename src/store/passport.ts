import { useCallback, useState } from 'react'
import { DEFAULT_LOOK, type PassportLook } from '../components/profile/passportStyles'

const KEY = 'tripmate:passport'

function read(): PassportLook {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (v && [v.sty, v.pal, v.stp, v.emb].every((n) => Number.isInteger(n))) return { ...DEFAULT_LOOK, ...v }
  } catch {
    /* storage blocked or unreadable: use the default look */
  }
  return DEFAULT_LOOK
}

/** The passport look, remembered on this device. */
export function usePassportLook() {
  const [look, setLookState] = useState<PassportLook>(read)
  const setLook = useCallback((l: PassportLook) => {
    setLookState(l)
    try {
      localStorage.setItem(KEY, JSON.stringify(l))
    } catch {
      /* ignore */
    }
  }, [])
  return [look, setLook] as const
}
