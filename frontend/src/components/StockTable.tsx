import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import type { Quote } from '@/hooks/useMarketData'

interface Props {
  quotes: Quote[]
  loading: boolean
}

function fmt(n: number | null, decimals = 2) {
  if (n == null) return '—'
  return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtMCap(n: number | null) {
  if (n == null) return '—'
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  return n.toFixed(0)
}

export default function StockTable({ quotes, loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground text-sm">Fetching live prices…</span>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-3 px-4 text-muted-foreground font-medium">Symbol</th>
            <th className="py-3 px-4 text-muted-foreground font-medium">Name</th>
            <th className="py-3 px-4 text-muted-foreground font-medium text-right">Price</th>
            <th className="py-3 px-4 text-muted-foreground font-medium text-right">Change</th>
            <th className="py-3 px-4 text-muted-foreground font-medium text-right">Change %</th>
            <th className="py-3 px-4 text-muted-foreground font-medium text-right">High</th>
            <th className="py-3 px-4 text-muted-foreground font-medium text-right">Low</th>
            <th className="py-3 px-4 text-muted-foreground font-medium text-right">Mkt Cap</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q) => {
            const positive = (q.change_pct ?? 0) >= 0
            return (
              <tr key={q.symbol} className="border-b border-border/50 hover:bg-secondary/30 transition">
                <td className="py-3 px-4 font-semibold text-primary">{q.symbol.replace('.NS', '').replace('.BO', '')}</td>
                <td className="py-3 px-4 text-foreground">{q.name}</td>
                <td className="py-3 px-4 text-right font-medium text-foreground">{fmt(q.price)}</td>
                <td className={`py-3 px-4 text-right font-medium ${positive ? 'text-primary' : 'text-red-400'}`}>
                  {q.change != null ? `${positive ? '+' : ''}${fmt(q.change)}` : '—'}
                </td>
                <td className={`py-3 px-4 text-right font-medium ${positive ? 'text-primary' : 'text-red-400'}`}>
                  <span className={`inline-flex items-center gap-0.5`}>
                    {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {q.change_pct != null ? `${positive ? '+' : ''}${fmt(q.change_pct)}%` : '—'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-muted-foreground">{fmt(q.high)}</td>
                <td className="py-3 px-4 text-right text-muted-foreground">{fmt(q.low)}</td>
                <td className="py-3 px-4 text-right text-muted-foreground">{fmtMCap(q.market_cap)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {quotes.length === 0 && (
        <p className="text-center text-muted-foreground py-8 text-sm">No stocks found.</p>
      )}
    </div>
  )
}
