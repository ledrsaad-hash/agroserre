import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  message?: string
}

export function ConfirmDialog({ open, onClose, onConfirm, loading, message }: ConfirmDialogProps) {
  const { t } = useTranslation()
  return (
    <Modal open={open} onClose={onClose} title={t('confirm.titre')} size="sm">
      <div className="flex flex-col items-center gap-4 text-center py-2">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-600" />
        </div>
        <p className="text-gray-600">{message ?? t('confirm.message')}</p>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            {t('common.annuler')}
          </Button>
          <Button variant="danger" fullWidth onClick={onConfirm} loading={loading}>
            {t('confirm.supprimer')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
