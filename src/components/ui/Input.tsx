import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  suffix?: string
  prefix?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, suffix, prefix, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute ltr:left-3 rtl:right-3 text-gray-400 text-sm pointer-events-none">{prefix}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'transition-all min-h-[44px] text-base',
              prefix ? 'ltr:pl-9 rtl:pr-9 px-4' : 'px-4',
              suffix ? 'ltr:pr-14 rtl:pl-14' : '',
              error && 'border-red-400 focus:ring-red-400',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute ltr:right-3 rtl:left-3 text-gray-400 text-sm pointer-events-none font-medium">{suffix}</span>
          )}
        </div>
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
