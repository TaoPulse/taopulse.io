#!/bin/bash
# Backfill historical whale_snapshots + whale_alpha_balances for the past N days.
# Skips block scan (txns/delegations) — use --skip-blocks flag in scan script.
# Usage: bash scripts/backfill-historical.sh [days=30]

set -e
cd "$(dirname "$0")/.."
export $(grep -v '^#' .env.local | xargs)

DAYS=${1:-30}
LOG_DIR="logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/backfill-$(date +%Y-%m-%d_%H-%M-%S).log"
FAILED_DATES=()

log() {
  echo "$@" | tee -a "$LOG_FILE"
}

log "🔄 Starting historical backfill for last $DAYS days..."
log "======================================================"
log "Log file: $LOG_FILE"
log ""

for i in $(seq 1 $DAYS); do
  DATE=$(date -v-${i}d +%Y-%m-%d)
  log ""
  log "📅 [$i/$DAYS] Running scan for $DATE..."

  # Run scan, capture all output (stdout + stderr) to log and screen
  set +e
  OUTPUT=$(npx ts-node --project tsconfig.scripts.json scripts/nightly-chain-scan.ts "$DATE" --skip-blocks 2>&1)
  EXIT_CODE=$?
  set -e

  # Always write full output to log file
  echo "$OUTPUT" >> "$LOG_FILE"

  if [ $EXIT_CODE -ne 0 ]; then
    log "  ❌ FAILED: $DATE (exit code $EXIT_CODE)"
    log "  --- Error output ---"
    echo "$OUTPUT" | tail -20 | tee -a "$LOG_FILE"
    log "  --------------------"
    FAILED_DATES+=("$DATE")
  else
    # Show summary lines on screen
    echo "$OUTPUT" | grep -E "✅|✗|COMPLETE|Date|Total|whale_|time|Top 10|^\s+[0-9]" | tee -a /dev/null
    log "  ✅ Done: $DATE"
  fi

  sleep 5
done

log ""
log "======================================================"
if [ ${#FAILED_DATES[@]} -eq 0 ]; then
  log "✅ Backfill complete for last $DAYS days — no failures"
else
  log "⚠️  Backfill finished with ${#FAILED_DATES[@]} failed date(s):"
  for d in "${FAILED_DATES[@]}"; do
    log "   - $d"
  done
  log "Full errors in: $LOG_FILE"
fi
