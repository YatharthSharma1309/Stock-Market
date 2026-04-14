# Deployment Runbook

This runbook tracks the remaining Phase 10 work for deploying StockSim Pro to a production VPS.

## Current Deployment Status

Complete in the repository:

- Production Docker Compose override
- Production Nginx config for HTTP
- HTTPS Nginx example config
- HTTPS Docker Compose override for port 443 and certificate mounts
- GitHub Actions test workflow
- GitHub Actions deploy workflow
- Sentry environment support (backend + frontend)
- Alembic migrations — `alembic upgrade head` runs automatically on production container start
- Structured JSON logging — enabled with `JSON_LOGS=true` in `.env`
- SQLAlchemy connection pool tuning (pool_size=5, max_overflow=10, pool_pre_ping)
- Daily PostgreSQL backup service
- Database restore helper script
- Backup retention setting

Still requires external infrastructure:

- VPS provisioning
- DNS record pointing to the VPS
- TLS certificate generation and domain-specific Nginx activation
- GitHub production secrets
- Uptime monitoring
- Production smoke test and backup restore test

## Server Prerequisites

Recommended server:

- Ubuntu 24.04 LTS
- 2 vCPU / 4 GB RAM minimum
- Docker Engine and Docker Compose plugin
- Ports 22, 80, and 443 allowed through the firewall
- Repository cloned at `/opt/stocksim`

## First-Time Server Setup

```bash
sudo apt update
sudo apt install -y ca-certificates curl git ufw

sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

Install Docker using the official Docker Engine instructions for Ubuntu, then clone the repository:

```bash
sudo mkdir -p /opt/stocksim
sudo chown "$USER":"$USER" /opt/stocksim
git clone <repo-url> /opt/stocksim
cd /opt/stocksim
cp .env.example .env
```

Fill in `.env` with production values before starting the stack.

## Required GitHub Secrets

Set these in the GitHub repository production environment:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_KEY`
- `SECRET_KEY`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `REDIS_PASSWORD`
- `CLAUDE_API_KEY`
- `FRONTEND_URL`
- `DOMAIN`
- `SENTRY_DSN`
- `WEB_CONCURRENCY`
- `BACKUP_RETAIN_DAYS`

Optional (set to `true` / `INFO` by default):
- `JSON_LOGS` — emit JSON-structured log lines for log aggregation
- `LOG_LEVEL` — application log level (`DEBUG` | `INFO` | `WARNING` | `ERROR`)

## Deploy

Manual server deploy:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
# Alembic runs automatically inside the backend container before gunicorn starts.
curl -sf http://localhost/api/health
```

GitHub Actions deploy:

- Push to `master`, or run the `Deploy` workflow manually.
- The workflow runs tests first, SSHes into `/opt/stocksim`, writes `.env`, rebuilds containers, and checks `/api/health`.

## HTTPS

After DNS points at the server, obtain certificates with Certbot or your preferred ACME client:

```bash
sudo apt install -y certbot
sudo certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN"
```

Then copy `nginx/nginx.ssl.example.conf` to `nginx/nginx.prod.conf` and replace `stocksim.example.com` with the real domain.

Deploy HTTPS mode:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.https.yml up -d --build
```

The HTTPS override exposes port 443 and mounts `/etc/letsencrypt` into the Nginx container.

## Smoke Test

After deployment:

```bash
curl -sf http://localhost/api/health
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 backend
```

Manual browser checks:

- Register a user
- Log in
- Load Markets
- Open a stock detail page
- Place a small paper trade
- Confirm Portfolio updates
- Confirm Leaderboard loads
- Send one AI assistant message

## Backup Restore Test

Backups are written by the `db-backup` service to the `db_backups` Docker volume. Before go-live, perform a restore test against a disposable database/container.

Example restore helper usage inside a container or host with `psql` available:

```bash
BACKUP_FILE=/backups/stocksim_db_20260414T020000Z.sql.gz ./scripts/restore-db.sh
```
