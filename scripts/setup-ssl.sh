#!/usr/bin/env bash
# setup-ssl.sh — Issue initial Let's Encrypt certificate and activate HTTPS.
#
# Run ONCE on the VPS after the HTTP stack is already running:
#   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
#
# Usage:
#   bash scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com
# Or via env vars:
#   DOMAIN=yourdomain.com SSL_EMAIL=admin@yourdomain.com bash scripts/setup-ssl.sh

set -euo pipefail

DOMAIN="${1:-${DOMAIN:-}}"
EMAIL="${2:-${SSL_EMAIL:-}}"

if [[ -z "$DOMAIN" ]]; then
  echo "Error: domain required."
  echo "Usage: $0 <domain> [email]"
  exit 1
fi

if [[ -z "$EMAIL" ]]; then
  read -rp "Enter email for Let's Encrypt notifications: " EMAIL
fi

echo "[ssl] Creating certbot webroot directory..."
mkdir -p certbot/www

echo "[ssl] Requesting certificate for ${DOMAIN} (and www.${DOMAIN})..."
echo "      Nginx must already be serving HTTP on port 80."
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    -d "${DOMAIN}" -d "www.${DOMAIN}" \
    --email "${EMAIL}" \
    --agree-tos \
    --non-interactive \
    --no-eff-email

echo "[ssl] Activating HTTPS nginx config for ${DOMAIN}..."
sed "s/stocksim.example.com/${DOMAIN}/g" nginx/nginx.ssl.example.conf > nginx/nginx.prod.conf

echo "[ssl] Restarting with HTTPS stack..."
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  -f docker-compose.https.yml \
  up -d --build --remove-orphans

echo "[ssl] Removing dangling images..."
docker image prune -f

echo "[ssl] Checking health..."
sleep 10
curl -sf "https://${DOMAIN}/api/health" && echo "[ssl] Health check passed."

echo ""
echo "[ssl] HTTPS is active for https://${DOMAIN}"
echo ""
echo "Next steps:"
echo "  1. Commit the updated nginx/nginx.prod.conf to your repository."
echo "  2. Add DOMAIN=${DOMAIN} as a GitHub Actions secret if not already set."
echo "  3. Future deploys will automatically use the HTTPS stack."
