import { Loader2 } from 'lucide-react'

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 size={size} className="animate-spin text-primary-600" />
    </div>
  )
}
