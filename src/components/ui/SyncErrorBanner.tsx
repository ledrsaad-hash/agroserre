import { useEffect, useState } from 'react'
import { onSyncError } from '@/lib/syncErrors'
import { X, CloudOff } from 'lucide-react'

export function SyncErrorBanner() {
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    return onSyncError((msg) => {
      setMessages(prev => [...prev, msg])
      setTimeout(() => setMessages(prev => prev.slice(1)), 8000)
    })
  }, [])

  if (messages.length === 0) return null

  return (
    <div className="fixed top-4 ltr:right-4 rtl:left-4 z-50 flex flex-col gap-2 max-w-sm">
      {messages.map((msg, i) => (
        <div
          key={i}
          className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow-lg"
        >
          <CloudOff size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1">{msg}</p>
          <button
            onClick={() => setMessages(prev => prev.filter((_, j) => j !== i))}
            className="text-red-400 hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
