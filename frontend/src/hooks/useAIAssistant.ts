import { useState, useCallback, useRef } from 'react'
import type { ChatContext } from '@/context/AIContext'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  isError?: boolean
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const loadHistory = useCallback(async () => {
    if (historyLoaded) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/api/ai/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data: { role: string; content: string }[] = await res.json()
        setMessages(data.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })))
      }
    } catch { /* ignore */ }
    setHistoryLoaded(true)
  }, [historyLoaded])

  const sendMessage = useCallback(async (text: string, context?: ChatContext) => {
    if (streaming || !text.trim()) return

    const userMsg: Message = { role: 'user', content: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setStreaming(true)

    // Add empty assistant placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    const abort = new AbortController()
    abortRef.current = abort

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text.trim(), context }),
        signal: abort.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        let streamDone = false
        for (const line of lines) {
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') { streamDone = true; break }

          try {
            const event = JSON.parse(payload)
            if (event.type === 'delta') {
              assistantText += event.text
              setMessages(prev => {
                const copy = [...prev]
                copy[copy.length - 1] = { role: 'assistant', content: assistantText, streaming: true }
                return copy
              })
            } else if (event.type === 'done') {
              setMessages(prev => {
                const copy = [...prev]
                copy[copy.length - 1] = { role: 'assistant', content: assistantText, streaming: false }
                return copy
              })
            } else if (event.type === 'error') {
              setMessages(prev => {
                const copy = [...prev]
                copy[copy.length - 1] = { role: 'assistant', content: event.detail, streaming: false, isError: true }
                return copy
              })
            }
          } catch { /* skip malformed lines */ }
        }
        if (streamDone) break
      }
    } catch (e: unknown) {
      if ((e as Error)?.name === 'AbortError') return
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = {
          role: 'assistant',
          content: 'Could not reach the AI service. Please check your connection and try again.',
          streaming: false,
          isError: true,
        }
        return copy
      })
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [streaming])

  const clearHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_BASE}/api/ai/history`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch { /* ignore */ }
    setMessages([])
    setHistoryLoaded(true)
  }, [])

  return { messages, streaming, sendMessage, loadHistory, clearHistory }
}
