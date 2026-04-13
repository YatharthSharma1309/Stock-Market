# StockSim Pro — Project Plan

## Vision

Build a world-class stock market simulator that:
- Fetches real stock prices from NSE/BSE (India) and NYSE/NASDAQ (global)
- Lets users practice paper trading with virtual money
- Teaches trading techniques through structured learning modules
- Provides AI-powered coaching and analysis via Claude API
- Runs fully in Docker for isolation and easy setup

---

## Important Note on Data Sources

NSE/BSE official institutional APIs are paid. We use the following free, legal, production-tested alternatives:
- **`yfinance`** (Yahoo Finance Python library) — covers NSE (`.NS` suffix), BSE (`.BO` suffix), and all global markets. Primary source.
- **`nsepy`** — pulls from NSE's public website. Fallback for NSE-specific data (F&O, indices).

---

## Recommended Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React + TypeScript + Vite | Fast, type-safe, industry standard |
| UI Library | TailwindCSS + ShadCN UI | World-class design system, accessible |
| Charts | TradingView Lightweight Charts | Professional financial charting |
| Backend | Python + FastAPI | Best ecosystem for financial data, async |
| Database | PostgreSQL | Reliable relational DB for portfolios/trades |
| Cache | Redis | Real-time price caching (15s refresh) |
| AI | Claude API (Anthropic) | Best reasoning, free tier available |
| Real-time | WebSockets | Live price streaming to frontend |
| Container | Docker + Docker Compose | Full isolation, one-command startup |
| Reverse Proxy | Nginx | Routes frontend ↔ backend cleanly |

---

## Project Structure

```
Stock Market/
├── docker-compose.yml
├── .env.example
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── services/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── api/
│       ├── models/
│       ├── services/
│       └── core/
└── nginx/
    └── nginx.conf
```

---

## Team Roles

| Member | Owns |
|--------|------|
| `team-lead` | Task breakdown, architecture decisions, coordination |
| `frontend-dev` | All React UI, charts, pages, TailwindCSS, ShadCN |
| `backend-eng` | FastAPI, DB models, yfinance integration, WebSockets |
| `fullstack-dev` | API wiring, auth flow, WebSocket client, state management |
| `qa-tester` | Tests, linting, feature verification, structured bug reports |

---

## Phase 1 — Foundation & Auth ✅ COMPLETE

**Goal:** Docker environment running with user registration and login working end-to-end.

### Tasks
- [x] Docker Compose with: frontend, backend, PostgreSQL, Redis, Nginx
- [x] FastAPI backend: User model, JWT register/login endpoints, SQLAlchemy + PostgreSQL, Redis client
- [x] React frontend: Vite + TypeScript setup, TailwindCSS dark theme, Login/Register pages, protected routes
- [x] Integration: connect frontend auth to backend JWT endpoints
- [x] QA: verified — `/api/health` returns `{"status":"ok","database":"connected","redis":"connected"}`

### Key fixes applied
- Pinned `bcrypt==3.2.2` to fix passlib compatibility with bcrypt 4.x
- Fixed PostgreSQL health check: added `-d ${POSTGRES_DB}` to `pg_isready`
- Removed deprecated `version:` field from docker-compose.yml

### Deliverables
- `docker compose up --build` starts everything ✅
- http://localhost:3000 — Login/Register/Dashboard working ✅
- Users can register and login with JWT tokens ✅

---

## Phase 2 — Live Market Data ✅ COMPLETE

**Goal:** Display real-time stock prices from NSE/BSE and global markets.

### Tasks
- [x] Backend: `yfinance` market service — NSE (`.NS`), BSE (`.BO`), global stocks
- [x] Backend: Redis caching layer (15s TTL per symbol)
- [x] Backend: WebSocket `/ws/prices` — streams live price updates every 15s
- [x] Backend: REST endpoints — `/api/market/indices`, `/nse`, `/global`, `/quote/{sym}`, `/quotes`, `/search`
- [x] Frontend: Markets page — 5 index cards, NSE/Global tabs, searchable stock table
- [x] Frontend: `useMarketData` WebSocket hook for real-time updates
- [x] Frontend: `Layout` component — shared sidebar with active-link highlighting
- [x] Frontend: `IndexCard`, `StockTable` components

