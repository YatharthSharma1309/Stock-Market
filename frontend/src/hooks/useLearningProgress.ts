import { useState, useEffect, useCallback } from 'react'
import api from '@/services/api'

interface LearningProgress {
  completedIds: Set<string>
  totalCompleted: number
  streakDays: number
  isLoading: boolean
  markComplete: (lessonId: string) => Promise<void>
}

export function useLearningProgress(): LearningProgress {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [totalCompleted, setTotalCompleted] = useState(0)
  const [streakDays, setStreakDays] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get('/api/learning/progress')
      .then(r => {
        const ids: string[] = r.data.completed_lesson_ids
        setCompletedIds(new Set(ids))
        setTotalCompleted(r.data.total_completed)
        setStreakDays(r.data.streak_days)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const markComplete = useCallback(async (lessonId: string) => {
    // Optimistic update
    setCompletedIds(prev => new Set([...prev, lessonId]))
    setTotalCompleted(prev => prev + 1)
    try {
      await api.post(`/api/learning/complete/${lessonId}`)
    } catch {
      // Roll back on failure
      setCompletedIds(prev => {
        const next = new Set(prev)
        next.delete(lessonId)
        return next
      })
      setTotalCompleted(prev => prev - 1)
    }
  }, [])

  return { completedIds, totalCompleted, streakDays, isLoading, markComplete }
}
