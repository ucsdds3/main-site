# Branching, dev environment, and production gates

This document defines how we integrate features on **`dev`**, ship to production on **`main`**, and who can merge where.

## Branches

| Branch | Purpose | Deploy target |
|--------|---------|---------------|
| **`dev`** | Shared integration branch for all in-progress work (hackathon matching, events, admin, etc.) | Non-production Vercel deployment (staging lane — configure domain `dev.ds3atucsd.com` when ready) |
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

Pushes to **`dev`** always build and deploy **preview/staging** only (never `vercel deploy --prod`).

### Staging secrets (recommended)

Point the `dev` deployment at non-production backends by adding GitHub Actions secrets (repository or environment `staging`):

| Secret | Purpose |
|--------|---------|
| `STAGING_VITE_SUPABASE_URL` | Staging Supabase project |
| `STAGING_VITE_SUPABASE_ANON_KEY` | Staging anon key |
| `STAGING_VITE_TALENTLENS_V2_API_URL` | Staging TalentLens API |

If unset, the deploy workflow falls back to the existing `VITE_*` secrets (same as today — **not** isolated from prod until staging secrets exist).

## Members portal on dev hosts

On Vercel preview/staging hosts, open the members portal with:

`https://<dev-host>/?subdomain=members`

Example path for hackathon matching: `/hackathon-matching` under that URL.

## Releasing database migrations

Schema changes still flow through `supabase/migrations/` and the **Supabase migrations** workflow. Apply to **staging Supabase** before relying on dev for enrollment writes; apply to **production** only via the existing manual `apply=true` dispatch on `main` after review.