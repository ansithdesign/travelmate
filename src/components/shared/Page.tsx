import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CaretLeft } from '@phosphor-icons/react'
import { cx } from '../../utils/cx'

/** Content placed directly on the sky: large titles and hero figures, no container. */
export function SkyHero({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('relative mx-auto w-full max-w-[1080px] px-6 lg:px-10', className)}>{children}</div>
}

/**
 * The page's working content. It sits on the haze below the sky band with no
 * sheet of its own: modules are frosted glass cards. A short fade on navigation.
 */
export function ContentSheet({ children, className }: { children: ReactNode; className?: string; wide?: boolean }) {
  const { pathname } = useLocation()
  // A full-width haze surface that fades in from the sky, so body text never sits on the coloured sky.
  return (
    <div
      className="relative -mt-16 w-full pt-[84px]"
      style={{
        // An eased ramp, so the sky melts into the page with no visible band
        background:
          'linear-gradient(180deg, transparent 0, color-mix(in srgb, var(--haze) 6%, transparent) 20px, color-mix(in srgb, var(--haze) 20%, transparent) 44px, color-mix(in srgb, var(--haze) 45%, transparent) 70px, color-mix(in srgb, var(--haze) 72%, transparent) 98px, color-mix(in srgb, var(--haze) 92%, transparent) 124px, var(--haze) 150px)',
      }}
    >
      <div key={pathname} className={cx('relative mx-auto w-full max-w-[1080px] [animation:rise_420ms_var(--ease-out-expo)_both]', className)}>
        {children}
      </div>
    </div>
  )
}

export function SheetBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('px-6 pt-4 pb-12 lg:px-10', className)}>{children}</div>
}

/** The signature blue full stop that ends a page title. */
export function Dot() {
  return (
    <span aria-hidden className="text-accent">
      .
    </span>
  )
}

/** True once the window has scrolled a few pixels, for headers that gain material. */
export function useScrolled(threshold = 4) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [threshold])
  return scrolled
}

/**
 * Sub-screen header: back on the left, a centred 17px title, actions on the
 * right. Transparent on the sky; haze material once content scrolls beneath.
 */
export function NavHeader({ title, back, actions, children }: { title: ReactNode; back?: string | (() => void); actions?: ReactNode; children?: ReactNode }) {
  const navigate = useNavigate()
  const scrolled = useScrolled()
  return (
    <header className={cx('sticky top-0 z-30 transition-[background-color,box-shadow] duration-200', scrolled && 'header-material')}>
      <div className={cx('mx-auto grid min-h-[calc(52px+env(safe-area-inset-top))] w-full max-w-[1080px] grid-cols-[44px_1fr_auto] items-center px-4 pt-[env(safe-area-inset-top)] lg:px-8', !scrolled && 'on-sky')}>
        <div>
          {back ? (
            <button
              type="button"
              aria-label="Back"
              onClick={() => (typeof back === 'string' ? navigate(back) : back())}
              className="press flex size-11 items-center justify-center rounded-full text-ink hover:bg-well"
            >
              <CaretLeft size={24} weight="regular" aria-hidden />
            </button>
          ) : null}
        </div>
        <h1 className="truncate text-center text-[17px] font-semibold tracking-[-0.01em]">{title}</h1>
        <div className="flex min-w-11 justify-end gap-0.5">{actions}</div>
      </div>
      {children}
    </header>
  )
}
