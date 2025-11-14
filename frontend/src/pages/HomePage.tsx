import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  BarChart3, 
  Receipt, 
  Users, 
  Package, 
  TrendingUp, 
  Calculator,
  ArrowRight
} from 'lucide-react'

const HomePage = () => {
  const navigate = useNavigate()

  const modules = [
    {
      title: 'Cuentas Contables',
      description: 'Gestione el plan de cuentas con códigos 1-6 (Activos, Pasivos, Patrimonio, Ingresos, Gastos, Costos)',
      icon: FileText,
      href: '/cuentas',
      color: 'text-blue-500',
    },
    {
      title: 'Balance General',
      description: 'Visualice el balance general con activos, pasivos y patrimonio',
      icon: BarChart3,
      href: '/balance',
      color: 'text-green-500',
    },
    {
      title: 'Estado de Resultados',
      description: 'Análisis de ingresos, costos, gastos y utilidades del período',
      icon: Receipt,
      href: '/estado-resultados',
      color: 'text-purple-500',
    },
    {
      title: 'Nómina',
      description: 'Gestión de empleados y cálculo de nómina con deducciones',
      icon: Users,
      href: '/nomina',
      color: 'text-orange-500',
    },
    {
      title: 'Kardex de Inventarios',
      description: 'Control de inventarios con método PEPS (Primeras Entradas, Primeras Salidas)',
      icon: Package,
      href: '/kardex',
      color: 'text-cyan-500',
    },
    {
      title: 'Análisis Financiero',
      description: 'Análisis horizontal y vertical de estados financieros',
      icon: TrendingUp,
      href: '/analisis',
      color: 'text-pink-500',
    },
    {
      title: 'Depreciación',
      description: 'Cálculo de depreciación por línea recta, suma de dígitos y tasa fija',
      icon: Calculator,
      href: '/depreciacion',
      color: 'text-indigo-500',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Sistema de Gestión Contable</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Plataforma integral para la gestión contable de su empresa. 
          Controle sus finanzas, inventarios, nómina y más.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Card 
              key={module.title} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(module.href)}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-secondary ${module.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                </div>
                <CardDescription className="mt-3">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(module.href)
                  }}
                >
                  Acceder
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Características Principales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">✓ Plan de Cuentas Completo</h3>
              <p className="text-sm text-muted-foreground">Sistema de códigos 1-6 para clasificación contable</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">✓ Estados Financieros</h3>
              <p className="text-sm text-muted-foreground">Balance General y Estado de Resultados automatizados</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">✓ Gestión de Inventarios</h3>
              <p className="text-sm text-muted-foreground">Kardex con método PEPS y costos promedio</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">✓ Análisis Avanzado</h3>
              <p className="text-sm text-muted-foreground">Análisis horizontal, vertical y depreciaciones</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HomePage
