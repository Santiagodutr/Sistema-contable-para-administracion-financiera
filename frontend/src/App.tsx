import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CuentasPage from './pages/CuentasPage'
import BalancePage from './pages/BalancePage'
import EstadoResultadosPage from './pages/EstadoResultadosPage'
import NominaPage from './pages/NominaPage'
import KardexPage from './pages/KardexPage'
import AnalisisFinancieroPage from './pages/AnalisisFinancieroPage'
import DepreciacionPage from './pages/DepreciacionPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cuentas" element={<CuentasPage />} />
        <Route path="/balance" element={<BalancePage />} />
        <Route path="/estado-resultados" element={<EstadoResultadosPage />} />
        <Route path="/nomina" element={<NominaPage />} />
        <Route path="/kardex" element={<KardexPage />} />
        <Route path="/analisis" element={<AnalisisFinancieroPage />} />
        <Route path="/depreciacion" element={<DepreciacionPage />} />
      </Routes>
    </Layout>
  )
}

export default App
