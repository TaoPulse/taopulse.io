#!/bin/bash
# Backfill historical data for the past N days.
# Skips block scan. Skips dates already in Supabase. Streams all output to log.
# Usage: bash scripts/backfill-historical.sh [days=30]

cd "$(dirname "$0")/.."
export $(grep -v '^#' .env.local | xargs)

DAYS=${1:-30}
LOG_DIR="logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="$LOG_DIR/backfill-$TIMESTAMP.log"
FAILED_DATES=()
SKIPPED_DATES=()
TIMEOUT_SECS=1800  # 30 minutes max per day

log() {
  echo "$@" | tee -a "$LOG_FILE"
}

log "🔄 Starting historical backfill for last $DAYS days..."
log "======================================================"
log "Log file: $LOG_FILE"
log "Timeout per day: ${TIMEOUT_SECS}s"
log ""

# Fetch dates already in Supabase (whale_snapshots as source of truth)
log "🔍 Checking existing dates in Supabase..."
EXISTING_DATES=$(npx ts-node --transpile-only -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
sb.from('whale_snapshots').select('date').then(({data}) => {
  const dates = [...new Set(data.map(r => r.date))];
  console.log(dates.join(' '));
});
" 2>/dev/null)
log "  Existing: $EXISTING_DATES"
log ""

for i in $(seq 1 $DAYS); do
  # Cross-platform date: macOS uses -v, Linux uses -d
  if date -v-1d +%Y-%m-%d > /dev/null 2>&1; then
    DATE=$(date -v-${i}d +%Y-%m-%d)
  else
    DATE=$(date -d "${i} days ago" +%Y-%m-%d)
  fi

  # Skip if already in Supabase
  if echo "$EXISTING_DATES" | grep -qw "$DATE"; then
    log "⏭️  [$i/$DAYS] Skipping $DATE (already in DB)"
    SKIPPED_DATES+=("$DATE")
    continue
  fi

  log ""
  log "📅 [$i/$DAYS] Running scan for $DATE..."
  log "  Started at: $(date '+%H:%M:%S')"

  # Stream all output directly to log file + screen, with manual timeout
  set +e
  npx ts-node --project tsconfig.scripts.json --transpile-only \
    scripts/nightly-chain-scan.ts "$DATE" --skip-blocks 2>&1 | tee -a "$LOG_FILE" &
  SCAN_PID=$!

  # Watchdog: kill if it runs too long
  ( sleep $TIMEOUT_SECS && kill $SCAN_PID 2>/dev/null && echo "  ⏰ WATCHDOG: killed PID $SCAN_PID after ${TIMEOUT_SECS}s" | tee -a "$LOG_FILE" ) &
  WATCHDOG_PID=$!

  wait $SCAN_PID
  EXIT_CODE=$?
  kill $WATCHDOG_PID 2>/dev/null
  wait $WATCHDOG_PID 2>/dev/null
  set -e

  if [ $EXIT_CODE -eq 143 ] || [ $EXIT_CODE -eq 137 ]; then
    log ""
    log "  ⏰ TIMEOUT: $DATE exceeded ${TIMEOUT_SECS}s — skipping"
    FAILED_DATES+=("$DATE (timeout)")
  elif [ $EXIT_CODE -ne 0 ]; then
    log ""
    log "  ❌ FAILED: $DATE (exit code $EXIT_CODE)"
    FAILED_DATES+=("$DATE (exit=$EXIT_CODE)")
  else
    log "  ✅ Done: $DATE at $(date '+%H:%M:%S')"
  fi

  sleep 5
done

log ""
log "======================================================"
log "BACKFILL SUMMARY"
log "======================================================"
log "Skipped (already had data): ${#SKIPPED_DATES[@]}"
if [ ${#FAILED_DATES[@]} -eq 0 ]; then
  log "✅ Backfill complete — no failures"
else
  log "⚠️  ${#FAILED_DATES[@]} failed date(s):"
  for d in "${FAILED_DATES[@]}"; do
    log "   - $d"
  done
  log "Full log: $LOG_FILE"
fi
