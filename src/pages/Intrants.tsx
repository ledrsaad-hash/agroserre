import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus } from 'lucide-react'
import { db } from '@/db/database'
import { intrantService } from '@/services/intrantService'
import { PageHeader } from '@/components/layout/PageHeader'
import { IntrantItem } from '@/components/intrant/IntrantItem'
import { IntrantForm } from '@/components/intrant/IntrantForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatMAD } from '@/utils/formatters'
import type { Intrant, IntrantFormData } from '@/types/intrant'

export function Intrants() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<Intrant | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filtreSerreId, setFiltreSerreId] = useState<string | 'tout'>('tout')

  const intrants = useLiveQuery(() => db.intrants.orderBy('date').reverse().toArray(), []) ?? []
  const serres = useLiveQuery(() => db.serres.toArray(), []) ?? []

  const filtered = filtreSerreId === 'tout' ? intrants : intrants.filter(i => i.serreId === filtreSerreId)
  const totalCout = filtered.reduce((s, i) => s + i.cout, 0)

  const handleCreate = async (data: IntrantFormData) => {
    await intrantService.create(data)
    setOpen(false)
  }

  const handleEdit = async (data: IntrantFormData) => {
    if (!editItem) return
    await intrantService.update(editItem.id, data)
    setEditItem(null)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('intrant.titre')}
        subtitle={`${t('common.total')} : ${formatMAD(totalCout)}`}
        action={<Button size="sm" icon={<Plus size={16} />} onClick={() => setOpen(true)}>{t('common.ajouter')}</Button>}
      />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        <button onClick={() => setFiltreSerreId('tout')} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filtreSerreId === 'tout' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'}`}>{t('common.tout')}</button>
        {serres.map(s => (
          <button key={s.id} onClick={() => setFiltreSerreId(s.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filtreSerreId === s.id ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'}`}>{s.nom}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🌿" title={t('intrant.aucun')} action={{ label: t('intrant.ajouter'), onClick: () => setOpen(true) }} />
      ) : (
        <div className="space-y-3">
          {filtered.map(i => (
            <IntrantItem key={i.id} intrant={i}
              onEdit={() => setEditItem(i)}
              onDelete={() => setDeleteId(i.id)}
            />
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t('intrant.ajouter')}>
        <IntrantForm onSubmit={handleCreate} onCancel={() => setOpen(false)} />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={t('intrant.modifier')}>
        {editItem && <IntrantForm initial={editItem} onSubmit={handleEdit} onCancel={() => setEditItem(null)} />}
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={async () => { if (deleteId) await intrantService.delete(deleteId); setDeleteId(null) }}
      />
    </div>
  )
}
