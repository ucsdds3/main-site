# AGENTS.md — DS3 Main Site

Guidance for coding agents working in this repository.

## What this repo is

This is the official website and members portal for **DS3** (Data Science Student Society at UC San Diego).

- GitHub: `ucsdds3/main-site`
- Production: `ds3atucsd.com` (public site) and `members.ds3atucsd.com` (members portal)
- Hosting: Vercel SPA (`vercel.json` rewrites all paths to `/`)
- Remote data: Supabase (Auth, Postgres, Storage, Edge Functions)

One Vite + React app serves **two sites**. `src/App.tsx` picks which tree to mount from the hostname (production) or `?subdomain=` (local / Vercel preview).

Sibling product (not this repo): **TalentLens V2** search API. This repo only owns the `/talentlens` UI and the members-portal ingest fields.

The root `README.md` is useful for clone / contribute steps. Its “Project Structure” section is outdated — trust this file and the actual `src/` tree.

## Stack

| Layer | Choice |
|---|---|
| App | React 19 + TypeScript (strict) |
| Build | Vite 6, `@vitejs/plugin-react-swc` |
| Routing | React Router 7 (`react-router` on Main; Members still imports `react-router-dom` in places) |
| Style | Tailwind CSS 4 (`@tailwindcss/vite`), DaisyUI, `fluid-tailwindcss`, `tailwind-merge` |
| Motion | Framer Motion |
| State | Zustand (`useAuthStore`, `useAdminStore`, `useTheme`) |
| Backend client | `@supabase/supabase-js` via `src/Utils/supabase.ts` |
| Validation | Zod |
| Toasts | `react-hot-toast` |
| Charts | Chart.js + `react-chartjs-2` (admin Insights) |
| Analytics | `@vercel/analytics` |

Path alias: import from `src/...` (configured in `vite.config.ts` and `tsconfig.app.json`).

## Commands

```sh
npm install
npm run dev          # Vite dev server
npm run build        # tsc -b && vite build
npm run lint
npm run format       # Prettier on src/**/*.{ts,tsx,js,jsx,json,css}
npm run preview
```

Local multi-site: `http://localhost:5173/?subdomain=members` (or omit / use `main`).

Local Supabase (Docker; does **not** write to Membership):

```
npm run db:local   # start, write .env.local, seed exec/board users
npm run dev
# http://localhost:5173/?subdomain=members → /sprints
# exec@ucsd.edu / LocalDev1
npm run db:stop    # then delete .env.local to use prod credentials again
```

Required env in `.env` (Vite, public):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_TALENTLENS_V2_API_URL=   # search UI only; local default http://localhost:8001
```

If Supabase env is missing, `src/Utils/supabase.ts` returns a stub client that fails queries safely instead of crashing. Do **not** put server secrets (Resend, service role) in `.env`.

## How the two sites work

`src/Hooks/useSiteHandler.ts` is the only place that should decide “which site” and cross-site navigation.

- Production (`*.ds3atucsd.com`, not `www`): first hostname label is the subdomain (`members`, else `main`).
- Localhost / IP / `*.vercel.app`: `?subdomain=` query param, default `main`.
- `navigate({ pathname, subdomain, hash, nextURL })` sets the query param locally, or does a full `https://{subdomain}.ds3atucsd.com/...` hop in production.

`App.tsx` only mounts `main` and `members`. `consulting` still appears in title / navbar JSON leftovers — consulting is a **page on Main** (`/consulting`), not a third site.

Auth runs globally via `useAuth()` in `App.tsx` (loads the Supabase user + `Members.admin_level`). That does **not** lock the public Main site. The members tree requires a session. TalentLens on Main uses the same Auth session plus a separate allowlist. See **Access** and **Supabase setup** below.

## Directory map

