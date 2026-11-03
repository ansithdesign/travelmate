import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { CheckCircle, WarningCircle } from '@phosphor-icons/react'

interface ToastItem {
  id: number
  message: string
  tone: 'success' | 'error'
  action?: { label: string; onClick: () => void }
}

interface ToastApi {
  success: (message: string, action?: ToastItem['action']) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

/** Dark glass capsules that rise above the tab bar. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const seq = useRef(0)

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), [])
  const push = useCallback(
    (t: Omit<ToastItem, 'id'>) => {
      const id = ++seq.current
      setItems((xs) => [...xs.slice(-2), { ...t, id }])
      setTimeout(() => dismiss(id), t.action ? 6000 : 3200)
    },
    [dismiss],
  )
  const api = useRef<ToastApi>({ success: () => {}, error: () => {} })
  api.current.success = (message, action) => push({ message, tone: 'success', action })
  api.current.error = (message) => push({ message, tone: 'error' })

  return (
    <ToastContext.Provider value={api.current}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4 md:bottom-8"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex max-w-[440px] items-center gap-3 rounded-full bg-[#0b1433]/88 py-2 pr-2 pl-3 text-meta font-medium text-white shadow-[0_18px_40px_-14px_rgb(0_0_0/0.55),inset_0_1px_0_rgb(255_255_255/0.12)] backdrop-blur-xl [animation:toast-in_380ms_var(--ease-glide)]"
          >
            {t.tone === 'success' ? (
              <CheckCircle size={22} weight="fill" className="shrink-0 text-[#6ee7c5]" aria-hidden />
            ) : (
              <WarningCircle size={22} weight="fill" className="shrink-0 text-[#ff9aa6]" aria-hidden />
            )}
            <span className="py-1 pr-2">{t.message}</span>
            {t.action ? (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick()
                  dismiss(t.id)
                }}
                className="press h-8 rounded-full bg-white/14 px-3.5 font-semibold text-white hover:bg-white/22"
              >
                {t.action.label}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const t = useContext(ToastContext)
  if (!t) throw new Error('useToast outside ToastProvider')
  return t
}
