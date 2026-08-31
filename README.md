# 🚀 DS3 Main Site Documentation for the github workshop

## 🎯 Getting Started with this repo

1. Clone the repo with `git clone https://github.com/ucsdds3/main-site.git`
2. Open the repo in your preferred code editor (For VSCode, use the command `code main-site`)
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server

## 🤝 Contribution Guidelines 

To make contributions to the DS3 Main Site, please follow these guidelines:

1. (Infra members with write access can skip this step) Fork the repository to your own GitHub account and clone it.
2. Create a new branch for your changes using the command `git checkout -b <branch-name>`.
3. Make your changes and push them to your branch.
4. Create a pull request from your branch to the main branch. Write a summary of your changes in the pull request description.
5. Once the pull request is merged, you can safely delete your branch using the command `git branch -d <branch-name>`.

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

### Search UI (`/talentlens`)

The `/talentlens` page uses the TalentLens V2 FastAPI service. Configure its base URL:

```sh
VITE_TALENTLENS_V2_API_URL=http://localhost:8001
```

From the sibling `Talentlens_V2` repository, run `python scripts/run_api.py --port 8001`.  
Once deployed, replace the local URL with the V2 Cloud Run service endpoint.

Code: `src/Sites/Main/Pages/TalentLens/`

**Beta feedback:** After a search, use **Report issue** (results toolbar or per-candidate icon). Submissions go to Supabase `TalentLensFeedback` with the query and top-10 debug snapshot attached. One-time setup in the DS3 Supabase project: run `Talentlens_V2/sql/talentlens_feedback.sql` in the SQL Editor. Admins (`TalentLensUsers.role = admin`) can triage rows in Supabase; reporters can only insert and read their own.

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
