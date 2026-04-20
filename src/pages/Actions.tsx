import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus } from 'lucide-react'
import { db } from '@/db/database'
import { actionService } from '@/services/actionService'
import { PageHeader } from '@/components/layout/PageHeader'
import { ActionItem } from '@/components/action/ActionItem'
import { ActionForm } from '@/components/action/ActionForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { TYPES_ACTION } from '@/utils/constants'
import type { Action, ActionFormData, TypeAction } from '@/types/action'

export function Actions() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<Action | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filtreType, setFiltreType] = useState<TypeAction | 'tout'>('tout')
  const [filtreSerreId, setFiltreSerreId] = useState<string | 'tout'>('tout')

  const actions = useLiveQuery(() => db.actions.orderBy('date').reverse().toArray(), []) ?? []
  const serres = useLiveQuery(() => db.serres.toArray(), []) ?? []

  const filtered = actions.filter(a => {
    const typeOk = filtreType === 'tout' || a.type === filtreType
    const serreOk = filtreSerreId === 'tout' || a.serreId === filtreSerreId
    return typeOk && serreOk
  })

  const handleCreate = async (data: ActionFormData) => {
    await actionService.create(data)
    setOpen(false)
  }

  const handleEdit = async (data: ActionFormData) => {
    if (!editItem) return
    await actionService.update(editItem.id, data)
    setEditItem(null)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('action.titre')}
        action={<Button size="sm" icon={<Plus size={16} />} onClick={() => setOpen(true)}>{t('common.ajouter')}</Button>}
      />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        <button onClick={() => setFiltreType('tout')} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filtreType === 'tout' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{t('common.tout')}</button>
        {TYPES_ACTION.map(type => (
          <button key={type} onClick={() => setFiltreType(type)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filtreType === type ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{t(`action.types.${type}`)}</button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        <button onClick={() => setFiltreSerreId('tout')} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filtreSerreId === 'tout' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'}`}>{t('common.tout')}</button>
        {serres.map(s => (
          <button key={s.id} onClick={() => setFiltreSerreId(s.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filtreSerreId === s.id ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-500'}`}>{s.nom}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="⚡" title={t('action.aucune')} action={{ label: t('action.ajouter'), onClick: () => setOpen(true) }} />
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <ActionItem key={a.id} action={a}
              onEdit={() => setEditItem(a)}
              onDelete={() => setDeleteId(a.id)}
            />
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t('action.ajouter')}>
        <ActionForm onSubmit={handleCreate} onCancel={() => setOpen(false)} />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={t('action.modifier')}>
        {editItem && <ActionForm initial={editItem} onSubmit={handleEdit} onCancel={() => setEditItem(null)} />}
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={async () => { if (deleteId) await actionService.delete(deleteId); setDeleteId(null) }}
      />
    </div>
  )
}
