import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus } from 'lucide-react'
import { db } from '@/db/database'
import { depenseService } from '@/services/depenseService'
import { emitSyncError } from '@/lib/syncErrors'
import { PageHeader } from '@/components/layout/PageHeader'
import { DepenseItem } from '@/components/depense/DepenseItem'
import { DepenseForm } from '@/components/depense/DepenseForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatMAD } from '@/utils/formatters'
import { CATEGORIES_DEPENSE } from '@/utils/constants'
import type { Depense, DepenseFormData, CategorieDepense } from '@/types/depense'

export function Depenses() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<Depense | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filtreCategorie, setFiltreCategorie] = useState<CategorieDepense | 'tout'>('tout')
  const [filtreSerreId, setFiltreSerreId] = useState<string | 'tout'>('tout')

  const depenses = useLiveQuery(() => db.depenses.orderBy('date').reverse().toArray(), []) ?? []
  const serres = useLiveQuery(() => db.serres.toArray(), []) ?? []

  const filtered = depenses.filter(d => {
    const catOk = filtreCategorie === 'tout' || d.categorie === filtreCategorie
    const serreOk = filtreSerreId === 'tout' || d.serreId === filtreSerreId || (filtreSerreId === '' && d.serreId === null)
    return catOk && serreOk
  })

  const total = filtered.reduce((s, d) => s + d.montant, 0)

  const handleCreate = async (data: DepenseFormData) => {
    try {
      await depenseService.create({ ...data, serreId: data.serreId || null })
      setOpen(false)
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement')
    }
  }

  const handleEdit = async (data: DepenseFormData) => {
    if (!editItem) return
    try {
      await depenseService.update(editItem.id, { ...data, serreId: data.serreId || null })
      setEditItem(null)
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de la modification')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await depenseService.delete(deleteId)
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de la suppression')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('depense.titre')}
        subtitle={`${t('common.total')} : ${formatMAD(total)}`}
        action={
          <Button size="sm" icon={<Plus size={16} />} onClick={() => setOpen(true)}>
            {t('common.ajouter')}
          </Button>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setFiltreCategorie('tout')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filtreCategorie === 'tout' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          {t('common.tout')}
        </button>
        {CATEGORIES_DEPENSE.map(cat => (
          <button
            key={cat}
            onClick={() => setFiltreCategorie(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filtreCategorie === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'}`}
          >
            {t(`depense.categories.${cat}`)}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setFiltreSerreId('tout')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filtreSerreId === 'tout' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          {t('common.tout')}
        </button>
        {serres.map(s => (
          <button
            key={s.id}
            onClick={() => setFiltreSerreId(s.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filtreSerreId === s.id ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'}`}
          >
            {s.nom}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="💰" title={t('depense.aucune')} action={{ label: t('depense.ajouter'), onClick: () => setOpen(true) }} />
      ) : (
        <div className="space-y-3">
          {filtered.map(d => (
            <DepenseItem key={d.id} depense={d}
              onEdit={() => setEditItem(d)}
              onDelete={() => setDeleteId(d.id)}
            />
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t('depense.ajouter')}>
        <DepenseForm onSubmit={handleCreate} onCancel={() => setOpen(false)} />
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={t('depense.modifier')}>
        {editItem && <DepenseForm initial={editItem} onSubmit={handleEdit} onCancel={() => setEditItem(null)} />}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  )
}