```
main-site/
├── src/
│   ├── main.tsx, App.tsx
│   ├── Sites/
│   │   ├── Main/                 # Public marketing site
│   │   │   ├── Main.tsx          # Route table
│   │   │   ├── Pages/            # Home, Events, Board, Projects, …
│   │   │   ├── Components/       # Main-only shared widgets
│   │   │   └── Data/             # Cross-page JSON (e.g. partners)
│   │   └── Members/              # Authenticated portal
│   │       ├── Members.tsx       # Route table + auth redirect
│   │       ├── Pages/            # Home, Auth, Profile, Admin, Store, …
│   │       ├── Hooks/            # useAuthStore, useLeaderboard
│   │       ├── Components/       # Form controls
│   │       └── Data/
│   ├── Shared/                   # Used by both sites
│   │   ├── Page/                 # Page shell, Navbar, Footer, Section
│   │   ├── Events/               # Public/member event calendar + cards
│   │   ├── Components/           # Button, SafeLink, Paginate, HoverCard
│   │   └── icons/
│   ├── Hooks/                    # useAuth, useSiteHandler, theme, pagination
│   ├── Utils/                    # supabase client, types, cn(), helpers
│   ├── Styles/                   # index.css, custom.css
│   ├── Assets/                   # Bundled images
│   └── Scripts/                  # One-off Python scrapers (not the web app)
├── public/                       # Static assets (board photos, event images, …)
├── supabase/migrations/          # Versioned schema ups (source of truth)
├── supabase/functions/           # Edge Functions (confirm-event-status, notify-sprint-task)
├── sql/                          # Historical one-offs only (do not add new schema here)
├── .github/workflows/            # Vercel deploy + Supabase migration CI
├── docs/                         # Feature architecture (event workflow)
├── scripts/                      # Node helpers (optimize-images, …)
└── vercel.json
```

### Page layout convention

Typical page folder:

```
Pages/<Name>/
  <Name>.tsx          # Route element; wrap content in <Page>
  Sections/           # Vertical page sections
  Components/         # Page-local UI
  Hooks/              # Page-local data/behavior
  Data/*.json         # Copy, lists, static content
  Utils/              # Page-local types/helpers (admin especially)
```

- Wrap every full page in `src/Shared/Page/Page.tsx` (navbar, footer, dark theme, CSS variables `--obs-*`).
- Use `src/Shared/Page/Section.tsx` for section width / title rhythm.
- Theme is **locked dark** (`src/Hooks/useTheme.ts`). Keep `isDark` branches that already exist; do not reintroduce a light/dark toggle unless asked.
- Navbar links live in `src/Shared/Page/Data/navbar.json` (per-subdomain).

## Access: Main site vs login vs role

There are **three access planes**. Same Supabase Auth project; different gates.

```
Visitor
  │
  ├─ Main site (ds3atucsd.com)          → public pages, no login
  │     └─ /talentlens                  → Auth + TalentLensUsers allowlist
  │
  └─ Members portal (members.…)         → Auth + Members row required
        ├─ /sprints                     → Board or Executive (strict route + RLS)
        │     └─ Create / close sprint  → Executive only
        └─ /admin*                      → Board or Executive (see caveats)
              └─ Event status / notes   → Executive only (UI + Edge Function)
```

`Members.admin_level` is `"Member" | "Board" | "Executive"` (or `null` if the column is unset / no row). “Admin” in conversation usually means **Board + Executive**. There is no separate `admin` string.

### Main site — no login

Anyone can load these routes (`src/Sites/Main/Main.tsx`). Navbar CTA is **Sign In** → members portal (or **Members** if already signed in).

| Path | What | Data source |
|---|---|---|
| `/` | Home | JSON + static |
| `/events` | Public calendar / cards | Supabase `Events` where `deleted = false` **and** `workflow_status = 'complete'` (DataHacks-named rows hidden) |
| `/events/{gbm,workshops,social,professional,leetcode}` | Series “about” pages | `Pages/Events/Data/events.json` |
| `/board` | Current board | `Members` with non-null `teams`, not deleted |
| `/board/alumni` | Alumni | JSON |
| `/projects` | Quarterly projects | JSON + `public/` screenshots |
| `/opensource` | Open-source | JSON |
| `/consulting` | Consulting program | JSON |
| `/partners` | Partners | JSON |

**DataHacks:** `Pages/DataHacks/` exists but is **not routed**. Navbar goes to `https://datahacks.ds3ucsd.com/`. Do not add `/datahacks` unless asked.

Public `/events` does **not** show draft/waiting events, passwords used as check-in codes, or `internal_notes`.

### Main site — TalentLens (`/talentlens`)

On the **public** site, but gated. Independent of `admin_level`.

1. Sign in with Supabase Auth (own form in `TalentLensAuthGate`; same user pool as members).
2. `TalentLensUsers` must have that email, `active = true`.
3. Otherwise **Access not granted** even if they are a DS3 Member / Board / Executive.

