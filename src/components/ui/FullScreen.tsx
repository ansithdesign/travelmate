import { useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { cx } from '../../utils/cx'
import { IconButton } from './Button'
import { useModalBehaviour, usePresence } from './Sheet'

/**
 * A full-screen page that rises over the app. Used for creating an expense, where
 * the whole screen is the form. Pickers still open as bottom sheets on top of it.
 */
export function FullScreen({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wash,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  /** A soft tinted wash behind the header and the top of the page */
  wash?: boolean
}) {
  const { mounted, visible } = usePresence(open, 420)
  const panel = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useModalBehaviour(open && mounted, panel, onClose)
  if (!mounted) return null
  return createPortal(
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={cx(
        'fixed inset-0 z-[49] flex justify-center bg-[#0b1020] outline-none transition-[transform,opacity] duration-[480ms] ease-[var(--ease-glide)]',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-[8%] opacity-0',
      )}
    >
      <div className="relative flex min-h-0 w-full max-w-[430px] flex-1 flex-col overflow-hidden bg-haze">
        {wash ? <div aria-hidden className="add-wash pointer-events-none absolute inset-x-0 top-0 h-[340px]" /> : null}
        <header className="relative flex items-center px-4 pt-[max(14px,env(safe-area-inset-top))] pb-2">
          <IconButton icon={X} label="Close" tone="plain" size={22} weight="regular" onClick={onClose} />
          <div className="pointer-events-none absolute inset-x-16 top-[max(14px,env(safe-area-inset-top))] flex min-h-11 flex-col items-center justify-center text-center">
            <h2 id={titleId} className="text-[16px] leading-5 font-semibold tracking-[-0.01em]">
              {title}
            </h2>
            {subtitle ? <div className="pointer-events-auto text-[12.5px] leading-4 text-ink-3">{subtitle}</div> : null}
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">{children}</div>
        {footer ? <div className="px-6 pt-3 pb-[max(22px,calc(env(safe-area-inset-bottom)+10px))]">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}
