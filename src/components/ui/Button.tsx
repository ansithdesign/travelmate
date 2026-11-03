import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { CircleNotch, type Icon, type IconWeight } from '@phosphor-icons/react'
import { cx } from '../../utils/cx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'quiet' | 'danger' | 'sky' | 'white'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: Icon
  iconRight?: Icon
  iconWeight?: IconWeight
  loading?: boolean
  block?: boolean
  children?: ReactNode
}

const variants: Record<Variant, string> = {
  // Midnight pill. White with ink at night. The accent never fills a primary button.
  primary: 'luminous hover:opacity-90 disabled:bg-well disabled:text-faint disabled:shadow-none',
  // Strong glass with a hairline
  secondary: 'glass-control hover:bg-solid disabled:text-faint',
  ghost: 'text-ink hover:bg-well disabled:text-faint',
  quiet: 'text-accent-ink hover:bg-accent-soft disabled:text-faint',
  danger: 'bg-loss-soft text-loss hover:brightness-95 disabled:opacity-45',
  // Kept as aliases so older call sites resolve to the system
  sky: 'glass-control hover:bg-solid disabled:text-faint',
  white: 'luminous hover:opacity-90 disabled:bg-well disabled:text-faint disabled:shadow-none',
}

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-[14px] gap-1.5',
  md: 'h-12 px-5 text-body gap-2',
  lg: 'h-14 px-[26px] text-base gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon: IconL, iconRight: IconR, iconWeight = 'bold', loading, block, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  const s = size === 'sm' ? 16 : 18
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cx(
        'press inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold tracking-[-0.01em] whitespace-nowrap disabled:cursor-not-allowed [&_svg]:shrink-0',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <CircleNotch size={s} weight="bold" className="animate-spin" aria-hidden /> : IconL ? <IconL size={s} weight={iconWeight} aria-hidden /> : null}
      {children}
      {IconR && !loading ? <IconR size={s} weight={iconWeight} aria-hidden /> : null}
    </button>
  )
})

export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { icon: Icon; label: string; tone?: 'plain' | 'sky' | 'panel'; weight?: IconWeight; size?: number }
>(function IconButton({ icon: I, label, tone = 'plain', weight = 'bold', size = 20, className, type = 'button', ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'press inline-flex size-11 shrink-0 items-center justify-center rounded-full',
        tone === 'plain' && 'text-ink hover:bg-well active:bg-well',
        (tone === 'panel' || tone === 'sky') && 'glass-control hover:bg-solid',
        className,
      )}
      {...rest}
    >
      <I size={size} weight={weight} aria-hidden />
    </button>
  )
})
