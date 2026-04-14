# StockSim Pro

A full-stack paper trading simulator with live NSE/BSE and global market data, technical charts, structured lessons, and a Claude-powered AI trading assistant.

## Status

| Phase | Area | Status |
|-------|------|--------|
| 1 | Foundation, Docker, Auth | Complete |
| 2 | Live Market Data (NSE/BSE + Global) | Complete |
| 3 | Paper Trading Engine | Complete |
| 4 | Charts and Technical Indicators | Complete |
| 5 | Learning Modules | Complete |
| 6 | AI Trading Assistant | Complete |
| 7 | UI Polish, Leaderboard, Mobile UX | Complete |
| 8 | Testing and QA | Complete |
| 9 | Production Docker Hardening | Complete |
| 10 | Cloud Deployment and CI/CD | Repo prep complete; VPS, DNS, SSL, and go-live pending |

## Features

- Live prices for NSE, BSE, NYSE, NASDAQ, and major indices via Yahoo Finance
- Paper trading with virtual cash, buy/sell orders, holdings, and live P&L
- Candlestick charts with SMA, EMA, Bollinger Bands, RSI, MACD, and volume
- Learning center with progress tracking and streaks
- Claude AI assistant with streamed responses and portfolio context
- JWT authentication and protected routes
- Leaderboard ranked by portfolio performance
- Dark/light themes, mobile sidebar, skeleton loading, toasts, and error boundary
- Production Nginx with gzip, security headers, and rate limiting
- GitHub Actions CI/CD, database backups, Sentry observability

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, TailwindCSS |
| Charts | TradingView Lightweight Charts |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| Cache | Redis |
| AI | Claude API (Anthropic SDK) |
| Real-time | WebSockets and SSE |
| Testing | Pytest, Vitest, Playwright |
| Infra | Docker, Nginx, GitHub Actions, Sentry |

## Getting Started

**Prerequisites:** Docker, Docker Compose, a Claude API key.

```bash
cp .env.example .env
# Fill in SECRET_KEY, CLAUDE_API_KEY, POSTGRES_*, REDIS_URL, FRONTEND_URL
docker compose up --build
```

- Frontend: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/api/health`

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

After SSL certificates are issued on the server:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.https.yml up -d --build
```

See [docs/deployment.md](docs/deployment.md) for the full deployment checklist.

## Testing

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test

# E2E (requires running Docker stack)
npx playwright test
```

## Project Structure

```
Stock Market/
├── .github/workflows/      # CI/CD workflows
├── backend/                # FastAPI app, models, services, tests
├── frontend/               # React + TypeScript app, components, tests
├── nginx/                  # Dev and production Nginx configs
├── scripts/                # Backup and SSL setup scripts
├── certbot/                # ACME challenge webroot
├── docker-compose.yml      # Development stack
├── docker-compose.prod.yml # Production overrides
└── docker-compose.https.yml # HTTPS overlay
```

## Remaining Work

- Provision and harden the production VPS
- Configure domain DNS and run `scripts/setup-ssl.sh`
- Activate HTTPS Nginx config with real domain and certificates
- Configure uptime monitoring
- Run E2E and Lighthouse checks against production
- Test backup restore before go-live

## License

MIT
