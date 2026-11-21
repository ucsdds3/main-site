# Branching, dev environment, and production gates

This document defines how we integrate features on **`dev`**, ship to production on **`main`**, and who can merge where.

## Branches

| Branch | Purpose | Deploy target |
|--------|---------|---------------|
| **`dev`** | Shared integration branch for all in-progress work (hackathon matching, events, admin, etc.) | Preview deploy aliased to **`dev.ds3atucsd.com`** (staging lane) |
| **`main`** | Production default branch | Production **only** when commit message includes `#prod` or `hotfix`, or via manual production workflow |
| **`feature/*`, `hackathon-matching`, …** | Short-lived work | Merge into **`dev`** via pull request (not directly into `main` while the feature is still experimental) |

### Typical flow

1. Open a branch from `dev` (or rebase your long-lived branch onto `dev`).
2. Open a **PR → `dev`**. Get **one approval**, pass **CI**.
3. After integration testing on the shared dev deployment, open a **PR `dev` → `main`** for release.
4. Merge to `main` with review; production deploy follows the gates below.

## GitHub rulesets

Configured in the repo **Rules** settings (not in git):

| Ruleset | Branch | Rules |
|---------|--------|--------|
| **Protect Main** | `main` (default) | PR required, **1 approving review**, required **CI** check, no branch deletion / force-push bypass |
| **Protect Dev** | `dev` | PR required, **1 approving review**, no branch deletion / force-push bypass |

Repository admins can still bypass in emergencies; everyone else merges through PRs.

## Production merge and deploy gates

**Merging to `main`**

- Must use a pull request (ruleset).
- At least one approval.
- **CI** (`lint` + `npm run build`) must pass on the PR.

**Deploying production (Vercel)**

Production is **not** deployed on every merge to `main`. A push to `main` builds a **preview** unless:

- The commit message contains **`#prod`** or **`hotfix`**, or
- Someone runs **Deploy to Vercel** manually (`workflow_dispatch`) and chooses **production** (uses the GitHub **production** environment — add required reviewers in repo Settings → Environments).

Pushes to **`dev`** always build and deploy **preview/staging** only (never `vercel deploy --prod`). After a successful preview deploy, the workflow runs `vercel alias set <deployment-url> dev.ds3atucsd.com` with the linked team scope. Concurrent `dev` runs cancel older in-progress deploys so an older build cannot overwrite the alias.

### Staging secrets (required for `dev`)

Point the `dev` deployment at non-production backends with GitHub Actions secrets:

| Secret | Purpose | Required on `dev`? |
|--------|---------|--------------------|
| `STAGING_VITE_SUPABASE_URL` | Staging Supabase project (DS3-dev) | **Yes** — build fails if missing |
| `STAGING_VITE_SUPABASE_ANON_KEY` | Staging anon key | **Yes** — build fails if missing |
| `STAGING_VITE_TALENTLENS_V2_API_URL` | Staging TalentLens API | Recommended |

`dev` builds **never** fall back to production `VITE_*` Supabase credentials.

## Members portal on dev hosts

Stable staging URL:

`https://dev.ds3atucsd.com/?subdomain=members`

Example path for hackathon matching: `/hackathon-matching` under that URL.

## Releasing database migrations

**Full instructions:** [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md) (no prod SQL Editor; dev first, then prod apply).

Schema changes flow through `supabase/migrations/` and the **Supabase migrations** workflow.

### New Supabase projects (dev/staging)

Production Membership was created before versioned migrations. Greenfield databases use:

1. **`20260907215800_brownfield_core_schema.sql`** — baseline `Members`, `Events`, `Attendance`, `Items`, and core RPCs (`IF NOT EXISTS` on prod).
2. Delta migrations (sprints, RLS, shop, matching, …).
3. **`20261120120000_talentlens_schema.sql`** — TalentLens tables, RLS, ingest trigger (from former `Talentlens_V2/sql/` one-offs).
4. **`20261120120100_legacy_prod_tables.sql`** — other Membership tables that never had versioned DDL (`FormQuestion`, `Purchases`, coffee vend, …).

On a **fresh** dev project after a dashboard reset:

```bash
npx supabase link --project-ref <dev-ref>
npx supabase db push --linked
```

If a previous failed push left a half-applied history, reset the dev database first, then push again.

Apply to **production** only via the existing manual `apply=true` dispatch on `main` after review (baseline is safe on prod — no-op where tables exist).