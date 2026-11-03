import { useEffect, useRef, useState, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

/**
 * A horizontally scrolling row that tells you there is more: while content
 * runs past the right edge it fades out the last stretch, so the next item
 * looks cut off. The fade goes away once you reach the end.
 */
export function ScrollRow({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)
  const [more, setMore] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setMore(el.scrollWidth - el.clientWidth - el.scrollLeft > 8)
    check()
    el.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => {
      el.removeEventListener('scroll', check)
      ro.disconnect()
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cx('no-scrollbar -my-3 overflow-x-auto py-3', className)}
      style={more ? { WebkitMaskImage: 'linear-gradient(90deg, #000 calc(100% - 56px), transparent)', maskImage: 'linear-gradient(90deg, #000 calc(100% - 56px), transparent)' } : undefined}
      {...rest}
    >
      {children}
    </div>
  )
}
