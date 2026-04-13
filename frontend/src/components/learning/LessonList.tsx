import { CheckCircle2, Circle } from 'lucide-react'
import type { Lesson } from '@/data/learningContent'

interface Props {
  lessons: Lesson[]
  activeLessonId: string
  completedIds: Set<string>
  onSelect: (lessonId: string) => void
}

export default function LessonList({ lessons, activeLessonId, completedIds, onSelect }: Props) {
  return (
    <nav className="flex flex-col gap-1">
      {lessons.map((lesson, idx) => {
        const isActive = lesson.id === activeLessonId
        const isDone = completedIds.has(lesson.id)
        return (
          <button
            key={lesson.id}
            onClick={() => onSelect(lesson.id)}
            className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {isDone
                ? <CheckCircle2 className="h-4 w-4 text-primary" />
                : <Circle className="h-4 w-4" />
              }
            </span>
            <span className="text-sm font-medium leading-snug">
              <span className="text-xs opacity-60 mr-1">{idx + 1}.</span>
              {lesson.title}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
