import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'
import { SyncErrorBanner } from '@/components/ui/SyncErrorBanner'

export function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ltr:pl-60 lg:rtl:pr-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 px-4 pt-4 pb-24 lg:pb-8 max-w-3xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <SyncErrorBanner />
    </div>
  )
}
