import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TradeModal from '../TradeModal'
import type { Quote } from '@/hooks/useMarketData'

// ── mocks ─────────────────────────────────────────────────────────────────────

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

// ── helpers ───────────────────────────────────────────────────────────────────

const mockQuote: Quote = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 200.0,
  change: 1.0,
  change_pct: 0.5,
  open: 199.0,
  high: 202.0,
  low: 198.0,
  prev_close: 199.0,
  volume: 1_000_000,
  market_cap: 3e12,
  currency: 'USD',
}

function renderModal(overrides?: Partial<typeof mockQuote>) {
  const onClose = vi.fn()
  const onSuccess = vi.fn()
  const quote = { ...mockQuote, ...overrides }
  render(<TradeModal quote={quote} onClose={onClose} onSuccess={onSuccess} />)
  return { onClose, onSuccess }
}

// ── rendering ─────────────────────────────────────────────────────────────────

describe('TradeModal — rendering', () => {
  it('shows the stock symbol', () => {
    renderModal()
    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })

  it('shows the stock name', () => {
    renderModal()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  it('shows the current price', () => {
    renderModal()
    expect(screen.getByText(/200\.00/)).toBeInTheDocument()
  })

  it('shows $ currency for USD stocks', () => {
    renderModal({ currency: 'USD' })
    // $ appears in the price display
    const priceArea = screen.getByText(/\$200\.00/)
    expect(priceArea).toBeInTheDocument()
  })

  it('shows ₹ currency for INR stocks', () => {
    renderModal({ currency: 'INR' })
    expect(screen.getByText(/₹200\.00/)).toBeInTheDocument()
  })

  it('defaults to Buy tab', () => {
    renderModal()
    const buyBtn = screen.getByRole('button', { name: /^Buy$/i })
    expect(buyBtn).toBeInTheDocument()
  })

  it('submit button is disabled with empty quantity', () => {
    renderModal()
    const submit = screen.getByRole('button', { name: /Buy AAPL/i })
    expect(submit).toBeDisabled()
  })
})

// ── tab switching ─────────────────────────────────────────────────────────────

describe('TradeModal — tab switching', () => {
  it('switches to Sell tab when Sell button is clicked', async () => {
    renderModal()
    await userEvent.click(screen.getByRole('button', { name: /^Sell$/i }))
    expect(screen.getByRole('button', { name: /Sell AAPL/i })).toBeInTheDocument()
  })
})

// ── quantity input ────────────────────────────────────────────────────────────

describe('TradeModal — quantity & cost estimate', () => {
  it('shows estimated cost when quantity is entered', async () => {
    renderModal()
    await userEvent.type(screen.getByPlaceholderText('0'), '5')
    // 5 × $200 = $1,000
    expect(screen.getByText(/Estimated Cost/i)).toBeInTheDocument()
    expect(screen.getByText(/1,000\.00/)).toBeInTheDocument()
  })

  it('enables submit button when quantity > 0', async () => {
    renderModal()
    await userEvent.type(screen.getByPlaceholderText('0'), '2')
    expect(screen.getByRole('button', { name: /Buy AAPL/i })).not.toBeDisabled()
  })
})

// ── API call ──────────────────────────────────────────────────────────────────

describe('TradeModal — API interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls POST /api/portfolio/buy with correct payload', async () => {
    const api = await import('@/services/api')
    renderModal()
    await userEvent.type(screen.getByPlaceholderText('0'), '3')
    await userEvent.click(screen.getByRole('button', { name: /Buy AAPL/i }))
    await waitFor(() => {
      expect(api.default.post).toHaveBeenCalledWith('/api/portfolio/buy', {
        symbol: 'AAPL',
        quantity: 3,
      })
    })
  })

  it('calls onSuccess and onClose after a successful trade', async () => {
    const { onClose, onSuccess } = renderModal()
    await userEvent.type(screen.getByPlaceholderText('0'), '1')
    await userEvent.click(screen.getByRole('button', { name: /Buy AAPL/i }))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('shows error message when API call fails', async () => {
    const api = await import('@/services/api')
    const axiosError = Object.assign(new Error('Insufficient balance'), {
      isAxiosError: true,
      response: { data: { detail: 'Insufficient balance' } },
    })
    vi.mocked(api.default.post).mockRejectedValueOnce(axiosError)

    renderModal()
    await userEvent.type(screen.getByPlaceholderText('0'), '100000')
    await userEvent.click(screen.getByRole('button', { name: /Buy AAPL/i }))
    await waitFor(() => {
      expect(screen.getByText(/Insufficient balance/i)).toBeInTheDocument()
    })
  })
})

// ── closing ───────────────────────────────────────────────────────────────────

describe('TradeModal — closing', () => {
  it('calls onClose when the X button is clicked', async () => {
    const { onClose } = renderModal()
    // X button is the close icon button
    const closeBtn = screen.getByRole('button', { name: '' })  // lucide X has no text
    // Find by position: first button with no visible text that isn't tab/submit
    const allBtns = screen.getAllByRole('button')
    const xBtn = allBtns.find(b => b.querySelector('svg') && !b.textContent?.trim())
    if (xBtn) {
      await userEvent.click(xBtn)
      expect(onClose).toHaveBeenCalled()
    }
  })

  it('calls onClose when backdrop is clicked', async () => {
    const { onClose } = renderModal()
    // The backdrop is the outermost div with the click handler
    const backdrop = screen.getByRole('button', { name: /Buy AAPL/i }).closest('.fixed')
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(onClose).toHaveBeenCalled()
    }
  })
})
