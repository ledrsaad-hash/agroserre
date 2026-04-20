import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { todayISO } from '@/utils/formatters'
import type { Serre, SerreFormData } from '@/types/serre'

interface SerreFormProps {
  initial?: Serre
  onSubmit: (data: SerreFormData) => Promise<void>
  onCancel: () => void
}

export function SerreForm({ initial, onSubmit, onCancel }: SerreFormProps) {
  const { t } = useTranslation()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SerreFormData>({
    defaultValues: initial ?? { dateCreation: todayISO() },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label={t('serre.nom')}
        error={errors.nom?.message}
        {...register('nom', { required: t('validation.requis') })}
      />
      <Input label={t('serre.localisation')} {...register('localisation')} />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('serre.superficie')}
          type="number"
          suffix="m²"
          min={0}
          {...register('superficie', { valueAsNumber: true })}
        />
        <Input
          label={t('serre.nombrePlants')}
          type="number"
          min={0}
          {...register('nombrePlants', { valueAsNumber: true })}
        />
      </div>
      <Input
        label={t('serre.dateCreation')}
        type="date"
        error={errors.dateCreation?.message}
        {...register('dateCreation', { required: t('validation.requis') })}
      />
      <Textarea label={t('serre.notes')} {...register('notes')} />
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
