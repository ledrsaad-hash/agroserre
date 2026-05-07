import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus } from 'lucide-react'
import { db } from '@/db/database'
import { serreService } from '@/services/serreService'
import { emitSyncError } from '@/lib/syncErrors'
import { PageHeader } from '@/components/layout/PageHeader'
import { SerreCard } from '@/components/serre/SerreCard'
import { SerreForm } from '@/components/serre/SerreForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { SerreFormData } from '@/types/serre'

export function Serres() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const serres = useLiveQuery(() => db.serres.orderBy('createdAt').reverse().toArray(), []) ?? []

  const handleCreate = async (data: SerreFormData) => {
    try {
      await serreService.create(data)
      setOpen(false)
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement')
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('serre.titre')}
        action={
          <Button size="sm" icon={<Plus size={16} />} onClick={() => setOpen(true)}>
            {t('common.ajouter')}
          </Button>
        }
      />

      {serres.length === 0 ? (
        <EmptyState
          icon="🌱"
          title={t('serre.aucune')}
          action={{ label: t('serre.ajouter'), onClick: () => setOpen(true) }}
        />
      ) : (
        <div className="space-y-3">
          {serres.map(serre => <SerreCard key={serre.id} serre={serre} />)}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t('serre.ajouter')}>
        <SerreForm onSubmit={handleCreate} onCancel={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
