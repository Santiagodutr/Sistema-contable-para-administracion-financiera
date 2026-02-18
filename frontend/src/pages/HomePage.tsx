import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import FileText from 'lucide-react/dist/esm/icons/file-text'
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3'
import Receipt from 'lucide-react/dist/esm/icons/receipt'
import Users from 'lucide-react/dist/esm/icons/users'
import Package from 'lucide-react/dist/esm/icons/package'
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up'
import Calculator from 'lucide-react/dist/esm/icons/calculator'
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right'
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2'

// Hoisted outside component — static data (rendering-hoist-jsx)
const modules = [
  {
    title: 'Cuentas Contables',
    description: 'Gestione el plan de cuentas con códigos 1-6: Activos, Pasivos, Patrimonio, Ingresos, Gastos y Costos.',
    icon: FileText,
    href: '/cuentas',
    accent: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-400',
    border: 'hover:border-blue-500/30',
  },
  {
    title: 'Balance General',
    description: 'Visualice el balance general con activos, pasivos y patrimonio en tiempo real.',
    icon: BarChart3,
    href: '/balance',
    accent: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-400',
    border: 'hover:border-emerald-500/30',
  },
  {
    title: 'Estado de Resultados',
    description: 'Análisis de ingresos, costos, gastos y utilidades del período contable.',
    icon: Receipt,
    href: '/estado-resultados',
    accent: 'from-violet-500/20 to-violet-600/10',
    iconColor: 'text-violet-400',
    border: 'hover:border-violet-500/30',
  },
  {
    title: 'Nómina',
    description: 'Gestión de empleados y cálculo de nómina con deducciones y prestaciones.',
    icon: Users,
    href: '/nomina',
    accent: 'from-orange-500/20 to-orange-600/10',
    iconColor: 'text-orange-400',
    border: 'hover:border-orange-500/30',
  },
  {
    title: 'Kardex de Inventarios',
    description: 'Control de inventarios con método PEPS (Primeras Entradas, Primeras Salidas).',
    icon: Package,
    href: '/kardex',
    accent: 'from-cyan-500/20 to-cyan-600/10',
    iconColor: 'text-cyan-400',
    border: 'hover:border-cyan-500/30',
  },
  {
    title: 'Análisis Financiero',
    description: 'Análisis horizontal y vertical de estados financieros con visualizaciones.',
    icon: TrendingUp,
    href: '/analisis',
    accent: 'from-pink-500/20 to-pink-600/10',
    iconColor: 'text-pink-400',
    border: 'hover:border-pink-500/30',
  },
  {
    title: 'Depreciación',
    description: 'Cálculo de depreciación por línea recta, suma de dígitos y tasa fija.',
    icon: Calculator,
    href: '/depreciacion',
    accent: 'from-indigo-500/20 to-indigo-600/10',
    iconColor: 'text-indigo-400',
    border: 'hover:border-indigo-500/30',
  },
]

const features = [
  { label: 'Plan de Cuentas Completo', desc: 'Sistema de códigos 1-6 para clasificación contable' },
  { label: 'Estados Financieros', desc: 'Balance General y Estado de Resultados automatizados' },
  { label: 'Gestión de Inventarios', desc: 'Kardex con método PEPS y costos promedio' },
  { label: 'Análisis Avanzado', desc: 'Análisis horizontal, vertical y depreciaciones' },
]

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="animate-slide-up space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Sistema de Gestión Contable
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
          Controla tus finanzas{' '}
          <span className="gradient-text">con precisión</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Plataforma integral para la gestión contable de su empresa.
          Controle sus finanzas, inventarios, nómina y más desde un solo lugar.
        </p>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-stagger">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Card
              key={module.href}
              className={`
                group relative overflow-hidden cursor-pointer
                bg-card/60 backdrop-blur-sm
                border border-border/60 ${module.border}
                hover:shadow-xl hover:-translate-y-0.5
                transition-all duration-200
              `}
              onClick={() => navigate(module.href)}
            >
              {/* Gradient accent */}
              <div className={`absolute inset-0 bg-gradient-to-br ${module.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

              <CardHeader className="relative pb-3">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl bg-secondary/80 ${module.iconColor} flex-shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base leading-snug">{module.title}</CardTitle>
                    <CardDescription className="mt-1.5 text-xs leading-relaxed">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-xs text-muted-foreground hover:text-foreground group/btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(module.href)
                  }}
                >
                  Acceder al módulo
                  <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Features */}
      <div className="glass rounded-2xl p-6 animate-fade-in">
        <h2 className="text-lg font-semibold mb-5">Características Principales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
