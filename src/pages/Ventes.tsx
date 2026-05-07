import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus } from 'lucide-react'
import { db } from '@/db/database'
import { venteService } from '@/services/venteService'
import { emitSyncError } from '@/lib/syncErrors'
import { PageHeader } from '@/components/layout/PageHeader'
import { VenteCard } from '@/components/vente/VenteCard'
import { VenteForm } from '@/components/vente/VenteForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { calculerVente } from '@/utils/calculs'
import { formatMAD } from '@/utils/formatters'
import type { VenteFormData } from '@/types/vente'

export function Ventes() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const ventes = useLiveQuery(() => db.ventes.orderBy('date').reverse().toArray(), []) ?? []
  const totalNet = ventes.reduce((s, v) => s + calculerVente(v).totalNet, 0)

  const handleCreate = async (data: VenteFormData) => {
    const repartitions = data.typeAffectation === 'mono_serre'
      ? [{ serreId: data.repartitions[0]?.serreId ?? data.serreIds[0], nombreRegimes: data.nombreRegimesTotal }]
      : data.repartitions
    try {
      await venteService.create({ ...data, repartitions })
      setOpen(false)
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('vente.titre')}
        subtitle={`${t('common.total')} : ${formatMAD(totalNet)}`}
        action={<Button size="sm" icon={<Plus size={16} />} onClick={() => setOpen(true)}>{t('common.ajouter')}</Button>}
      />

      {ventes.length === 0 ? (
        <EmptyState icon="🍌" title={t('vente.aucune')} action={{ label: t('vente.ajouter'), onClick: () => setOpen(true) }} />
      ) : (
        <div className="space-y-3">
          {ventes.map(v => <VenteCard key={v.id} vente={v} />)}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t('vente.ajouter')} size="lg">
        <VenteForm onSubmit={handleCreate} onCancel={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
