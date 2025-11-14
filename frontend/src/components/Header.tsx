import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Receipt, 
  Users, 
  Package, 
  TrendingUp, 
  Calculator 
} from 'lucide-react'

const Header = () => {
  const location = useLocation()

  const navigation = [
    { name: 'Inicio', href: '/', icon: LayoutDashboard },
    { name: 'Cuentas', href: '/cuentas', icon: FileText },
    { name: 'Balance', href: '/balance', icon: BarChart3 },
    { name: 'Estado de Resultados', href: '/estado-resultados', icon: Receipt },
    { name: 'Nómina', href: '/nomina', icon: Users },
    { name: 'Kardex', href: '/kardex', icon: Package },
    { name: 'Análisis Financiero', href: '/analisis', icon: TrendingUp },
    { name: 'Depreciación', href: '/depreciacion', icon: Calculator },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <div className="mr-8">
            <Link to="/" className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6" />
              <span className="font-bold text-lg">Sistema Contable</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-1 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
