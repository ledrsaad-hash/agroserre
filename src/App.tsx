import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
