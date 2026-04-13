import { Link } from 'react-router-dom'
import { BarChart2, TrendingUp, Layers, Zap, CheckCircle2, ArrowRight } from 'lucide-react'
import type { Module } from '@/data/learningContent'

const ICONS: Record<string, React.ElementType> = {
  BarChart2, TrendingUp, Layers, Zap,
}

interface Props {
  module: Module
  completedCount: number
}

export default function ModuleCard({ module, completedCount }: Props) {
  const Icon = ICONS[module.icon] ?? BarChart2
  const total = module.lessons.length
  const pct = Math.round((completedCount / total) * 100)
  const allDone = completedCount === total

  return (
    <Link
      to={`/learn/${module.id}`}
      className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition group flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg bg-secondary ${module.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        {allDone && (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        )}
      </div>

      {/* Title & description */}
      <div className="flex-1">
        <h3 className="font-semibold text-foreground mb-1">{module.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {module.description}
        </p>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>{completedCount} / {total} lessons</span>
          <span className={allDone ? 'text-primary font-medium' : ''}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-primary' : 'bg-primary/70'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition">
        {allDone ? 'Review module' : completedCount > 0 ? 'Continue' : 'Start module'}
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  )
}
