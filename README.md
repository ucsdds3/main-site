# DS3 main site

Public marketing site + members portal (single React/Vite app). Production: [ds3atucsd.com](https://ds3atucsd.com). Shared staging: [dev.ds3atucsd.com](https://dev.ds3atucsd.com).

## How we work now

| Rule | Detail |
|------|--------|
| **Integrate on `dev`** | Feature branches merge via PR into **`dev`**, not `main`. |
| **Test on staging** | Merges to `dev` deploy to **https://dev.ds3atucsd.com** (DS3-dev Supabase baked in at build time). |
| **Ship to production** | After staging looks good, open PR **`dev` → `main`**, then production deploy only with **`#prod` / `hotfix`** or manual production workflow (see [BRANCHING_AND_DEPLOY.md](docs/BRANCHING_AND_DEPLOY.md)). |
| **Do not push directly to `main`** | `main` is protected; day-to-day work targets `dev`. |
| **Schema** | All DB changes via `supabase/migrations/` — apply to **DS3-dev** first, prod only after review ([DATABASE_MIGRATIONS.md](docs/DATABASE_MIGRATIONS.md)). |

**Members portal on staging:** `https://dev.ds3atucsd.com/?subdomain=members` (the `dev` hostname is staging, not a site name — see `src/Hooks/useSiteHandler.ts`).

**Agent / contributor deep dive:** [AGENTS.md](AGENTS.md)

## Getting started

```bash
git clone https://github.com/ucsdds3/main-site.git
cd main-site
npm install
cp .env.example .env    # then edit — see below
npm run dev
```

- Main site: [http://localhost:5173/](http://localhost:5173/)
- Members portal: [http://localhost:5173/?subdomain=members](http://localhost:5173/?subdomain=members)

## Local environment: which Supabase am I using?

The browser **does not** pick dev vs prod from your git branch. Vite reads **`VITE_SUPABASE_URL`** and **`VITE_SUPABASE_ANON_KEY`** at dev-server startup (from `.env`, with **`.env.local` on top**).

| Mode | How | Backend |
|------|-----|---------|
| **A — DS3-dev (recommended)** | In `.env`, use the **DS3-dev** URL + anon key pair; comment out prod | Cloud staging DB (`ngsciswixeaslnaspgsg`) |
| **B — Production Membership** | Uncomment the **prod** pair; comment out dev | Live member data — use only when you mean to |
| **C — Local Docker** | `npm run db:local` then `npm run dev` | Local Supabase; `.env.local` overrides `.env` |

After changing `.env`, restart `npm run dev`. To leave Docker mode: `npm run db:stop` and remove `.env.local`.

```bash
# Schema work against DS3-dev (not prod)
npx supabase link --project-ref ngsciswixeaslnaspgsg
npx supabase db push --linked
```

Anon keys: Supabase dashboard → project → **Settings → API**. DS3-dev anon matches what infra stores as `STAGING_VITE_SUPABASE_ANON_KEY` for CI.

**Hosted staging note:** `dev.ds3atucsd.com` gets Supabase from **GitHub Actions secrets** when the `dev` branch builds — your local `.env` only affects **localhost**.

## Contribution workflow

1. Fork (if needed) and clone.
2. `git fetch origin dev && git checkout -b my-feature origin/dev`
3. Change code; run `npm run dev` / `npm run build` locally.
4. Open PR **into `dev`** — one approval + green CI.
5. Verify on **https://dev.ds3atucsd.com** after merge.
6. Release: PR **`dev` → `main`**, then production deploy per [BRANCHING_AND_DEPLOY.md](docs/BRANCHING_AND_DEPLOY.md).

## Database (Supabase)

**Read first:** [docs/DATABASE_MIGRATIONS.md](docs/DATABASE_MIGRATIONS.md)

- **Prod:** DS3-prod / Membership — live data. No routine schema edits in the SQL Editor.
- **Dev:** DS3-dev — test signups and integration. `db push` here first.
- **Migrations:** `npm run db:new -- <name>` → PR to `dev` → apply to dev → later promote to prod.

## Project structure (simplified)

```
main-site/
├── src/
│   ├── App.tsx                 # main vs members shell
│   ├── Hooks/useSiteHandler.ts # hostname / ?subdomain= routing
│   ├── Sites/Main/             # Public site (/talentlens, /events, …)
│   ├── Sites/Members/          # Portal (auth, profile, admin, …)
│   └── Utils/supabase.ts       # Supabase client (Vite env)
├── supabase/migrations/        # Schema source of truth
└── .github/workflows/          # CI, deploy, migrations
```

## Dependencies

See `package.json`. Core stack: Vite, React, React Router, Tailwind, DaisyUI, Framer Motion, Supabase JS.

## TalentLens

**Start here:** sibling repo [`Talentlens_V2/README.md`](../Talentlens_V2/README.md).

### Search UI (`/talentlens`)

Local API default:

```sh
VITE_TALENTLENS_V2_API_URL=http://127.0.0.1:8001
```

Run API from `Talentlens_V2`: `python scripts/run_api.py --port 8001`. Staging builds can set `STAGING_VITE_TALENTLENS_V2_API_URL` in GitHub.

Code: `src/Sites/Main/Pages/TalentLens/`

### Members portal → ingest

Members set `resume_link` / talent pool on the portal; Supabase trigger enqueues ingest jobs. Worker often run locally or on GCP — see `../Talentlens_V2/docs/DS3_INTEGRATION.md`.

| Surface | Route / access |
|---------|----------------|
| Members portal | `?subdomain=members` (or `members.ds3atucsd.com` in prod) |
| TalentLens | `/talentlens` |
