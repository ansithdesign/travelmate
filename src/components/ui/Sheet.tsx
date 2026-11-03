import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { cx } from '../../utils/cx'
import { IconButton } from './Button'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

let openCount = 0

function usePresence(open: boolean, ms = 340) {
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
    }, 60)
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

/** Drag the grabber (or header) down to dismiss on touch screens. */
function useDragToDismiss(onClose: () => void) {
  const [dy, setDy] = useState(0)
  const [dragging, setDragging] = useState(false)
  const start = useRef<{ y: number; t: number } | null>(null)
  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && window.innerWidth >= 768) return
      if ((e.target as HTMLElement).closest('button')) return
      start.current = { y: e.clientY, t: performance.now() }
      setDragging(true)
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!start.current) return
      const d = e.clientY - start.current.y
      setDy(d > 0 ? d : d / 6)
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (!start.current) return
      const d = e.clientY - start.current.y
      const v = d / Math.max(1, performance.now() - start.current.t)
      start.current = null
      setDragging(false)
      if (d > 120 || v > 0.6) onClose()
      setDy(0)
    },
    onPointerCancel: () => {
      start.current = null
      setDragging(false)
      setDy(0)
    },
  }
  return { dy, dragging, handlers }
}

/**
 * Glass bottom sheet on phones, floating glass panel from 768px.
 * Springs in, drags down to dismiss, traps focus, closes on Escape.
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
  const { dy, dragging, handlers } = useDragToDismiss(onClose)
  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-stretch md:justify-end md:p-3">
      <div
        aria-hidden
        onClick={onClose}
        className={cx(
          'absolute inset-0 bg-[#081236]/35 backdrop-blur-[3px] transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{ transform: visible ? `translateY(${dy}px)` : undefined }}
        className={cx(
          'sheet-glass relative flex max-h-[92dvh] w-full flex-col outline-none',
          'rounded-t-[32px] md:h-full md:max-h-none md:rounded-[30px]',
          size === 'lg' ? 'md:w-[540px]' : 'md:w-[460px]',
          !dragging && 'transition-[transform,opacity] duration-[520ms] ease-[var(--ease-glide)]',
          visible ? 'translate-y-0 md:translate-x-0 md:opacity-100' : 'translate-y-full md:translate-x-[110%] md:translate-y-0 md:opacity-0',
        )}
      >
        <div {...handlers} className="touch-none select-none">
          <div className="flex justify-center pt-2.5 md:hidden" aria-hidden>
            <span className="h-[5px] w-10 rounded-full bg-ink/20" />
          </div>
          <header className="flex items-start gap-3 px-5 pt-3 pb-3 md:px-6 md:pt-6">
            <div className="min-w-0 flex-1 pt-1.5">
              <h2 id={titleId} className="text-title">
                {title}
              </h2>
              {description ? <p className="mt-1 text-meta text-ink-2">{description}</p> : null}
            </div>
            {headerAction}
            <IconButton icon={X} label="Close" tone="panel" size={18} onClick={onClose} className="size-10" />
          </header>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 md:px-6">{children}</div>
        {footer ? <div className="safe-bottom border-t border-line px-5 py-3 md:rounded-b-[30px] md:px-6 md:py-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}

/** Small centred glass dialog for confirmations that protect data. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  tone = 'danger',
  icon,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  body: ReactNode
  confirmLabel: string
  tone?: 'danger' | 'primary'
  icon?: ReactNode
}) {
  const { mounted, visible } = usePresence(open, 220)
  const panel = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useModalBehaviour(open && mounted, panel, onClose)
  if (!mounted) return null
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      <div aria-hidden onClick={onClose} className={cx('absolute inset-0 bg-[#081236]/45 backdrop-blur-[4px] transition-opacity duration-200', visible ? 'opacity-100' : 'opacity-0')} />
      <div
        ref={panel}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          'sheet-glass relative w-full max-w-[380px] rounded-[30px] p-6 text-center outline-none transition-[opacity,transform] duration-300 ease-[var(--ease-glide)]',
          visible ? 'scale-100 opacity-100' : 'scale-[0.92] opacity-0',
        )}
      >
        {icon ? <div className="mb-4 flex justify-center">{icon}</div> : null}
        <h2 id={titleId} className="text-title">
          {title}
        </h2>
        <div className="mt-2 text-body text-ink-2">{body}</div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" data-autofocus onClick={onClose} className="press h-12 rounded-full bg-well font-semibold text-ink hover:bg-line">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={cx(
              'press h-12 rounded-full font-semibold text-white',
              tone === 'danger'
                ? 'bg-[linear-gradient(180deg,#f2566a,#d02c42)] shadow-[0_10px_24px_-12px_rgb(214_54_74/0.7)]'
                : 'luminous',
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
