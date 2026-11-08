# DataHacks teammate matching — frontend and integration handoff

**Updated 2026-11-08.** Intake UI and live skill-check results exist on `hackathon-matching`. Full directory, persistence and production matching API are still ahead.

## Default git branch

**Use `hackathon-matching` for all matching work in this repo** (and the same branch name in sibling `Talentlens_V2`). Do **not** open PRs into production `main` for incomplete matching work. Details: [project hub — Default git branch](../../Talentlens_V2/docs/hackathon-matching/README.md#default-git-branch).

## Start here

Canonical docs: [project hub](../../Talentlens_V2/docs/hackathon-matching/README.md), [scope](../../Talentlens_V2/docs/hackathon-matching/PROJECT_BRIEF.md), [roadmap](../../Talentlens_V2/docs/hackathon-matching/ROADMAP.md), [backlog](../../Talentlens_V2/docs/hackathon-matching/BACKLOG.md).

Closed prototype trackers: [main-site #190](https://github.com/ucsdds3/main-site/issues/190) (intake UI), [Talentlens_V2 #4](https://github.com/Ishayu1/Talentlens_V2/issues/4) (skill-list experiment).

## Product in one paragraph

DataHacks participants use website accounts and independently opt into teammate discovery. They enter desired teammate skills, working-preference answers, a resume, and at least one chosen contact method. Everyone else currently opted into the event is browsable, with a personalized score using both skill directions and working compatibility. Contact/team formation happens outside the site. This is not resume-to-resume matching, recruiter search, or automatic team assignment.

## What works locally today

- Route `/hackathon-matching` under the members portal (navbar **Hackathon matching**).
- Form: skills list, PDF upload or profile resume link, overnight / vibecoding dropdowns.
- Submit calls TalentLens `POST /hackathon/skill-match` (`VITE_TALENTLENS_V2_API_URL`) and shows used/listed evidence for each other indexed resume.
- Working-style answers and the uploaded file are collected in the UI but not scored or stored yet.
- Corpus is the local TalentLens index, not an event opt-in roster.

## Placement and conventions

- Code: `src/Sites/Members/Pages/HackathonMatching/`.
- Use existing `Page`/`Section`, dark theme, auth session and `useSiteHandler` conventions from [AGENTS.md](../AGENTS.md).
- The unrouted `Pages/DataHacks/` marketing page is not this application.
- Matching opt-in must stay separate from recruiter `in_talent_pool` and `TalentLensUsers`.

## Shared database (next major frontend/integration slice)

New shared schema belongs in `supabase/migrations/` with matching `revert/` scripts. Edge dispatch belongs in `supabase/functions/`. Do not add a second authoritative schema under backend `sql/`.

Needed before real enrollment:

- Event participation / opt-in (independent of talent pool)
- Requested skills + preference answers with revisions
- Explicit contacts (login email not auto-published)
- Selected resume source/version and private upload ownership
- RLS: own writes; event-scoped directory reads

Backend must adapt ingest so hackathon-only participants are processed without setting recruiter consent. Read [architecture](../../Talentlens_V2/docs/hackathon-matching/ARCHITECTURE.md).

## Next product steps after DB

Reverse skill direction, preference scoring, event-scoped directory UI, refresh/persistence, then pilot deploy. See [BACKLOG.md](../../Talentlens_V2/docs/hackathon-matching/BACKLOG.md).

## Checks

Use synthetic fixtures; no real participant resumes/contacts in git. Matching contract changes update frontend types, backend schemas and the matching contract in the same session. Recruiter `/search` or `/health` changes still follow the workspace contract-sync skill.
