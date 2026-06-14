import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  prefix?: string
  suffix?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-slate-400 text-sm select-none">{prefix}</span>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500',
              'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50',
              'transition-colors text-sm',
              prefix ? 'pl-7 pr-3 py-2.5' : 'px-3 py-2.5',
              suffix ? 'pr-10' : '',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-slate-400 text-sm select-none">{suffix}</span>
          )}
        </div>
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
