import { MODULES } from '@/data/learningContent'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import ProgressBanner from '@/components/learning/ProgressBanner'
import ModuleCard from '@/components/learning/ModuleCard'

export default function LearningPage() {
  const { completedIds, totalCompleted, streakDays, isLoading } = useLearningProgress()

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Learning Centre</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Master trading through structured modules and hands-on practice.
        </p>
      </div>

      <ProgressBanner
        totalCompleted={totalCompleted}
        streakDays={streakDays}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5">
        {MODULES.map(module => (
          <ModuleCard
            key={module.id}
            module={module}
            completedCount={module.lessons.filter(l => completedIds.has(l.id)).length}
          />
        ))}
      </div>
    </div>
  )
}
