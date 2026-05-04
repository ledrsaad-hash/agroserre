import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { PrivateRoute } from '@/components/auth/PrivateRoute'
import { MigrationModal } from '@/components/auth/MigrationModal'
import { AppShell } from '@/components/layout/AppShell'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Serres } from '@/pages/Serres'
import { SerreDetail } from '@/pages/SerreDetail'
import { Depenses } from '@/pages/Depenses'
import { Actions } from '@/pages/Actions'
import { Intrants } from '@/pages/Intrants'
import { Ventes } from '@/pages/Ventes'
import { VenteDetail } from '@/pages/VenteDetail'
import { Marche } from '@/pages/Marche'
import { Rapports } from '@/pages/Rapports'
import { Parametres } from '@/pages/Parametres'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MigrationModal />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="serres" element={<Serres />} />
              <Route path="serres/:id" element={<SerreDetail />} />
              <Route path="depenses" element={<Depenses />} />
              <Route path="actions" element={<Actions />} />
              <Route path="intrants" element={<Intrants />} />
              <Route path="ventes" element={<Ventes />} />
              <Route path="ventes/:id" element={<VenteDetail />} />
              <Route path="marche" element={<Marche />} />
              <Route path="rapports" element={<Rapports />} />
              <Route path="parametres" element={<Parametres />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
