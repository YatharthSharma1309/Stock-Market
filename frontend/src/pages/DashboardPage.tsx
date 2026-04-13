import { TrendingUp, TrendingDown, BarChart2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const statCards = [
  { label: 'Total Portfolio Value', value: '₹10,00,000.00', change: '+0.00%', positive: true },
  { label: "Today's P&L", value: '₹0.00', change: '+0.00%', positive: true },
  { label: 'Trades Made', value: '0', change: 'No trades yet', positive: true },
  { label: 'Learning Progress', value: '0%', change: '0 / 5 modules', positive: true },
]

export default function DashboardPage() {
  const { payload } = useAuth()

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back{payload?.sub ? `, ${payload.sub.split('@')[0]}` : ''}! 👋
        </h2>
        <p className="text-muted-foreground mt-1">Your virtual trading journey. Markets are open.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">{card.label}</p>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${card.positive ? 'text-primary' : 'text-red-400'}`}>
              {card.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {card.change}
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link to="/markets" className="lg:col-span-2 bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" /> Market Overview
            </h3>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
          </div>
          <p className="text-sm text-muted-foreground">
            View live NSE/BSE and global stock prices, indices, and market movers. Click to open Markets.
          </p>
        </Link>
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-3">AI Assistant</h3>
          <p className="text-sm text-muted-foreground">
            Your AI trading coach will be available here in Phase 6.
          </p>
        </div>
      </div>
    </div>
  )
}
