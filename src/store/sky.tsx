import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/** Two themes: a light sky ("day") and a dark one ("night"). */
export type SkyPhase = 'day' | 'night'
export type SkyChoice = SkyPhase | 'auto'

export const SKY_LABEL: Record<SkyPhase, string> = { day: 'Light', night: 'Dark' }

const KEY = 'tripmate:sky'
const VALID = ['day', 'night', 'auto']
const ALIAS: Record<string, SkyChoice> = { light: 'day', dark: 'night', dawn: 'day', golden: 'day' }

function readChoice(): SkyChoice {
  try {
    const q = new URLSearchParams(window.location.search).get('sky')
    if (q) return ALIAS[q] ?? (VALID.includes(q) ? (q as SkyChoice) : 'auto')
    const v = localStorage.getItem(KEY)
    if (v) return ALIAS[v] ?? (VALID.includes(v) ? (v as SkyChoice) : 'auto')
  } catch {
    /* storage blocked: fall through */
  }
  return 'auto'
}

function systemPhase(): SkyPhase {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'
  } catch {
    return 'day'
  }
}

interface SkyState {
  phase: SkyPhase
  choice: SkyChoice
  setChoice: (c: SkyChoice) => void
}

const SkyContext = createContext<SkyState | null>(null)

export function SkyProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<SkyChoice>(readChoice)
  const [system, setSystem] = useState<SkyPhase>(systemPhase)

  // Follow the device when the choice is Auto.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const on = () => setSystem(mq.matches ? 'night' : 'day')
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])

  const phase = choice === 'auto' ? system : choice

  useEffect(() => {
    document.documentElement.dataset.sky = phase
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', { day: '#78b8ee', night: '#070f26' }[phase])
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
