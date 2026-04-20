import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { todayISO } from '@/utils/formatters'
import { TYPES_ACTION } from '@/utils/constants'
import { db } from '@/db/database'
import type { Action, ActionFormData } from '@/types/action'

interface ActionFormProps {
  initial?: Action
  defaultSerreId?: string
  onSubmit: (data: ActionFormData) => Promise<void>
  onCancel: () => void
}

export function ActionForm({ initial, defaultSerreId, onSubmit, onCancel }: ActionFormProps) {
  const { t } = useTranslation()
  const serres = useLiveQuery(() => db.serres.toArray(), []) ?? []

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ActionFormData>({
    defaultValues: initial ?? { date: todayISO(), serreId: defaultSerreId ?? '' },
  })

  const typeOptions = TYPES_ACTION.map(type => ({ value: type, label: t(`action.types.${type}`) }))
  const serreOptions = serres.map(s => ({ value: s.id, label: s.nom }))

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
          label={t('action.coutAssocie')}
          type="number"
          step="0.01"
          min={0}
          suffix="MAD"
          {...register('coutAssocie', { valueAsNumber: true })}
        />
      </div>
      <Select
        label={t('action.type')}
        options={typeOptions}
        placeholder={t('common.selectionner')}
        error={errors.type?.message}
        {...register('type', { required: t('validation.requis') })}
      />
      <Select
        label={t('action.serre')}
        options={serreOptions}
        placeholder={t('common.selectionner')}
        error={errors.serreId?.message}
        {...register('serreId', { required: t('validation.requis') })}
      />
      <Input
        label={t('common.description')}
        error={errors.description?.message}
        {...register('description', { required: t('validation.requis') })}
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
