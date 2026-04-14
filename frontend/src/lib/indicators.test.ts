import { describe, it, expect } from 'vitest'
import { computeSMA, computeEMA, computeBB, computeRSI, computeMACD, type Candle } from './indicators'

function makeCandles(closes: number[]): Candle[] {
  return closes.map((close, i) => ({ time: i + 1, open: close, high: close, low: close, close, volume: 0 }))
}

// ─── SMA ────────────────────────────────────────────────────────────────────

describe('computeSMA', () => {
  it('returns empty when data is shorter than period', () => {
    expect(computeSMA(makeCandles([1, 2, 3]), 5)).toEqual([])
  })

  it('computes correct 3-period SMA', () => {
    const result = computeSMA(makeCandles([1, 2, 3, 4, 5]), 3)
    expect(result).toHaveLength(3)
    expect(result[0].value).toBeCloseTo(2)   // (1+2+3)/3
    expect(result[1].value).toBeCloseTo(3)   // (2+3+4)/3
    expect(result[2].value).toBeCloseTo(4)   // (3+4+5)/3
  })

  it('timestamps match the candle times', () => {
    const candles = makeCandles([10, 20, 30])
    const result = computeSMA(candles, 2)
    expect(result[0].time).toBe(candles[1].time)
    expect(result[1].time).toBe(candles[2].time)
  })

  it('handles period equal to data length', () => {
    const result = computeSMA(makeCandles([2, 4, 6]), 3)
    expect(result).toHaveLength(1)
    expect(result[0].value).toBeCloseTo(4)
  })

  it('handles constant prices', () => {
    const result = computeSMA(makeCandles([5, 5, 5, 5, 5]), 3)
    result.forEach(p => expect(p.value).toBeCloseTo(5))
  })
})

// ─── EMA ────────────────────────────────────────────────────────────────────

describe('computeEMA', () => {
  it('returns empty when data is shorter than period', () => {
    expect(computeEMA(makeCandles([1, 2]), 3)).toEqual([])
  })

  it('first EMA value equals the SMA seed', () => {
    const closes = [10, 20, 30, 40]
    const result = computeEMA(makeCandles(closes), 3)
    // Seed = (10+20+30)/3 = 20
    expect(result[0].value).toBeCloseTo(20)
  })

  it('subsequent values apply the multiplier correctly', () => {
    const closes = [10, 20, 30, 40]
    const k = 2 / (3 + 1) // 0.5
    const seed = (10 + 20 + 30) / 3  // 20
    const expected = 40 * k + seed * (1 - k)  // 40*0.5 + 20*0.5 = 30
    const result = computeEMA(makeCandles(closes), 3)
    expect(result[1].value).toBeCloseTo(expected)
  })

  it('EMA stays constant for constant prices', () => {
    const result = computeEMA(makeCandles([5, 5, 5, 5, 5]), 3)
    result.forEach(p => expect(p.value).toBeCloseTo(5))
  })
})

// ─── Bollinger Bands ────────────────────────────────────────────────────────

describe('computeBB', () => {
  it('upper === lower === middle when prices are constant (zero std dev)', () => {
    const result = computeBB(makeCandles([100, 100, 100, 100, 100]), 5, 2)
    expect(result.middle).toHaveLength(1)
    expect(result.upper[0].value).toBeCloseTo(100)
    expect(result.lower[0].value).toBeCloseTo(100)
    expect(result.middle[0].value).toBeCloseTo(100)
  })

  it('upper > middle > lower for non-constant prices', () => {
    const result = computeBB(makeCandles([95, 98, 100, 102, 105]), 5)
    expect(result.upper[0].value).toBeGreaterThan(result.middle[0].value)
    expect(result.middle[0].value).toBeGreaterThan(result.lower[0].value)
  })

  it('band width scales with multiplier', () => {
    const candles = makeCandles([95, 98, 100, 102, 105])
    const bb1 = computeBB(candles, 5, 1)
    const bb2 = computeBB(candles, 5, 2)
    const width1 = bb1.upper[0].value - bb1.lower[0].value
    const width2 = bb2.upper[0].value - bb2.lower[0].value
    expect(width2).toBeCloseTo(width1 * 2)
  })

  it('returns correct number of points', () => {
    const n = 10
    const period = 4
    const result = computeBB(makeCandles(Array(n).fill(50)), period)
    expect(result.middle).toHaveLength(n - period + 1)
  })
})

