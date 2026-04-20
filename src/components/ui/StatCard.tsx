import { cn } from '@/utils/cn'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon?: React.ReactNode
  color?: 'green' | 'red' | 'blue' | 'yellow' | 'gray'
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ label, value, sub, icon, color = 'gray' }: StatCardProps) {
  const colors = {
    green:  'bg-primary-50 text-primary-700',
    red:    'bg-red-50 text-red-700',
    blue:   'bg-blue-50 text-blue-700',
    yellow: 'bg-banana-50 text-banana-600',
    gray:   'bg-gray-50 text-gray-700',
  }

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        {icon && (
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', colors[color])}>
            {icon}
          </div>
        )}
      </div>
      <p className={cn('text-xl font-bold', color === 'gray' ? 'text-gray-900' : colors[color].split(' ')[1])}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </Card>
  )
}
