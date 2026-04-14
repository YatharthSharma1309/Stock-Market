import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StockTable from '../StockTable'
import type { Quote } from '@/hooks/useMarketData'

// ── helpers ───────────────────────────────────────────────────────────────────

function makeQuote(overrides: Partial<Quote> = {}): Quote {
  return {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 180.5,
    change: 2.5,
    change_pct: 1.4,
    open: 178.0,
    high: 182.0,
    low: 177.5,
    prev_close: 178.0,
    volume: 1_000_000,
    market_cap: 2.8e12,
    currency: 'USD',
    ...overrides,
  }
}

function renderTable(quotes: Quote[], loading = false, onTrade?: (q: Quote) => void) {
  return render(
    <MemoryRouter>
      <StockTable quotes={quotes} loading={loading} onTrade={onTrade} />
    </MemoryRouter>
  )
}

// ── loading state ─────────────────────────────────────────────────────────────

describe('StockTable — loading state', () => {
  it('shows spinner and loading text when loading=true', () => {
    renderTable([], true)
    expect(screen.getByText(/Fetching live prices/i)).toBeInTheDocument()
  })

  it('does not show table rows while loading', () => {
    renderTable([makeQuote()], true)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})

// ── empty state ───────────────────────────────────────────────────────────────

describe('StockTable — empty state', () => {
  it('shows unavailable message when quotes=[] and not loading', () => {
    renderTable([], false)
    expect(screen.getByText(/Market data temporarily unavailable/i)).toBeInTheDocument()
  })
})

// ── data rendering ────────────────────────────────────────────────────────────

describe('StockTable — data rendering', () => {
  it('renders one row per quote', () => {
    renderTable([makeQuote(), makeQuote({ symbol: 'MSFT', name: 'Microsoft' })])
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    expect(screen.getByText('Microsoft')).toBeInTheDocument()
  })

  it('strips .NS suffix from symbol in the link', () => {
    renderTable([makeQuote({ symbol: 'RELIANCE.NS', name: 'Reliance' })])
    expect(screen.getByText('RELIANCE')).toBeInTheDocument()
  })

  it('strips .BO suffix from symbol in the link', () => {
    renderTable([makeQuote({ symbol: 'TCS.BO', name: 'Tata Consultancy Services' })])
    expect(screen.getByText('TCS')).toBeInTheDocument()
  })

  it('symbol cell is a link to /stocks/:symbol', () => {
    renderTable([makeQuote({ symbol: 'AAPL' })])
    const link = screen.getByRole('link', { name: 'AAPL' })
    expect(link).toHaveAttribute('href', '/stocks/AAPL')
  })

  it('shows formatted market cap in billions', () => {
    renderTable([makeQuote({ market_cap: 2.8e12 })])
    expect(screen.getByText('2.80T')).toBeInTheDocument()
  })

  it('shows — for null price', () => {
    renderTable([makeQuote({ price: null })])
    // Multiple — dashes appear for null numeric columns
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })
})

// ── positive / negative colouring ────────────────────────────────────────────

describe('StockTable — P&L colouring', () => {
  it('renders positive change_pct without errors', () => {
    renderTable([makeQuote({ change_pct: 1.4 })])
    expect(screen.getByText(/\+1\.40%/)).toBeInTheDocument()
  })

  it('renders negative change_pct without errors', () => {
    renderTable([makeQuote({ change_pct: -2.3 })])
    expect(screen.getByText(/-2\.30%/)).toBeInTheDocument()
  })
})

// ── Trade button ──────────────────────────────────────────────────────────────

describe('StockTable — Trade button', () => {
  it('shows Trade button when onTrade prop is provided', () => {
    renderTable([makeQuote()], false, vi.fn())
    expect(screen.getByRole('button', { name: /Trade/i })).toBeInTheDocument()
  })

  it('hides Trade button when onTrade is not provided', () => {
    renderTable([makeQuote()])
    expect(screen.queryByRole('button', { name: /Trade/i })).not.toBeInTheDocument()
  })

  it('calls onTrade with the quote when Trade button is clicked', () => {
    const onTrade = vi.fn()
    const quote = makeQuote()
    renderTable([quote], false, onTrade)
    fireEvent.click(screen.getByRole('button', { name: /Trade/i }))
    expect(onTrade).toHaveBeenCalledTimes(1)
    expect(onTrade).toHaveBeenCalledWith(quote)
  })
})
