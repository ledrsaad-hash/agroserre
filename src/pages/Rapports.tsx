import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { db } from '@/db/database'
import { calculerIndicateursGlobaux, calculerIndicateursSerre } from '@/utils/calculs'
import { formatMAD, formatROI } from '@/utils/formatters'
import { CATEGORIE_COLORS } from '@/utils/constants'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'

export function Rapports() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'global' | 'serre'>('global')
  const [serreId, setSerreId] = useState<string>('')

  const serres = useLiveQuery(() => db.serres.toArray(), []) ?? []
  const depenses = useLiveQuery(() => db.depenses.toArray(), []) ?? []
  const actions = useLiveQuery(() => db.actions.toArray(), []) ?? []
  const ventes = useLiveQuery(() => db.ventes.toArray(), []) ?? []

  const indicateursGlobaux = calculerIndicateursGlobaux(serres, depenses, actions, ventes)

  const selectedSerre = serres.find(s => s.id === serreId)
  const indicateursSerre = selectedSerre
    ? calculerIndicateursSerre(selectedSerre, depenses, actions, ventes)
    : null

  const serreOptions = serres.map(s => ({ value: s.id, label: s.nom }))

  const pieData = Object.entries(indicateursGlobaux.parCategorie)
    .map(([key, value]) => ({
      name: t(`depense.categories.${key}`),
      value,
      color: CATEGORIE_COLORS[key as keyof typeof CATEGORIE_COLORS],
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const barData = indicateursGlobaux.parSerre.map(s => ({
    name: s.nomSerre,
    depenses: Math.round(s.totalDepenses),
    ventes: Math.round(s.totalVentesNettes),
  }))

  if (serres.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader title={t('rapports.titre')} />
        <EmptyState icon="📊" title={t('rapports.aucune_donnee')} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t('rapports.titre')} />

      <div className="flex gap-3">
        {(['global', 'serre'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
              mode === m ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'
            }`}
          >
            {t(`rapports.${m === 'global' ? 'global' : 'par_serre'}`)}
          </button>
        ))}
      </div>

      {mode === 'serre' && (
        <Select
          label={t('rapports.selectionner_serre')}
          options={serreOptions}
          placeholder={t('common.selectionner')}
          value={serreId}
          onChange={e => setSerreId(e.target.value)}
        />
      )}

      {mode === 'global' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label={t('indicateurs.total_depenses')} value={formatMAD(indicateursGlobaux.totalDepenses)} color="red" />
            <StatCard label={t('indicateurs.total_ventes')} value={formatMAD(indicateursGlobaux.totalVentesNettes)} color="green" />
            <StatCard label={t('indicateurs.balance')} value={formatMAD(indicateursGlobaux.balance)} color={indicateursGlobaux.balance >= 0 ? 'green' : 'red'} />
            <StatCard label={t('indicateurs.roi')} value={formatROI(indicateursGlobaux.roi)} color={!indicateursGlobaux.roi || indicateursGlobaux.roi >= 0 ? 'green' : 'red'} />
          </div>

          {pieData.length > 0 && (
            <Card>
              <p className="font-bold text-gray-700 mb-4">{t('rapports.depenses_categories')}</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatMAD(v)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {barData.length > 1 && (
            <Card>
              <p className="font-bold text-gray-700 mb-4">{t('rapports.comparaison_serres')}</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => formatMAD(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="depenses" name={t('indicateurs.total_depenses')} fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ventes" name={t('indicateurs.total_ventes')} fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {mode === 'serre' && indicateursSerre && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label={t('indicateurs.total_depenses')} value={formatMAD(indicateursSerre.totalDepenses)} color="red" />
            <StatCard label={t('indicateurs.total_ventes')} value={formatMAD(indicateursSerre.totalVentesNettes)} color="green" />
            <StatCard label={t('indicateurs.balance')} value={formatMAD(indicateursSerre.balance)} color={indicateursSerre.balance >= 0 ? 'green' : 'red'} />
            <StatCard label={t('indicateurs.roi')} value={formatROI(indicateursSerre.roi)} color={!indicateursSerre.roi || indicateursSerre.roi >= 0 ? 'green' : 'red'} />
            <StatCard label={t('indicateurs.total_regimes')} value={String(indicateursSerre.totalRegimes)} />
            <StatCard label={t('indicateurs.poids_moyen')} value={indicateursSerre.poidsMoyenRegime > 0 ? indicateursSerre.poidsMoyenRegime.toFixed(1) + ' kg' : '—'} />
          </div>
        </div>
      )}

      {mode === 'serre' && !indicateursSerre && (
        <EmptyState icon="📊" title={t('rapports.selectionner_serre')} />
      )}
    </div>
  )
}
