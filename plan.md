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

## Phase 6 — AI Trading Assistant ✅ COMPLETE

**Goal:** Claude-powered chatbot that coaches users on trading.

### Capabilities
- Explains any stock, indicator, or concept on demand
- Analyses the user's portfolio and gives specific feedback
- Post-trade analysis ("why did I gain/lose on this trade?")
- Personalized coaching based on trade history
- Market commentary and trend analysis

### Tasks
- [x] Backend: Claude API integration (`claude-3-5-haiku-20241022`), conversation history per user (DB-persisted, last 20 fed to Claude)
- [x] Backend: Portfolio context injection into system prompt (holdings + recent trades)
- [x] Backend: `POST /api/ai/chat` — SSE streaming response with `X-Accel-Buffering: no`
- [x] Backend: `GET /api/ai/history` — load last 50 messages; `DELETE /api/ai/history` — clear conversation
- [x] Frontend: Floating AI assistant panel (`AIAssistantPanel`) — available on all pages via Layout
- [x] Frontend: `useAIAssistant` hook — native fetch SSE streaming, optimistic message append, history load
- [x] Frontend: Context-aware "Ask AI" button on Stock Detail page
- [x] Frontend: "Analyse with AI" button on Portfolio page
- [x] Frontend: Per-trade "Explain" (MessageSquare) button on Trade History page
- [x] QA: responses stream correctly, context injected, conversation persists across sessions

### New files
- `backend/app/models/ai.py` — AIConversation model (UUID PK, composite index on user_id + created_at)
- `backend/app/schemas/ai.py` — ChatContext, ChatRequest, HistoryMessageOut
- `backend/app/services/ai.py` — Claude client singleton, portfolio context builder, system prompt builder
- `backend/app/api/ai.py` — 3 endpoints (chat SSE, history GET, history DELETE)
- `frontend/src/context/AIContext.tsx` — React context providing `openWithMessage` to all pages
- `frontend/src/hooks/useAIAssistant.ts` — SSE streaming hook (native fetch, not Axios)
- `frontend/src/components/ai/ChatMessage.tsx` — user/assistant bubbles with streaming cursor
- `frontend/src/components/ai/ChatInput.tsx` — auto-resize textarea, Enter to send
- `frontend/src/components/ai/TypingIndicator.tsx` — 3 animated bounce dots
- `frontend/src/components/AIAssistantPanel.tsx` — collapsible FAB + 600px panel, `forwardRef` imperative handle

### Key implementation details
- SSE format: `data: {"type":"delta","text":"..."}` → `data: {"type":"done"}` → `data: [DONE]`
- Axios cannot stream SSE — `useAIAssistant` uses native `fetch` + `ReadableStream` reader
- `AIContext` + `forwardRef` pattern avoids prop drilling through Layout → Outlet → any page
- History pruned to last 50 messages in DB after each assistant reply
- `X-Accel-Buffering: no` header prevents nginx from batching SSE chunks

---

## Phase 7 — UI Polish & Final Features ✅ COMPLETE

**Goal:** World-class UI, mobile responsive, leaderboard, dark mode.

### Tasks
- [x] Dark / Light mode toggle (ThemeContext wired into main.tsx, toggle button in header, full CSS variable split)
- [x] Leaderboard page (`GET /api/leaderboard` + `/leaderboard` route, ranked by P&L%, mobile-responsive cards)
- [x] Full mobile responsiveness (hamburger menu, overlay sidebar, responsive header, overflow-safe layout)
- [x] Loading skeletons (`Skeleton` component, wired into DashboardPage stats cards)
- [x] Error boundary handling (`ErrorBoundary` class component wrapping all routes)
- [x] Toast notifications (`sonner` library, success/error toasts on trades)
- [ ] Performance audit (Lighthouse score target: 90+)
- [ ] QA: full regression test across all phases

### New files
- `frontend/src/components/Skeleton.tsx` — animated pulse skeleton for loading states
- `frontend/src/components/ErrorBoundary.tsx` — React class error boundary with retry
- `frontend/src/pages/LeaderboardPage.tsx` — ranked leaderboard with desktop table + mobile cards
- `backend/app/api/leaderboard.py` — `GET /api/leaderboard` (all users, live prices via Redis cache, P&L%)

### Key implementation details
- Light mode in `:root`, dark mode in `.dark` — Tailwind `darkMode: ['class']` strategy
- `sonner` toaster added to `main.tsx` alongside `ThemeProvider`
- Leaderboard uses `get_quotes_batch` (cached) — fast for repeated calls
- Mobile sidebar: `fixed z-50 -translate-x-full` → `translate-x-0` on open, `lg:static lg:translate-x-0` always visible on desktop
- `ErrorBoundary` wraps entire `<Routes>` in App.tsx — catches any render error with retry button

