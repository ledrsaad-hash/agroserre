import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pencil, Trash2, MapPin, Layers, TreePine } from 'lucide-react'
import { db } from '@/db/database'
import { serreService } from '@/services/serreService'
import { depenseService } from '@/services/depenseService'
import { actionService } from '@/services/actionService'
import { intrantService } from '@/services/intrantService'
import { emitSyncError } from '@/lib/syncErrors'
import { calculerIndicateursSerre } from '@/utils/calculs'
import { formatMAD, formatROI } from '@/utils/formatters'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SerreForm } from '@/components/serre/SerreForm'
import { DepenseItem } from '@/components/depense/DepenseItem'
import { DepenseForm } from '@/components/depense/DepenseForm'
import { ActionItem } from '@/components/action/ActionItem'
import { ActionForm } from '@/components/action/ActionForm'
import { IntrantItem } from '@/components/intrant/IntrantItem'
import { IntrantForm } from '@/components/intrant/IntrantForm'
import { VenteCard } from '@/components/vente/VenteCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { SerreFormData } from '@/types/serre'
import type { Depense, DepenseFormData } from '@/types/depense'
import type { Action, ActionFormData } from '@/types/action'
import type { Intrant, IntrantFormData } from '@/types/intrant'
import type { Vente } from '@/types/vente'

type Tab = 'infos' | 'depenses' | 'actions' | 'intrants' | 'ventes'

