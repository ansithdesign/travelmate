/** The light-theme skies people can choose from. Dark mode keeps its own purple night. */
export interface SkyTheme {
  id: string
  name: string
  mood: string
  /** Top, middle and horizon of the sky */
  c: [string, string, string]
  /** Strength of the soft clouds */
  clouds: number
  /** Optional warm glow near the sun */
  glow?: string
}

export const SKY_THEMES: SkyTheme[] = [
  { id: 'ocean-steel', name: 'Ocean steel', mood: 'A deep sea-blue with a steely edge. Clear and a little nautical.', c: ['#153e6b', '#3a74a8', '#8fbbdc'], clouds: 0.6 },
  { id: 'alpine-blue', name: 'Alpine blue', mood: 'Deep, cool and calm, like a winter morning above the mountains.', c: ['#1f3b82', '#4668b4', '#84a1d8'], clouds: 0.6 },
  { id: 'dusty-periwinkle', name: 'Dusty periwinkle', mood: 'Soft violet-leaning blue. Gentle and a little dreamy.', c: ['#3b4f9a', '#6f84c9', '#b4c0ea'], clouds: 0.55 },
  { id: 'overcast-winter', name: 'Overcast winter', mood: 'A grey-blue snow day. The quietest of the set.', c: ['#4a5f7a', '#7d93ad', '#bccbdb'], clouds: 0.8 },
  { id: 'dawn-rose', name: 'Dawn rose', mood: 'Blue into lilac into a pink horizon, like first light.', c: ['#3d4a8f', '#8d7fc0', '#f0b9b0'], clouds: 0.55, glow: 'rgba(255,214,190,0.35)' },
  { id: 'deep-cobalt', name: 'Deep cobalt', mood: 'The darkest and most saturated. Rich and dramatic.', c: ['#12286b', '#2d4fa8', '#7090d8'], clouds: 0.5 },
  { id: 'twilight-violet', name: 'Twilight violet', mood: 'Blue-violet dusk that leads into the purple night theme.', c: ['#28266e', '#5a56b0', '#a9a6e6'], clouds: 0.5 },
  { id: 'soft-morning', name: 'Soft morning', mood: 'The lightest: airy and hazy.', c: ['#4f7fc0', '#8db3e0', '#cfe0f4'], clouds: 0.75 },
  { id: 'slate-lavender', name: 'Slate lavender', mood: 'Muted blue-grey with a lavender cast. Calm and sophisticated.', c: ['#3a3f7a', '#6d72b0', '#b9bde0'], clouds: 0.55 },
  { id: 'storm-blue', name: 'Storm blue', mood: 'A dark, moody winter storm. The most dramatic daytime sky.', c: ['#24344f', '#4b6485', '#94abc6'], clouds: 0.8 },
  { id: 'arctic-dawn', name: 'Arctic dawn', mood: 'Cold blue brightening to a pale rose-white horizon.', c: ['#274a7c', '#7fa4c8', '#e8d7e0'], clouds: 0.7, glow: 'rgba(255,232,230,0.35)' },
  { id: 'plum-dusk', name: 'Plum dusk', mood: 'Violet into pink, a soft evening that pairs with the night theme.', c: ['#3a2a6e', '#7d5fa8', '#e3a9c4'], clouds: 0.5, glow: 'rgba(255,200,230,0.35)' },
]

export const DEFAULT_SKY_THEME = 'ocean-steel'

export const skyThemeById = (id: string | null | undefined): SkyTheme => SKY_THEMES.find((t) => t.id === id) ?? SKY_THEMES[0]

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
}
function lum([r, g, b]: [number, number, number]) {
  const f = (v: number) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** Contrast of white text on the middle of the sky */
export function whiteContrast(t: SkyTheme): number {
  return 1.05 / (lum(rgb(t.c[1])) + 0.05)
}

export function readability(t: SkyTheme): { label: 'Strong' | 'Good' | 'Fair'; ratio: number } {
  const r = whiteContrast(t)
  return { ratio: r, label: r >= 5.5 ? 'Strong' : r >= 4 ? 'Good' : 'Fair' }
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [0, 1, 2].map((i) => Math.round(a[i] * (1 - t) + b[i] * t)) as [number, number, number]
}

/** CSS variables that paint this sky. A dimming scrim over the hero keeps white text at 4.6:1 or better, even on the paler lower half. */
export function skyVars(t: SkyTheme): Record<string, string> {
  const [a, b, c] = t.c
  const [br, bg, bb] = rgb(c)
  const [mr, mg, mb] = rgb(b)
  // The lightest place white text can sit: about 55% of the way from the middle to the horizon colour.
  const worst = mix(rgb(b), rgb(c), 0.8)
  const over: [number, number, number] = [8, 18, 48]
  let scrim = 0
  while (scrim < 0.62 && 1.05 / (lum(mix(worst, over, scrim)) + 0.05) < 4.6) scrim += 0.01
  return {
    '--sky-1': a,
    '--sky-2': b,
    '--sky-3': c,
    '--sun': t.glow ?? 'rgba(255,255,255,0.2)',
    '--cloud-a': String(t.clouds),
    '--ridge-back': `rgba(${br}, ${bg}, ${bb}, 0.5)`,
    '--ridge-far': `rgba(${Math.round((br + mr) / 2)}, ${Math.round((bg + mg) / 2)}, ${Math.round((bb + mb) / 2)}, 0.42)`,
    '--ridge-near': `rgba(${mr}, ${mg}, ${mb}, 0.34)`,
    '--sky-scrim': scrim.toFixed(2),
  }
}
