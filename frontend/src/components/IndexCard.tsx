import { TrendingUp, TrendingDown } from 'lucide-react'
import type { Quote } from '@/hooks/useMarketData'

interface Props {
  name: string
  quote?: Quote
  loading?: boolean
}

export default function IndexCard({ name, quote, loading }: Props) {
  const positive = (quote?.change_pct ?? 0) >= 0

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">{name}</p>
      {loading || !quote ? (
        <div className="animate-pulse space-y-2">
          <div className="h-7 bg-secondary rounded w-3/4" />
          <div className="h-4 bg-secondary rounded w-1/2" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-foreground">
            {quote.price != null
              ? quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '—'}
          </p>
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${positive ? 'text-primary' : 'text-red-400'}`}>
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {quote.change != null ? (
              <span>
                {positive ? '+' : ''}{quote.change.toFixed(2)} ({positive ? '+' : ''}{quote.change_pct?.toFixed(2)}%)
              </span>
            ) : '—'}
          </div>
        </>
      )}
    </div>
  )
}
