import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { cx } from '../../utils/cx'

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
  const api = useRef<ToastApi>({
    success: (message, action) => push({ message, tone: 'success', action }),
    error: (message) => push({ message, tone: 'error' }),
  })
  api.current.success = (message, action) => push({ message, tone: 'success', action })
  api.current.error = (message) => push({ message, tone: 'error' })

  return (
    <ToastContext.Provider value={api.current}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6 md:left-auto md:right-6 md:items-end"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-[420px] items-center gap-3 rounded-md bg-ink py-3 pr-2 pl-4 text-meta text-white shadow-pop [animation:toast-in_280ms_var(--ease-out-expo)]"
          >
            {t.tone === 'success' ? (
              <CircleCheck size={18} className="shrink-0 text-forest-200" aria-hidden />
            ) : (
              <CircleAlert size={18} className="shrink-0 text-[#f0a594]" aria-hidden />
            )}
            <span className="flex-1 py-0.5">{t.message}</span>
            {t.action ? (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick()
                  dismiss(t.id)
                }}
                className={cx('h-8 rounded-[8px] px-3 font-semibold text-amber-100 hover:bg-white/10')}
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
