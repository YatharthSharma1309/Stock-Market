export interface Lesson {
  id: string
  title: string
  description: string
  theory: string[]
  practiceText: string
  practiceLink: string
}

export interface Module {
  id: string
  title: string
  description: string
  icon: string
  color: string
  lessons: Lesson[]
}

export const MODULES: Module[] = [
  {
    id: 'technical-analysis',
    title: 'Technical Analysis',
    description: 'Learn to read price charts, identify patterns, and use momentum indicators to time entries and exits.',
    icon: 'BarChart2',
    color: 'text-blue-400',
    lessons: [
      {
        id: 'ta-lesson-1',
        title: 'Reading Candlestick Charts',
        description: 'Understand how candlesticks encode price action and learn to distinguish bullish from bearish bars.',
        theory: [
          'A candlestick encodes four prices in a single bar: open, high, low, and close. The rectangular "body" spans from open to close, while the thin lines above and below — called wicks or shadows — extend to the day\'s high and low.',
          'A green (or white) candle closes higher than it opened — bullish. A red (or black) candle closes lower — bearish. The size of the body tells you conviction: a large body means price moved decisively; a small body or "doji" (open ≈ close) signals indecision.',
          'Single-candle patterns carry meaning. A "hammer" — small body near the top with a long lower wick — suggests buyers defended a low and price reversed up. An "engulfing" pattern, where one candle\'s body fully covers the prior one, signals momentum reversal. Recognising these is the first step toward reading price action without indicators.',
        ],
        practiceText: 'Open a chart and identify candles',
        practiceLink: '/markets',
      },
      {
        id: 'ta-lesson-2',
        title: 'Support, Resistance & Trendlines',
        description: 'Identify price floors and ceilings, and draw trendlines to reveal the dominant market direction.',
        theory: [
          'Support is a price level where buying demand has historically been strong enough to halt a decline. Each time price falls to that level and bounces, it reinforces the floor. Resistance is the mirror: a ceiling where selling supply overwhelms demand, capping advances.',
          'A level that was support often becomes resistance once broken, and vice versa — this "role reversal" is one of the most reliable patterns in technical analysis. The more times a level is tested without breaking, the more significant it becomes.',
          'Trendlines connect successive higher lows in an uptrend, or successive lower highs in a downtrend. A valid trendline requires at least two touch points; a third confirms it. When price breaks a trendline with conviction (large candle, high volume), it signals a potential change of trend. Always draw trendlines on the closing prices, not the wicks, for cleaner lines.',
        ],
        practiceText: 'Identify support & resistance on TCS',
        practiceLink: '/stocks/TCS.NS',
      },
      {
        id: 'ta-lesson-3',
        title: 'RSI and Momentum',
        description: 'Use the Relative Strength Index to spot overbought and oversold conditions and momentum divergences.',
        theory: [
          'The Relative Strength Index (RSI-14) measures the speed and magnitude of recent price changes, producing a value between 0 and 100. Readings above 70 are conventionally "overbought" — price has risen steeply and may be due for a pullback. Readings below 30 are "oversold."',
          'However, in strong uptrends, RSI can stay above 70 for extended periods. The more actionable signal is a divergence: price makes a new high but RSI makes a lower high. This bearish divergence warns that upward momentum is weakening even as price advances. The reverse (price new low, RSI higher low) is a bullish divergence.',
          'Use RSI as a filter, not a trigger. An oversold reading on RSI tells you conditions may be ripe for a bounce, but combine it with a support level or a reversal candlestick before entering. RSI alone generates too many false signals in trending markets.',
        ],
        practiceText: 'Toggle RSI on a live stock chart',
        practiceLink: '/stocks/RELIANCE.NS',
      },
      {
        id: 'ta-lesson-4',
        title: 'MACD and Bollinger Bands',
        description: 'Combine trend-following and volatility tools to confirm entries and assess breakout quality.',
        theory: [
          'MACD (Moving Average Convergence Divergence) subtracts the 26-period EMA from the 12-period EMA to create the MACD line. A 9-period EMA of the MACD line is the "signal line." When the MACD line crosses above the signal line, that\'s a bullish crossover. The histogram shows the difference between the two — watch for it to shrink toward zero before a crossover happens.',
          'Bollinger Bands place two standard-deviation bands around a 20-period SMA. When the bands squeeze together (low volatility), a directional breakout is likely approaching. Price breaking above the upper band in an uptrend is a continuation signal; in a sideways market the same move is a mean-reversion short signal. Context matters.',
          'Combining MACD and Bollinger Bands: look for a Bollinger squeeze + MACD bullish crossover simultaneously. When both align, the probability of a sustained breakout increases. Neither indicator works perfectly alone — the edge comes from requiring multiple conditions to be true before entering a trade.',
        ],
        practiceText: 'Enable MACD and BB on HDFC Bank',
        practiceLink: '/stocks/HDFCBANK.NS',
      },
    ],
  },
  {
    id: 'fundamental-analysis',
    title: 'Fundamental Analysis',
    description: 'Evaluate companies using financial ratios, earnings, and balance sheet data to find undervalued stocks.',
    icon: 'TrendingUp',
    color: 'text-green-400',
    lessons: [
      {
        id: 'fa-lesson-1',
        title: 'Understanding the P/E Ratio',
        description: 'Learn what the Price-to-Earnings ratio tells you about valuation and how to compare it across peers.',
        theory: [
          'The Price-to-Earnings (P/E) ratio divides the current share price by earnings per share (EPS). A P/E of 25 means you are paying ₹25 for every ₹1 of current annual earnings. It expresses "how many years of current earnings" the market is pricing in — a rough payback period if earnings stayed flat.',
          'A high P/E is not automatically bad. Fast-growing companies deserve higher P/Es because their future earnings will be much larger. A mature utility trading at P/E 12 may actually be expensive relative to its growth, while a tech firm at P/E 40 with 30% annual earnings growth may be cheap. Always compare P/E to the company\'s own historical average and to its sector peers.',
          'Beware the "earnings quality" trap: EPS can be boosted by share buybacks, one-time gains, or accounting choices without the underlying business actually improving. Always look at operating earnings and free cash flow alongside reported P/E for a fuller picture.',
        ],
        practiceText: 'Compare P/E across IT sector stocks',
        practiceLink: '/markets',
      },
      {
        id: 'fa-lesson-2',
        title: 'EPS and Revenue Growth',
        description: 'Track top-line and bottom-line growth to assess whether a company\'s profitability is improving over time.',
        theory: [
          'Earnings Per Share (EPS) is net profit divided by the number of shares outstanding. Growing EPS quarter-over-quarter signals a company is becoming more profitable per unit of ownership. Comparing EPS growth year-over-year removes seasonal distortions that quarterly comparisons can introduce.',
          'Revenue growth (top line) tells you whether the business is winning more customers or raising prices. EPS growth (bottom line) confirms that revenue growth is translating into profit. A company with strong revenue growth but declining EPS is seeing costs rise faster than sales — a red flag. The ideal combination is both growing together.',
          'For Indian markets, pay attention to the earnings season calendar. NSE-listed companies report quarterly results; institutional investors often move stock prices violently in the 48 hours before and after an earnings release. Tracking consensus EPS estimates vs. actual results ("earnings surprise") is a core short-term trading signal.',
        ],
        practiceText: 'Browse NSE stocks and review quote data',
        practiceLink: '/markets',
      },
      {
        id: 'fa-lesson-3',
        title: 'Reading a Balance Sheet',
        description: 'Understand assets, liabilities, and equity — and the key ratios that reveal financial health.',
        theory: [
          'A balance sheet is a snapshot of what a company owns (assets), what it owes (liabilities), and what belongs to shareholders (equity) at a single point in time. The accounting identity is unbreakable: Assets = Liabilities + Shareholders\' Equity. If it does not balance, something is wrong.',
          'The current ratio (current assets ÷ current liabilities) measures whether the company can meet its short-term obligations. A ratio above 1.5 is generally healthy; below 1 signals potential liquidity problems. The debt-to-equity ratio (total debt ÷ equity) measures financial leverage — capital-intensive industries like utilities carry high debt by nature, while software companies with low D/E ratios have more flexibility.',
          'Tangible book value per share (total equity minus intangibles, divided by shares) is a floor valuation: it is approximately what shareholders would receive if the company were liquidated at carrying value. Stocks trading below book value may signal distress, deep value, or accounting concerns — always investigate before concluding it is cheap.',
        ],
        practiceText: 'Research a NIFTY 50 company balance sheet',
        practiceLink: '/markets',
      },
      {
        id: 'fa-lesson-4',
        title: 'Valuation — DCF and Comps',
        description: 'Apply discounted cash flow and comparable company analysis to estimate a stock\'s intrinsic value.',
        theory: [
          'Discounted Cash Flow (DCF) analysis asks: what is this company\'s future free cash flow worth today? You project free cash flow for 5–10 years, then add a "terminal value" for cash flows beyond that horizon, and discount everything back to present value using a required rate of return (typically 10–15% for equity). The result is your intrinsic value — if it is above the market price, the stock is cheap.',
          'DCF\'s weakness is its extreme sensitivity to assumptions. Changing the discount rate by 2% or revenue growth by 3% can swing the intrinsic value by 40%. Treat DCF as a range ("this stock is worth ₹1,400–₹1,800") not a precise figure. Margin of safety — only buying significantly below your intrinsic value estimate — is the discipline that compensates for estimation error.',
          'Comparable company analysis ("comps") skips the future cash flow projection by applying valuation multiples from similar publicly traded companies. Common multiples: EV/EBITDA (enterprise value to earnings before interest, tax, depreciation, amortisation) and P/S (price-to-sales) for pre-profit companies. If peers trade at 15× EBITDA and the target company trades at 10×, it may be undervalued — assuming similar growth and risk profiles.',
        ],
        practiceText: 'Compare valuations in the same sector',
        practiceLink: '/markets',
      },
    ],
  },
  {
    id: 'options-derivatives',
    title: 'Options & Derivatives',
    description: 'Master calls, puts, and basic option strategies used to hedge positions and generate income.',
    icon: 'Layers',
    color: 'text-purple-400',
    lessons: [
      {
        id: 'od-lesson-1',
        title: 'What Are Options?',
        description: 'Understand the fundamental contract structure of options and the rights they convey to buyers and sellers.',
        theory: [
          'An option is a contract that gives the buyer the right — but not the obligation — to buy (call option) or sell (put option) an underlying asset at a predetermined price (strike price) on or before a specified date (expiry). The buyer pays a premium for this right; the seller (writer) receives the premium and takes on the obligation.',
          'For the buyer, maximum loss is always limited to the premium paid. A call option\'s maximum gain is theoretically unlimited (price can keep rising); a put option\'s maximum gain is the full strike price (stock can only fall to zero). For the seller, the risk profile is the mirror image — capped gain (the premium received), potentially large losses.',
          'Options derive their value from the underlying stock price, time remaining to expiry, and implied volatility. An option that is "in the money" (ITM) has intrinsic value — a call with strike ₹1,000 on a ₹1,100 stock has ₹100 of intrinsic value. "Out of the money" (OTM) options have only time value. Understanding this decomposition is essential for pricing and strategy selection.',
        ],
        practiceText: 'Browse NSE stocks as potential option underlyings',
        practiceLink: '/markets',
      },
      {
        id: 'od-lesson-2',
        title: 'Calls and Puts — Payoff Profiles',
        description: 'Map out the profit and loss at expiry for long calls and long puts across a range of underlying prices.',
        theory: [
          'A long call payoff at expiry: max(0, Stock Price − Strike) − Premium Paid. The break-even price is Strike + Premium. Below the strike, the option expires worthless and you lose the full premium. Above break-even, every rupee rise in the stock translates directly to profit. Example: buy a call on RELIANCE with strike ₹2,800 and premium ₹50. Break-even = ₹2,850. At ₹3,000, profit = ₹150.',
          'A long put payoff at expiry: max(0, Strike − Stock Price) − Premium Paid. Break-even = Strike − Premium. If HDFC Bank falls below your break-even, you profit. Puts are most commonly used as insurance against a falling position in your portfolio — a concept formalised in the protective put strategy.',
          'Visualising payoff diagrams before entering a trade is non-negotiable. The diagram immediately tells you your maximum loss, your break-even, and what stock price move you need to profit. It also reveals whether the trade has a high probability of small loss or a low probability of large gain — the risk/reward tradeoff that should drive every position decision.',
        ],
        practiceText: 'Check current stock prices for strike calculation',
        practiceLink: '/markets',
      },
      {
        id: 'od-lesson-3',
        title: 'Covered Call Strategy',
        description: 'Generate premium income from stocks you already own by selling call options against your position.',
        theory: [
          'A covered call involves holding 100 shares (or a lot in NSE F&O) of a stock and simultaneously selling (writing) a call option on the same stock. You collect the premium immediately. If the stock stays below the strike at expiry, the option expires worthless — you keep the premium and your shares. If the stock rises above the strike, your shares are "called away" at the strike price — you also keep the premium, but forego upside above the strike.',
          'The strategy is most effective when you are neutral-to-mildly bullish on a stock and want to enhance your return in a sideways or slowly rising market. It converts potential capital gains into income. The trade-off: you cap your maximum profit at (Strike − Entry Price + Premium) per share.',
          'Strike selection is critical. An at-the-money (ATM) call generates the most premium but caps upside immediately. A far out-of-the-money (OTM) call gives you more room to ride an upswing but pays a smaller premium. Most practitioners use a 1–2 standard deviation OTM strike, rolling the position monthly. The covered call is one of the few option strategies explicitly approved for use in retirement accounts due to its limited downside profile.',
        ],
        practiceText: 'View your current holdings for covered call candidates',
        practiceLink: '/portfolio',
      },
      {
        id: 'od-lesson-4',
        title: 'Protective Put Strategy',
        description: 'Insure your stock position against large losses by pairing it with a put option.',
        theory: [
          'A protective put is the purchase of a put option on a stock you already own. It acts as portfolio insurance: regardless of how far the stock falls, your loss is capped at (Purchase Price − Strike Price + Premium Paid). The put gives you the right to sell the stock at the strike, no matter how low the market price drops.',
          'The cost of this insurance is the premium, which reduces your net return if the stock rises. A protective put is most valuable during periods of high uncertainty — earnings announcements, regulatory decisions, macro events — when you want to hold your position long-term but fear short-term volatility. Buying a put deep in the money insures against even modest declines but is expensive; a put far out of the money is cheap but only protects against catastrophic drops.',
          'Comparing the protective put to a stop-loss order reveals a key difference: a stop-loss exits the position if price falls to a level, potentially at a worse price in a gap-down market. A put option guarantees the right to sell at the strike, even if the stock opens 20% lower overnight. For high-conviction long-term holdings where you cannot afford a catastrophic loss, the put premium is rational insurance.',
        ],
        practiceText: 'Identify volatile holdings to protect',
        practiceLink: '/portfolio',
      },
    ],
  },
  {
    id: 'intraday-trading',
    title: 'Intraday Trading',
    description: 'Build the skills and discipline needed to trade within a single session using momentum and risk management.',
    icon: 'Zap',
    color: 'text-yellow-400',
    lessons: [
      {
        id: 'it-lesson-1',
        title: 'Intraday vs Positional Trading',
        description: 'Understand the key differences in timeframes, risk, and required discipline between intraday and positional approaches.',
        theory: [
          'Intraday traders open and close all positions within the same trading session — typically 9:15 AM to 3:30 PM on NSE. All trades are squared off before close to avoid overnight gap risk (the stock opening significantly higher or lower the next day due to news that broke after market hours). This requires full attention during market hours and a clear plan before each session.',
          'Positional traders hold for days to weeks, riding a larger trend. They tolerate more volatility per trade but make far fewer decisions. The edge in positional trading comes from correctly identifying a multi-day trend; the edge in intraday trading comes from reading short-term order flow and momentum on 5-minute or 15-minute candle charts.',
          'Neither approach is superior. Many professional traders blend both: positional holdings for their core portfolio plus intraday scalps when specific setups appear. What matters is that your rules — entry, stop-loss, target — are defined before you place a trade, not improvised while money is at risk.',
        ],
        practiceText: 'Execute a buy and sell on the same stock',
        practiceLink: '/markets',
      },
      {
        id: 'it-lesson-2',
        title: 'Scalping and Momentum Trading',
        description: 'Learn the mechanics and key setups behind two of the most common intraday trading styles.',
        theory: [
          'Scalping captures very small price moves — often less than 0.3–0.5% — by entering and exiting rapidly. A scalper might take 20–30 trades a day, each lasting 1–10 minutes. The edge is speed and discipline: tight stop-losses mean individual losses are tiny; consistent execution across many small wins generates the daily P&L. Scalping requires low transaction costs, a fast platform, and extraordinary focus — it is not suitable for part-time traders.',
          'Momentum trading holds for hours rather than minutes, entering after a confirmed breakout: price clears a resistance level with strong volume, and the trade is held as long as momentum continues. The classic entry signal is a 15-minute candle closing above a prior day\'s high on 1.5× average volume. The stop-loss is placed just below the breakout level.',
          'Volume is the heartbeat of both strategies. High volume on a breakout confirms institutional participation and increases the probability that the move continues. Low volume breakouts are often false — price drifts above resistance without follow-through and snaps back. On the 1D chart in the simulator, high-volume candles are the ones momentum traders watch for entries.',
        ],
        practiceText: 'Find a high-volume candle on a 1D chart',
        practiceLink: '/stocks/NIFTY50.NS',
      },
      {
        id: 'it-lesson-3',
        title: 'Risk Management and Position Sizing',
        description: 'Apply the 1% rule and risk:reward ratios to size every trade before you enter it.',
        theory: [
          'The 1% rule: never risk more than 1% of your total trading capital on a single trade. If your account is ₹10,00,000, maximum risk per trade is ₹10,000. Position size = Risk Amount ÷ Distance to Stop-Loss. If you want to buy INFY at ₹1,500 with a stop at ₹1,470 (₹30 risk per share), you may buy: ₹10,000 ÷ ₹30 = 333 shares.',
          'Risk:reward ratio compares potential loss to potential gain. A ratio of 1:2 means for every ₹1 you risk, you expect to gain ₹2 if the trade works. With a 1:2 ratio you can be wrong 40% of the time and still be profitable overall (0.6 × ₹2 gain − 0.4 × ₹1 loss = ₹0.80 per trade). Never enter a trade where the reward is less than twice the risk.',
          'Position sizing is the single most important factor separating amateur from professional traders — more important than entry timing or indicator selection. A technically perfect entry in a position that is too large turns a 5% adverse move into an account-destroying loss. Professionals obsess over position size before asking which stock to trade.',
        ],
        practiceText: 'Calculate your position size for a trade',
        practiceLink: '/portfolio',
      },
      {
        id: 'it-lesson-4',
        title: 'Common Mistakes and Trading Psychology',
        description: 'Identify the behavioural patterns that destroy intraday accounts and build the discipline to avoid them.',
        theory: [
          'Overtrading is entering positions when no valid setup exists, driven by boredom or the need to "be in the market." The solution is a pre-session checklist: identify 2–3 specific setups you will trade today; if those setups do not appear, do nothing. Inactivity is a legitimate trade decision.',
          'Revenge trading is the most dangerous pattern: you take a loss, feel emotionally compelled to recover it immediately, and enter a low-quality trade without a proper setup. The second trade is almost always worse than the first because it is made from emotion rather than analysis. Implement a rule: after two consecutive losing trades, stop trading for the day.',
          'Moving stop-losses against your position — widening the stop because you "believe" in the trade — violates the entire purpose of a stop-loss and is a direct path to outsized losses. The stop is placed before you enter, at a technical level that invalidates your thesis. If the trade moves against you and hits the stop, the thesis was wrong; accept the planned loss and move on. Review the trade in the evening, not while you are in it.',
        ],
        practiceText: 'Review your trading history for patterns',
        practiceLink: '/trades',
      },
    ],
  },
]

export const TOTAL_LESSONS = MODULES.reduce((sum, m) => sum + m.lessons.length, 0)

export function getModule(moduleId: string): Module | undefined {
  return MODULES.find(m => m.id === moduleId)
}

export function getLesson(lessonId: string): Lesson | undefined {
  for (const m of MODULES) {
    const lesson = m.lessons.find(l => l.id === lessonId)
    if (lesson) return lesson
  }
  return undefined
}
