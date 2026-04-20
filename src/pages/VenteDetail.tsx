import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pencil, Trash2 } from 'lucide-react'
import { db } from '@/db/database'
import { venteService } from '@/services/venteService'
import { calculerVente } from '@/utils/calculs'
import { formatKg, formatDateShort } from '@/utils/formatters'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { VenteForm } from '@/components/vente/VenteForm'
import { VenteCalculs } from '@/components/vente/VenteCalculs'
import type { VenteFormData, VenteSerreRepartition } from '@/types/vente'
import type { Serre } from '@/types/serre'

export function VenteDetail() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const vente = useLiveQuery(() => id ? db.ventes.get(id) : undefined, [id])
  const serres = (useLiveQuery(() => db.serres.toArray(), []) ?? []) as Serre[]

  if (!vente) return null

  const calculs = calculerVente(vente)
  const nomSerres = vente.serreIds
    .map((sid: string) => serres.find(s => s.id === sid)?.nom ?? '?')
    .join(', ')

  const handleEdit = async (data: VenteFormData) => {
    await venteService.update(vente.id, data)
    setEditOpen(false)
  }

  const handleDelete = async () => {
    await venteService.delete(vente.id)
    navigate('/ventes')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('vente.detail')}
        subtitle={formatDateShort(vente.date, i18n.language)}
        backTo="/ventes"
        action={
          <div className="flex gap-2">
            <button onClick={() => setEditOpen(true)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <Pencil size={18} />
            </button>
            <button onClick={() => setDeleteOpen(true)} className="p-2 rounded-xl hover:bg-red-50 text-red-400">
              <Trash2 size={18} />
            </button>
          </div>
        }
      />

      <Card>
        <div className="space-y-2 text-sm">
          <Row label={t('vente.serres')} value={nomSerres} />
          <Row label={t('vente.nombreRegimes')} value={`${vente.nombreRegimesTotal} ${t('vente.regimes')}`} />
          <Row label={t('vente.prixKg')} value={`${vente.prixAuKg} MAD`} />
          {vente.acheteur && <Row label={t('vente.acheteur')} value={vente.acheteur} />}
          {vente.lieuVente && <Row label={t('vente.lieuVente')} value={vente.lieuVente} />}
          {vente.note && <Row label={t('common.note')} value={vente.note} />}
        </div>
      </Card>

      <VenteCalculs calculs={calculs} />

      {vente.typeAffectation === 'multi_serres' && vente.repartitions.length > 0 && (
        <Card>
          <p className="font-bold text-gray-700 mb-3 text-sm">{t('vente.repartition')}</p>
          <div className="space-y-2">
            {(vente.repartitions as VenteSerreRepartition[]).map(rep => {
              const nom = serres.find(s => s.id === rep.serreId)?.nom ?? rep.serreId
              const poidsMoyen = vente.nombreRegimesTotal > 0
                ? vente.tonnageBrutTotal / vente.nombreRegimesTotal
                : 0
              const tonnage = rep.nombreRegimes * poidsMoyen
              return (
                <div key={rep.serreId} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 font-medium">{nom}</span>
                  <div className="text-end">
                    <p className="font-semibold">{rep.nombreRegimes} {t('vente.regimes')}</p>
                    <p className="text-xs text-gray-400">{formatKg(tonnage)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t('vente.modifier')} size="lg">
        <VenteForm initial={vente} onSubmit={handleEdit} onCancel={() => setEditOpen(false)} />
      </Modal>
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-800 text-end">{value}</span>
    </div>
  )
}
