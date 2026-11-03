import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
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
      <label htmlFor={htmlFor} className="flex items-baseline gap-1.5 text-meta font-medium text-ink-2">
        {label}
        {optional ? <span className="font-normal text-ink-3">Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-meta text-brick" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-meta text-ink-3">{hint}</p>
      ) : null}
    </div>
  )
}

export const inputClass =
  'h-12 w-full rounded-md bg-surface px-3.5 text-body hairline outline-none transition-shadow duration-150 hover:shadow-[inset_0_0_0_1px_#cfc9bd] focus:shadow-[inset_0_0_0_1.5px_var(--color-forest),0_0_0_3px_var(--color-forest-50)] aria-[invalid=true]:shadow-[inset_0_0_0_1.5px_var(--color-brick)]'

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function TextInput({ className, invalid, ...rest }, ref) {
    return <input ref={ref} aria-invalid={invalid || undefined} className={cx(inputClass, className)} {...rest} />
  },
)

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea(
  { className, ...rest },
  ref,
) {
  return <textarea ref={ref} className={cx(inputClass, 'h-auto min-h-24 resize-y py-3 leading-[1.4]', className)} {...rest} />
})

/** Labelled field with an id wired automatically. */
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
