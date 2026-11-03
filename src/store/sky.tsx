import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_SKY_THEME, skyThemeById, skyVars } from '../data/skyThemes'

/** Two themes: a light sky ("day") and a dark one ("night"). */
export type SkyPhase = 'day' | 'night'
export type SkyChoice = SkyPhase | 'auto'

export const SKY_LABEL: Record<SkyPhase, string> = { day: 'Light', night: 'Dark' }

const KEY = 'tripmate:sky'
const LIGHT_KEY = 'tripmate:lightsky'
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

function readLightSky(): string {
  try {
    const q = new URLSearchParams(window.location.search).get('lsky')
    if (q) return skyThemeById(q).id
    return skyThemeById(localStorage.getItem(LIGHT_KEY) ?? DEFAULT_SKY_THEME).id
  } catch {
    return DEFAULT_SKY_THEME
  }
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
  /** Which light-theme sky is chosen */
  lightSky: string
  setLightSky: (id: string) => void
}

const SkyContext = createContext<SkyState | null>(null)

export function SkyProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<SkyChoice>(readChoice)
  const [system, setSystem] = useState<SkyPhase>(systemPhase)
  const [lightSky, setLightSkyState] = useState<string>(readLightSky)

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
    const root = document.documentElement
    root.dataset.sky = phase
    const theme = skyThemeById(lightSky)
    const vars = skyVars(theme)
    // The chosen sky only paints the light theme; the purple night keeps its own colours.
    for (const [k, v] of Object.entries(vars)) {
      if (phase === 'day') root.style.setProperty(k, v)
      else root.style.removeProperty(k)
    }
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', phase === 'day' ? theme.c[0] : '#050214')
  }, [phase, lightSky])

  const value = useMemo<SkyState>(
    () => ({
      phase,
      choice,
      lightSky,
      setLightSky: (id) => {
        setLightSkyState(skyThemeById(id).id)
        try {
          localStorage.setItem(LIGHT_KEY, skyThemeById(id).id)
        } catch {
          /* ignore */
        }
      },
      setChoice: (c) => {
        setChoiceState(c)
        try {
          localStorage.setItem(KEY, c)
        } catch {
          /* ignore */
        }
      },
    }),
    [phase, choice, lightSky],
  )
  return <SkyContext.Provider value={value}>{children}</SkyContext.Provider>
}

export function useSky(): SkyState {
  const s = useContext(SkyContext)
  if (!s) throw new Error('useSky outside SkyProvider')
  return s
}
