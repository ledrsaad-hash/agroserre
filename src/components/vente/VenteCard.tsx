import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card } from '@/components/ui/Card'
import { formatMAD, formatDateShort, formatKg } from '@/utils/formatters'
import { calculerVente } from '@/utils/calculs'
import { db } from '@/db/database'
import type { Vente } from '@/types/vente'

export function VenteCard({ vente }: { vente: Vente }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const calculs = calculerVente(vente)
  const serres = useLiveQuery(() => db.serres.toArray(), []) ?? []

  const nomSerres = vente.serreIds
    .map(id => serres.find(s => s.id === id)?.nom ?? '?')
    .join(', ')

  return (
    <Card onClick={() => navigate(`/ventes/${vente.id}`)} className="flex items-start gap-3">
      <div className="w-12 h-12 bg-banana-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl">
        🍌
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{nomSerres}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDateShort(vente.date, i18n.language)}</p>
          </div>
          <ChevronRight size={18} className="text-gray-300 rtl:rotate-180 flex-shrink-0 mt-1" />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          <div>
            <p className="text-xs text-gray-400">{t('vente.tonnageNet')}</p>
            <p className="text-sm font-semibold text-gray-700">{formatKg(calculs.tonnageNet)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">{t('vente.totalNet')}</p>
            <p className="text-sm font-bold text-primary-600">{formatMAD(calculs.totalNet)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">{t('vente.nombreRegimes')}</p>
            <p className="text-sm font-semibold text-gray-700">{vente.nombreRegimesTotal} {t('vente.regimes')}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