Copy on the gate: approved recruiters and DS3 board, via allowlist — being Board in `Members` is **not** enough by itself.

### Members portal — must be logged in

`src/Sites/Members/Members.tsx`: if `authState !== "authenticated"`, every path except `/auth` redirects to `/auth` with `next` preserved.

Signup: `.edu` email, password rules, insert `Members` (no `admin_level` set in the client). Profile updates go to `Members` + Auth `user_metadata`. Talent-pool opt-in requires `resume_link`. Store page is a stub (`<Page>` only).

| Path | Who (UI) | What |
|---|---|---|
| `/auth` | Anyone | Sign in / sign up / forgot / reset (`authState`) |
| `/` | Any signed-in member | Home: XP/points (`Members.experience`, `Members.points`) + **my attendance** + event-code check-in |
| `/profile` | Any signed-in member | Own profile, links, talent pool, PFP |
| `/events` | Any signed-in member | Same shared public calendar as Main (`complete` only) |
| `/events/leaderboard` | Any signed-in member | Top 10 `Members` by points |
| `/store` | Any signed-in member | Placeholder |
| `/sprints`, `/sprints/:id` | Board + Executive | Club-wide sprint task board |
| `/admin` | Board + Executive (nav) | Schema-driven tables |
| `/admin/insights` | Board + Executive (nav) | Stats + charts |

Navbar (`Links.tsx`): **Sprints** and **Admin** (Dashboard + Insights) when `adminLevel` is Board or Executive. Avatar menu: Profile + Sign Out. **Main Site** link always shown on the portal.

**Route vs nav (do not “fix” unless asked):** `/admin*` is only bounced when `adminLevel == null`. A row with `admin_level = "Member"` can still open `/admin` by URL; nav stays hidden. `tables.json` `canView` is **not** enforced in `Admin.tsx` — only `canAdd` / `canEdit` and `execOnly` columns are.

**`/sprints` is stricter:** redirect unless `adminLevel` is `Board` or `Executive`. RLS in the sprints migration matches.

Check-in is portal-only: `rpc validate_event_code` (QR / `?eventcode=`). Attendance list: `rpc get_my_attendance`.

### Role matrix (members `admin_level`)

Intent lives in `Pages/Admin/Data/tables.json`. Writes that matter for event **status** are re-checked in the Edge Function.

| Capability | Member | Board | Executive |
|---|---|---|---|
| Use portal home / profile / events / leaderboard / check-in | Yes | Yes | Yes |
| `/sprints` (view + add/edit tasks) | No (nav hidden, route bounce) | Yes | Yes |
| Create / close sprint, roll leftover tasks | No | No | Yes |
| Admin nav + `/admin`, `/admin/insights` | No (nav hidden) | Yes | Yes |
| View Events / Members / Items / Attendance tables | — | View | View |
| Create Events, Items | No | No | Yes |
| Edit Events, Items, Members | No | No | Yes |
| Create Members or edit Attendance | No | No | No (`canAdd`/`canEdit` empty) |
| See / edit `workflow_status`, `internal_notes` | No | Hidden (`execOnly`) | Yes |
| **Confirm status** (publish / email officers) | No | No (no fields) | Yes — Edge Function requires Executive |
| Change someone else’s `admin_level` | No | No | Yes (Members table edit) |

Board can open Events in admin but cannot confirm status or see ops notes. Executive Save still **cannot** patch `workflow_status`; only **Confirm status** can.

### What login does *not* unlock

Signing in does not add Main-site routes. It unlocks the members subdomain and (if allowlisted) TalentLens. A recruiter on `TalentLensUsers` may have no `Members` row and cannot use the portal. A DS3 member not on `TalentLensUsers` cannot search TalentLens.

## Shared events + ops workflow

Public and member calendars use `src/Shared/Events/` (`EventPage`, `EventList`, `EventCard`, `useEvents`).

Event lifecycle (Executives, members admin):

1. Create/edit event fields + internal notes with normal **Save** (client → PostgREST).
2. Change `workflow_status` only via **Confirm status**, which invokes Edge Function `confirm-event-status`.
3. Public `/events` shows only `workflow_status = 'complete'`.

Statuses: `none` → `waiting_room` | `waiting_finance` | `waiting_marketing` → `complete`. The three `waiting_*` values email VPI / VPF / Marketing via Resend from the Edge Function.

