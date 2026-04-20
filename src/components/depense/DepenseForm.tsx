import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { todayISO } from '@/utils/formatters'
import { CATEGORIES_DEPENSE, MODES_PAIEMENT } from '@/utils/constants'
import { db } from '@/db/database'
import type { Depense, DepenseFormData } from '@/types/depense'

interface DepenseFormProps {
  initial?: Depense
  defaultSerreId?: string
  onSubmit: (data: DepenseFormData) => Promise<void>
  onCancel: () => void
}

export function DepenseForm({ initial, defaultSerreId, onSubmit, onCancel }: DepenseFormProps) {
  const { t } = useTranslation()
  const serres = useLiveQuery(() => db.serres.toArray(), []) ?? []

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DepenseFormData>({
    defaultValues: initial ?? {
      date: todayISO(),
      devise: 'MAD',
      serreId: defaultSerreId ?? null,
    },
  })

  const serreOptions = [
    { value: '', label: t('depense.depense_globale') },
    ...serres.map(s => ({ value: s.id, label: s.nom })),
  ]

  const categorieOptions = CATEGORIES_DEPENSE.map(c => ({
    value: c,
    label: t(`depense.categories.${c}`),
  }))

  const paiementOptions = MODES_PAIEMENT.map(p => ({
    value: p,
    label: t(`depense.paiement.${p}`),
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('common.date')}
          type="date"
          error={errors.date?.message}
          {...register('date', { required: t('validation.requis') })}
        />
        <Input
          label={t('common.montant')}
          type="number"
          step="0.01"
          min={0}
          suffix="MAD"
          error={errors.montant?.message}
          {...register('montant', {
            required: t('validation.requis'),
            valueAsNumber: true,
            min: { value: 0, message: t('validation.montant_positif') },
          })}
        />
      </div>
      <Select
        label={t('depense.categorie')}
        options={categorieOptions}
        error={errors.categorie?.message}
        {...register('categorie', { required: t('validation.requis') })}
      />
      <Input label={t('depense.sousType')} {...register('sousType')} />
      <Input
        label={t('common.description')}
        error={errors.description?.message}
        {...register('description', { required: t('validation.requis') })}
      />
      <Select
        label={t('depense.serre')}
        options={serreOptions}
        placeholder=""
        {...register('serreId')}
      />
      <Select
        label={t('depense.modePaiement')}
        options={paiementOptions}
        placeholder={t('common.selectionner')}
        {...register('modePaiement')}
      />
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
