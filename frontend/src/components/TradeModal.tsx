import { useState } from 'react'
import { X, TrendingUp, TrendingDown } from 'lucide-react'
import axios from 'axios'
import api from '@/services/api'
import type { Quote } from '@/hooks/useMarketData'

interface Props {
  quote: Quote
  onClose: () => void
  onSuccess: () => void
}

export default function TradeModal({ quote, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const qty = parseFloat(quantity) || 0
  const total = qty > 0 && quote.price != null ? qty * quote.price : null
  const currency = quote.currency === 'INR' ? '₹' : '$'
  const positive = (quote.change_pct ?? 0) >= 0

  async function handleTrade() {
    if (qty <= 0) { setError('Enter a valid quantity'); return }
    setLoading(true)
    setError('')
    try {
      await api.post(`/api/portfolio/${tab}`, { symbol: quote.symbol, quantity: qty })
      onSuccess()
      onClose()
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setError(e.response?.data?.detail || 'Trade failed. Please try again.')
      } else {
        setError('Trade failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-md p-6 mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {quote.symbol.replace('.NS', '').replace('.BO', '')}
            </h2>
            <p className="text-sm text-muted-foreground">{quote.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Price */}
        <div className="bg-secondary rounded-xl p-4 mb-5">
          <p className="text-xs text-muted-foreground mb-1">Current Price</p>
          <p className="text-2xl font-bold text-foreground">
            {currency}{quote.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
          </p>
          {quote.change_pct != null && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${positive ? 'text-primary' : 'text-red-400'}`}>
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {positive ? '+' : ''}{quote.change_pct.toFixed(2)}%
            </div>
          )}
        </div>

        {/* Buy / Sell tabs */}
        <div className="flex bg-secondary rounded-lg p-1 mb-4">
          <button
            onClick={() => setTab('buy')}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${
              tab === 'buy' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setTab('sell')}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${
              tab === 'sell' ? 'bg-red-500 text-white shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">
            Quantity (shares)
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={e => { setQuantity(e.target.value); setError('') }}
            placeholder="0"
            className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
          />
        </div>

        {/* Total estimate */}
        {total !== null && (
          <div className="bg-secondary rounded-lg px-4 py-3 mb-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Estimated {tab === 'buy' ? 'Cost' : 'Proceeds'}
            </span>
            <span className="font-bold text-foreground">
              {currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleTrade}
          disabled={loading || qty <= 0}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 ${
            tab === 'buy'
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {loading
            ? 'Processing…'
            : tab === 'buy'
            ? `Buy ${quote.symbol.replace('.NS', '').replace('.BO', '')}`
            : `Sell ${quote.symbol.replace('.NS', '').replace('.BO', '')}`}
        </button>
      </div>
    </div>
  )
}
