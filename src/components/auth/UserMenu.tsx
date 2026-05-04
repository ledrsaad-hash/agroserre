import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LogOut, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { syncService } from '@/services/syncService'

export function UserMenu() {
  const { t } = useTranslation()
  const { user, signOut, syncing } = useAuth()
  const [open, setOpen] = useState(false)
  const [localSyncing, setLocalSyncing] = useState(false)

  if (!user) return null

  const email = user.email ?? ''
  const initials = email.slice(0, 2).toUpperCase()

  const handleSync = async () => {
    setLocalSyncing(true)
    try {
      await syncService.pullFromSupabase(user.id)
    } finally {
      setLocalSyncing(false)
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors w-full"
      >
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary-700">{initials}</span>
        </div>
        <div className="flex-1 min-w-0 text-start">
          <p className="text-xs font-semibold text-gray-700 truncate">{email}</p>
          <p className="text-xs text-gray-400">{t('auth.connected')}</p>
        </div>
      </button>

      {open && (
        <div className="absolute bottom-full ltr:left-0 rtl:right-0 mb-1 w-full bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
          <button
            onClick={handleSync}
            disabled={localSyncing || syncing}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 w-full text-sm text-gray-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={localSyncing ? 'animate-spin' : ''} />
            {t('auth.sync_now')}
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={async () => { setOpen(false); await signOut() }}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 w-full text-sm text-red-600"
          >
            <LogOut size={16} />
            {t('auth.sign_out')}
          </button>
        </div>
      )}
    </div>
  )
}
