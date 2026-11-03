import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { cx } from '../../utils/cx'

/** Content placed directly on the sky. White type, glass controls. */
export function SkyHero({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('on-sky relative mx-auto w-full max-w-[1080px] px-5 sm:px-6 lg:px-10', className)}>{children}</div>
}

/**
 * The frosted sheet that rises over the sky and holds the page's working
 * content. It rises a little on every navigation: the app's one page motion.
 */
export function ContentSheet({ children, className, wide }: { children: ReactNode; className?: string; wide?: boolean }) {
  const { pathname } = useLocation()
  return (
    <div
      key={pathname}
      className={cx(
        'sheet-glass relative mx-auto min-h-[70dvh] w-full rounded-t-[34px] pb-[calc(110px+env(safe-area-inset-bottom))] [animation:rise_640ms_var(--ease-out-expo)_both] lg:mb-10 lg:min-h-0 lg:rounded-[34px] lg:pb-0',
        wide ? 'lg:max-w-[1080px]' : 'lg:max-w-[1080px]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SheetBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('px-5 pt-6 pb-10 sm:px-7 lg:px-10 lg:pt-8', className)}>{children}</div>
}
