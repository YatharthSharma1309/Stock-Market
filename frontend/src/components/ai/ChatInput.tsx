import { useRef, useEffect, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface Props {
  onSend: (text: string) => void
  disabled: boolean
  placeholder?: string
}

export default function ChatInput({ onSend, disabled, placeholder = 'Ask about a stock, strategy, or your portfolio…' }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  // Auto-resize up to 3 rows
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
  })

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const text = ref.current?.value.trim()
    if (!text || disabled) return
    onSend(text)
    if (ref.current) ref.current.value = ''
  }

  return (
    <div className="flex gap-2 items-end p-3 border-t border-border">
      <textarea
        ref={ref}
        rows={1}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 resize-none bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition disabled:opacity-50 leading-relaxed"
      />
      <button
        onClick={submit}
        disabled={disabled}
        className="shrink-0 w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  )
}
