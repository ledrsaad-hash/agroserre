import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, fullWidth, className, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none'

    const variants = {
      primary:   'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
      danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost:     'text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
      outline:   'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    }

    const sizes = {
      sm: 'text-sm px-3 py-1.5 min-h-[36px]',
      md: 'text-base px-4 py-2.5 min-h-[44px]',
      lg: 'text-lg px-6 py-3.5 min-h-[52px]',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : icon}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
