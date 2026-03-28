#!/bin/bash
# Backfill historical whale_snapshots + whale_alpha_balances for the past N days.
# Skips block scan (txns/delegations) — use --skip-blocks flag in scan script.
# Usage: bash scripts/backfill-historical.sh [days=30]

set -e
cd "$(dirname "$0")/.."
export $(grep -v '^#' .env.local | xargs)

DAYS=${1:-30}
echo "🔄 Starting historical backfill for last $DAYS days..."
echo "======================================================"

for i in $(seq 1 $DAYS); do
  DATE=$(date -v-${i}d +%Y-%m-%d)
  echo ""
  echo "📅 [$i/$DAYS] Running scan for $DATE..."
  npx ts-node --project tsconfig.scripts.json scripts/nightly-chain-scan.ts $DATE --skip-blocks 2>&1 \
    | grep -E "✅|✗|COMPLETE|Date|Total|whale_|time|Top 10|^\s+[0-9]"
  echo "  ✓ Done: $DATE"
  # Small pause between runs to avoid overwhelming the RPC
  sleep 5
done

echo ""
echo "======================================================"
echo "✅ Backfill complete for last $DAYS days"
