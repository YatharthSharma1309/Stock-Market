import { Bot, User } from 'lucide-react'
import type { Message } from '@/hooks/useAIAssistant'

interface Props {
  message: Message
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
        isUser ? 'bg-primary/20' : 'bg-secondary border border-border'
      }`}>
        {isUser
          ? <User className="h-3.5 w-3.5 text-primary" />
          : <Bot className="h-3.5 w-3.5 text-muted-foreground" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-primary text-primary-foreground rounded-tr-sm'
          : message.isError
            ? 'bg-red-500/10 text-red-400 border border-red-500/20 rounded-tl-sm'
            : 'bg-secondary text-foreground rounded-tl-sm'
      }`}>
        {message.content || (message.streaming ? '' : '…')}
        {message.streaming && (
          <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-0.5 align-text-bottom" />
        )}
      </div>
    </div>
  )
}
