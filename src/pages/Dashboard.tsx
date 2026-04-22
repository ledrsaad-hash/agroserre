import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { TrendingDown, ShoppingCart, Warehouse, Store, Zap, Leaf, Weight, Scale } from 'lucide-react'
import { db } from '@/db/database'
import { calculerIndicateursGlobaux } from '@/utils/calculs'
import { formatMAD, formatROI, formatKg, formatDateShort } from '@/utils/formatters'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { VenteCard } from '@/components/vente/VenteCard'

export function Dashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const serres = useLiveQuery(() => db.serres.toArray(), []) ?? []
  const depenses = useLiveQuery(() => db.depenses.toArray(), []) ?? []
  const actions = useLiveQuery(() => db.actions.toArray(), []) ?? []
  const ventes = useLiveQuery(() => db.ventes.orderBy('date').reverse().toArray(), []) ?? []
  const dernierPrix = useLiveQuery(() => db.prixMarche.orderBy('date').last(), [])

  const indicateurs = calculerIndicateursGlobaux(serres, depenses, actions, ventes)
  const derniereVente = ventes[0]

  if (serres.length === 0) {
    return (
      <div className="pt-8">
        <div className="text-center mb-6">
          <span className="text-6xl">🌱</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">{t('app.name')}</h1>
          <p className="text-gray-400 mt-1">{t('app.tagline')}</p>
        </div>
        <EmptyState
          title={t('dashboard.aucune_serre')}
          action={{ label: t('dashboard.creer_serre'), onClick: () => navigate('/serres') }}
        />
      </div>
    )
  }

  const balanceColor = indicateurs.balance >= 0 ? 'green' : 'red'
  const roiColor = (indicateurs.roi ?? 0) >= 0 ? 'green' : 'red'

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('dashboard.titre')}
        subtitle={`${serres.length} ${t('dashboard.serres_actives')}`}
      />

      {dernierPrix && (
        <Card className="flex items-center gap-3 bg-banana-50 border-banana-200">
          <span className="text-2xl">💰</span>
          <div>
            <p className="text-xs text-banana-600 font-semibold">{t('dashboard.dernier_prix')}</p>
            <p className="text-xl font-bold text-banana-700">{dernierPrix.prixKg} MAD<span className="text-sm font-normal"> {t('dashboard.par_kg')}</span></p>
            {dernierPrix.marche && <p className="text-xs text-banana-600">{dernierPrix.marche} · {formatDateShort(dernierPrix.date, i18n.language)}</p>}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={t('indicateurs.total_depenses')}
          value={formatMAD(indicateurs.totalDepenses)}
          icon={<TrendingDown size={18} />}
          color="red"
        />
        <StatCard
          label={t('indicateurs.total_ventes')}
          value={formatMAD(indicateurs.totalVentesNettes)}
          icon={<ShoppingCart size={18} />}
          color="green"
        />
        <StatCard
          label={t('indicateurs.balance')}
          value={formatMAD(indicateurs.balance)}
          icon={<span className="text-base">{indicateurs.balance >= 0 ? '📈' : '📉'}</span>}
          color={balanceColor}
        />
        <StatCard
          label={t('indicateurs.roi')}
          value={formatROI(indicateurs.roi)}
          icon={<span className="text-base">%</span>}
          color={roiColor}
        />
        <StatCard
          label={t('indicateurs.tonnage_brut_total')}
          value={formatKg(indicateurs.tonnageBrutTotal)}
          icon={<Weight size={18} />}
          color="blue"
        />
        <StatCard
          label={t('indicateurs.poids_moyen_global')}
          value={indicateurs.poidsMoyenGlobal > 0 ? formatKg(indicateurs.poidsMoyenGlobal) : '—'}
          icon={<Scale size={18} />}
          color="yellow"
        />
      </div>

      <div>
        <p className="font-bold text-gray-700 mb-3">{t('dashboard.ajout_rapide')}</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: t('nav.depenses'), icon: <TrendingDown size={16} />, to: '/depenses' },
            { label: t('nav.ventes'), icon: <ShoppingCart size={16} />, to: '/ventes' },
            { label: t('nav.actions'), icon: <Zap size={16} />, to: '/actions' },
            { label: t('nav.intrants'), icon: <Leaf size={16} />, to: '/intrants' },
            { label: t('nav.marche'), icon: <Store size={16} />, to: '/marche' },
            { label: t('nav.serres'), icon: <Warehouse size={16} />, to: '/serres' },
          ].map(item => (
            <Button
              key={item.to}
              variant="secondary"
              size="sm"
              icon={item.icon}
              onClick={() => navigate(item.to)}
              className="justify-start"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {derniereVente && (
        <div>
          <p className="font-bold text-gray-700 mb-3">{t('dashboard.derniere_vente')}</p>
          <VenteCard vente={derniereVente} />
        </div>
      )}
    </div>
  )
}
