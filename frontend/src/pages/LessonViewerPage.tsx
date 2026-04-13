import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getModule } from '@/data/learningContent'
import { useLearningProgress } from '@/hooks/useLearningProgress'
import LessonList from '@/components/learning/LessonList'
import LessonContent from '@/components/learning/LessonContent'

export default function LessonViewerPage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()
  const module = moduleId ? getModule(moduleId) : undefined
  const { completedIds, markComplete, isLoading } = useLearningProgress()
  const [activeLessonId, setActiveLessonId] = useState<string>('')
  const [isMarking, setIsMarking] = useState(false)

  // Default to first incomplete lesson, else first lesson
  useEffect(() => {
    if (!module || isLoading) return
    if (activeLessonId) return
    const firstIncomplete = module.lessons.find(l => !completedIds.has(l.id))
    setActiveLessonId((firstIncomplete ?? module.lessons[0]).id)
  }, [module, isLoading, completedIds])

  if (!module) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4 min-h-96">
        <p className="text-muted-foreground">Module not found.</p>
        <Link to="/learn" className="text-sm text-primary hover:underline">← Back to Learning Centre</Link>
      </div>
    )
  }

  const activeLesson = module.lessons.find(l => l.id === activeLessonId) ?? module.lessons[0]
  const completedInModule = module.lessons.filter(l => completedIds.has(l.id)).length

  async function handleComplete() {
    if (!activeLesson || isMarking) return
    setIsMarking(true)
    await markComplete(activeLesson.id)
    setIsMarking(false)
    // Advance to next incomplete lesson automatically
    const currentIdx = module!.lessons.findIndex(l => l.id === activeLesson.id)
    const next = module!.lessons.slice(currentIdx + 1).find(l => !completedIds.has(l.id))
    if (next) setActiveLessonId(next.id)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/learn')}
          className="p-1.5 rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{module.title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completedInModule} / {module.lessons.length} lessons completed
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-6 items-start">
        {/* Lesson list sidebar */}
        <aside className="w-64 shrink-0 bg-card border border-border rounded-xl p-4 sticky top-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Lessons
          </p>
          <LessonList
            lessons={module.lessons}
            activeLessonId={activeLessonId}
            completedIds={completedIds}
            onSelect={setActiveLessonId}
          />
        </aside>

        {/* Content panel */}
        <div className="flex-1 bg-card border border-border rounded-xl p-6 min-w-0">
          {activeLesson && (
            <LessonContent
              lesson={activeLesson}
              isCompleted={completedIds.has(activeLesson.id)}
              isMarking={isMarking}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
