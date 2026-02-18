import { Link, useLocation } from 'react-router-dom'
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard'
import FileText from 'lucide-react/dist/esm/icons/file-text'
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3'
import Receipt from 'lucide-react/dist/esm/icons/receipt'
import Users from 'lucide-react/dist/esm/icons/users'
import Package from 'lucide-react/dist/esm/icons/package'
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up'
import Calculator from 'lucide-react/dist/esm/icons/calculator'
import X from 'lucide-react/dist/esm/icons/x'

// Hoisted outside component — static data, never changes (rendering-hoist-jsx)
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

interface SidebarProps {
    open: boolean
    onClose: () => void
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
    const location = useLocation()

    return (
        <aside
            className={`
        fixed top-0 left-0 h-full z-30 w-[260px]
        flex flex-col
        bg-card/90 backdrop-blur-xl
        border-r border-border/50
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
        >
            {/* Brand */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-border/40">
                <Link to="/" className="flex items-center gap-3" onClick={onClose}>
                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center glow-emerald">
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold leading-none" style={{ fontFamily: 'Sora, sans-serif' }}>
                            Sistema Contable
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Gestión Financiera</p>
                    </div>
                </Link>
                <button
                    onClick={onClose}
                    className="lg:hidden p-1.5 rounded-md hover:bg-secondary transition-colors"
                    aria-label="Cerrar menú"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
                    Módulos
                </p>
                {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={onClose}
                            className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 relative
                ${isActive
                                    ? 'bg-primary/15 text-primary border border-primary/20'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent'
                                }
              `}
                        >
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                            )}
                            <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                            <span className="truncate">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border/40">
                <p className="text-[10px] text-muted-foreground">v1.0.0 · © 2025</p>
            </div>
        </aside>
    )
}

export default Sidebar