---

## Phase 8 — Testing & QA 🔄 IN PROGRESS

**Goal:** Comprehensive test coverage across all layers before production deployment.

### Tasks
- [x] Frontend unit tests: Vitest — 22 tests covering all 5 indicator functions (`computeSMA`, `computeEMA`, `computeBB`, `computeRSI`, `computeMACD`)
- [x] Backend unit tests: pytest — 22 tests covering `_safe_float`, `search_stocks`, Redis cache logic, portfolio P&L math
- [ ] Backend integration tests: FastAPI `TestClient` + SQLite in-memory DB (no Docker needed)
  - Auth flow: register → login → JWT protected endpoints
  - Portfolio: buy → sell → portfolio summary → trade history
  - Leaderboard: multi-user P&L ranking
- [ ] Frontend component tests: `@testing-library/react` + Vitest
  - `TradeModal`: renders, validates quantity, calls API on submit
  - `StockTable`: renders rows, search filter, clickable links
  - `PortfolioPage`: shows holdings, P&L colors correct
- [ ] E2E tests: Playwright against the running Docker stack
  - Happy path: register → buy stock → view portfolio → check leaderboard
  - Auth guard: unauthenticated access redirects to `/login`
- [ ] Performance audit: Lighthouse CI (target 90+ on Performance, Accessibility, Best Practices)
- [ ] QA: full regression across Phases 1–7

### Test file locations
- `frontend/src/lib/indicators.test.ts` — ✅ 22 passing
- `backend/tests/test_market_service.py` — ✅ 22 passing
- `backend/tests/test_api_auth.py` — planned
- `backend/tests/test_api_portfolio.py` — planned
- `frontend/src/components/__tests__/` — planned
- `e2e/` — planned (Playwright)

---

## Phase 9 — Production Hardening

**Goal:** Make the Docker stack production-ready: optimised builds, secrets management, multi-worker backend, proper nginx config.

### Tasks

#### Docker
- [ ] `frontend/Dockerfile.prod` — multi-stage: `node:20-alpine` build stage → `nginx:alpine` serve stage
  - Stage 1: `npm ci && npm run build` → `/app/dist`
  - Stage 2: copy `dist/` into nginx, serve static at port 80
- [ ] `backend/Dockerfile.prod` — no volume mount, `gunicorn -k uvicorn.workers.UvicornWorker --workers 4`
- [ ] `docker-compose.prod.yml` — production overrides:
  - Remove `volumes: ./backend:/app` (no hot-reload)
  - Add `restart: unless-stopped` to all services
  - Expose only port 80/443 via nginx (no direct 3000/8000)
  - Pass secrets via env file, not inline

#### Nginx (production config)
- [ ] Serve frontend as static files (no proxy to Vite dev server)
- [ ] Add `gzip` compression for JS/CSS/JSON
- [ ] Add security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- [ ] Add cache headers: `Cache-Control: public, max-age=31536000` for hashed assets, `no-cache` for `index.html`
- [ ] Rate limiting: `limit_req_zone` on `/api/` (prevent abuse of yfinance quota)
- [ ] Placeholder `server` block ready for HTTPS (Phase 10)

#### Backend
- [ ] Replace `Base.metadata.create_all` with Alembic migrations (proper schema versioning)
  - `alembic init alembic`
  - `env.py` wired to `settings.DATABASE_URL`
  - Initial migration from current models
- [ ] SQLAlchemy connection pool tuning: `pool_size=10, max_overflow=20, pool_pre_ping=True`
- [ ] `SECRET_KEY` must be ≥32 random bytes — add startup validation
- [ ] Structured JSON logging (`python-json-logger`) for production log aggregation

#### Redis
- [ ] Add password: `requirepass` in Redis config + `REDIS_URL=redis://:password@redis:6379`
- [ ] Enable persistence: `appendonly yes` in `redis.conf`
- [ ] Add `redis_data` named volume to `docker-compose.prod.yml`

#### Environment
- [ ] Create `.env.example` with all required keys and safe placeholder values
- [ ] Add `.env` to `.gitignore` (must not be committed)
- [ ] Document secret generation: `openssl rand -hex 32` for `SECRET_KEY`

### Key implementation details
- Dev stack (`docker-compose.yml`) stays as-is for local development
- Prod stack (`docker-compose.prod.yml`) extends/overrides for deployment: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
- Frontend build output is ~200KB gzipped; nginx handles 1000s of concurrent users from static files
- 4 uvicorn workers handle concurrent API + WebSocket connections; yfinance calls are I/O-bound so they benefit from async