### Stock coverage
- **Indices:** NIFTY 50, SENSEX, S&P 500, NASDAQ, Dow Jones
- **NSE stocks:** 20 (RELIANCE, TCS, HDFC, INFY, ICICI, etc.)
- **Global stocks:** 20 (AAPL, MSFT, GOOGL, NVDA, META, TSLA, etc.)

### Architecture note
Dropped `nsepy` as primary source — `yfinance` covers NSE/BSE/global uniformly and is more reliable.

---

## Phase 3 — Paper Trading Engine ✅ COMPLETE

**Goal:** Users can buy/sell stocks with virtual money and track their portfolio.

### Tasks
- [x] Backend: Portfolio model, Trade model, virtual wallet (₹10,00,000 starting cash)
- [x] Backend: Buy/sell order endpoints (validate price, deduct/add cash, record trade)
- [x] Backend: Portfolio value calculation (holdings × current price), P&L endpoint
- [x] Frontend: Portfolio dashboard (holdings table, total value, P&L)
- [x] Frontend: Buy/sell modal on stock detail page
- [x] Frontend: Trade history page
- [x] QA fixes: yfinance upgraded (>=0.2.50), silent errors logged, validation added

### API endpoints added
- `POST /api/portfolio/buy` — buy shares (avg-cost tracking, balance deduction)
- `POST /api/portfolio/sell` — sell shares (proceeds added, holdings updated)
- `GET /api/portfolio` — full portfolio summary with live P&L per holding
- `GET /api/portfolio/trades` — chronological trade history

### Key implementation details
- Average buy price recalculated on partial buys: `(old_qty * old_avg + new_qty * price) / total_qty`
- Holdings deleted automatically when quantity reaches 0
- Dashboard fetches real portfolio data (not hardcoded)

---

## Phase 4 — Charts & Technical Indicators ✅ COMPLETE

**Goal:** Professional-grade financial charts with key indicators.

### Tasks
- [x] Frontend: Integrate TradingView Lightweight Charts (`lightweight-charts ^4.0.0`)
- [x] Backend: Historical OHLCV data endpoint (via yfinance) — `GET /api/market/history/{symbol}?period=`
- [x] Frontend: Candlestick chart component with time range selector (1D/1W/1M/3M/1Y)
- [x] Frontend: Indicator overlays — SMA 20, SMA 50, EMA 20, Bollinger Bands
- [x] Frontend: Indicator panels — RSI (14), MACD (12/26/9), Volume histogram
- [x] QA: chart renders correctly, indicators accurate

### New files
- `frontend/src/lib/indicators.ts` — pure JS: SMA, EMA, BB, RSI (Wilder), MACD
- `frontend/src/hooks/useStockHistory.ts` — fetches OHLCV from `/api/market/history`
- `frontend/src/components/StockChart.tsx` — three-pane chart (main + oscillator + volume), time-scale synced
- `frontend/src/pages/StockDetailPage.tsx` — `/stocks/:symbol` route with quote header, chart, stats grid, Trade button

### Key implementation details
- Symbol names in `StockTable` are clickable links → `/stocks/:symbol`
- Search results navigate to stock detail page
- All indicators computed client-side from OHLCV data (O(n), no extra backend endpoints)
- ResizeObserver keeps all three chart panes responsive
- Time scales synced across panes via `subscribeVisibleLogicalRangeChange`

---

## Phase 5 — Learning Modules ✅ COMPLETE

**Goal:** Structured educational content with interactive exercises on the simulator.

### Modules (4 lessons each = 16 total)
1. **Technical Analysis** — candlesticks, support/resistance, RSI, MACD + Bollinger Bands
2. **Fundamental Analysis** — P/E ratio, EPS/revenue growth, balance sheets, DCF + comps
3. **Options & Derivatives** — what are options, payoff profiles, covered call, protective put
4. **Intraday Trading** — intraday vs positional, scalping + momentum, position sizing, psychology

