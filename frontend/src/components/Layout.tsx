import { Outlet, Link, useLocation } from 'react-router-dom'
import { TrendingUp, LayoutDashboard, BarChart2, Briefcase, BookOpen, Bot, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: BarChart2, label: 'Markets', to: '/markets' },
  { icon: Briefcase, label: 'Portfolio', to: '/portfolio' },
  { icon: BookOpen, label: 'Learn', to: '/learn' },
  { icon: Bot, label: 'AI Assistant', to: '/ai' },
]

export default function Layout() {
  const { payload, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-foreground">StockSim Pro</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(({ icon: Icon, label, to }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-foreground capitalize">
            {location.pathname.slice(1)}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
              {payload?.sub?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <span className="text-sm text-muted-foreground">{payload?.sub}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
