import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

// Lazy-load all pages for code splitting (bundle-dynamic-imports)
const HomePage = lazy(() => import('./pages/HomePage'))
const CuentasPage = lazy(() => import('./pages/CuentasPage'))
const BalancePage = lazy(() => import('./pages/BalancePage'))
const EstadoResultadosPage = lazy(() => import('./pages/EstadoResultadosPage'))
const NominaPage = lazy(() => import('./pages/NominaPage'))
const KardexPage = lazy(() => import('./pages/KardexPage'))
const AnalisisFinancieroPage = lazy(() => import('./pages/AnalisisFinancieroPage'))
const DepreciacionPage = lazy(() => import('./pages/DepreciacionPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </Layout>
  )
}

export default App
