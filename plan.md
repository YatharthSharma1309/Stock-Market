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

## Phase 1 — Foundation & Auth

**Goal:** Docker environment running with user registration and login working end-to-end.

### Tasks
- [ ] Docker Compose with: frontend, backend, PostgreSQL, Redis, Nginx
- [ ] FastAPI backend: User model, JWT register/login endpoints, SQLAlchemy + PostgreSQL, Redis client
- [ ] React frontend: Vite + TypeScript setup, TailwindCSS + ShadCN, Login/Register pages, protected routes
- [ ] Integration: connect frontend auth to backend JWT endpoints
- [ ] QA: verify full stack boots and auth works

### Deliverables
- `docker compose up --build` starts everything
- http://localhost:3000 shows the app
- Users can register and login with JWT tokens

---

## Phase 2 — Live Market Data

**Goal:** Display real-time stock prices from NSE/BSE and global markets.

### Tasks
- [ ] Backend: `yfinance` integration service, stock search endpoint, price endpoint
- [ ] Backend: Redis caching layer (prices refresh every 15 seconds)
- [ ] Backend: WebSocket endpoint for streaming live prices
- [ ] Frontend: Stock search bar, price display, WebSocket client hook
- [ ] Frontend: Market overview page (top gainers/losers, indices)
- [ ] QA: verify prices update in real time, search works for NSE/BSE/global tickers

---

## Phase 3 — Paper Trading Engine

**Goal:** Users can buy/sell stocks with virtual money and track their portfolio.

### Tasks
- [ ] Backend: Portfolio model, Trade model, virtual wallet (₹10,00,000 starting cash)
- [ ] Backend: Buy/sell order endpoints (validate price, deduct/add cash, record trade)
- [ ] Backend: Portfolio value calculation (holdings × current price), P&L endpoint
- [ ] Frontend: Portfolio dashboard (holdings table, total value, P&L)
- [ ] Frontend: Buy/sell modal on stock detail page
- [ ] Frontend: Trade history page
- [ ] QA: end-to-end trade flow, P&L accuracy

---

## Phase 4 — Charts & Technical Indicators

**Goal:** Professional-grade financial charts with key indicators.

### Tasks
- [ ] Frontend: Integrate TradingView Lightweight Charts
- [ ] Backend: Historical OHLCV data endpoint (via yfinance)
- [ ] Frontend: Candlestick chart component with time range selector (1D/1W/1M/3M/1Y)
- [ ] Frontend: Indicator overlays — SMA, EMA, Bollinger Bands
- [ ] Frontend: Indicator panels — RSI, MACD, Volume
- [ ] QA: verify chart renders correctly, indicators are accurate

---

## Phase 5 — Learning Modules

**Goal:** Structured educational content with interactive exercises on the simulator.

### Modules
1. **Technical Analysis** — chart patterns, support/resistance, RSI/MACD/Bollinger
2. **Fundamental Analysis** — P/E ratio, EPS, reading balance sheets
3. **Options & Derivatives** — calls, puts, basic strategies (covered call, protective put)
4. **Intraday Trading** — scalping, momentum, risk management

### Tasks
- [ ] Backend: Module/Lesson/Exercise models, progress tracking per user
- [ ] Frontend: Learning centre page with module cards
- [ ] Frontend: Lesson viewer (theory content + embedded simulator for exercises)
- [ ] Frontend: Progress tracking UI (completion badges, streaks)
- [ ] QA: all modules accessible, progress saves correctly

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
- [ ] Phase 1 — Foundation & Auth (in progress)
- [ ] Phase 2 — Live Market Data
- [ ] Phase 3 — Paper Trading Engine
- [ ] Phase 4 — Charts & Technical Indicators
- [ ] Phase 5 — Learning Modules
- [ ] Phase 6 — AI Trading Assistant
- [ ] Phase 7 — UI Polish & Final Features
