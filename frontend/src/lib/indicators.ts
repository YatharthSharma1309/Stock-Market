export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface LinePoint {
  time: number
  value: number
}

// O(n) sliding-window SMA
export function computeSMA(candles: Candle[], period: number): LinePoint[] {
  if (candles.length < period) return []
  const result: LinePoint[] = []
  let sum = 0
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close
    if (i >= period) sum -= candles[i - period].close
    if (i >= period - 1) result.push({ time: candles[i].time, value: sum / period })
  }
  return result
}

// Wilder / standard EMA seeded from first SMA
export function computeEMA(candles: Candle[], period: number): LinePoint[] {
  if (candles.length < period) return []
  const k = 2 / (period + 1)
  let ema = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period
  const result: LinePoint[] = [{ time: candles[period - 1].time, value: ema }]
  for (let i = period; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k)
    result.push({ time: candles[i].time, value: ema })
  }
  return result
}

export interface BBResult {
  upper: LinePoint[]
  middle: LinePoint[]
  lower: LinePoint[]
}

export function computeBB(candles: Candle[], period = 20, multiplier = 2): BBResult {
  const upper: LinePoint[] = []
  const middle: LinePoint[] = []
  const lower: LinePoint[] = []
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1)
    const mean = slice.reduce((s, c) => s + c.close, 0) / period
    const variance = slice.reduce((s, c) => s + (c.close - mean) ** 2, 0) / period
    const std = Math.sqrt(variance)
    middle.push({ time: candles[i].time, value: mean })
    upper.push({ time: candles[i].time, value: mean + multiplier * std })
    lower.push({ time: candles[i].time, value: mean - multiplier * std })
  }
  return { upper, middle, lower }
}

// RSI with Wilder smoothing (period = 14)
export function computeRSI(candles: Candle[], period = 14): LinePoint[] {
  if (candles.length < period + 1) return []
  const gains: number[] = []
  const losses: number[] = []
  for (let i = 1; i < candles.length; i++) {
    const d = candles[i].close - candles[i - 1].close
    gains.push(Math.max(d, 0))
    losses.push(Math.max(-d, 0))
  }
  let avgGain = gains.slice(0, period).reduce((s, v) => s + v, 0) / period
  let avgLoss = losses.slice(0, period).reduce((s, v) => s + v, 0) / period
  const rsi = (ag: number, al: number) => al === 0 ? 100 : 100 - 100 / (1 + ag / al)
  const result: LinePoint[] = [{ time: candles[period].time, value: rsi(avgGain, avgLoss) }]
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period
    result.push({ time: candles[i + 1].time, value: rsi(avgGain, avgLoss) })
  }
  return result
}

export interface MACDResult {
  macdLine: LinePoint[]
  signalLine: LinePoint[]
  histogram: LinePoint[]
}

// Standard MACD: fast=12, slow=26, signal=9
export function computeMACD(candles: Candle[], fast = 12, slow = 26, signal = 9): MACDResult {
  const ema12 = computeEMA(candles, fast)   // ema12[i] → candles[fast-1+i]
  const ema26 = computeEMA(candles, slow)   // ema26[i] → candles[slow-1+i]
  if (!ema12.length || !ema26.length) return { macdLine: [], signalLine: [], histogram: [] }

  const offset = slow - fast  // 14 — how far ema12 is ahead of ema26
  const macdLine: LinePoint[] = ema26.map((p, i) => ({
    time: p.time,
    value: ema12[i + offset].value - p.value,
  }))

  // Signal = EMA(macdLine, 9) — treat macdLine values as "close" prices
  const macdCandles: Candle[] = macdLine.map(p => ({
    time: p.time, open: p.value, high: p.value, low: p.value, close: p.value, volume: 0,
  }))
  const signalEMA = computeEMA(macdCandles, signal)
  if (!signalEMA.length) return { macdLine, signalLine: [], histogram: [] }

  const sigOffset = signal - 1
  const signalLine: LinePoint[] = []
  const histogram: LinePoint[] = []
  for (let i = 0; i < signalEMA.length; i++) {
    signalLine.push({ time: signalEMA[i].time, value: signalEMA[i].value })
    histogram.push({ time: signalEMA[i].time, value: macdLine[sigOffset + i].value - signalEMA[i].value })
  }

  return { macdLine, signalLine, histogram }
}
