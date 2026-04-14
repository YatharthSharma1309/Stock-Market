# StockSim Pro

A full-stack stock market simulator for learning and practicing trading, powered by live NSE/BSE and global market data with an integrated AI trading assistant.

## What Is StockSim Pro?

StockSim Pro is a paper trading platform for learning how markets work without risking real money. Users get a virtual portfolio, live market prices, technical charts, structured lessons, a leaderboard, and an AI assistant that can explain concepts and review portfolio decisions.

## Current Status

The core product is implemented through production hardening. Cloud deployment is partially prepared but not yet completed.

| Phase | Area | Status |
|-------|------|--------|
| 1 | Foundation, Docker, Auth, User Accounts | Complete |
| 2 | Live Market Data for NSE/BSE and Global Stocks | Complete |
| 3 | Paper Trading Engine | Complete |
| 4 | Charts and Technical Indicators | Complete |
| 5 | Learning Modules | Complete |
| 6 | AI Trading Assistant | Complete |
| 7 | UI Polish, Leaderboard, Mobile UX | Complete |
| 8 | Testing and QA | Mostly complete; backend and frontend test suites exist, E2E and full regression still pending |
| 9 | Production Docker Hardening | Complete |
| 10 | Cloud Deployment and CI/CD | Repo-side deployment prep complete; VPS, DNS, SSL activation, uptime monitoring, and production go-live still pending |

## Features

- Live market data for NSE, BSE, NYSE, NASDAQ, and major indices via Yahoo Finance
- Paper trading with virtual cash, buy/sell orders, holdings, trade history, and live P&L
- Candlestick charts with SMA, EMA, Bollinger Bands, RSI, MACD, and volume
- Structured learning center with progress tracking and streaks
- Claude-powered AI trading assistant with streamed responses and portfolio context
- User registration, login, JWT authentication, and protected routes
- Leaderboard ranked by portfolio performance
- Dark and light themes, mobile sidebar, skeleton loading states, toasts, and error boundary
- Production Docker setup with Nginx, gzip, security headers, rate limiting, Redis persistence, Sentry support, and database backups
- GitHub Actions workflows for tests and deployment
- Deployment runbook and HTTPS Nginx example for production rollout
- HTTPS Compose override and database restore helper for go-live operations

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite |
| Styling | TailwindCSS |
| Charts | TradingView Lightweight Charts |
| Backend | Python, FastAPI |
| Database | PostgreSQL, SQLAlchemy |
| Cache | Redis |
| AI | Claude API via Anthropic SDK |
| Real-time | WebSockets and SSE |
| Testing | Pytest, Vitest, React Testing Library |
| Container | Docker, Docker Compose |
| Proxy | Nginx |
| Observability | Sentry |
| CI/CD | GitHub Actions |

## Getting Started

### Prerequisites

- Docker and Docker Compose
- A Claude API key from `console.anthropic.com`

### Local Development

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Fill in required values in `.env`, especially:

   ```env
   SECRET_KEY=your-jwt-secret
   CLAUDE_API_KEY=your-anthropic-api-key
   POSTGRES_USER=stocksim
   POSTGRES_PASSWORD=stocksim_password
   POSTGRES_DB=stocksim_db
   REDIS_URL=redis://redis:6379
   FRONTEND_URL=http://localhost:3000
   ```

3. Start the development stack:

   ```bash
   docker compose up --build
   ```

4. Open:

   - Frontend: `http://localhost:3000`
   - Backend API docs: `http://localhost:8000/docs`
   - Health check: `http://localhost:8000/api/health`

## Production Run

Use the production override file with the base compose file:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Production mode uses:

- Multi-stage frontend build served by Nginx
- Gunicorn with Uvicorn workers for FastAPI
- Dev-only frontend/backend ports and backend source mounts removed by the production override
- Redis password and append-only persistence
- Nginx production config with gzip, security headers, API rate limiting, and SSE support
- Scheduled PostgreSQL backups through the `db-backup` service

The deployment checklist is maintained in [docs/deployment.md](docs/deployment.md). The latest project status is tracked in [docs/current-status.md](docs/current-status.md).

After certificates exist on the server, HTTPS mode can be started with:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.https.yml up -d --build
```

## Testing

Backend:

```bash
cd backend
pytest
```

Frontend:

```bash
cd frontend
npm test
```

Current local verification:

- Backend: `52 passed`
- Frontend: blocked in the current sandbox by `spawn EPERM` while loading the Vite config; this looks like a local permission issue, not a failing test assertion.

## Project Structure

```text
Stock Market/
|-- .github/workflows/       # GitHub Actions test and deploy workflows
|-- backend/                 # FastAPI app, models, schemas, services, tests
|-- frontend/                # React + TypeScript app, components, pages, hooks, tests
|-- nginx/                   # Development and production Nginx config
|-- scripts/                 # Operational scripts such as database backup
|-- docker-compose.yml       # Development Docker stack
|-- docker-compose.prod.yml  # Production compose overrides
|-- plan.md                  # Detailed project plan and phase notes
`-- README.md
```

## Remaining Work

- Provision and harden the production VPS
- Configure domain DNS and HTTPS certificates
- Activate the HTTPS Nginx config with the real domain and certificates
- Configure uptime monitoring
- Run full E2E and Lighthouse checks against production
- Test backup restore procedure before go-live

## License

MIT
