import { TrendingUp, TrendingDown, LayoutDashboard, BarChart2, Briefcase, BookOpen, Bot, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const navLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: BarChart2, label: 'Markets', to: '/markets' },
  { icon: Briefcase, label: 'Portfolio', to: '/portfolio' },
  { icon: BookOpen, label: 'Learn', to: '/learn' },
  { icon: Bot, label: 'AI Assistant', to: '/ai' },
]

const statCards = [
  { label: 'Total Portfolio Value', value: '₹10,00,000.00', change: '+0.00%', positive: true },
  { label: "Today's P&L", value: '₹0.00', change: '+0.00%', positive: true },
  { label: 'Trades Made', value: '0', change: 'No trades yet', positive: true },
  { label: 'Learning Progress', value: '0%', change: '0 / 5 modules', positive: true },
]

export default function DashboardPage() {
  const { payload, logout } = useAuth()

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
          {navLinks.map(({ icon: Icon, label, to }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition text-sm font-medium"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
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

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
              {payload?.sub?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <span className="text-sm text-muted-foreground">{payload?.sub}</span>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              Welcome back{payload?.sub ? `, ${payload.sub.split('@')[0]}` : ''}! 👋
            </h2>
            <p className="text-muted-foreground mt-1">
              Your virtual trading journey starts here. Markets are open.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${card.positive ? 'text-primary' : 'text-red-400'}`}>
                  {card.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {card.change}
                </div>
              </div>
            ))}
          </div>

          {/* Placeholder sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Market Overview</h3>
              <p className="text-sm text-muted-foreground">
                Live market data will appear here in Phase 2. You'll see NSE/BSE indices, top gainers, and losers in real time.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Your AI trading coach will be available here in Phase 6. Ask anything about stocks, indicators, or your portfolio.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
