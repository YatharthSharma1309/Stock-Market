import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts'
import type { IChartApi, UTCTimestamp } from 'lightweight-charts'
import { useStockHistory } from '@/hooks/useStockHistory'
import { computeSMA, computeEMA, computeBB, computeRSI, computeMACD } from '@/lib/indicators'

type Period = '1D' | '1W' | '1M' | '3M' | '1Y'

interface Indicators {
  sma20: boolean
  sma50: boolean
  ema20: boolean
  bb: boolean
  rsi: boolean
  macd: boolean
}

const PERIODS: Period[] = ['1D', '1W', '1M', '3M', '1Y']

const INDICATOR_LABELS: Record<keyof Indicators, string> = {
  sma20: 'SMA 20', sma50: 'SMA 50', ema20: 'EMA 20', bb: 'BB', rsi: 'RSI', macd: 'MACD',
}

// Match the app's dark theme (hsl values from tailwind config)
const THEME = {
  bg: '#0f172a',
  text: '#94a3b8',
  grid: '#1e293b',
  border: '#1e293b',
}

const UP = '#22c55e'
const DOWN = '#f87171'

export default function StockChart({ symbol }: { symbol: string }) {
  const [period, setPeriod] = useState<Period>('1M')
  const [indicators, setIndicators] = useState<Indicators>({
    sma20: false, sma50: false, ema20: false, bb: false, rsi: false, macd: false,
  })

  const mainRef = useRef<HTMLDivElement>(null)
  const oscRef = useRef<HTMLDivElement>(null)
  const volRef = useRef<HTMLDivElement>(null)

  const { candles, loading, error } = useStockHistory(symbol, period)

  const showOsc = indicators.rsi || indicators.macd

  const toggle = (key: keyof Indicators) =>
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }))

  useEffect(() => {
    if (!candles.length || !mainRef.current || !oscRef.current || !volRef.current) return

    const baseOptions = {
      layout: { background: { color: THEME.bg }, textColor: THEME.text },
      grid: { vertLines: { color: THEME.grid }, horzLines: { color: THEME.grid } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: THEME.border },
      timeScale: { borderColor: THEME.border, timeVisible: true, secondsVisible: false },
    }

    // --- Main chart (candlestick + overlays) ---
    const mainChart = createChart(mainRef.current, {
      ...baseOptions,
      width: mainRef.current.clientWidth,
      height: 384,
    })

    const candleSeries = mainChart.addCandlestickSeries({
      upColor: UP, downColor: DOWN,
      borderUpColor: UP, borderDownColor: DOWN,
      wickUpColor: UP, wickDownColor: DOWN,
    })
    candleSeries.setData(
      candles.map(c => ({ time: c.time as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close }))
    )

    if (indicators.sma20) {
      const s = mainChart.addLineSeries({ color: '#f59e0b', lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
      s.setData(computeSMA(candles, 20).map(p => ({ time: p.time as UTCTimestamp, value: p.value })))
    }
    if (indicators.sma50) {
      const s = mainChart.addLineSeries({ color: '#8b5cf6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
      s.setData(computeSMA(candles, 50).map(p => ({ time: p.time as UTCTimestamp, value: p.value })))
    }
    if (indicators.ema20) {
      const s = mainChart.addLineSeries({ color: '#06b6d4', lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
      s.setData(computeEMA(candles, 20).map(p => ({ time: p.time as UTCTimestamp, value: p.value })))
    }
    if (indicators.bb) {
      const { upper, middle, lower } = computeBB(candles, 20, 2)
      const mid = mainChart.addLineSeries({ color: '#f59e0b', lineWidth: 1, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false })
      const up = mainChart.addLineSeries({ color: '#64748b', lineWidth: 1, lineStyle: LineStyle.Dotted, priceLineVisible: false, lastValueVisible: false })
      const lo = mainChart.addLineSeries({ color: '#64748b', lineWidth: 1, lineStyle: LineStyle.Dotted, priceLineVisible: false, lastValueVisible: false })
      mid.setData(middle.map(p => ({ time: p.time as UTCTimestamp, value: p.value })))
      up.setData(upper.map(p => ({ time: p.time as UTCTimestamp, value: p.value })))
      lo.setData(lower.map(p => ({ time: p.time as UTCTimestamp, value: p.value })))
    }

    // --- Oscillator chart (RSI / MACD) ---
    let oscChart: IChartApi | null = null
    if (showOsc) {
      oscChart = createChart(oscRef.current, {
        ...baseOptions,
        width: oscRef.current.clientWidth,
        height: 176,
      })

      if (indicators.rsi) {
        const rsiSeries = oscChart.addLineSeries({ color: UP, lineWidth: 1, priceLineVisible: false, lastValueVisible: true })
        rsiSeries.setData(computeRSI(candles, 14).map(p => ({ time: p.time as UTCTimestamp, value: p.value })))
        rsiSeries.createPriceLine({ price: 70, color: DOWN, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'OB' })
        rsiSeries.createPriceLine({ price: 30, color: UP, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'OS' })
      }
      if (indicators.macd) {
        const { macdLine, signalLine, histogram } = computeMACD(candles)
        if (histogram.length) {
          const histSeries = oscChart.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false })
          histSeries.setData(histogram.map(p => ({ time: p.time as UTCTimestamp, value: p.value, color: p.value >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(248,113,113,0.7)' })))
          const macdSeries = oscChart.addLineSeries({ color: '#3b82f6', lineWidth: 1, priceLineVisible: false, lastValueVisible: true })
          macdSeries.setData(macdLine.map(p => ({ time: p.time as UTCTimestamp, value: p.value })))
          const sigSeries = oscChart.addLineSeries({ color: '#f59e0b', lineWidth: 1, priceLineVisible: false, lastValueVisible: true })
          sigSeries.setData(signalLine.map(p => ({ time: p.time as UTCTimestamp, value: p.value })))
        }
      }
    }

    // --- Volume chart ---
    const volChart = createChart(volRef.current, {
      ...baseOptions,
      width: volRef.current.clientWidth,
      height: 96,
    })
    const volSeries = volChart.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false, priceScaleId: '' })
    volSeries.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0 } })
    volSeries.setData(
      candles.map(c => ({
        time: c.time as UTCTimestamp,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(34,197,94,0.5)' : 'rgba(248,113,113,0.5)',
      }))
    )

    // --- Sync time scales across all active charts ---
    const activeCharts = [mainChart, volChart, ...(oscChart ? [oscChart] : [])]
    activeCharts.forEach(source => {
      source.timeScale().subscribeVisibleLogicalRangeChange(range => {
        if (!range) return
        activeCharts.filter(c => c !== source).forEach(c => c.timeScale().setVisibleLogicalRange(range))
      })
    })

    // --- Resize observer ---
    const ro = new ResizeObserver(() => {
      if (mainRef.current) mainChart.applyOptions({ width: mainRef.current.clientWidth })
      if (oscChart && oscRef.current) oscChart.applyOptions({ width: oscRef.current.clientWidth })
      if (volRef.current) volChart.applyOptions({ width: volRef.current.clientWidth })
    })
    ro.observe(mainRef.current)
    if (volRef.current) ro.observe(volRef.current)

    return () => {
      ro.disconnect()
      mainChart.remove()
      oscChart?.remove()
      volChart.remove()
    }
  }, [candles, indicators])

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border">
        {/* Period selector */}
        <div className="flex bg-secondary rounded-lg p-0.5 gap-0.5">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                period === p
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Indicator toggles */}
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(indicators) as (keyof Indicators)[]).map(key => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                indicators[key]
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {INDICATOR_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">Loading chart…</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-sm text-red-400">Chart data unavailable</p>
        </div>
      ) : candles.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-sm text-muted-foreground">No data for this period</p>
        </div>
      ) : (
        <div>
          <div ref={mainRef} className="w-full" style={{ height: 384 }} />
          <div
            ref={oscRef}
            className="w-full border-t border-border overflow-hidden transition-all duration-200"
            style={{ height: showOsc ? 176 : 0 }}
          />
          <div ref={volRef} className="w-full border-t border-border" style={{ height: 96 }} />
        </div>
      )}
    </div>
  )
}