---

## Phase 10 — Cloud Deployment & CI/CD

**Goal:** Deploy to a public URL with HTTPS, automated deployments on push, monitoring, and DB backups.

### Deployment target options

| Option | Pros | Cons | Recommended for |
|--------|------|------|-----------------|
| **DigitalOcean Droplet** (VPS) | Full control, cheap ($6/mo), Docker Compose works natively | Manual SSL setup, no auto-scaling | This project ✅ |
| **Railway** | Git push deploy, managed Postgres/Redis, zero-config SSL | Less control, cost scales with usage | Fast prototypes |
| **AWS EC2 + RDS** | Enterprise-grade, fine-grained IAM | Complex setup, higher cost | Production SaaS |
| **Fly.io** | Docker-native, free tier, global edge | Limited persistent disk | Stateless APIs |

**Recommended:** DigitalOcean Droplet (2 vCPU / 4 GB RAM) — ~$18/month, sufficient for 500+ concurrent users.

### Tasks

#### VPS Setup
- [ ] Provision Ubuntu 24.04 LTS droplet (min 2 vCPU / 4 GB)
- [ ] Harden: non-root sudo user, SSH key auth only, `ufw` firewall (allow 22/80/443)
- [ ] Install Docker Engine + Docker Compose plugin
- [ ] Clone repo, create `.env` from `.env.example`

#### SSL / HTTPS
- [ ] Point domain A record → droplet IP (or use DigitalOcean managed DNS)
- [ ] Install `certbot` + `python3-certbot-nginx`
- [ ] Run `certbot --nginx -d yourdomain.com -d www.yourdomain.com`
- [ ] Update nginx config: HTTP → HTTPS redirect, `ssl_certificate` paths
- [ ] Add `443` listener to `docker-compose.prod.yml` nginx service
- [ ] Set up certbot auto-renew: `systemctl enable certbot.timer`

#### CI/CD — GitHub Actions
- [ ] `.github/workflows/test.yml` — runs on every push/PR:
  ```
  jobs:
    test-backend:  python -m pytest backend/tests/ -v
    test-frontend: cd frontend && npm ci && npm test
  ```
- [ ] `.github/workflows/deploy.yml` — runs on push to `main`:
  ```
  jobs:
    deploy:
      SSH into droplet
      git pull
      docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
  ```
  Uses GitHub Secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY`

#### Monitoring & Observability
- [ ] Uptime monitoring: UptimeRobot (free) — ping `/api/health` every 5 minutes, alert on downtime
- [ ] Error tracking: Sentry (free tier) — `sentry-sdk` in FastAPI, `@sentry/react` in frontend
- [ ] Log aggregation: `docker compose logs --tail=100 -f` or ship to Logtail (free tier)
- [ ] PostgreSQL metrics: `pg_stat_statements` + Grafana (optional)

#### Database Backups
- [ ] Cron job on the droplet: `pg_dump` daily → compressed → upload to S3/Spaces
  ```bash
  # /etc/cron.d/stocksim-backup
  0 2 * * * root docker exec stocksim-postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > /backups/$(date +\%F).sql.gz
  ```
- [ ] Retain 7 days of backups; delete older files automatically
- [ ] Test restore procedure before going live

### Post-deployment checklist
- [ ] HTTPS works, HTTP redirects to HTTPS
- [ ] `/api/health` returns `{"status":"ok","database":"connected","redis":"connected"}`
- [ ] WebSocket prices stream on the Markets page
- [ ] AI Assistant responds (CLAUDE_API_KEY is set in `.env`)
- [ ] Register a test user, make a trade, verify leaderboard
- [ ] Lighthouse score ≥ 90 on the production URL
- [ ] Sentry receives a test error
- [ ] UptimeRobot alert is configured

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
- [x] Phase 6 — AI Trading Assistant ✅
- [x] Phase 7 — UI Polish & Final Features ✅
- [ ] Phase 8 — Testing & QA 🔄 (unit tests done, integration + E2E pending)
- [ ] Phase 9 — Production Hardening
- [ ] Phase 10 — Cloud Deployment & CI/CD

## Git History

| Commit | Description |
|--------|-------------|
| `6544f8f` | Initial commit: README + plan.md |
| `269a594` | Phase 1: Docker + FastAPI backend + React frontend skeleton |
| `787c265` | Phase 2: Live market data — NSE/BSE + global stocks |
| `4d0a4ef` | docs: update plan.md with Phase 1 & 2 completion status |
| `2996c1a` | Phase 3: Paper Trading Engine + Phase 2 QA fixes |
