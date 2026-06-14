import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize',
        {
          'text-slate-300 bg-slate-800 border-slate-700': variant === 'default',
          'text-green-400 bg-green-400/10 border-green-400/20': variant === 'success',
          'text-yellow-400 bg-yellow-400/10 border-yellow-400/20': variant === 'warning',
          'text-red-400 bg-red-400/10 border-red-400/20': variant === 'danger',
          'text-blue-400 bg-blue-400/10 border-blue-400/20': variant === 'info',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
