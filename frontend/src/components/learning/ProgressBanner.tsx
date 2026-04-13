import { Flame, BookOpen } from 'lucide-react'
import { TOTAL_LESSONS } from '@/data/learningContent'

interface Props {
  totalCompleted: number
  streakDays: number
  isLoading: boolean
}

export default function ProgressBanner({ totalCompleted, streakDays, isLoading }: Props) {
  const pct = Math.round((totalCompleted / TOTAL_LESSONS) * 100)

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-5">
      {/* Streak */}
      <div className="flex items-center gap-3 sm:w-48">
        <div className={`p-2 rounded-lg ${streakDays > 0 ? 'bg-orange-500/10' : 'bg-secondary'}`}>
          <Flame className={`h-5 w-5 ${streakDays > 0 ? 'text-orange-400' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">
            {isLoading ? '—' : `${streakDays} day${streakDays !== 1 ? 's' : ''}`}
          </p>
          <p className="text-xs text-muted-foreground">Learning streak</p>
        </div>
      </div>

      <div className="hidden sm:block w-px h-10 bg-border" />

      {/* Progress */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {isLoading ? '…' : `${totalCompleted} / ${TOTAL_LESSONS} lessons completed`}
            </span>
          </div>
          <span className="text-sm font-semibold text-primary">{isLoading ? '' : `${pct}%`}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