Read before changing this: `docs/EVENT_WORKFLOW_ARCHITECTURE.md` and `docs/EVENT_WORKFLOW_STATUS.md`. SQL: `sql/events_workflow_status.sql`. Deploy function from repo root: `supabase functions deploy confirm-event-status`. Secrets stay in Supabase (`RESEND_*`, optional `VPI_EMAIL` / `VPF_EMAIL` / `MARKETING_DIRECTOR_EMAIL`).

## TalentLens (search UI only)

Code: `src/Sites/Main/Pages/TalentLens/`. Access rules are in **Access** above.

- Search: `POST {VITE_TALENTLENS_V2_API_URL}/search` with the user’s Bearer token (`api.ts`).
- Results are **card-only** (no detail popup). One feedback entry: **Report an issue** after a search → `TalentLensFeedback`.
- Saved candidates / recent queries are client-side (`storage.ts`).

Do not implement ingest, ranking, or resume parsing here. Ingest is a **DB trigger** on `Members` → `TalentLensIngestJobs` (SQL in the sibling TalentLens V2 repo, not this UI).

## How Supabase is set up

This repo is the **anon-key frontend** plus Edge Functions and **versioned Postgres migrations**. Schema changes go through `supabase/migrations/`, not the SQL Editor.

Linked CLI project: **Membership** (`aogowlvmcvvrnryxuzlr`). There is no generated types file.

| Path | Role |
|---|---|
| `supabase/migrations/*.sql` | Forward migrations (source of truth) |
| `supabase/migrations/revert/` | Manual down scripts (never auto-applied) |
| `supabase/functions/` | Edge Functions (`confirm-event-status`, `notify-sprint-task`) |
| `sql/events_workflow_status.sql` | Historical one-off (already on prod; do not re-add as a new migration) |
| `sql/sprints.sql` | Pointer only — real file is the sprints migration |

**New schema change:** `npm run db:new -- <name>` → edit the file in `supabase/migrations/` → add a matching `revert/<timestamp>_<name>.sql` → PR. CI applies ups on ephemeral Postgres. Apply to prod only via GitHub Action **Supabase migrations** with `apply=true` (dumps schema+data artifacts first) or `npm run db:push` after `supabase link`.

**Revert:** restore from the Action backup artifact, or run the revert SQL then `supabase migration repair --status reverted <version>`.

**GitHub secrets** (for dry-run + apply): `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID`, `SUPABASE_DB_PASSWORD`, optional `SUPABASE_DB_URL` (faster dumps). Optional environment: `supabase-prod`.

```
Browser (Vite)
  ├─ createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)   src/Utils/supabase.ts
  ├─ Auth          email + password (signup, signin, reset, updateUser)
  ├─ PostgREST     from("Members"|"Events"|"Attendance"|"Items"|"TalentLensUsers"|"TalentLensFeedback"|"Sprints"|"SprintTasks"|"SprintTaskAssignees"|"SprintTaskSprints")
  ├─ RPC           check_member_email_exists, validate_event_code, get_my_attendance, insight RPCs
  ├─ Storage       "Profile Pictures", "Event Images"
  └─ functions.invoke("confirm-event-status"|"notify-sprint-task") + user JWT
         └─ Edge Function uses service role + Resend (secrets, not Vite env)
```

Missing Vite env → stub client that fails queries instead of crashing. **Never** put service-role or `RESEND_*` in `.env`.

### Auth

| Flow | Code | Behavior |
|---|---|---|
| Session boot | `src/Hooks/useAuth.ts` | `getUser()`, optional `tokenHash` recovery OTP, then `Members.admin_level` by email |
| Sign up | `useSignUp.ts` | `auth.signUp` + `Members.insert` (points/experience 0; no admin_level in payload) |
| Sign in | `useSignIn.ts` | `signInWithPassword` + load `admin_level` |
| Forgot / reset | `useForgotPassword.ts`, `useResetPassword.ts` | RPC email exists check → `resetPasswordForEmail`; `updateUser({ password })` |
| Sign out | `useSignOut.ts` | `auth.signOut()` |
| TalentLens sign in | `TalentLensAuthGate` | Same `signInWithPassword`, then allowlist |

Emails are lowercased. Signup / forgot-password Zod requires `.edu` (TalentLens recruiter form does not).

### Tables this app reads/writes

Column lists are what the **frontend** uses. The live DB may have more.

**`Members`** — one profile row per club member; join key is **email** (not Auth uid).

