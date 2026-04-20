import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up',
          'max-h-[92vh] overflow-y-auto',
          sizes[size]
        )}
      >
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
          <button
            onClick={onClose}
            className="ltr:ml-auto rtl:mr-auto p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-4 pb-8">{children}</div>
      </div>
    </div>
  )
}
