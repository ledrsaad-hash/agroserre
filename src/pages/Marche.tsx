import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { useForm } from 'react-hook-form'
import { Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { db } from '@/db/database'
import { marcheService } from '@/services/marcheService'
import { emitSyncError } from '@/lib/syncErrors'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDateShort, todayISO } from '@/utils/formatters'
import type { PrixMarcheFormData } from '@/types/marche'

export function Marche() {
  const { t, i18n } = useTranslation()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const prix = useLiveQuery(() => db.prixMarche.orderBy('date').reverse().toArray(), []) ?? []

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<PrixMarcheFormData>({
    defaultValues: { date: todayISO() },
  })

  const handleCreate = async (data: PrixMarcheFormData) => {
    try {
      await marcheService.create({ ...data, prixKg: Number(data.prixKg) })
      reset({ date: todayISO() })
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await marcheService.delete(deleteId)
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de la suppression')
    } finally {
      setDeleteId(null)
    }
  }

  const dernier = prix[0]

  const getTrend = (index: number) => {
    if (index >= prix.length - 1) return 'neutral'
    const current = prix[index].prixKg
    const prev = prix[index + 1].prixKg
    if (current > prev) return 'up'
    if (current < prev) return 'down'
    return 'neutral'
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t('marche.titre')} />

      {dernier && (
        <Card className="bg-banana-50 border-banana-200 text-center py-6">
          <p className="text-xs font-semibold text-banana-600 uppercase tracking-wide mb-1">{t('marche.dernier_prix')}</p>
          <p className="text-5xl font-bold text-banana-700">{dernier.prixKg}</p>
          <p className="text-lg text-banana-600 mt-1">MAD / kg</p>
          {dernier.marche && <p className="text-sm text-banana-500 mt-1">{dernier.marche}</p>}
          <p className="text-xs text-banana-400 mt-0.5">{formatDateShort(dernier.date, i18n.language)}</p>
        </Card>
      )}

      <Card>
        <p className="font-bold text-gray-700 mb-4">{t('marche.ajouter')}</p>
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('common.date')} type="date" {...register('date', { required: true })} />
            <Input label={t('marche.prixKg')} type="number" step="0.01" min={0} suffix="MAD"
              {...register('prixKg', { required: true, valueAsNumber: true })} />
          </div>
          <Input label={t('marche.marche')} {...register('marche')} />
          <Input label={t('common.note')} {...register('note')} />
          <Button type="submit" fullWidth loading={isSubmitting}>{t('common.enregistrer')}</Button>
        </form>
      </Card>

      <div>
        <p className="font-bold text-gray-700 mb-3">{t('marche.historique')}</p>
        {prix.length === 0 ? (
          <EmptyState icon="💰" title={t('marche.aucun')} />
        ) : (
          <div className="space-y-2">
            {prix.map((p, index) => {
              const trend = getTrend(index)
              return (
                <Card key={p.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-banana-50 flex items-center justify-center flex-shrink-0">
                    {trend === 'up' && <TrendingUp size={18} className="text-green-500" />}
                    {trend === 'down' && <TrendingDown size={18} className="text-red-500" />}
                    {trend === 'neutral' && <Minus size={18} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{p.prixKg} MAD / kg</p>
                    <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                      <span>{formatDateShort(p.date, i18n.language)}</span>
                      {p.marche && <span>· {p.marche}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  )
}
