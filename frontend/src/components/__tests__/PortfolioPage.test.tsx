import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PortfolioPage from '@/pages/PortfolioPage'

// ── mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('@/context/AIContext', () => ({
  useAI: () => ({ openWithMessage: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// ── helpers ───────────────────────────────────────────────────────────────────

const emptyPortfolio = {
  virtual_balance: 1_000_000,
  holdings_value: 0,
  total_value: 1_000_000,
  total_invested: 0,
  unrealized_pnl: 0,
  unrealized_pnl_pct: 0,
  holdings: [],
}

const portfolioWithHoldings = {
  virtual_balance: 800_000,
  holdings_value: 200_000,
  total_value: 1_000_000,
  total_invested: 180_000,
  unrealized_pnl: 20_000,
  unrealized_pnl_pct: 11.11,
  holdings: [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 10,
      avg_buy_price: 180,
      current_price: 200,
      current_value: 2000,
      unrealized_pnl: 200,
      unrealized_pnl_pct: 11.11,
    },
    {
      symbol: 'RELIANCE.NS',
      name: 'Reliance Industries',
      quantity: 5,
      avg_buy_price: 2400,
      current_price: 2500,
      current_value: 12500,
      unrealized_pnl: 500,
      unrealized_pnl_pct: 4.17,
    },
  ],
}

function renderPage() {
  return render(
    <MemoryRouter>
      <PortfolioPage />
    </MemoryRouter>
  )
}

// ── loading state ─────────────────────────────────────────────────────────────

describe('PortfolioPage — loading state', () => {
  it('shows loading text while fetching', async () => {
    const api = await import('@/services/api')
    vi.mocked(api.default.get).mockReturnValue(new Promise(() => {})) // never resolves
    renderPage()
    expect(screen.getByText(/Loading portfolio/i)).toBeInTheDocument()
  })
})

// ── empty portfolio ───────────────────────────────────────────────────────────

describe('PortfolioPage — empty portfolio', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const api = await import('@/services/api')
    vi.mocked(api.default.get).mockResolvedValue({ data: emptyPortfolio })
  })

  it('shows summary cards after load', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/Total Portfolio/i)).toBeInTheDocument())
  })

  it('shows empty holdings message', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/No holdings yet/i)).toBeInTheDocument())
  })

  it('shows browse markets link when empty', async () => {
    renderPage()
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /Browse markets/i })
      expect(link).toHaveAttribute('href', '/markets')
    })
  })

  it('shows Trade History link in header', async () => {
    renderPage()
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /Trade History/i })
      expect(link).toHaveAttribute('href', '/trades')
    })
  })
})

// ── portfolio with holdings ───────────────────────────────────────────────────

describe('PortfolioPage — with holdings', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const api = await import('@/services/api')
    vi.mocked(api.default.get).mockResolvedValue({ data: portfolioWithHoldings })
  })

  it('renders a row for each holding', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
      expect(screen.getByText('Reliance Industries')).toBeInTheDocument()
    })
  })

  it('strips .NS suffix from the symbol cell', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('RELIANCE')).toBeInTheDocument())
  })

  it('shows quantity for each holding', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument())
  })

  it('shows positive P&L with + prefix', async () => {
    renderPage()
    await waitFor(() => {
      // unrealized_pnl of first holding is 200
      expect(screen.getByText(/\+.*200\.00/)).toBeInTheDocument()
    })
  })

  it('shows Trade button for each holding', async () => {
    renderPage()
    await waitFor(() => {
      const tradeBtns = screen.getAllByRole('button', { name: /Trade/i })
      expect(tradeBtns).toHaveLength(2)
    })
  })

  it('shows holding count badge', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText(/2 stocks/i)).toBeInTheDocument())
  })
})

// ── summary card values ───────────────────────────────────────────────────────

describe('PortfolioPage — summary cards', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const api = await import('@/services/api')
    vi.mocked(api.default.get).mockResolvedValue({ data: portfolioWithHoldings })
  })

  it('displays total portfolio value', async () => {
    renderPage()
    // en-IN locale: 1,000,000 → "10,00,000.00"
    await waitFor(() => expect(screen.getByText(/10,00,000\.00/)).toBeInTheDocument())
  })

  it('displays unrealized P&L as positive', async () => {
    renderPage()
    await waitFor(() => {
      // unrealized_pnl = 20000 → "20,000.00" in en-IN
      expect(screen.getByText(/\+.*20,000\.00/)).toBeInTheDocument()
    })
  })
})

// ── refresh button ────────────────────────────────────────────────────────────

describe('PortfolioPage — refresh', () => {
  it('re-fetches portfolio when Refresh is clicked', async () => {
    vi.clearAllMocks()
    const api = await import('@/services/api')
    vi.mocked(api.default.get).mockResolvedValue({ data: emptyPortfolio })
    renderPage()
    await waitFor(() => screen.getByRole('button', { name: /Refresh/i }))
    await userEvent.click(screen.getByRole('button', { name: /Refresh/i }))
    // get called once on mount, once on click
    await waitFor(() => expect(api.default.get).toHaveBeenCalledTimes(2))
  })
})

// ── trade modal ───────────────────────────────────────────────────────────────

describe('PortfolioPage — trade modal', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const api = await import('@/services/api')
    vi.mocked(api.default.get).mockResolvedValue({ data: portfolioWithHoldings })
    vi.mocked(api.default.post).mockResolvedValue({ data: {} })
  })

  it('opens TradeModal when Trade button is clicked', async () => {
    renderPage()
    const tradeBtns = await screen.findAllByRole('button', { name: /Trade/i })
    await userEvent.click(tradeBtns[0])
    // Modal shows Buy/Sell submit button
    await waitFor(() => expect(screen.getByRole('button', { name: /Buy AAPL/i })).toBeInTheDocument())
  })
})
