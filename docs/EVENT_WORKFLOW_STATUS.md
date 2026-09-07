# Event workflow status + internal notes

Executive-only ops fields on the members admin Events dashboard, plus public visibility gated on **Complete**.

**System design (read this for PRs / onboarding):** [`EVENT_WORKFLOW_ARCHITECTURE.md`](./EVENT_WORKFLOW_ARCHITECTURE.md)

## What changed

| Layer | Change |
|-------|--------|
| DB | `Events.workflow_status`, `Events.internal_notes` |
| Admin UI | Status + Internal notes columns (Executive only); Confirm status button |
| Public `/events` | Only rows with `workflow_status = 'complete'` |
| Edge Function | `confirm-event-status` updates status and emails VPI/VPF/Marketing via Resend |

### Status values

- `none` — draft / not ready (default for new events)
- `waiting_room` — emails VPI (`cclougherty@ucsd.edu`)
- `waiting_finance` — emails VPF (`v1zhu@ucsd.edu`)
- `waiting_marketing` — emails Marketing Director (`ankamath@ucsd.edu`)
- `complete` — visible on public events page (no email)

Internal notes save with the normal **Save** button. Status only changes via **Confirm status**.

---

## 1. Run SQL

In Supabase → SQL Editor, run:

[`sql/events_workflow_status.sql`](../sql/events_workflow_status.sql)

This adds the columns and backfills existing events to `complete` so the live calendar does not go empty.

---

## 2. Resend (email)

1. Create a free account at [resend.com](https://resend.com)
2. Create an API key
3. For testing you can send from `onboarding@resend.dev` (Resend test sender — only delivers to **your** Resend account email until you verify a domain)
4. For production, verify `ds3atucsd.com` (or your domain) and set a real From address

**Do not** put `RESEND_API_KEY` in `main-site/.env`. That file is only for the Vite frontend. The Edge Function reads secrets from the Supabase project.

---

## 3. Deploy Edge Function

### Install the CLI (one-time)

Homebrew (if Cellar is writable):

```bash
brew install supabase/tap/supabase
```

Or use the project-local CLI (no global install) — already available via `npm install` in `main-site/`:

```bash
cd main-site
npx supabase --version
```

You can also deploy from the **Supabase Dashboard** → Edge Functions → create `confirm-event-status` and paste `supabase/functions/confirm-event-status/index.ts` (then set secrets under Project Settings → Edge Functions).

### Link + secrets + deploy

From `main-site/`:

```bash
npx supabase login
npx supabase link --project-ref aogowlvmcvvrnryxuzlr

npx supabase secrets set RESEND_API_KEY=re_xxxxxxxx
npx supabase secrets set RESEND_FROM_EMAIL="DS3 Events <onboarding@resend.dev>"

# Optional overrides (defaults are baked into the function):
# npx supabase secrets set VPI_EMAIL=cclougherty@ucsd.edu
# npx supabase secrets set VPF_EMAIL=v1zhu@ucsd.edu
# npx supabase secrets set MARKETING_DIRECTOR_EMAIL=ankamath@ucsd.edu

npx supabase functions deploy confirm-event-status
```

Function source: [`supabase/functions/confirm-event-status/index.ts`](../supabase/functions/confirm-event-status/index.ts)

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically to Edge Functions.

---

## 4. Frontend

Already wired in this repo:

- Admin table/edit: Status + Internal notes (`execOnly`)
- Confirm → `supabase.functions.invoke("confirm-event-status", …)`
- Public list filter: `.eq("workflow_status", "complete")`

Deploy/publish the main-site as usual after SQL + function are live.

---

## Test checklist

1. As Executive: open `/admin` → Events → see Status / Internal notes columns
2. As Board: those columns hidden
3. Edit event → change status to Waiting for finance → Confirm → VPF receives email; status updates
4. Set Complete → Confirm → event appears on public `/events`
5. Set None → event disappears from public `/events`
6. Edit notes → Save (no email)

---

## Security note

UI hides Status/Notes from Board. Notes are still on the `Events` row; anyone who can `select *` under current RLS could read them via the API. Tighten with column grants or a separate table if that becomes a requirement.
