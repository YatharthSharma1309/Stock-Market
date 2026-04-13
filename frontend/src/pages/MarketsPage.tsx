import { useEffect, useState } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import api from '@/services/api'
import IndexCard from '@/components/IndexCard'
import StockTable from '@/components/StockTable'
import { useMarketData, type Quote } from '@/hooks/useMarketData'

const INDEX_SYMBOLS = ['^NSEI', '^BSESN', '^GSPC', '^IXIC', '^DJI']
const INDEX_NAMES: Record<string, string> = {
  '^NSEI': 'NIFTY 50',
  '^BSESN': 'SENSEX',
  '^GSPC': 'S&P 500',
  '^IXIC': 'NASDAQ',
  '^DJI': 'Dow Jones',
}

type Tab = 'nse' | 'global'

export default function MarketsPage() {
  const [tab, setTab] = useState<Tab>('nse')
  const [nseQuotes, setNseQuotes] = useState<Quote[]>([])
  const [globalQuotes, setGlobalQuotes] = useState<Quote[]>([])
  const [indexQuotes, setIndexQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [indexLoading, setIndexLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<{ symbol: string; name: string }[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // live WebSocket updates for currently visible stocks
  const activeSymbols = tab === 'nse'
    ? nseQuotes.map(q => q.symbol)
    : globalQuotes.map(q => q.symbol)
  const liveData = useMarketData(activeSymbols)

  async function fetchIndices() {
    setIndexLoading(true)
    try {
      const res = await api.get('/api/market/indices')
      setIndexQuotes(res.data)
    } finally {
      setIndexLoading(false)
    }
  }

  async function fetchStocks() {
    setLoading(true)
    try {
      const [nse, global] = await Promise.all([
        api.get('/api/market/nse'),
        api.get('/api/market/global'),
      ])
      setNseQuotes(nse.data)
      setGlobalQuotes(global.data)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIndices()
    fetchStocks()
  }, [])

  // merge live WebSocket updates into table
  const displayedQuotes = (tab === 'nse' ? nseQuotes : globalQuotes).map(q =>
    liveData[q.symbol] ? { ...q, ...liveData[q.symbol] } : q
  )

  // search
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/api/market/search', { params: { q: search } })
        setSearchResults(res.data)
      } catch { setSearchResults([]) }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const indexMap: Record<string, Quote> = {}
  for (const q of indexQuotes) indexMap[q.symbol] = q

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Markets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live NSE, BSE & global stock prices
            {lastUpdated && <span> · Updated {lastUpdated.toLocaleTimeString()}</span>}
          </p>
        </div>
        <button
          onClick={fetchStocks}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground hover:bg-secondary/80 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Index cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {INDEX_SYMBOLS.map(sym => (
          <IndexCard
            key={sym}
            name={INDEX_NAMES[sym]}
            quote={indexMap[sym]}
            loading={indexLoading}
          />
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search stocks (e.g. Reliance, AAPL, TCS)…"
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
            {searchResults.map(s => (
              <button
                key={s.symbol}
                onClick={() => setSearch('')}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary text-left transition"
              >
                <span className="font-medium text-primary text-sm">{s.symbol}</span>
                <span className="text-muted-foreground text-sm">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs + Table */}
      <div className="bg-card border border-border rounded-xl">
        <div className="flex border-b border-border px-4">
          {(['nse', 'global'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition -mb-px ${
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'nse' ? 'NSE / BSE' : 'Global'}
            </button>
          ))}
        </div>
        <StockTable quotes={displayedQuotes} loading={loading} />
      </div>
    </div>
  )
}
