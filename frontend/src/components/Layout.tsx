import { ReactNode, useState } from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background mesh-bg flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px]">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Abrir menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
            Sistema Contable
          </span>
        </div>

        <main className="flex-1 p-6 lg:p-8 animate-fade-in">
          {children}
        </main>

        <footer className="border-t border-border/40 py-4 px-6 lg:px-8">
          <p className="text-xs text-muted-foreground text-center">
            © 2025 Sistema de Gestión Contable · Todos los derechos reservados ·{" "}
            Desarrollado por{" "}
            <a
              href="https://portafolio-santiago-duarte.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary transition-colors"
            >
              Santiago Duarte
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default Layout