| Fields the app uses | Who writes |
|---|---|
| `email`, `full_name`, `graduation_year`, `major`, `date_of_birth`, `gender`, `is_grad_student`, `on_mailing_list` | Signup / profile / Exec admin |
| `points`, `experience` | Check-in / backend (UI displays; Exec can edit in admin) |
| `admin_level` | Exec admin only (`Member` / `Board` / `Executive`) |
| `in_talent_pool`, `resume_link`, `github_link`, `linkedin_link`, `other_link` | Signup / profile / Exec admin |
| `teams` (jsonb: committee key → role title) | Exec admin; public `/board` reads non-null `teams` |
| `profile_picture` | Profile upload + Auth metadata |
| `deleted` | Soft-delete in admin |

INSERT/UPDATE on talent-pool + resume is expected to fire a **trigger** that enqueues `TalentLensIngestJobs` (sibling SQL). This app never talks to that jobs table.

**`Events`** — calendar + admin.

| Fields | Notes |
|---|---|
| `name`, `description`, `points`, `image`, `password`, `start`, `end`, `temp_end`, `location`, `tags`, `deleted` | Exec create/edit; `password` is the check-in code |
| `workflow_status` | `none` / `waiting_*` / `complete`. Client inserts `none`. Later changes only via Edge Function |
| `internal_notes` | Exec Save; UI-hidden from Board |

Public list selects a subset and filters `complete`. QR column in admin is derived UI (`qr_code` type), not a stored column.

**`Attendance`** — `member_id`, `event_id`, `check_in`/`created_at`, `points`. Members insert via `validate_event_code`. Admin is view-only (hard delete if Exec UI allowed it — `canEdit` is empty). Insights join `Members` + `Events`.

**`Items`** — merch (`name`, `description`, `price`, `image`, `deleted`). Admin CRUD for Executives. Storefront is not wired.

**`TalentLensUsers`** — `email`, `role`, `active`. Read-only from this app (allowlist).

**`TalentLensFeedback`** — insert from search UI (`feedbackApi.ts`).

**`Sprints` / `SprintTasks` / `SprintTaskAssignees`** — Board sprint tracker. SQL + RLS: `supabase/migrations/20260907220000_create_sprints.sql`. UI: `src/Sites/Members/Pages/Sprints/`.

| Table | Notes |
|---|---|
| `Sprints` | Club-wide. `status`: `planning` / `active` / `closed`. At most one `active`. Exec insert/update only |
| `SprintTasks` | `team_key`, title, required description, optional `relevant_url`, `expected_hours`, `expected_completion_on`, `actual_hours` (required before `pending_review`), `completed_at` (set when `done`), `reviewer_id`, `review_approved` / `review_comment` / `reviewed_at`. Status: `todo` / `in_progress` / `pending_review` / `done` / `cancelled`. Complete requires reviewer approval. Board+Exec write if any linked sprint is planning/active |
| `SprintTaskAssignees` | `(task_id, member_id)`. Person lookup joins here |
| `SprintTaskSprints` | `(task_id, sprint_id)` many-to-many so a card can span / roll across sprints |

Helpers: `is_board_or_exec()`, `is_executive()` (JWT email → `Members.admin_level`). Regular members have no policies. Apply the sprints migration before using `/sprints`.

### RPCs

| Function | Used for |
|---|---|
| `check_member_email_exists(check_email)` | Forgot-password: refuse unknown emails |
| `validate_event_code(event_code)` | Check-in; returns `registered`, `already_registered`, `event_not_started`, `event_expired`, `not_authenticated`, `member_not_found`, `invalid_event` |
| `get_my_attendance` | Member home “events I attended” |
| `get_attendance_distribution_by_time_of_day` | Insights pies |
| `get_event_tag_percents` | Insights |
| `get_event_venue_percents` | Insights |
| `get_member_distribution_by_year` | Insights |
| `get_member_distribution_by_major` | Insights |

### Storage

| Bucket | Who | Path / notes |
|---|---|---|
| `Profile Pictures` | Signed-in member | Upload + public or long-lived signed URL; also stored on Auth metadata + `Members.profile_picture` |
| `Event Images` | Admin event edit | Same public/signed-URL pattern |

Bucket names are exact strings in `useUploadPFP.ts` and `useEditCard.ts`.

### Edge Function `confirm-event-status`

