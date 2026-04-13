import { useState, useEffect } from 'react'
import api from '@/services/api'
import type { Candle } from '@/lib/indicators'

export function useStockHistory(symbol: string, period: string) {
  const [candles, setCandles] = useState<Candle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!symbol) return
    setLoading(true)
    setCandles([])
    setError(null)
    api.get(`/api/market/history/${symbol}`, { params: { period } })
      .then(r => setCandles(r.data))
      .catch(e => setError(e.response?.data?.detail ?? e.message ?? 'Failed to load chart data'))
      .finally(() => setLoading(false))
  }, [symbol, period])

  return { candles, loading, error }
}
