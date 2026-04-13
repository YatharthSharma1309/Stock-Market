import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Briefcase, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import TradeModal from '@/components/TradeModal'
import type { Quote } from '@/hooks/useMarketData'

interface HoldingOut {
  symbol: string
  name: string
  quantity: number
  avg_buy_price: number
  current_price: number | null
  current_value: number | null
  unrealized_pnl: number | null
  unrealized_pnl_pct: number | null
}

interface PortfolioSummary {
  virtual_balance: number
  holdings_value: number
  total_value: number
  total_invested: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
  holdings: HoldingOut[]
}

function fmt(n: number | null, decimals = 2) {
  if (n == null) return '—'
  return n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function holdingToQuote(h: HoldingOut): Quote {
  const isIndian = h.symbol.endsWith('.NS') || h.symbol.endsWith('.BO')
  return {
    symbol: h.symbol,
    name: h.name,
    price: h.current_price,
    change: null,
    change_pct: null,
    open: null,
    high: null,
    low: null,
    prev_close: null,
    volume: null,
    market_cap: null,
    currency: isIndian ? 'INR' : 'USD',
  }
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [tradeTarget, setTradeTarget] = useState<HoldingOut | null>(null)

  async function fetchPortfolio() {
    setLoading(true)
    try {
      const res = await api.get('/api/portfolio')
      setPortfolio(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPortfolio() }, [])

  const pnlPositive = (portfolio?.unrealized_pnl ?? 0) >= 0

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your virtual holdings and P&L</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/trades"
            className="px-4 py-2 text-sm bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition text-foreground"
          >
            Trade History
          </Link>
          <button
            onClick={fetchPortfolio}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground hover:bg-secondary/80 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {portfolio && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Total Portfolio</p>
            <p className="text-2xl font-bold text-foreground">₹{fmt(portfolio.total_value)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Cash Balance</p>
            <p className="text-2xl font-bold text-foreground">₹{fmt(portfolio.virtual_balance)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Holdings Value</p>
            <p className="text-2xl font-bold text-foreground">₹{fmt(portfolio.holdings_value)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Unrealized P&L</p>
            <p className={`text-2xl font-bold ${pnlPositive ? 'text-primary' : 'text-red-400'}`}>
              {pnlPositive ? '+' : ''}₹{fmt(portfolio.unrealized_pnl)}
            </p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${pnlPositive ? 'text-primary' : 'text-red-400'}`}>
              {pnlPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {pnlPositive ? '+' : ''}{portfolio.unrealized_pnl_pct.toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="bg-card border border-border rounded-xl">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Holdings</h3>
          {portfolio && (
            <span className="text-xs text-muted-foreground ml-1">({portfolio.holdings.length} stocks)</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12 text-muted-foreground text-sm">Loading portfolio…</div>
        ) : portfolio?.holdings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No holdings yet.</p>
            <Link to="/markets" className="text-primary text-sm mt-2 inline-block hover:underline">
              Browse markets to start trading →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 px-4 text-muted-foreground font-medium">Symbol</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium">Name</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium text-right">Qty</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium text-right">Avg Buy</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium text-right">Cur. Price</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium text-right">Value</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium text-right">P&L</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolio?.holdings.map(h => {
                  const pos = (h.unrealized_pnl ?? 0) >= 0
                  return (
                    <tr key={h.symbol} className="border-b border-border/50 hover:bg-secondary/30 transition">
                      <td className="py-3 px-4 font-semibold text-primary">
                        {h.symbol.replace('.NS', '').replace('.BO', '')}
                      </td>
                      <td className="py-3 px-4 text-foreground">{h.name}</td>
                      <td className="py-3 px-4 text-right text-foreground">{h.quantity}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">₹{fmt(h.avg_buy_price)}</td>
                      <td className="py-3 px-4 text-right text-foreground">₹{fmt(h.current_price)}</td>
                      <td className="py-3 px-4 text-right font-medium text-foreground">₹{fmt(h.current_value)}</td>
                      <td className={`py-3 px-4 text-right font-medium ${pos ? 'text-primary' : 'text-red-400'}`}>
                        <div>{pos ? '+' : ''}₹{fmt(h.unrealized_pnl)}</div>
                        {h.unrealized_pnl_pct != null && (
                          <div className="text-xs">{pos ? '+' : ''}{h.unrealized_pnl_pct.toFixed(2)}%</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setTradeTarget(h)}
                          className="px-3 py-1 bg-secondary border border-border rounded-lg text-xs hover:bg-primary/10 hover:border-primary hover:text-primary transition"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {tradeTarget && (
        <TradeModal
          quote={holdingToQuote(tradeTarget)}
          onClose={() => setTradeTarget(null)}
          onSuccess={fetchPortfolio}
        />
      )}
    </div>
  )
}
