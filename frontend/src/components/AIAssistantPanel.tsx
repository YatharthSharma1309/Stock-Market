import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Bot, X, Trash2 } from 'lucide-react'
import { useAIAssistant } from '@/hooks/useAIAssistant'
import ChatMessage from '@/components/ai/ChatMessage'
import ChatInput from '@/components/ai/ChatInput'
import TypingIndicator from '@/components/ai/TypingIndicator'
import type { ChatContext } from '@/context/AIContext'

export interface AIAssistantHandle {
  openWithMessage: (message: string, context?: ChatContext) => void
}

const AIAssistantPanel = forwardRef<AIAssistantHandle>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, streaming, sendMessage, loadHistory, clearHistory } = useAIAssistant()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pendingRef = useRef<{ message: string; context?: ChatContext } | null>(null)

  useImperativeHandle(ref, () => ({
    openWithMessage(message: string, context?: ChatContext) {
      pendingRef.current = { message, context }
      setIsOpen(true)
    },
  }))

  // Load history when panel first opens
  useEffect(() => {
    if (isOpen) {
      loadHistory().then(() => {
        // Send pending message after history loads
        if (pendingRef.current) {
          const { message, context } = pendingRef.current
          pendingRef.current = null
          sendMessage(message, context)
        }
      })
    }
  // loadHistory is stable (only re-creates when historyLoaded flips once).
  // sendMessage is stable between streams. Adding both satisfies the exhaustive-deps rule
  // while remaining safe: the extra invocations are no-ops (loadHistory returns early
  // once loaded; pendingRef is null after the first send).
  }, [isOpen, loadHistory, sendMessage])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const showTyping = streaming && messages.length > 0 && messages[messages.length - 1].content === ''

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition flex items-center justify-center"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">AI Trading Coach</p>
                <p className="text-xs text-muted-foreground">Powered by Claude</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearHistory}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                title="Clear conversation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !streaming && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Ask me anything</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-56">
                    I can explain indicators, analyse your portfolio, or coach you on any trade.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 w-full mt-2">
                  {[
                    'What is RSI and how do I use it?',
                    'Analyse my portfolio',
                    'Explain a covered call strategy',
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="text-xs text-left px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 hover:text-primary transition text-muted-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {showTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={sendMessage} disabled={streaming} />
        </div>
      )}
    </>
  )
})

AIAssistantPanel.displayName = 'AIAssistantPanel'
export default AIAssistantPanel
