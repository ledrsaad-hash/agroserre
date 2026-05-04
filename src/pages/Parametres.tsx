import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Download, Upload, Trash2, CheckCircle2,
  AlertCircle, Database, Info,
} from 'lucide-react'
import { exportService } from '@/services/exportService'
import { db } from '@/db/database'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

type ImportMode = 'replace' | 'merge'
type Status = { type: 'success' | 'error'; message: string } | null

export function Parametres() {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [importMode, setImportMode] = useState<ImportMode>('replace')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message })
    setTimeout(() => setStatus(null), 5000)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportService.exportAll()
      showStatus('success', t('parametres.export_success'))
    } catch {
      showStatus('error', t('parametres.export_error'))
    } finally {
      setExporting(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.json')) {
      showStatus('error', t('parametres.import_error_format'))
      return
    }
    setSelectedFile(file)
    setImportModalOpen(true)
    e.target.value = ''
  }

  const handleImport = async () => {
    if (!selectedFile) return
    setImporting(true)
    try {
      const result = await exportService.importFile(selectedFile, importMode)
      if (result.success && result.counts) {
        const total = Object.values(result.counts).reduce((a, b) => a + b, 0)
        showStatus('success', t('parametres.import_success', { count: total }))
        setImportModalOpen(false)
        setSelectedFile(null)
      } else {
        const errKey = result.error === 'invalid_json'
          ? 'parametres.import_error_json'
          : result.error === 'invalid_format'
            ? 'parametres.import_error_format'
            : 'parametres.import_error'
        showStatus('error', t(errKey))
      }
    } finally {
      setImporting(false)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      await db.transaction('rw', [
        db.serres, db.depenses, db.actions,
        db.intrants, db.ventes, db.prixMarche,
      ], async () => {
        await db.serres.clear()
        await db.depenses.clear()
        await db.actions.clear()
        await db.intrants.clear()
        await db.ventes.clear()
        await db.prixMarche.clear()
      })
      showStatus('success', t('parametres.reset_success'))
    } catch {
      showStatus('error', t('parametres.reset_error'))
    } finally {
      setResetting(false)
      setResetOpen(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t('parametres.titre')} />

      {status && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl animate-fade-in ${
          status.type === 'success'
            ? 'bg-primary-50 text-primary-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {status.type === 'success'
            ? <CheckCircle2 size={20} className="flex-shrink-0" />
            : <AlertCircle size={20} className="flex-shrink-0" />}
          <p className="text-sm font-semibold">{status.message}</p>
        </div>
      )}

      {/* Export */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Download size={22} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">{t('parametres.export_titre')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('parametres.export_desc')}</p>
            <Button
              className="mt-4"
              fullWidth
              icon={<Download size={16} />}
              onClick={handleExport}
              loading={exporting}
            >
              {t('parametres.export_btn')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Import */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Upload size={22} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">{t('parametres.import_titre')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('parametres.import_desc')}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              className="mt-4"
              fullWidth
              variant="outline"
              icon={<Upload size={16} />}
              onClick={() => fileInputRef.current?.click()}
            >
              {t('parametres.import_btn')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Info sauvegarde */}
      <Card className="bg-banana-50 border-banana-200">
        <div className="flex gap-3">
          <Info size={18} className="text-banana-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-banana-700 space-y-1">
            <p className="font-semibold">{t('parametres.info_titre')}</p>
            <p>{t('parametres.info_desc')}</p>
          </div>
        </div>
      </Card>

      {/* Espace disque */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Database size={22} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">{t('parametres.stockage_titre')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('parametres.stockage_desc')}</p>
          </div>
        </div>
      </Card>

      {/* Reset */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Trash2 size={22} className="text-red-500" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">{t('parametres.reset_titre')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('parametres.reset_desc')}</p>
            <Button
              className="mt-4"
              fullWidth
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={() => setResetOpen(true)}
            >
              {t('parametres.reset_btn')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal choix import */}
      <Modal
        open={importModalOpen}
        onClose={() => { setImportModalOpen(false); setSelectedFile(null) }}
        title={t('parametres.import_titre')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {t('parametres.import_fichier')} : <span className="font-semibold">{selectedFile?.name}</span>
          </p>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">{t('parametres.import_mode')}</p>
            {(['replace', 'merge'] as const).map(mode => (
              <label
                key={mode}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  importMode === mode
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  value={mode}
                  checked={importMode === mode}
                  onChange={() => setImportMode(mode)}
                  className="mt-0.5 accent-primary-600"
                />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{t(`parametres.import_${mode}`)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t(`parametres.import_${mode}_desc`)}</p>
                </div>
              </label>
            ))}
          </div>

          {importMode === 'replace' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-xs text-red-600">
              <AlertCircle size={14} className="flex-shrink-0" />
              {t('parametres.import_replace_warning')}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => { setImportModalOpen(false); setSelectedFile(null) }}
            >
              {t('common.annuler')}
            </Button>
            <Button fullWidth loading={importing} onClick={handleImport}>
              {t('parametres.import_confirmer')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        loading={resetting}
        message={t('parametres.reset_confirm')}
      />
    </div>
  )
}
