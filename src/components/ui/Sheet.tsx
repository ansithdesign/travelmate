import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cx } from '../../utils/cx'
import { IconButton } from './Button'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

let openCount = 0

/** Mount/unmount with an exit transition. */
function usePresence(open: boolean, ms = 260) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (open) {
      setMounted(true)
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      return () => cancelAnimationFrame(r)
    }
    setVisible(false)
    const t = setTimeout(() => setMounted(false), ms)
    return () => clearTimeout(t)
  }, [open, ms])
  return { mounted, visible }
}

function useModalBehaviour(open: boolean, panel: React.RefObject<HTMLDivElement | null>, onClose: () => void) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    openCount++
    document.documentElement.style.overflow = 'hidden'
    const t = setTimeout(() => {
      const el = panel.current
      if (!el) return
      const auto = el.querySelector<HTMLElement>('[data-autofocus]')
      ;(auto ?? el).focus({ preventScroll: true })
    }, 40)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
      }
      if (e.key === 'Tab' && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((x) => x.offsetParent !== null)
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    const node = panel.current
    node?.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      node?.removeEventListener('keydown', onKey)
      openCount--
      if (openCount <= 0) document.documentElement.style.overflow = ''
      previous?.focus?.({ preventScroll: true })
    }
  }, [open, panel])
}

/**
 * Bottom sheet on phones, side panel from 768px. Used for short tasks:
 * add expense, filters, invite, scan, forms.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  headerAction,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
  headerAction?: ReactNode
}) {
  const { mounted, visible } = usePresence(open)
  const panel = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useModalBehaviour(open && mounted, panel, onClose)
  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-stretch md:justify-end">
      <div
        aria-hidden
        onClick={onClose}
        className={cx('absolute inset-0 bg-[#141a17]/40 transition-opacity duration-300', visible ? 'opacity-100' : 'opacity-0')}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          'relative flex max-h-[92dvh] w-full flex-col bg-surface outline-none',
          'rounded-t-xl shadow-sheet transition-transform duration-[380ms] ease-[var(--ease-out-expo)]',
          'md:h-full md:max-h-none md:rounded-none md:shadow-panel',
          size === 'lg' ? 'md:w-[560px]' : 'md:w-[480px]',
          visible ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full md:translate-y-0',
        )}
      >
        <div className="flex justify-center pt-2 md:hidden" aria-hidden>
          <span className="h-1 w-9 rounded-full bg-line" />
        </div>
        <header className="flex items-start gap-3 px-5 pt-3 pb-3 md:px-6 md:pt-6">
          <div className="min-w-0 flex-1 pt-1.5">
            <h2 id={titleId} className="text-title">
              {title}
            </h2>
            {description ? <p className="mt-1 text-meta text-ink-2">{description}</p> : null}
          </div>
          {headerAction}
          <IconButton icon={X} label="Close" onClick={onClose} className="-mr-2" />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 md:px-6">{children}</div>
        {footer ? <div className="safe-bottom border-t border-line-soft bg-surface px-5 py-3 md:px-6 md:py-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}

/** Small centred dialog for confirmations that protect data. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  tone = 'danger',
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  body: ReactNode
  confirmLabel: string
  tone?: 'danger' | 'primary'
}) {
  const { mounted, visible } = usePresence(open, 200)
  const panel = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useModalBehaviour(open && mounted, panel, onClose)
  if (!mounted) return null
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      <div aria-hidden onClick={onClose} className={cx('absolute inset-0 bg-[#141a17]/45 transition-opacity duration-200', visible ? 'opacity-100' : 'opacity-0')} />
      <div
        ref={panel}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          'relative w-full max-w-[380px] rounded-xl bg-surface p-6 shadow-pop outline-none transition-[opacity,transform] duration-200 ease-[var(--ease-out-expo)]',
          visible ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-0',
        )}
      >
        <h2 id={titleId} className="text-heading">
          {title}
        </h2>
        <div className="mt-2 text-body text-ink-2">{body}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" data-autofocus onClick={onClose} className="h-11 rounded-md px-4 font-medium text-ink hover:bg-sunken">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={cx(
              'h-11 rounded-md px-4 font-medium text-white',
              tone === 'danger' ? 'bg-brick hover:bg-[#8c3523]' : 'bg-forest hover:bg-forest-700',
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
