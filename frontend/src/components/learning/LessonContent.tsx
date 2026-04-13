import { Link } from 'react-router-dom'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import type { Lesson } from '@/data/learningContent'

interface Props {
  lesson: Lesson
  isCompleted: boolean
  isMarking: boolean
  onComplete: () => void
}

export default function LessonContent({ lesson, isCompleted, isMarking, onComplete }: Props) {
  return (
    <article className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{lesson.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-lg shrink-0">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">Completed</span>
          </div>
        )}
      </div>

      {/* Theory */}
      <div className="space-y-4">
        {lesson.theory.map((para, i) => (
          <p key={i} className="text-sm text-foreground leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      {/* Practice box */}
      <div className="bg-secondary border border-border rounded-xl p-5">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Practice</p>
        <p className="text-sm text-muted-foreground mb-4">
          Apply what you've learned on the live simulator.
        </p>
        <Link
          to={lesson.practiceLink}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition"
        >
          {lesson.practiceText}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Mark complete */}
      <div className="pt-2 border-t border-border">
        <button
          onClick={onComplete}
          disabled={isCompleted || isMarking}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
            isCompleted
              ? 'bg-primary/10 text-primary cursor-default'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
          }`}
        >
          {isMarking ? 'Saving…' : isCompleted ? '✓ Lesson completed' : 'Mark as complete'}
        </button>
      </div>
    </article>
  )
}
