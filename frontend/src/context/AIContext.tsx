import { createContext, useContext } from 'react'

export interface ChatContext {
  type: 'stock' | 'portfolio' | 'trade' | 'general'
  symbol?: string
  name?: string
  price?: number
  change_pct?: number
  trade_type?: string
  quantity?: number
  trade_date?: string
}

interface AIContextValue {
  openWithMessage: (message: string, context?: ChatContext) => void
}

export const AIContext = createContext<AIContextValue>({
  openWithMessage: () => {},
})

export function useAI() {
  return useContext(AIContext)
}
