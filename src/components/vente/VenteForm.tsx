import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { VenteCalculs } from './VenteCalculs'
import { todayISO } from '@/utils/formatters'
import { calculerVente } from '@/utils/calculs'
import { POURCENTAGE_CHARGES_DEFAULT } from '@/utils/constants'
import { db } from '@/db/database'
import type { Vente, VenteFormData } from '@/types/vente'

interface VenteFormProps {
  initial?: Vente
  onSubmit: (data: VenteFormData) => Promise<void>
  onCancel: () => void
}

export function VenteForm({ initial, onSubmit, onCancel }: VenteFormProps) {
  const { t } = useTranslation()
  const serres = useLiveQuery(() => db.serres.toArray(), []) ?? []
  const [typeAffectation, setTypeAffectation] = useState<'mono_serre' | 'multi_serres'>(
    initial?.typeAffectation ?? 'mono_serre'
  )
  const [liveCalculs, setLiveCalculs] = useState<ReturnType<typeof calculerVente> | null>(null)

  const { register, handleSubmit, watch, setValue, control, formState: { errors, isSubmitting } } = useForm<VenteFormData>({
    defaultValues: initial ?? {
      date: todayISO(),
      typeAffectation: 'mono_serre',
      serreIds: [],
      repartitions: [{ serreId: '', nombreRegimes: 0 }],
      pourcentageCharges: POURCENTAGE_CHARGES_DEFAULT,
      nombreRegimesTotal: 0,
      tonnageBrutTotal: 0,
      prixAuKg: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'repartitions' })

  const watched = watch(['tonnageBrutTotal', 'prixAuKg', 'pourcentageCharges',
    'chargesFixes.travailleur', 'chargesFixes.courtier', 'chargesFixes.transport', 'chargesFixes.autre',
    'nombreRegimesTotal'])

  useEffect(() => {
    const [tonnage, prix, pct, trav, court, transp, autre, regimes] = watched
    if (tonnage > 0 && prix > 0) {
      setLiveCalculs(calculerVente({
        tonnageBrutTotal: Number(tonnage), prixAuKg: Number(prix),
        pourcentageCharges: Number(pct) || 0, nombreRegimesTotal: Number(regimes) || 0,
        chargesFixes: {
          travailleur: Number(trav) || 0, courtier: Number(court) || 0,
          transport: Number(transp) || 0, autre: Number(autre) || 0,
        },
      } as Vente))
    } else {
      setLiveCalculs(null)
    }
  }, [JSON.stringify(watched)])

  const serreOptions = serres.map(s => ({ value: s.id, label: s.nom }))

  const handleTypeChange = (type: 'mono_serre' | 'multi_serres') => {
    setTypeAffectation(type)
    setValue('typeAffectation', type)
    if (type === 'mono_serre') {
      setValue('repartitions', [{ serreId: '', nombreRegimes: 0 }])
    }
  }

  const handleSerreSelect = (serreId: string, checked: boolean) => {
    const current = watch('serreIds') ?? []
    const updated = checked ? [...current, serreId] : current.filter(id => id !== serreId)
    setValue('serreIds', updated)
    if (checked) {
      append({ serreId, nombreRegimes: 0 })
    } else {
      const idx = fields.findIndex(f => f.serreId === serreId)
      if (idx !== -1) remove(idx)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input
        label={t('common.date')}
        type="date"
        error={errors.date?.message}
        {...register('date', { required: t('validation.requis') })}
      />

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">{t('vente.typeAffectation')}</p>
        <div className="flex gap-3">
          {(['mono_serre', 'multi_serres'] as const).map(type => (
            <button
              key={type} type="button"
              onClick={() => handleTypeChange(type)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                typeAffectation === type
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {t(`vente.${type}`)}
            </button>
          ))}
        </div>
      </div>

      {typeAffectation === 'mono_serre' ? (
        <Select
          label={t('vente.serre')}
          options={serreOptions}
          placeholder={t('common.selectionner')}
          error={errors.repartitions?.[0]?.serreId?.message}
          {...register('repartitions.0.serreId', { required: t('validation.requis') })}
          onChange={e => { setValue('serreIds', [e.target.value]); setValue('repartitions.0.serreId', e.target.value) }}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-gray-700">{t('vente.serres')}</p>
          {serres.map(serre => (
            <label key={serre.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 accent-primary-600"
                onChange={e => handleSerreSelect(serre.id, e.target.checked)}
                defaultChecked={initial?.serreIds.includes(serre.id)}
              />
              <span className="font-medium text-gray-700">{serre.nom}</span>
            </label>
          ))}
        </div>
      )}

      {typeAffectation === 'multi_serres' && fields.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
          <p className="text-sm font-semibold text-gray-700">{t('vente.repartition')}</p>
          <p className="text-xs text-gray-400">{t('vente.repartition_helper')}</p>
          {fields.map((field, index) => {
            const nom = serres.find(s => s.id === field.serreId)?.nom ?? field.serreId
            return (
              <div key={field.id} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 flex-1 truncate">{nom}</span>
                <Input
                  type="number"
                  min={0}
                  suffix={t('vente.regimes')}
                  className="w-28"
                  {...register(`repartitions.${index}.nombreRegimes`, { valueAsNumber: true })}
                />
              </div>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('vente.nombreRegimes')}
          type="number"
          min={0}
          error={errors.nombreRegimesTotal?.message}
          {...register('nombreRegimesTotal', { required: t('validation.requis'), valueAsNumber: true, min: { value: 1, message: t('validation.nombre_regimes') } })}
        />
        <Input
          label={t('vente.tonnageBrut')}
          type="number"
          step="0.1"
          min={0}
          suffix="kg"
          error={errors.tonnageBrutTotal?.message}
          {...register('tonnageBrutTotal', { required: t('validation.requis'), valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('vente.prixKg')}
          type="number"
          step="0.01"
          min={0}
          suffix="MAD"
          error={errors.prixAuKg?.message}
          {...register('prixAuKg', { required: t('validation.requis'), valueAsNumber: true })}
        />
        <Input
          label={t('vente.pourcentageCharges')}
          type="number"
          step="0.1"
          min={0}
          max={100}
          suffix="%"
          {...register('pourcentageCharges', { valueAsNumber: true })}
        />
      </div>

      <div className="bg-gray-50 rounded-2xl p-3 space-y-3">
        <p className="text-sm font-semibold text-gray-700">{t('vente.chargesFixes')}</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('vente.travailleur')} type="number" step="0.01" min={0} suffix="MAD" {...register('chargesFixes.travailleur', { valueAsNumber: true })} />
          <Input label={t('vente.courtier')} type="number" step="0.01" min={0} suffix="MAD" {...register('chargesFixes.courtier', { valueAsNumber: true })} />
          <Input label={t('vente.transport')} type="number" step="0.01" min={0} suffix="MAD" {...register('chargesFixes.transport', { valueAsNumber: true })} />
          <Input label={t('vente.autre')} type="number" step="0.01" min={0} suffix="MAD" {...register('chargesFixes.autre', { valueAsNumber: true })} />
        </div>
      </div>

      {liveCalculs && <VenteCalculs calculs={liveCalculs} />}

      <Input label={t('vente.acheteur')} {...register('acheteur')} />
      <Input label={t('vente.lieuVente')} {...register('lieuVente')} />
      <Textarea label={t('common.note')} {...register('note')} />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          {t('common.annuler')}
        </Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          {t('common.enregistrer')}
        </Button>
      </div>
    </form>
  )
}
