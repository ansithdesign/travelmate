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
  // Luminous sky-blue pill with a lit top edge
  primary:
    'text-white bg-[linear-gradient(180deg,#4f8dff_0%,#2563eb_100%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_1px_2px_rgb(23_73_196/0.3),0_10px_24px_-10px_rgb(37_99_235/0.7)] hover:brightness-[1.06] disabled:opacity-45 disabled:shadow-none',
  secondary: 'bg-panel-strong text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong),0_1px_2px_rgb(var(--t-shadow)/0.06)] hover:bg-panel disabled:text-ink-3',
  ghost: 'text-ink hover:bg-well disabled:text-ink-3',
  quiet: 'text-accent hover:bg-accent-soft disabled:text-ink-3',
  danger:
    'text-white bg-[linear-gradient(180deg,#f2566a_0%,#d02c42_100%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_10px_24px_-12px_rgb(214_54_74/0.7)] hover:brightness-105 disabled:opacity-45',
  sky: 'glass text-white [text-shadow:0_1px_8px_rgb(8_22_70/0.35)] hover:brightness-110',
  white: 'bg-white text-[#0c1736] shadow-[0_10px_30px_-12px_rgb(8_20_60/0.5),inset_0_-1px_0_rgb(12_23_54/0.08)] hover:bg-white/92',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-meta gap-1.5',
  md: 'h-11 px-5 text-body gap-2',
  lg: 'h-[52px] px-6 text-body gap-2',
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
        'press inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold tracking-[-0.005em] whitespace-nowrap disabled:cursor-not-allowed',
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
        tone === 'plain' && 'text-ink hover:bg-well',
        tone === 'panel' && 'bg-panel-strong text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-panel',
        tone === 'sky' && 'glass text-white hover:brightness-110',
        className,
      )}
      {...rest}
    >
      <I size={size} weight={weight} aria-hidden />
    </button>
  )
})
