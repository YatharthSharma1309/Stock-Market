import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import { useAI } from '@/context/AIContext'

interface TradeOut {
  id: string
  symbol: string
  name: string
  trade_type: 'buy' | 'sell'
  quantity: number
  price: number
  total_value: number
  created_at: string
}

function fmt(n: number | null, decimals = 2) {
  if (n == null) return '—'
  return n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export default function TradesPage() {
  const [trades, setTrades] = useState<TradeOut[]>([])
  const [loading, setLoading] = useState(true)
  const { openWithMessage } = useAI()

  useEffect(() => {
    api.get('/api/portfolio/trades')
      .then(r => setTrades(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trade History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All your paper trades</p>
        </div>
        <Link
          to="/portfolio"
          className="px-4 py-2 text-sm bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition text-foreground"
        >
          ← Portfolio
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl">
        {loading ? (
          <div className="flex justify-center py-12 text-muted-foreground text-sm">Loading trades…</div>
        ) : trades.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No trades yet.</p>
            <Link to="/markets" className="text-primary text-sm mt-2 inline-block hover:underline">
              Go to Markets to start trading →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 px-4 text-muted-foreground font-medium">Date & Time</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium">Symbol</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium">Name</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium text-center">Type</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium text-right">Qty</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium text-right">Price</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium text-right">Total</th>
                  <th className="py-3 px-4 text-muted-foreground font-medium text-center">AI</th>
                </tr>
              </thead>
              <tbody>
                {trades.map(t => {
                  const displaySym = t.symbol.replace('.NS', '').replace('.BO', '')
                  const tradeDate = new Date(t.created_at).toLocaleDateString('en-IN')
                  return (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30 transition">
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {tradeDate}{' '}
                      {new Date(t.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-primary">{displaySym}</td>
                    <td className="py-3 px-4 text-foreground">{t.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        t.trade_type === 'buy'
                          ? 'bg-primary/15 text-primary'
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        {t.trade_type === 'buy'
                          ? <TrendingUp className="h-3 w-3" />
                          : <TrendingDown className="h-3 w-3" />}
                        {t.trade_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">{t.quantity}</td>
                    <td className="py-3 px-4 text-right text-foreground">₹{fmt(t.price)}</td>
                    <td className="py-3 px-4 text-right font-medium text-foreground">₹{fmt(t.total_value)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openWithMessage(
                          `Explain this trade: I ${t.trade_type === 'buy' ? 'bought' : 'sold'} ${t.quantity} shares of ${t.name} (${displaySym}) at ₹${fmt(t.price)} on ${tradeDate}. Was this a good decision?`,
                          { type: 'trade', symbol: t.symbol, name: t.name, trade_type: t.trade_type, quantity: t.quantity, trade_date: tradeDate }
                        )}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                        title="Ask AI to explain this trade"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
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
    </div>
  )
}
