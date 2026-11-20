# Database changes — migrations only

DS3 uses **two Supabase Postgres projects**:

| Project | Ref (example) | Role |
|---------|---------------|------|
| **DS3-prod** (Membership) | `aogowlvmcvvrnryxuzlr` | Live site — real members and data |
| **DS3-dev** | `ngsciswixeaslnaspgsg` | Staging / integration — no prod data |

**Source of truth for schema** is this repo: `supabase/migrations/*.sql` (not the Supabase SQL Editor on prod).

## What migrations cover today

Running the full migration chain on an empty database recreates essentially **all `public` base tables** the club app and TalentLens portal touch:

- Core portal tables (brownfield baseline + later deltas): `Members`, `Events`, `Attendance`, `Items`, sprints, shop, applications, fundraising, …
- TalentLens: `TalentLensUsers`, `TalentLensProfiles`, `TalentLensChunks`, `TalentLensIngestJobs`, `TalentLensFeedback` + RLS + ingest trigger
- Legacy prod tables: `FormQuestion`, `ApplicationQuestion`, `ApplicationSubmission`, `TeamMember`, `Purchases`, coffee vend tables
- Hackathon matching: `matching_*`

**Not** created by migrations alone (configure per environment):

- **Auth** settings, email templates, redirect URLs
- **Storage** buckets (`Profile Pictures`, `Event Images`, shop images, …)
- **Edge Functions** in `supabase/functions/` (deploy separately)
- **Some RPCs** used only in admin insights may still exist only on prod until added in a migration
- **Data** (rows) — use seeds or test signups; never copy prod member PII into git

Prod may still have a few objects created only in the dashboard years ago. **New work must add migrations** so dev stays in sync; if you find drift, add a migration or extend the baseline — do not “fix prod only.”

## Hard rules

1. **Do not** change production schema in the Supabase **SQL Editor** for routine work.
2. **Do not** run `supabase db push --linked` while linked to **DS3-prod** unless you are following the reviewed prod apply process below.
3. **Do** add forward SQL under `supabase/migrations/` and a manual revert under `supabase/migrations/revert/`.
4. **Do** apply to **DS3-dev** first (`db push`), test on the staging site, then promote to prod.
5. **Do** use `IF NOT EXISTS` / idempotent patterns when backfilling objects prod already has.

Historical one-offs in `sql/` and `Talentlens_V2/sql/` are **deprecated for new changes** — port DDL into `supabase/migrations/` instead.

## Workflow: change the database

### 1. Branch and author migration

```bash
cd main-site
git fetch origin dev && git checkout -b feat/my-schema-change origin/dev

npm run db:new -- my_schema_change
# Edit supabase/migrations/<timestamp>_my_schema_change.sql
# Add supabase/migrations/revert/<timestamp>_my_schema_change.sql (manual down)
```

Open a PR **into `dev`**. CI **Supabase migrations** applies every migration on ephemeral Postgres (with pgvector).

### 2. Apply to DS3-dev

```bash
npx supabase link --project-ref ngsciswixeaslnaspgsg   # dev only
npx supabase db push --linked
```

Confirm `supabase/.temp/project-ref` is **not** the prod ref before pushing.

If the CLI asks for `--include-all`, you had a messy migration history — prefer **resetting the dev database** in the dashboard, then push again.

### 3. Test

Point local or staging frontend at dev (`STAGING_VITE_SUPABASE_*` on Vercel, or `.env` for local experiments). Exercise the feature that needs the new schema.

### 4. Ship code + schema to production

1. Merge feature PR → `dev`, then release PR **`dev` → `main`** when ready.
2. Apply **pending** migrations to **DS3-prod** only after review:
   - GitHub → **Actions** → **Supabase migrations** → **Run workflow** on `main` with **`apply=true`** (backs up first), **or**
   - Locally: link prod explicitly, then push (infra members only):

     ```bash
     npx supabase link --project-ref aogowlvmcvvrnryxuzlr
     npx supabase db push --linked --dry-run   # review first
     # npx supabase db push --linked           # only when intentional
     ```

Never apply prod migrations from a laptop without the same review you would use for the GitHub Action.

## Local Supabase (optional)

```bash
npm run db:local    # Docker Supabase + .env.local overlay
npm run db:stop
```

Uses `supabase/seed.sql` for demo users after migrations; seed does **not** run on remote `db push`.

## Reverts and emergencies

- Forward migrations are applied in order by timestamp.
- **Revert scripts are manual** — not run by CI. Use after a restore from backup if a migration must be undone.
- Prod backup artifacts: Supabase migrations workflow when `apply=true`.

## Quick reference

| Task | Command / location |
|------|---------------------|
| New migration | `npm run db:new -- <name>` |
| Dry-run on linked prod (CI) | Action secrets + `db push --dry-run` |
| Fresh dev project | Dashboard reset → `db push --linked` |
| Edge Functions | `supabase functions deploy …` (not migrations) |
| Agent / contributor rules | [AGENTS.md](../AGENTS.md) → Supabase |
| Branch + Vercel staging | [BRANCHING_AND_DEPLOY.md](BRANCHING_AND_DEPLOY.md) |