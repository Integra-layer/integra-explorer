#!/usr/bin/env bash
# health-check.sh — Check Integra Explorer health and alert via Discord.
#
# Usage:
#   DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..." ./health-check.sh
#
# Crontab example (every 5 minutes):
#   */5 * * * * DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..." /root/integra-explorer/scripts/health-check.sh >> /var/log/integra-health.log 2>&1

set -euo pipefail

HEALTH_URL="https://testnet.explorer.integralayer.com/api/health"
DISCORD_WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"

if [[ -z "$DISCORD_WEBHOOK_URL" ]]; then
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] ERROR: DISCORD_WEBHOOK_URL is not set." >&2
  exit 1
fi

# Fetch health endpoint (10s timeout)
RESPONSE=$(curl --silent --max-time 10 --write-out "\n%{http_code}" "$HEALTH_URL" || true)
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Determine status
if [[ "$HTTP_CODE" == "200" ]]; then
  STATUS=$(echo "$HTTP_BODY" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
else
  STATUS="down"
fi

echo "[$TIMESTAMP] status=$STATUS http=$HTTP_CODE"

if [[ "$STATUS" != "ok" ]]; then
  NETWORK=$(echo "$HTTP_BODY" | grep -o '"network":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
  BACKEND=$(echo "$HTTP_BODY" | grep -o '"backend":"[^"]*"' | cut -d'"' -f4 || echo "unknown")

  PAYLOAD=$(cat <<EOF
{
  "content": ":warning: **Integra Explorer health alert**",
  "embeds": [{
    "title": "Health check failed",
    "color": 16711680,
    "fields": [
      { "name": "Status",  "value": "\`$STATUS\`",  "inline": true },
      { "name": "Backend", "value": "\`$BACKEND\`", "inline": true },
      { "name": "Network", "value": "\`$NETWORK\`", "inline": true },
      { "name": "HTTP",    "value": "\`$HTTP_CODE\`","inline": true },
      { "name": "URL",     "value": "$HEALTH_URL",  "inline": false }
    ],
    "timestamp": "$TIMESTAMP"
  }]
}
EOF
)

  curl --silent --max-time 10 \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    "$DISCORD_WEBHOOK_URL" \
    -o /dev/null

  echo "[$TIMESTAMP] Discord alert sent."
fi
