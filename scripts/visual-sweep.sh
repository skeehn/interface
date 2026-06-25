#!/usr/bin/env bash
# Visual QA sweep — capture every component (32) × every theme (7) = 224 shots
# via the gstack `browse` headless binary, for critical review.
#
# Usage:
#   1. cd apps/docs && bun run dev        # serve the docs on $PORT (default 3000)
#   2. PORT=3000 bash scripts/visual-sweep.sh
#   Screenshots land in apps/docs/.visual-qa/<slug>__<theme>.png (gitignored).
set -euo pipefail

BROWSE="${BROWSE:-$HOME/.claude/skills/gstack/browse/dist/browse}"
PORT="${PORT:-3000}"
BASE="http://localhost:$PORT/preview"
OUT="apps/docs/.visual-qa"
mkdir -p "$OUT"

THEMES=(light default dark terminal brutal grain print)
SLUGS=(button card input badge alert dialog tabs toggle progress avatar tooltip
  dropdown table accordion chat-bubble chat-input reasoning-step tool-card
  citation-card streaming-text terminal-panel agent-status code-block
  typing-indicator markdown voice-session thinking-block prompt-suggestions
  file-attachment layout dataviz motion)

"$BROWSE" viewport 1440x900 >/dev/null
for slug in "${SLUGS[@]}"; do
  for theme in "${THEMES[@]}"; do
    "$BROWSE" goto "$BASE/$slug?theme=$theme" >/dev/null 2>&1 || true
    "$BROWSE" wait '[data-preview-ready="true"]' >/dev/null 2>&1 || true
    "$BROWSE" screenshot --viewport "$OUT/${slug}__${theme}.png" >/dev/null 2>&1 || true
  done
  echo "captured $slug × ${#THEMES[@]}"
done
echo "Done: $(( ${#SLUGS[@]} * ${#THEMES[@]} )) shots in $OUT"
