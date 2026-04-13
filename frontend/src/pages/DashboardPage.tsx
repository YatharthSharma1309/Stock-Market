import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, BarChart2, ArrowRight, Briefcase, GraduationCap, Flame } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import api from '@/services/api'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import { TOTAL_LESSONS } from '@/data/learningContent'

interface PortfolioSummary {
  virtual_balance: number
  total_value: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export default function DashboardPage() {
  const { payload } = useAuth()
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null)
  const { totalCompleted, streakDays, isLoading: learnLoading } = useLearningProgress()

  useEffect(() => {
    api.get('/api/portfolio').then(r => setPortfolio(r.data)).catch(() => {})
  }, [])

  const pnlPositive = (portfolio?.unrealized_pnl ?? 0) >= 0

  const statCards = [
    {
      label: 'Total Portfolio Value',
      value: portfolio ? `₹${fmt(portfolio.total_value)}` : '₹10,00,000.00',
      change: portfolio
        ? `${pnlPositive ? '+' : ''}${fmt(portfolio.unrealized_pnl_pct)}%`
        : '+0.00%',
      positive: pnlPositive,
    },
    {
      label: 'Cash Balance',
      value: portfolio ? `₹${fmt(portfolio.virtual_balance)}` : '₹10,00,000.00',
      change: 'Available to invest',
      positive: true,
    },
    {
      label: 'Unrealized P&L',
      value: portfolio
        ? `${pnlPositive ? '+' : ''}₹${fmt(portfolio.unrealized_pnl)}`
        : '₹0.00',
      change: portfolio
        ? `${pnlPositive ? '+' : ''}${fmt(portfolio.unrealized_pnl_pct)}%`
        : '+0.00%',
      positive: pnlPositive,
    },
    {
      label: 'Learning Progress',
      value: learnLoading ? '…' : `${totalCompleted} / ${TOTAL_LESSONS}`,
      change: learnLoading ? '' : streakDays > 0 ? `${streakDays} day streak 🔥` : 'Start learning',
      positive: true,
    },
  ]

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back{payload?.sub ? `, ${payload.sub.split('@')[0]}` : ''}!
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
        <Link
          to="/markets"
          className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" /> Market Overview
            </h3>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
          </div>
          <p className="text-sm text-muted-foreground">
            View live NSE/BSE and global stock prices, indices, and market movers.
          </p>
        </Link>
        <Link
          to="/portfolio"
          className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Portfolio
            </h3>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
          </div>
          <p className="text-sm text-muted-foreground">
            Track your virtual holdings, buy/sell stocks, and monitor P&L.
          </p>
        </Link>
        <Link
          to="/learn"
          className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" /> Learning Centre
            </h3>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
          </div>
          <p className="text-sm text-muted-foreground">
            {streakDays > 0
              ? `${streakDays}-day streak! Keep going — ${TOTAL_LESSONS - totalCompleted} lessons remaining.`
              : 'Learn trading from technical analysis to options strategies.'}
          </p>
        </Link>
      </div>
    </div>
  )
}