export function SerreDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('infos')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addDepense, setAddDepense] = useState(false)
  const [addAction, setAddAction] = useState(false)
  const [addIntrant, setAddIntrant] = useState(false)
  const [editDepense, setEditDepense] = useState<Depense | null>(null)
  const [editAction, setEditAction] = useState<Action | null>(null)
  const [editIntrant, setEditIntrant] = useState<Intrant | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null)

  const serre = useLiveQuery(() => id ? db.serres.get(id) : undefined, [id])
  const depenses = useLiveQuery(() => id ? db.depenses.where('serreId').equals(id).reverse().sortBy('date') : [], [id]) ?? []
  const actions = useLiveQuery(() => id ? db.actions.where('serreId').equals(id).reverse().sortBy('date') : [], [id]) ?? []
  const intrants = useLiveQuery(() => id ? db.intrants.where('serreId').equals(id).reverse().sortBy('date') : [], [id]) ?? []
  const ventes = useLiveQuery(async () => {
    if (!id) return []
    const all = await db.ventes.toArray()
    return all.filter(v => v.serreIds.includes(id)).sort((a, b) => b.date.localeCompare(a.date))
  }, [id]) ?? []
  const allVentes = useLiveQuery(() => db.ventes.toArray(), []) ?? []

  if (!serre) return null

  const indicateurs = calculerIndicateursSerre(serre, depenses, [], allVentes)

  // --- Serre handlers ---
  const handleEdit = async (data: SerreFormData) => {
    try {
      await serreService.update(serre.id, data)
      setEditOpen(false)
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de la modification')
    }
  }

  const handleDelete = async () => {
    try {
      await serreService.delete(serre.id)
      navigate('/serres')
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de la suppression')
      setDeleteOpen(false)
    }
  }

  // --- Dépense handlers ---
  const handleAddDepense = async (data: DepenseFormData) => {
    try {
      await depenseService.create(data)
      setAddDepense(false)
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement')
    }
  }

  const handleEditDepense = async (data: DepenseFormData) => {
    if (!editDepense) return
    try {
      await depenseService.update(editDepense.id, data)
      setEditDepense(null)
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de la modification')
    }
  }

  // --- Action handlers ---
  const handleAddAction = async (data: ActionFormData) => {
    try {
      await actionService.create(data)
      setAddAction(false)
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement')
    }
  }

  const handleEditAction = async (data: ActionFormData) => {
    if (!editAction) return
    try {
      await actionService.update(editAction.id, data)
      setEditAction(null)
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de la modification')
    }
  }

  // --- Intrant handlers ---
  const handleAddIntrant = async (data: IntrantFormData) => {
    try {
      await intrantService.create(data)
      setAddIntrant(false)
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement')
    }
  }

  const handleEditIntrant = async (data: IntrantFormData) => {
    if (!editIntrant) return
    try {
      await intrantService.update(editIntrant.id, data)
      setEditIntrant(null)
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de la modification')
    }
  }

  // --- Delete cible (dépense/action/intrant) ---
  const handleDeleteTarget = async () => {
    if (!deleteTarget) return
    try {
      if (deleteTarget.type === 'depense') await depenseService.delete(deleteTarget.id)
      if (deleteTarget.type === 'action') await actionService.delete(deleteTarget.id)
      if (deleteTarget.type === 'intrant') await intrantService.delete(deleteTarget.id)
    } catch (e) {
      emitSyncError(e instanceof Error ? e.message : 'Erreur lors de la suppression')
    } finally {
      setDeleteTarget(null)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'infos', label: t('serre.tabs.infos') },
    { key: 'depenses', label: t('serre.tabs.depenses') },
    { key: 'actions', label: t('serre.tabs.actions') },
    { key: 'intrants', label: t('serre.tabs.intrants') },
    { key: 'ventes', label: t('serre.tabs.ventes') },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title={serre.nom}
        subtitle={serre.localisation}
        backTo="/serres"
        action={
          <div className="flex gap-2">
            <button onClick={() => setEditOpen(true)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <Pencil size={18} />
            </button>
            <button onClick={() => setDeleteOpen(true)} className="p-2 rounded-xl hover:bg-red-50 text-red-400 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        }
      />

      <div className="flex overflow-x-auto gap-1 pb-1 -mx-4 px-4 scrollbar-hide">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'infos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label={t('indicateurs.total_depenses')} value={formatMAD(indicateurs.totalDepenses)} color="red" />
            <StatCard label={t('indicateurs.total_ventes')} value={formatMAD(indicateurs.totalVentesNettes)} color="green" />
            <StatCard label={t('indicateurs.balance')} value={formatMAD(indicateurs.balance)} color={indicateurs.balance >= 0 ? 'green' : 'red'} />
            <StatCard label={t('indicateurs.roi')} value={formatROI(indicateurs.roi)} color={!indicateurs.roi || indicateurs.roi >= 0 ? 'green' : 'red'} />
          </div>
          <Card>
            <div className="space-y-3">
              {serre.localisation && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-gray-400" />{serre.localisation}
                </div>
              )}
              {serre.superficie && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Layers size={16} className="text-gray-400" />{serre.superficie} {t('serre.m2')}
                </div>
              )}
              {serre.nombrePlants && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TreePine size={16} className="text-gray-400" />{serre.nombrePlants} {t('serre.plants')}
                </div>
              )}
              {serre.notes && <p className="text-sm text-gray-500 pt-1 border-t border-gray-100">{serre.notes}</p>}
            </div>
          </Card>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label={t('indicateurs.total_regimes')} value={String(indicateurs.totalRegimes)} />
            <StatCard label={t('indicateurs.nombre_actions')} value={String(indicateurs.nombreActions)} />
            <StatCard label={t('indicateurs.poids_moyen')} value={indicateurs.poidsMoyenRegime > 0 ? indicateurs.poidsMoyenRegime.toFixed(1) + ' kg' : '—'} />
          </div>
        </div>
      )}

      {tab === 'depenses' && (
        <div className="space-y-3">
          <Button size="sm" variant="outline" onClick={() => setAddDepense(true)} className="w-full">+ {t('depense.ajouter')}</Button>
          {depenses.length === 0 ? <EmptyState title={t('depense.aucune')} /> : (depenses as Depense[]).map(d => (
            <DepenseItem key={d.id} depense={d}
              onEdit={() => setEditDepense(d)}
              onDelete={() => setDeleteTarget({ type: 'depense', id: d.id })}
            />
          ))}
        </div>
      )}

      {tab === 'actions' && (
        <div className="space-y-3">
          <Button size="sm" variant="outline" onClick={() => setAddAction(true)} className="w-full">+ {t('action.ajouter')}</Button>
          {actions.length === 0 ? <EmptyState title={t('action.aucune')} /> : (actions as Action[]).map(a => (
            <ActionItem key={a.id} action={a}
              onEdit={() => setEditAction(a)}
              onDelete={() => setDeleteTarget({ type: 'action', id: a.id })}
            />
          ))}
        </div>
      )}

      {tab === 'intrants' && (
        <div className="space-y-3">
          <Button size="sm" variant="outline" onClick={() => setAddIntrant(true)} className="w-full">+ {t('intrant.ajouter')}</Button>
          {intrants.length === 0 ? <EmptyState title={t('intrant.aucun')} /> : (intrants as Intrant[]).map(i => (
            <IntrantItem key={i.id} intrant={i}
              onEdit={() => setEditIntrant(i)}
              onDelete={() => setDeleteTarget({ type: 'intrant', id: i.id })}
            />
          ))}
        </div>
      )}

      {tab === 'ventes' && (
        <div className="space-y-3">
          {ventes.length === 0 ? <EmptyState title={t('vente.aucune')} /> : (ventes as Vente[]).map(v => <VenteCard key={v.id} vente={v} />)}
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t('serre.modifier')}>
        <SerreForm initial={serre} onSubmit={handleEdit} onCancel={() => setEditOpen(false)} />
      </Modal>

      <Modal open={addDepense} onClose={() => setAddDepense(false)} title={t('depense.ajouter')}>
        <DepenseForm defaultSerreId={serre.id} onSubmit={handleAddDepense} onCancel={() => setAddDepense(false)} />
      </Modal>
      <Modal open={!!editDepense} onClose={() => setEditDepense(null)} title={t('depense.modifier')}>
        {editDepense && <DepenseForm initial={editDepense} onSubmit={handleEditDepense} onCancel={() => setEditDepense(null)} />}
      </Modal>

      <Modal open={addAction} onClose={() => setAddAction(false)} title={t('action.ajouter')}>
        <ActionForm defaultSerreId={serre.id} onSubmit={handleAddAction} onCancel={() => setAddAction(false)} />
      </Modal>
      <Modal open={!!editAction} onClose={() => setEditAction(null)} title={t('action.modifier')}>
        {editAction && <ActionForm initial={editAction} onSubmit={handleEditAction} onCancel={() => setEditAction(null)} />}
      </Modal>

      <Modal open={addIntrant} onClose={() => setAddIntrant(false)} title={t('intrant.ajouter')}>
        <IntrantForm defaultSerreId={serre.id} onSubmit={handleAddIntrant} onCancel={() => setAddIntrant(false)} />
      </Modal>
      <Modal open={!!editIntrant} onClose={() => setEditIntrant(null)} title={t('intrant.modifier')}>
        {editIntrant && <IntrantForm initial={editIntrant} onSubmit={handleEditIntrant} onCancel={() => setEditIntrant(null)} />}
      </Modal>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} message={t('serre.confirmer_supprimer')} />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteTarget} />
    </div>
  )
}
