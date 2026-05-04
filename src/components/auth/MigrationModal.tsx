import { useTranslation } from 'react-i18next'
import { Upload, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export function MigrationModal() {
  const { t } = useTranslation()
  const { needsMigration, syncing, acceptMigration, skipMigration } = useAuth()

  return (
    <Modal open={needsMigration} onClose={() => {}} title={t('auth.migration_titre')} size="sm">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
          <Upload size={28} className="text-primary-600" />
        </div>
        <p className="text-sm text-gray-600 text-center">{t('auth.migration_desc')}</p>

        {syncing && (
          <div className="flex items-center justify-center gap-2 text-primary-600 py-2">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm font-medium">{t('auth.migration_syncing')}</span>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={skipMigration}
            disabled={syncing}
            icon={<X size={16} />}
          >
            {t('auth.migration_skip')}
          </Button>
          <Button
            fullWidth
            onClick={acceptMigration}
            loading={syncing}
            icon={<Upload size={16} />}
          >
            {t('auth.migration_upload')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
