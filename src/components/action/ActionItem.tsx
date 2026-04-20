import { useTranslation } from 'react-i18next'
import { Trash2, Pencil } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatMAD, formatDateShort } from '@/utils/formatters'
import { ACTION_COLORS } from '@/utils/constants'
import type { Action } from '@/types/action'

interface ActionItemProps {
  action: Action
  onEdit: () => void
  onDelete: () => void
}

export function ActionItem({ action, onEdit, onDelete }: ActionItemProps) {
  const { t, i18n } = useTranslation()
  const color = ACTION_COLORS[action.type]

  const icons: Record<string, string> = {
    fertilisation: '🌿', traitement: '💊', entretien: '🔧',
    irrigation_speciale: '💧', recolte: '🍌', autre: '⚡',
  }

  return (
    <Card className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5" style={{ backgroundColor: color + '22' }}>
        <span className="text-lg">{icons[action.type]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-900 truncate">{action.description}</p>
          {action.coutAssocie ? (
            <p className="font-bold text-red-600 flex-shrink-0 text-sm">{formatMAD(action.coutAssocie)}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 mt-1.5">
          <Badge color={color}>{t(`action.types.${action.type}`)}</Badge>
          <span className="text-xs text-gray-400">{formatDateShort(action.date, i18n.language)}</span>
        </div>
        {action.note && <p className="text-xs text-gray-400 mt-1 truncate">{action.note}</p>}
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
          <Pencil size={15} />
        </button>
        <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={15} />
        </button>
      </div>
    </Card>
  )
}