`supabase/functions/confirm-event-status/index.ts`. Deploy: `supabase functions deploy confirm-event-status`.

1. Verify caller JWT.
2. Service-role: `Members` email must be **Executive** and not deleted.
3. If `waiting_*`, email VPI / VPF / Marketing via Resend **before** write.
4. `UPDATE Events.workflow_status`.

Secrets (Supabase, not Vite): `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, optional `VPI_EMAIL` / `VPF_EMAIL` / `MARKETING_DIRECTOR_EMAIL`.

### Edge Function `notify-sprint-task`

`supabase/functions/notify-sprint-task/index.ts`. Deploy: `supabase functions deploy notify-sprint-task`.

1. Verify caller JWT. Service-role: `Members` email must be **Board** or **Executive**.
2. `kind = assigned` → Resend the assignees when a task is created.
3. `kind = pending_review` → Resend the reviewer when a task moves to pending review.

Same `RESEND_*` secrets as `confirm-event-status`. Optional `MEMBERS_PORTAL_URL` (default `https://members.ds3atucsd.com`). Task writes still go client → PostgREST; a mail failure does not roll back the card.

### RLS / grants (not in this repo)

Most tables do **not** have policies checked in here. The UI is a presentation layer for Admin/events: hide columns, hide nav, split Confirm vs Save.

**Sprints are the exception:** the sprints migration enables RLS. Board/Exec can read; Board/Exec can write tasks on planning/active sprints; only Exec can insert/update `Sprints`. Regular members have no access.

Known gap (documented in `docs/EVENT_WORKFLOW_ARCHITECTURE.md`): `internal_notes` is only hidden in the UI. Anyone who can `select *` on `Events` under current RLS could read notes. Status **writes** are enforced in the Edge Function. Do not treat UI `execOnly` as server security.

Row types: `src/Sites/Members/Pages/Admin/Utils/types.ts`, `src/Utils/types.ts`.

## Conventions for agents

- **Navigate with `useSiteHandler().navigate`**, not raw `useNavigate`, whenever the destination might change subdomain or need `next` / hash scrolling.
- **Colocate** page JSON and hooks; put cross-site UI in `src/Shared`.
- **Match existing style**: Prettier (semicolons, double quotes, 100 width, `arrowParens: avoid`). Tailwind utility classes; theme colors via `--obs-*` CSS variables from `Page`.
- **Do not invent routes** that are not in `Main.tsx` / `Members.tsx`. DataHacks and a consulting subdomain are the usual traps.
- **Files named `* 2.tsx` / `* 2.json`** are leftover duplicates. Edit the file **without** ` 2` unless you are cleaning them up.
- **Client-only secrets are not secrets.** Anon Supabase key is expected in Vite env. Never add service-role or Resend keys to the frontend.
- **Event publish gate:** do not show incomplete events on public lists. Do not write `workflow_status` from the client except through the Edge Function confirm path.
- **Talent pool:** require resume URL when `in_talent_pool` is true (`validateResumeLink`).
- Prefer small, focused diffs. Do not rewrite `README.md` structure or “modernize” the two-site split unless asked.
- Image work: `npm run optimize-images` (`scripts/optimize-images.mjs`). Board photo upload helper: `scripts/upload_board_pics.py`. Projects JSON scraper: `src/Scripts/projectsScraper/` (run from `src/Scripts`).

## Where to look first

| Task | Start here |
|---|---|
| Who can see what | This file: **Access** + **Supabase setup** |
| Public page / copy / layout | `src/Sites/Main/Pages/<Page>/` |
| Members auth or profile | `src/Sites/Members/Pages/Auth`, `Pages/Profile` |
| Role / admin permissions | `Pages/Admin/Data/tables.json`, `Members.tsx`, `Links.tsx` |
| Admin tables | `useAdminFetch`, `EditCard` |
| Sprint tracker | `src/Sites/Members/Pages/Sprints/`, `supabase/migrations/20260907220000_create_sprints.sql` |
| Events calendar / cards | `src/Shared/Events/` |
| Cross-site nav / titles | `src/Hooks/useSiteHandler.ts`, `navbar.json` |
| Supabase client | `src/Utils/supabase.ts` |
| TalentLens UI + allowlist | `src/Sites/Main/Pages/TalentLens/` |
| Event ops / email | `docs/EVENT_WORKFLOW_ARCHITECTURE.md`, `supabase/functions/confirm-event-status/` |
