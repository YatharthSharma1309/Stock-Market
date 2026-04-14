import { useEffect, useState } from 'react'
import { Trophy, TrendingUp, TrendingDown, Medal } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/services/api'
import { Skeleton } from '@/components/Skeleton'

interface LeaderboardEntry {
  rank: number
  username: string
  total_value: number
  return_pct: number
  num_trades: number
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

const RANK_STYLES: Record<number, string> = {
  1: 'text-yellow-500',
  2: 'text-slate-400',
  3: 'text-amber-600',
}

const RANK_ICONS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default function LeaderboardPage() {
  const { payload } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/leaderboard')
      .then(r => setEntries(r.data))
      .catch(() => setError('Failed to load leaderboard. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const currentUser = payload?.sub ?? ''
  const myEntry = entries.find(e => e.username === currentUser)

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
          <p className="text-sm text-muted-foreground">Ranked by total portfolio return</p>
        </div>
      </div>

      {/* My rank banner */}
      {myEntry && !loading && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Medal className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Your rank: #{myEntry.rank}</span>
          </div>
          <div className="flex items-center gap-6 text-sm flex-wrap">
            <span className="text-muted-foreground">
              Portfolio: <span className="text-foreground font-medium">₹{fmt(myEntry.total_value)}</span>
            </span>
            <span className={myEntry.return_pct >= 0 ? 'text-primary font-medium' : 'text-red-400 font-medium'}>
              {myEntry.return_pct >= 0 ? '+' : ''}{fmt(myEntry.return_pct)}% return
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wide">Rank</th>
                <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wide">Trader</th>
                <th className="text-right px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wide">Portfolio Value</th>
                <th className="text-right px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wide">Return</th>
                <th className="text-right px-6 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wide">Trades</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-6 py-4"><Skeleton className="h-4 w-6" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28 ml-auto" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-10 ml-auto" /></td>
                    </tr>
                  ))
                : error
                ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">{error}</td>
                    </tr>
                  )
                : entries.length === 0
                ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No traders yet. Be the first!</td>
                    </tr>
                  )
                : entries.map(entry => {
                    const isMe = entry.username === currentUser
                    const positive = entry.return_pct >= 0
                    return (
                      <tr
                        key={entry.rank}
                        className={`border-b border-border last:border-0 transition-colors ${
                          isMe ? 'bg-primary/5' : 'hover:bg-secondary/50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className={`text-sm font-bold ${RANK_STYLES[entry.rank] ?? 'text-muted-foreground'}`}>
                            {RANK_ICONS[entry.rank] ?? `#${entry.rank}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                              {entry.username[0]?.toUpperCase()}
                            </div>
                            <span className={`text-sm font-medium ${isMe ? 'text-primary' : 'text-foreground'}`}>
                              {entry.username}{isMe ? ' (you)' : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-foreground">
                          ₹{fmt(entry.total_value)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`flex items-center justify-end gap-1 text-sm font-semibold ${positive ? 'text-primary' : 'text-red-400'}`}>
                            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {positive ? '+' : ''}{fmt(entry.return_pct)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                          {entry.num_trades}
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-border">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))
            : entries.map(entry => {
                const isMe = entry.username === currentUser
                const positive = entry.return_pct >= 0
                return (
                  <div key={entry.rank} className={`p-4 flex items-center gap-3 ${isMe ? 'bg-primary/5' : ''}`}>
                    <span className={`text-lg w-8 text-center ${RANK_STYLES[entry.rank] ?? 'text-muted-foreground text-sm font-bold'}`}>
                      {RANK_ICONS[entry.rank] ?? `#${entry.rank}`}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {entry.username[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isMe ? 'text-primary' : 'text-foreground'}`}>
                        {entry.username}{isMe ? ' (you)' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">₹{fmt(entry.total_value)}</p>
                    </div>
                    <span className={`text-sm font-semibold shrink-0 ${positive ? 'text-primary' : 'text-red-400'}`}>
                      {positive ? '+' : ''}{fmt(entry.return_pct)}%
                    </span>
                  </div>
                )
              })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Starting balance: ₹10,00,000 · Returns include unrealized P&L on open positions
      </p>
    </div>
  )
}
