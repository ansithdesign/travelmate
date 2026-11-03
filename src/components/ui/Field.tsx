import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { WarningCircle } from '@phosphor-icons/react'
import { cx } from '../../utils/cx'

export function Field({
  label,
  hint,
  error,
  children,
  optional,
  htmlFor,
  className,
}: {
  label: string
  hint?: ReactNode
  error?: string
  optional?: boolean
  htmlFor?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="flex items-baseline gap-1.5 pl-0.5 text-meta font-semibold text-ink-2">
        {label}
        {optional ? <span className="font-normal text-ink-3">optional</span> : null}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 pl-0.5 text-caption font-semibold text-loss" role="alert">
          <WarningCircle size={15} weight="fill" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p className="pl-0.5 text-caption text-ink-3">{hint}</p>
      ) : null}
    </div>
  )
}

/** Strong glass with a hairline. Accent ring and halo on focus; act colour when invalid. */
export const inputClass =
  'h-[54px] w-full rounded-[16px] bg-panel-strong px-4 text-base font-medium text-ink outline-none transition-[box-shadow,background-color] duration-150 shadow-[0_1px_2px_rgba(23,63,112,0.04)] focus:shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--accent)_55%,transparent),0_0_0_4px_var(--accent-soft)] focus-visible:outline-none aria-[invalid=true]:bg-loss-soft aria-[invalid=true]:shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--act)_55%,transparent)]'

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function TextInput({ className, invalid, ...rest }, ref) {
    return <input ref={ref} aria-invalid={invalid || undefined} className={cx(inputClass, className)} {...rest} />
  },
)

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cx(inputClass, 'h-auto min-h-24 resize-y py-3.5 leading-[1.45]', className)} {...rest} />
})

export function InputField({
  label,
  hint,
  error,
  optional,
  ...input
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode; error?: string; optional?: boolean }) {
  const id = useId()
  return (
    <Field label={label} hint={hint} error={error} optional={optional} htmlFor={id}>
      <TextInput id={id} invalid={!!error} {...input} />
    </Field>
  )
}
