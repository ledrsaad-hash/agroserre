import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backTo?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, backTo, action, className }: PageHeaderProps) {
  const navigate = useNavigate()
  return (
    <div className={cn('flex items-center justify-between gap-3 mb-5', className)}>
      <div className="flex items-center gap-3 min-w-0">
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 flex-shrink-0"
          >
            <ArrowLeft size={20} className="rtl:rotate-180" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