// ─── RSI ────────────────────────────────────────────────────────────────────

describe('computeRSI', () => {
  it('returns empty when data is too short', () => {
    expect(computeRSI(makeCandles([1, 2, 3]), 14)).toEqual([])
  })

  it('RSI is 100 for a pure uptrend (no losses)', () => {
    const closes = Array.from({ length: 20 }, (_, i) => i + 1) // 1,2,...,20
    const result = computeRSI(makeCandles(closes), 14)
    // All changes are +1, no losses → avgLoss = 0 → RSI = 100
    expect(result[0].value).toBeCloseTo(100)
  })

  it('RSI is 0 for a pure downtrend (no gains)', () => {
    const closes = Array.from({ length: 20 }, (_, i) => 20 - i) // 20,19,...,1
    const result = computeRSI(makeCandles(closes), 14)
    // All changes are -1, no gains → avgGain = 0 → RSI = 0
    expect(result[0].value).toBeCloseTo(0)
  })

  it('RSI is ~50 for alternating up/down of equal magnitude', () => {
    const closes: number[] = [100]
    for (let i = 0; i < 30; i++) closes.push(closes[closes.length - 1] + (i % 2 === 0 ? 1 : -1))
    const result = computeRSI(makeCandles(closes), 14)
    // Should hover around 50 after warmup
    expect(result[result.length - 1].value).toBeGreaterThan(40)
    expect(result[result.length - 1].value).toBeLessThan(60)
  })

  it('values are always in [0, 100]', () => {
    const closes = [10, 11, 9, 12, 8, 15, 7, 14, 10, 11, 13, 9, 8, 12, 14, 11, 10]
    const result = computeRSI(makeCandles(closes), 5)
    result.forEach(p => {
      expect(p.value).toBeGreaterThanOrEqual(0)
      expect(p.value).toBeLessThanOrEqual(100)
    })
  })
})

// ─── MACD ────────────────────────────────────────────────────────────────────

describe('computeMACD', () => {
  it('returns empty arrays when data is too short', () => {
    const result = computeMACD(makeCandles(Array(10).fill(100)), 12, 26, 9)
    expect(result.macdLine).toEqual([])
    expect(result.signalLine).toEqual([])
    expect(result.histogram).toEqual([])
  })

  it('returns correct length arrays for sufficient data', () => {
    // Need at least slow(26) + signal(9) - 1 = 34 candles
    const candles = makeCandles(Array.from({ length: 60 }, (_, i) => 100 + i * 0.5))
    const { macdLine, signalLine, histogram } = computeMACD(candles)
    expect(macdLine.length).toBeGreaterThan(0)
    expect(signalLine.length).toBeGreaterThan(0)
    expect(histogram.length).toBe(signalLine.length)
  })

  it('histogram = macdLine - signalLine', () => {
    const candles = makeCandles(Array.from({ length: 60 }, (_, i) => 100 + Math.sin(i * 0.3) * 5))
    const { macdLine, signalLine, histogram } = computeMACD(candles)
    const offset = macdLine.length - signalLine.length
    for (let i = 0; i < signalLine.length; i++) {
      expect(histogram[i].value).toBeCloseTo(macdLine[offset + i].value - signalLine[i].value, 5)
    }
  })

  it('MACD is near 0 for constant prices (EMA12 ≈ EMA26)', () => {
    const candles = makeCandles(Array(60).fill(100))
    const { macdLine } = computeMACD(candles)
    macdLine.forEach(p => expect(Math.abs(p.value)).toBeLessThan(1e-8))
  })
})
