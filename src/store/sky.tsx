import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type SkyPhase = 'dawn' | 'day' | 'golden' | 'night'
export type SkyChoice = SkyPhase | 'auto'

export const SKY_LABEL: Record<SkyPhase, string> = {
  dawn: 'Dawn',
  day: 'Clear day',
  golden: 'Golden hour',
  night: 'Night',
}

/** Local time decides the sky: 5 to 8 dawn, 8 to 16 day, 16 to 19 golden hour, otherwise night. */
export function phaseForHour(h: number): SkyPhase {
  if (h >= 5 && h < 8) return 'dawn'
  if (h >= 8 && h < 16) return 'day'
  if (h >= 16 && h < 19) return 'golden'
  return 'night'
}

const KEY = 'tripmate:sky'

function readChoice(): SkyChoice {
  try {
    const q = new URLSearchParams(window.location.search).get('sky')
    if (q && ['dawn', 'day', 'golden', 'night', 'auto'].includes(q)) return q as SkyChoice
    const v = localStorage.getItem(KEY)
    if (v && ['dawn', 'day', 'golden', 'night', 'auto'].includes(v)) return v as SkyChoice
  } catch {
    /* storage blocked: fall through */
  }
  return 'auto'
}

interface SkyState {
  phase: SkyPhase
  choice: SkyChoice
  setChoice: (c: SkyChoice) => void
}

const SkyContext = createContext<SkyState | null>(null)

export function SkyProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<SkyChoice>(readChoice)
  const [hour, setHour] = useState(() => new Date().getHours())

  // Re-check the clock every minute so an open app moves into evening on its own.
  useEffect(() => {
    const t = window.setInterval(() => setHour(new Date().getHours()), 60_000)
    return () => window.clearInterval(t)
  }, [])

  const phase = choice === 'auto' ? phaseForHour(hour) : choice

  useEffect(() => {
    document.documentElement.dataset.sky = phase
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', { dawn: '#6f86cf', day: '#2f72e0', golden: '#5a66c9', night: '#0a1030' }[phase])
  }, [phase])

  const value = useMemo<SkyState>(
    () => ({
      phase,
      choice,
      setChoice: (c) => {
        setChoiceState(c)
        try {
          localStorage.setItem(KEY, c)
        } catch {
          /* ignore */
        }
      },
    }),
    [phase, choice],
  )
  return <SkyContext.Provider value={value}>{children}</SkyContext.Provider>
}

export function useSky(): SkyState {
  const s = useContext(SkyContext)
  if (!s) throw new Error('useSky outside SkyProvider')
  return s
}
