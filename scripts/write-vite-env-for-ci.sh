#!/usr/bin/env bash
# Emit .env.production for Vite during CI / vercel build --prebuilt.
# Callers must export VITE_* (including Supabase) before invoking this script.
set -euo pipefail

for name in VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY; do
  if [[ -z "${!name:-}" ]]; then
    echo "::error::$name is required for deploy builds." >&2
    exit 1
  fi
done

{
  printf 'VITE_SUPABASE_URL=%s\n' "$VITE_SUPABASE_URL"
  printf 'VITE_SUPABASE_ANON_KEY=%s\n' "$VITE_SUPABASE_ANON_KEY"
  [[ -n "${VITE_GOOGLE_CALENDAR_ID:-}" ]] && printf 'VITE_GOOGLE_CALENDAR_ID=%s\n' "$VITE_GOOGLE_CALENDAR_ID"
  [[ -n "${VITE_GOOGLE_CALENDAR_API_KEY:-}" ]] && printf 'VITE_GOOGLE_CALENDAR_API_KEY=%s\n' "$VITE_GOOGLE_CALENDAR_API_KEY"
  [[ -n "${VITE_TALENTLENS_V2_API_URL:-}" ]] && printf 'VITE_TALENTLENS_V2_API_URL=%s\n' "$VITE_TALENTLENS_V2_API_URL"
} > .env.production

echo "Wrote .env.production for Vite ($(wc -l < .env.production | tr -d ' ') lines)."