import { cn } from '@/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className, onClick, padding = 'md' }: CardProps) {
  const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100',
        paddings[padding],
        onClick && 'cursor-pointer hover:shadow-md active:scale-[0.99] transition-all',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
