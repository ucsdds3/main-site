# 🚀 DS3 Main Site Documentation for the github workshop

## 🎯 Getting Started with this repo

1. Clone the repo with `git clone https://github.com/ucsdds3/main-site.git`
2. Open the repo in your preferred code editor (For VSCode, use the command `code main-site`)
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server

## 🤝 Contribution Guidelines 

To make contributions to the DS3 Main Site, please follow these guidelines:

1. (Infra members with write access can skip this step) Fork the repository to your own GitHub account and clone it.
2. Branch from **`dev`**: `git fetch origin dev && git checkout -b <branch-name> origin/dev`
3. Make your changes and push them to your branch.
4. Open a pull request **into `dev`** (not `main`). Get one approval; CI must pass.
5. To release, open a separate PR **`dev` → `main`** after integration testing on the dev deployment.

Full branching, rulesets, and production deploy gates: [docs/BRANCHING_AND_DEPLOY.md](docs/BRANCHING_AND_DEPLOY.md)

## Database (Supabase)

**Read first:** [docs/DATABASE_MIGRATIONS.md](docs/DATABASE_MIGRATIONS.md)

- **Prod:** DS3-prod / Membership — live data. **Do not** edit schema in the SQL Editor for normal feature work.
- **Dev:** DS3-dev — empty or test data. Apply schema here first with `npx supabase db push --linked` after linking the **dev** project ref.
- **All schema changes** go in `supabase/migrations/` (plus a revert in `supabase/migrations/revert/`), merged via PR to **`dev`**, then reviewed apply to prod.

Quick start for a new table or column:

```bash
git checkout -b feat/schema-change origin/dev
npm run db:new -- describe_your_change
# edit supabase/migrations/<timestamp>_describe_your_change.sql
npx supabase link --project-ref <dev-project-ref>
npx supabase db push --linked
```

## 📁 Project Structure 

Stick to the project structure shown below to keep things organized:

```
main-site/  
├── node_modules/         # Installed dependencies  
├── public/               # Public assets  
├── src/                  # Source code files  
│   ├── Assets/           # Project assets  
│   │   ├── Data/         # Data files  
│   │   └── Images/       # Image assets  
│   ├── Components/       # General components  
│   ├── Hooks/            # Custom hooks  
│   ├── Pages/            # Pages  
│   │   └── Example/      # Page-specific components  
│   ├── Styles/           # Custom styles  
│   ├── Utils/            # Utilities  
│   │   ├── functions.ts  # Utility functions  
│   │   └── types.ts      # Utility types  
```

## 📦 Dependencies 

Check the depencencies listed below for this project before starting. Use these to your advantage so you don't have to do more work! There are more dependencies that you can find in the `package.json` file, but these are the ones you should be familiar with.

- [Vite](https://vitejs.dev/) - Build Tool ⚡
- [React](https://react.dev/) - Frontend Framework ⚛️
- [React Router](https://reactrouter.com/en/main) - Routing 🛣️
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework 🎨
- [React Icons](https://react-icons.github.io/react-icons/) - Icon Library 🖼️
- [Daisy UI](https://daisyui.com/) - Tailwind CSS Component Library 🎯
- [Framer Motion](https://www.framer.com/motion/) - Animation Library ✨

## TalentLens

**Start here:** sibling repo [`Talentlens_V2/README.md`](../Talentlens_V2/README.md) — product overview, local dev, and doc map.

### Search UI (`/talentlens`)

The `/talentlens` page uses the TalentLens V2 FastAPI service. Configure its base URL:

```sh
VITE_TALENTLENS_V2_API_URL=http://localhost:8001
```

From the sibling `Talentlens_V2` repository, run `python scripts/run_api.py --port 8001`.  
Once deployed, replace the local URL with the V2 Cloud Run service endpoint.

Code: `src/Sites/Main/Pages/TalentLens/`

**Beta feedback:** After a search, use **Report an issue** (orange button in the results toolbar). Submissions go to Supabase `TalentLensFeedback`. Table DDL: `supabase/migrations/20261120120000_talentlens_schema.sql` ([DATABASE_MIGRATIONS.md](docs/DATABASE_MIGRATIONS.md)). Triage: `Talentlens_V2/docs/FEEDBACK_TRIAGE.md`.

**UI (2026-09):** Results are card-only (no detail popup). Single feedback entry point — no per-candidate report icon.

### Members portal → TalentLens ingest

The **members subdomain** (`?subdomain=members`) is where members set `resume_link` and opt into the talent pool (`/profile`, signup). Those writes go to Supabase `Members`; a **database trigger** enqueues ingest jobs — the portal does not parse resumes itself.

| Surface | Route / access | Role |
|---------|----------------|------|
| Members portal | `?subdomain=members` | Profile, events, resume URL |
| TalentLens search | `/talentlens` | Recruiter search (`TalentLensUsers` allowlist + auth gate) |

**Ingest worker (GCP):** currently **OFF** — portal still enqueues jobs in Supabase; a Cloud Run Job (every 30 min when enabled) or local worker processes them. See sibling doc for costs and deploy.

**Full integration architecture** (Supabase tables, worker, RLS, costs, roadmap):  
`../Talentlens_V2/docs/DS3_INTEGRATION.md` (sibling repo in DS3_new workspace)

Supabase env (portal): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in `.env`
