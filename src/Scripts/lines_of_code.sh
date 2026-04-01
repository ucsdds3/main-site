#!/usr/bin/env bash
# Line counts by extension (css, html, js, json, md, py, ts, tsx, txt, yaml).
# Run from anywhere: bash src/Scripts/lines_of_code.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT" || exit 1

exts=(css html js md py ts tsx txt yaml)
total=0

printf '%-6s %10s\n' ext lines
printf '%s\n' '--------------'
for ext in "${exts[@]}"; do
  n=$(
    find . -type f -name "*.$ext" \
      ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./dist/*" 2>/dev/null \
      -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}'
  )
  n=${n:-0}
  printf '%-6s %10s\n' "$ext" "$n"
  total=$((total + n))
done
printf '%s\n' '--------------'
printf '%-6s %10s\n' TOTAL "$total"
