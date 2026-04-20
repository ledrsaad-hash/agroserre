import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { todayISO } from '@/utils/formatters'
import { TYPES_INTRANT, UNITES_INTRANT } from '@/utils/constants'
import { db } from '@/db/database'
import type { Intrant, IntrantFormData } from '@/types/intrant'

interface IntrantFormProps {
  initial?: Intrant
  defaultSerreId?: string
  onSubmit: (data: IntrantFormData) => Promise<void>
  onCancel: () => void
}

export function IntrantForm({ initial, defaultSerreId, onSubmit, onCancel }: IntrantFormProps) {
  const { t } = useTranslation()
  const serres = useLiveQuery(() => db.serres.toArray(), []) ?? []

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<IntrantFormData>({
    defaultValues: initial ?? { date: todayISO(), serreId: defaultSerreId ?? '', unite: 'kg' },
  })

  const typeOptions = TYPES_INTRANT.map(type => ({ value: type, label: t(`intrant.types.${type}`) }))
  const uniteOptions = UNITES_INTRANT.map(u => ({ value: u, label: t(`intrant.unites.${u}`) }))
  const serreOptions = serres.map(s => ({ value: s.id, label: s.nom }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label={t('common.date')}
        type="date"
        error={errors.date?.message}
        {...register('date', { required: t('validation.requis') })}
      />
      <Select
        label={t('intrant.serre')}
        options={serreOptions}
        placeholder={t('common.selectionner')}
        error={errors.serreId?.message}
        {...register('serreId', { required: t('validation.requis') })}
      />
      <Select
        label={t('intrant.typeIntrant')}
        options={typeOptions}
        placeholder={t('common.selectionner')}
        error={errors.typeIntrant?.message}
        {...register('typeIntrant', { required: t('validation.requis') })}
      />
      <Input
        label={t('intrant.nomProduit')}
        error={errors.nomProduit?.message}
        {...register('nomProduit', { required: t('validation.requis') })}
      />
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Input
            label={t('intrant.quantite')}
            type="number"
            step="0.01"
            min={0}
            error={errors.quantite?.message}
            {...register('quantite', {
              required: t('validation.requis'),
              valueAsNumber: true,
              min: { value: 0, message: t('validation.quantite_positive') },
            })}
          />
        </div>
        <Select
          label={t('intrant.unite')}
          options={uniteOptions}
          {...register('unite')}
        />
      </div>
      <Input
        label={t('intrant.cout')}
        type="number"
        step="0.01"
        min={0}
        suffix="MAD"
        error={errors.cout?.message}
        {...register('cout', { required: t('validation.requis'), valueAsNumber: true })}
      />
      <Input label={t('intrant.modeApplication')} {...register('modeApplication')} />
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