### Tasks
- [x] Backend: `LessonProgress` model (user_id, lesson_id, completed_at, UNIQUE constraint)
- [x] Backend: `GET /api/learning/progress`, `POST /api/learning/complete/{lesson_id}`, `GET /api/learning/progress/{module_id}`
- [x] Frontend: Learning Centre page (`/learn`) with ProgressBanner + 4 ModuleCards
- [x] Frontend: Lesson viewer (`/learn/:moduleId`) — sidebar lesson list + content panel
- [x] Frontend: Progress tracking — streak days, completion badges, optimistic updates
- [x] QA: lessons accessible, progress saves, idempotent completion, streak computed correctly

### Key implementation details
- Lesson content hardcoded in `frontend/src/data/learningContent.ts` (no CMS needed)
- Progress stored in DB; `useLearningProgress` hook fetches once, updates optimistically
- "Practice" CTAs link to live simulator pages (Markets, StockDetail, Portfolio, Trades)
- Streak = consecutive UTC days with ≥1 lesson completed (computed server-side)
- Dashboard "Learning Progress" card now shows real `X / 16 lessons` + streak

---

## Phase 6 — AI Trading Assistant

**Goal:** Claude-powered chatbot that coaches users on trading.

### Capabilities
- Explains any stock, indicator, or concept on demand
- Analyses the user's portfolio and gives specific feedback
- Post-trade analysis ("why did I gain/lose on this trade?")
- Personalized coaching based on trade history
- Market commentary and trend analysis

### Tasks
- [ ] Backend: Claude API integration, conversation history per user, portfolio context injection
- [ ] Backend: `/ai/chat` endpoint (streams responses)
- [ ] Frontend: Floating AI assistant panel (available on all pages)
- [ ] Frontend: Context-aware prompts (e.g., "Analyse this stock" button on stock page)
- [ ] QA: verify responses are accurate and context-aware

---

## Phase 7 — UI Polish & Final Features

**Goal:** World-class UI, mobile responsive, leaderboard, dark mode.

### Tasks
- [ ] Dark / Light mode toggle (persisted to user profile)
- [ ] Leaderboard page (rank users by virtual P&L %)
- [ ] Full mobile responsiveness
- [ ] Loading skeletons, smooth animations, micro-interactions
- [ ] Error boundary handling, empty states, toast notifications
- [ ] Performance audit (Lighthouse score target: 90+)
- [ ] QA: full regression test across all phases

---

## How to Run

```bash
# Start all services (first time)
docker compose up --build

# Start all services (subsequent times)
docker compose up

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Access points
# Frontend:     http://localhost:3000
# Backend API:  http://localhost:8000
# API Docs:     http://localhost:8000/docs
```

---

## Environment Variables

```env
# Backend
SECRET_KEY=your-jwt-secret-key-here
CLAUDE_API_KEY=your-anthropic-api-key-here
POSTGRES_USER=stocksim
POSTGRES_PASSWORD=stocksim_password
POSTGRES_DB=stocksim_db
REDIS_URL=redis://redis:6379

# Frontend
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

---

## Current Status

- [x] Plan approved
- [x] Git repository initialized
- [x] Phase 1 — Foundation & Auth ✅
- [x] Phase 2 — Live Market Data ✅
- [x] Phase 3 — Paper Trading Engine ✅
- [x] Phase 4 — Charts & Technical Indicators ✅
- [x] Phase 5 — Learning Modules ✅
- [ ] Phase 6 — AI Trading Assistant *(Claude API key configured)*
- [ ] Phase 7 — UI Polish & Final Features

## Git History

| Commit | Description |
|--------|-------------|
| `6544f8f` | Initial commit: README + plan.md |
| `269a594` | Phase 1: Docker + FastAPI backend + React frontend skeleton |
| `787c265` | Phase 2: Live market data — NSE/BSE + global stocks |
| `4d0a4ef` | docs: update plan.md with Phase 1 & 2 completion status |
| `2996c1a` | Phase 3: Paper Trading Engine + Phase 2 QA fixes |
