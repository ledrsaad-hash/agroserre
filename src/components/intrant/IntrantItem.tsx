import { useTranslation } from 'react-i18next'
import { Trash2, Pencil } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatMAD, formatDateShort } from '@/utils/formatters'
import type { Intrant } from '@/types/intrant'

interface IntrantItemProps {
  intrant: Intrant
  onEdit: () => void
  onDelete: () => void
}

export function IntrantItem({ intrant, onEdit, onDelete }: IntrantItemProps) {
  const { t, i18n } = useTranslation()

  const typeColors: Record<string, string> = {
    engrais: '#22c55e', pesticide: '#ef4444', fongicide: '#8b5cf6',
    herbicide: '#f97316', amendement: '#06b6d4', autre: '#6b7280',
  }
  const color = typeColors[intrant.typeIntrant]

  return (
    <Card className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5" style={{ backgroundColor: color + '22' }}>
        <span className="text-lg">🌿</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-900 truncate">{intrant.nomProduit}</p>
          <p className="font-bold text-red-600 flex-shrink-0 text-sm">{formatMAD(intrant.cout)}</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-1.5">
          <Badge color={color}>{t(`intrant.types.${intrant.typeIntrant}`)}</Badge>
          <span className="text-xs text-gray-500 font-medium">{intrant.quantite} {t(`intrant.unites.${intrant.unite}`)}</span>
          <span className="text-xs text-gray-400">{formatDateShort(intrant.date, i18n.language)}</span>
        </div>
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
