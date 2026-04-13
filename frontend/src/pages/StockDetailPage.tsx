import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '@/services/api'
import type { Quote } from '@/hooks/useMarketData'
import StockChart from '@/components/StockChart'
import TradeModal from '@/components/TradeModal'

function fmtBig(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  return n.toLocaleString()
}

function fmtPrice(n: number | null, currency: string): string {
  if (n == null) return '—'
  return `${currency}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [tradeOpen, setTradeOpen] = useState(false)

  useEffect(() => {
    if (!symbol) return
    api.get(`/api/market/quote/${symbol}`)
      .then(r => setQuote(r.data))
      .catch(() => setQuote(null))
  }, [symbol])

  if (!symbol) return null

  const currency = quote?.currency === 'INR' ? '₹' : '$'
  const positive = (quote?.change_pct ?? 0) >= 0
  const displaySymbol = symbol.replace('.NS', '').replace('.BO', '')

  const statsGrid = quote
    ? [
        { label: 'Open', value: fmtPrice(quote.open, currency) },
        { label: "Day's High", value: fmtPrice(quote.high, currency) },
        { label: "Day's Low", value: fmtPrice(quote.low, currency) },
        { label: 'Prev Close', value: fmtPrice(quote.prev_close, currency) },
        { label: 'Volume', value: quote.volume != null ? fmtBig(quote.volume) : '—' },
        { label: 'Market Cap', value: quote.market_cap != null ? fmtBig(quote.market_cap) : '—' },
      ]
    : []

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/markets')}
            className="mt-1.5 p-1.5 rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{displaySymbol}</h1>
            {quote && <p className="text-sm text-muted-foreground mt-0.5">{quote.name}</p>}
          </div>
        </div>

        {quote && (
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                {fmtPrice(quote.price, currency)}
              </p>
              {quote.change_pct != null && (
                <p className={`text-sm font-medium mt-0.5 ${positive ? 'text-primary' : 'text-red-400'}`}>
                  {positive ? '+' : ''}{quote.change?.toFixed(2)} ({positive ? '+' : ''}{quote.change_pct.toFixed(2)}%)
                </p>
              )}
            </div>
            <button
              onClick={() => setTradeOpen(true)}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition"
            >
              Trade
            </button>
          </div>
        )}
      </div>

      {/* Chart */}
      <StockChart symbol={symbol} />

      {/* Stats grid */}
      {statsGrid.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsGrid.map(({ label, value }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{label}</p>
              <p className="text-base font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      )}

      {tradeOpen && quote && (
        <TradeModal
          quote={quote}
          onClose={() => setTradeOpen(false)}
          onSuccess={() => setTradeOpen(false)}
        />
      )}
    </div>
  )
}
