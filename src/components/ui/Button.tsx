import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2, type LucideIcon } from 'lucide-react'
import { cx } from '../../utils/cx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet' | 'accent' | 'onDark'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: LucideIcon
  iconRight?: LucideIcon
  loading?: boolean
  block?: boolean
  children?: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'bg-forest text-white hover:bg-forest-700 active:bg-forest-900 disabled:bg-forest-200 disabled:text-white/90',
  secondary:
    'bg-surface text-ink hairline hover:bg-ground active:bg-sunken disabled:text-ink-3',
  ghost: 'text-ink hover:bg-sunken/70 active:bg-sunken disabled:text-ink-3',
  accent: 'bg-amber text-[#2b1d05] hover:bg-[#d69728] active:bg-[#b97d17] disabled:opacity-50',
  onDark: 'text-white hover:bg-white/10 active:bg-white/15',
  quiet: 'text-forest hover:bg-forest-50 active:bg-forest-100 disabled:text-ink-3',
  danger: 'bg-brick text-white hover:bg-[#8c3523] active:bg-[#762c1d] disabled:opacity-50',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-meta gap-1.5 rounded-[10px]',
  md: 'h-11 px-4 text-body gap-2 rounded-md',
  lg: 'h-13 px-5 text-body gap-2 rounded-md',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, loading, block, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  const iconSize = size === 'sm' ? 16 : 18
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cx(
        'inline-flex shrink-0 select-none items-center justify-center font-medium whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.985] disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 size={iconSize} className="animate-spin" aria-hidden /> : Icon ? <Icon size={iconSize} strokeWidth={1.9} aria-hidden /> : null}
      {children}
      {IconRight && !loading ? <IconRight size={iconSize} strokeWidth={1.9} aria-hidden /> : null}
    </button>
  )
})

export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { icon: LucideIcon; label: string; tone?: 'plain' | 'onImage' | 'surface' }
>(function IconButton({ icon: Icon, label, tone = 'plain', className, type = 'button', ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors duration-150',
        tone === 'plain' && 'text-ink hover:bg-sunken/80 active:bg-sunken',
        tone === 'surface' && 'bg-surface text-ink hairline hover:bg-ground',
        tone === 'onImage' && 'bg-white/92 text-ink shadow-lift hover:bg-white',
        className,
      )}
      {...rest}
    >
      <Icon size={20} strokeWidth={1.8} aria-hidden />
    </button>
  )
})
