# StockSim Pro

A world-class stock market simulator for learning and practising trading — powered by real NSE/BSE and global market data, with an integrated AI trading assistant.

## What is StockSim Pro?

StockSim Pro is a full-stack paper trading platform designed to teach prospective traders how the stock market works. Users get a virtual portfolio, real-time stock prices, professional-grade charts with technical indicators, structured learning modules, and an AI assistant that coaches them through their trades.

## Features

- **Live Market Data** — Real NSE/BSE (Indian) and NYSE/NASDAQ (global) stock prices via Yahoo Finance
- **Paper Trading** — Buy and sell stocks with virtual money, track P&L in real time
- **Professional Charts** — Candlestick charts with RSI, MACD, Bollinger Bands, EMA, SMA
- **Learning Modules** — Technical analysis, fundamental analysis, options trading, intraday strategies
- **AI Trading Assistant** — Powered by Claude API; analyses your portfolio, explains concepts, coaches your decisions
- **User Accounts** — Register, login, save portfolio and trade history
- **Leaderboard** — Compare your virtual P&L with other users

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| UI | TailwindCSS + ShadCN UI |
| Charts | TradingView Lightweight Charts |
| Backend | Python + FastAPI |
| Database | PostgreSQL |
| Cache | Redis |
| AI | Claude API (Anthropic) |
| Real-time | WebSockets |
| Container | Docker + Docker Compose |
| Proxy | Nginx |

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose installed
- A Claude API key from [console.anthropic.com](https://console.anthropic.com)

### Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd stocksim-pro
   ```

2. Copy and fill in environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and secrets
   ```

3. Start all services:
   ```bash
   docker compose up --build
   ```

4. Open your browser:
   - Frontend: http://localhost:3000
   - Backend API docs: http://localhost:8000/docs

## Project Structure

```
Stock Market/
├── docker-compose.yml        # All services: frontend, backend, db, redis, nginx
├── .env.example              # Environment variable template
├── frontend/                 # React + TypeScript app
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Route pages
│       ├── hooks/            # Custom React hooks
│       └── services/         # API call functions
├── backend/                  # Python FastAPI app
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── api/              # Route handlers
│       ├── models/           # DB models
│       ├── services/         # Business logic (market data, AI, trading engine)
│       └── core/             # Config, auth, DB connection
└── nginx/
    └── nginx.conf            # Reverse proxy config
```

## Development Phases

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Foundation: Docker, Auth, User Accounts | In Progress |
| 2 | Live Market Data (NSE/BSE + Global) | Pending |
| 3 | Paper Trading Engine | Pending |
| 4 | Charts & Technical Indicators | Pending |
| 5 | Learning Modules | Pending |
| 6 | AI Trading Assistant | Pending |
| 7 | UI Polish, Leaderboard, Mobile | Pending |

## Environment Variables

See `.env.example` for all required variables. Key ones:

```
CLAUDE_API_KEY=        # Anthropic Claude API key
SECRET_KEY=            # JWT signing secret
POSTGRES_PASSWORD=     # Database password
```

## Contributing

This project is built by the dev-squad agent team. See `plan.md` for the full architecture and development plan.

## License

MIT
