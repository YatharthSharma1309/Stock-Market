import { useEffect, useRef, useState } from 'react'

export interface Quote {
  symbol: string
  name: string
  price: number | null
  change: number | null
  change_pct: number | null
  open: number | null
  high: number | null
  low: number | null
  prev_close: number | null
  volume: number | null
  market_cap: number | null
  currency: string | null
  index_name?: string
}

export function useMarketData(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})
  const wsRef = useRef<WebSocket | null>(null)
  const key = symbols.join(',')

  useEffect(() => {
    if (!symbols.length) return
    const wsUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:8000').replace(/^http/, 'ws')
    const ws = new WebSocket(`${wsUrl}/ws/prices`)
    wsRef.current = ws

    ws.onopen = () => ws.send(JSON.stringify({ symbols }))

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'price_update') {
        const map: Record<string, Quote> = {}
        for (const q of msg.data as Quote[]) map[q.symbol] = q
        setQuotes((prev) => ({ ...prev, ...map }))
      }
    }

    return () => ws.close()
  }, [key])

  return quotes
}
