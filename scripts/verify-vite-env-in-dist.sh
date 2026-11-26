#!/usr/bin/env bash
# Fail the deploy if the production bundle never picked up Supabase env (stub client path).
set -euo pipefail

while IFS= read -r -d '' js; do
  if grep -q 'supabase\.co' "$js"; then
    echo "Supabase project URL present in $(basename "$js")."
    exit 0
  fi
done < <(find dist .vercel/output/static -type f -path '*/assets/*.js' -size +100k 2>/dev/null -print0 || true)

echo "::error::Build output has no supabase.co URL — Vite did not bake VITE_SUPABASE_* (check CI .env.production step)." >&2
exit 1