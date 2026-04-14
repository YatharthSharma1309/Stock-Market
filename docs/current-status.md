# Current Project Status

Last updated: 2026-04-14

## Summary

StockSim Pro is feature-complete through production hardening. Phase 10 is complete on the repository side: deployment docs, CI/CD workflow, production Docker config, HTTPS override, Sentry config, backup job, and restore helper are in place.

The remaining Phase 10 work requires external infrastructure access:

- Provision production VPS
- Point DNS to the VPS
- Issue TLS certificates for the real domain
- Replace the example HTTPS Nginx domain with the real domain
- Add GitHub production environment secrets
- Run the GitHub Actions deployment
- Configure uptime monitoring
- Run production smoke tests
- Run and document a backup restore test

## Local Verification

- Backend unit + integration tests: `52 passed` (pytest, SQLite in-memory, mocked Redis/Anthropic)
- Frontend unit + component tests: Vitest (indicators × 22, TradeModal, StockTable, PortfolioPage)
- E2E tests: Playwright suite in `e2e/` — requires `docker compose up` first
- Lighthouse CI workflow: `.github/workflows/lighthouse.yml` — runs on frontend pushes
- Production Compose render: passes for `docker-compose.yml` + `docker-compose.prod.yml`
- HTTPS Compose render: passes for all three compose files

## Modified Areas

- Deployment docs: `docs/deployment.md`
- Project status docs: `README.md`, `plan.md`, `docs/current-status.md`
- Production Compose: `docker-compose.prod.yml`, `docker-compose.https.yml`
- Nginx: `nginx/nginx.prod.conf`, `nginx/nginx.ssl.example.conf`
- GitHub Actions: `.github/workflows/test.yml`, `.github/workflows/deploy.yml`
- Ops scripts: `scripts/backup-db.sh`, `scripts/restore-db.sh`
- Environment template: `.env.example`
- Line-ending policy: `.gitattributes`
