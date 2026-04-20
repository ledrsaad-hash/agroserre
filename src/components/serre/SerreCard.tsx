import { useTranslation } from 'react-i18next'
import { ChevronRight, MapPin, Layers } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import type { Serre } from '@/types/serre'

export function SerreCard({ serre }: { serre: Serre }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Card onClick={() => navigate(`/serres/${serre.id}`)} className="flex items-center gap-4">
      <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl">
        🌱
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 truncate">{serre.nom}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
          {serre.localisation && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={12} /> {serre.localisation}
            </span>
          )}
          {serre.superficie && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Layers size={12} /> {serre.superficie} {t('serre.m2')}
            </span>
          )}
          {serre.nombrePlants && (
            <span className="text-xs text-gray-400">
              {serre.nombrePlants} {t('serre.plants')}
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-300 rtl:rotate-180 flex-shrink-0" />
    </Card>
  )
}
