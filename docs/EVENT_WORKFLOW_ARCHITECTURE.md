# Event ops workflow — system architecture

How DS3 moves an event from **internal draft** → **officer handoff** → **public calendar**, and how email fits in.

For setup/deploy steps, see [`EVENT_WORKFLOW_STATUS.md`](./EVENT_WORKFLOW_STATUS.md).

---

## 1. Problem

Before this feature:

- Creating an event in admin made it available to the public calendar as soon as it was saved (subject to `deleted` + dates).
- There was no shared place for “waiting on room / finance / marketing.”
- Officer notifications were informal (Slack, DMs).

We needed:

1. An **ops status** pipeline owned by Executives.
2. **Confirm + notify** so changing a waiting status emails the right officer.
3. **Internal notes** for Exec-only context.
4. **Publish gate**: public `/events` only shows events marked **Complete**.

---

## 2. Design principles

| Principle | Choice |
|-----------|--------|
| Separate publish from draft | Public when `waiting_marketing` or `complete` |
| Status changes are intentional | Not part of normal **Save**; requires **Confirm status** |
| Notify on handoff only | Email only for the three `waiting_*` states |
| Secrets stay server-side | Resend API key lives in Edge Function secrets, never in Vite `.env` |
| Recipients are explicit | Fixed emails (secrets + code fallbacks), not dynamic board lookup (v1) |
| Least surprise for live site | Existing events backfilled to `complete` at migration time |

---

## 3. High-level architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Members portal (main-site)                         │
│                                                                           │
│  Executive /admin                  Anyone (auth) /events or public list   │
│  ┌─────────────────────┐           ┌──────────────────────────────────┐ │
│  │ DataTable + EditCard│           │ Shared EventPage / useEvents     │ │
│  │ Status, Notes       │           │ .in(waiting_marketing, complete) │ │
│  └──────────┬──────────┘           └────────────────▲─────────────────┘ │
│             │                                        │                   │
│   Save notes│  Confirm status                        │ select public cols│
│   (client)  │  invoke Edge Function                  │                   │
└─────────────┼────────────────────────────────────────┼───────────────────┘
              │                                        │
              ▼                                        │
┌─────────────────────────────┐                        │
│ Supabase Edge Function      │                        │
│ confirm-event-status        │                        │
│  1. Verify JWT + Executive  │                        │
│  2. If waiting_*: Resend    │                        │
│  3. UPDATE workflow_status  │                        │
└──────────┬──────────────────┘                        │
           │ service role                              │
           ▼                                           │
┌─────────────────────────────┐     ┌──────────────────┴──────────────────┐
│ Postgres: Events            │◄────│ Anon / authenticated PostgREST      │
│  workflow_status            │     │ (public: waiting_marketing|complete)│
│  internal_notes             │     └─────────────────────────────────────┘
└──────────────┬──────────────┘
               │
               ▼
        ┌─────────────┐
        │ Resend API  │──► VPI / VPF / Marketing Director inboxes
        └─────────────┘
```

**Key split:** normal CRUD (create/edit notes/dates) stays **client → PostgREST**. Status confirmation is a **controlled write path** through an Edge Function so auth + email happen atomically from a system-design perspective (email first for notify states, then DB update).

---

## 4. Components

### 4.1 Data model (`Events`)

| Column | Type | Role |
|--------|------|------|
| …existing fields… | | name, times, password, tags, etc. |
| `workflow_status` | `text NOT NULL DEFAULT 'none'` | Ops + publish gate |
| `internal_notes` | `text NULL` | Exec ops notes |

Allowed `workflow_status` values (DB check constraint):

| Value | Meaning | Public? | Email on Confirm? |
|-------|---------|---------|-------------------|
| `none` | Draft / not ready | No | No |
| `waiting_room` | Needs room booking (VPI) | No | Yes → VPI |
| `waiting_finance` | Needs finance (VPF) | No | Yes → VPF |
| `waiting_marketing` | Needs marketing | No | Yes → Marketing Director |
| `complete` | Ready to publish | **Yes** | No |

New events insert as `none`. Migration backfilled prior rows to `complete` so the calendar did not go empty.

SQL: [`sql/events_workflow_status.sql`](../sql/events_workflow_status.sql).

### 4.2 Admin UI (schema-driven dashboard)

Location: `src/Sites/Members/Pages/Admin/`.

- Column schema: `Data/tables.json` — `workflow_status` and `internal_notes` marked `execOnly: true`.
- `Admin.tsx` filters `execOnly` columns unless `adminLevel === "Executive"`.
- **Board** can open `/admin` and see Events, but not Status/Notes columns or fields.
- **Executive** sees both as table columns and in the Edit panel.

Two write paths in the Edit panel:

| Action | Mechanism | Fields |
|--------|-----------|--------|
| **Save / Create** | `supabase.from("Events").insert/update` | Everything **except** `workflow_status` (updates strip it; creates force `none`) |
| **Confirm status** | `supabase.functions.invoke("confirm-event-status")` | `workflow_status` only |

Why separate Confirm:

- Forces an explicit confirm dialog (“email VPF?” / “publish publicly?”).
- Guarantees waiting statuses go through the server path that can send mail.
- Avoids accidental emails on every field Save.

Shared status labels/helpers: `Pages/Admin/Utils/eventWorkflow.ts`.

### 4.3 Edge Function `confirm-event-status`

Source: [`supabase/functions/confirm-event-status/index.ts`](../supabase/functions/confirm-event-status/index.ts).

**Request** (authenticated user JWT via `functions.invoke`):

```json
{ "event_id": 123, "workflow_status": "waiting_finance" }
```

**Pipeline:**

1. **Auth** — Resolve user from JWT (`anon` client + `Authorization` header).
2. **Authorize** — Service-role lookup on `Members` where email matches; require `admin_level === "Executive"` and not deleted.
3. **Validate** — Event exists, not soft-deleted; status in allow-list.
4. **Notify (conditional)** — If status is `waiting_*`, send Resend email to fixed recipient **before** DB write (so a mail failure does not leave a “waiting” row that never notified).
5. **Persist** — `UPDATE Events SET workflow_status = …` via service role.
6. **Respond** — `{ ok, workflow_status, emailed, recipient }`.

**Recipient map (v1 fixed list):**

| Status | Role | Default email (overridable by secret) |
|--------|------|----------------------------------------|
| `waiting_room` | VPI | `VPI_EMAIL` or `cclougherty@ucsd.edu` |
| `waiting_finance` | VPF | `VPF_EMAIL` or `v1zhu@ucsd.edu` |
| `waiting_marketing` | Director of Marketing | `MARKETING_DIRECTOR_EMAIL` or `ankamath@ucsd.edu` |

### 4.4 Email provider (Resend)

- Edge Function calls Resend HTTP API with `RESEND_API_KEY`.
- `RESEND_FROM_EMAIL` must use a **verified domain** to mail third parties. Resend’s `onboarding@resend.dev` only delivers to the Resend account owner (useful for smoke tests only).
- Frontend never holds the Resend key.

### 4.5 Public / shared events list

`src/Shared/Events/useEvents.ts`:

```ts
.from("Events")
.select("name,description,image,points,deleted,password,start,end,location,tags")
.eq("deleted", false)
.in("workflow_status", ["waiting_marketing", "complete"])
```

Implications:

- `none` / `waiting_room` / `waiting_finance` stay invisible on the public calendar.
- `waiting_marketing` and `complete` are public (marketing handoff = publish).
- `internal_notes` is not requested by the public query (defense in depth; still rely on RLS/grants for true secrecy).

---

## 5. End-to-end flows

### 5.1 Create event (Executive)

```
EditCard Create
  → insert Events { …fields, workflow_status: "none" }
  → not public yet
```

### 5.2 Handoff to an officer

```
Select status "Waiting for finance" (draft in form only)
  → Confirm status (browser confirm)
  → Edge Function
       → email VPF
       → UPDATE workflow_status = waiting_finance
  → still not public
```

### 5.3 Publish (marketing handoff)

```
Select status "Waiting for marketing"
  → Confirm status
  → Edge Function
       → email Marketing Director
       → UPDATE workflow_status = waiting_marketing
  → appears on /events for everyone

Select status "Complete" (later)
  → Confirm status (no email)
  → UPDATE workflow_status = complete
  → stays public; marks ops finished
```

### 5.4 Unpublish / park

```
Confirm status → none (or waiting_*)
  → drops out of public list immediately after reload
```

### 5.5 Internal notes

```
Edit notes → Save
  → client UPDATE internal_notes (and other non-status fields)
  → no email
```

---

## 6. Authorization model

```
Supabase Auth user
    │
    ▼
Members.admin_level ∈ { Member, Board, Executive }
    │
    ├── Member  → no /admin nav (typical)
    ├── Board   → /admin UI; Events view; no Status/Notes columns; no Confirm
    └── Executive → Status/Notes UI; Confirm invokes Edge Function
                         └── Function re-checks Executive server-side
```

**Important:** UI `execOnly` is a **presentation** control. Status writes that matter are enforced in the Edge Function. Notes currently use the same client update path as other event fields; true column secrecy would need RLS/grants or a separate table (documented as a known follow-up).

---

## 7. Failure modes & invariants

| Scenario | Behavior |
|----------|----------|
| Confirm Waiting_* but Resend fails | Function returns error; **status not updated** (email-before-write) |
| Confirm Complete/None | No Resend call; DB update only |
| Non-Executive calls function | `403 Executive access required` |
| Public query before SQL migration | Filter on missing column fails — migrate first |
| Resend test domain | `403` when mailing anyone other than account owner — verify club domain |
| Board opens admin | Works, but Status/Notes hidden |

**Invariant:** An event is publicly listable iff `deleted = false` **and** `workflow_status` in (`waiting_marketing`, `complete`).

---

## 8. Why this shape (tradeoffs)

| Alternative | Why we didn’t (v1) |
|-------------|---------------------|
| Email from the browser | Exposes API keys; spoofable |
| Status on normal Save | Easy to spam officers; no confirm step |
| Dynamic lookup of VPI via `Members.teams` | Fragile title strings year-to-year; fixed list is operable |
| Separate `EventInternal` table | Cleaner secrecy; more joins — deferred |
| Soft “draft” flag only | Doesn’t encode which officer is blocked |

---

## 9. Code map

| Concern | Path |
|---------|------|
| Column schema + execOnly | `Pages/Admin/Data/tables.json` |
| Status constants / labels | `Pages/Admin/Utils/eventWorkflow.ts` |
| Confirm + Save split | `Pages/Admin/Hooks/useEditCard.ts` |
| Status UI + Confirm button | `Pages/Admin/Components/EditCard.tsx` |
| Table display | `Pages/Admin/Components/TableBody.tsx` |
| Role column filter | `Pages/Admin/Admin.tsx` |
| Public filter | `Shared/Events/useEvents.ts` |
| Edge Function | `supabase/functions/confirm-event-status/index.ts` |
| Migration | `sql/events_workflow_status.sql` |
| Ops runbook | `docs/EVENT_WORKFLOW_STATUS.md` |

---

## 10. Operational checklist (for reviewers)

1. SQL applied; existing events `complete`.
2. Function deployed; secrets: `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (verified domain).
3. Optional: `VPI_EMAIL` / `VPF_EMAIL` / `MARKETING_DIRECTOR_EMAIL` when officers change.
4. Frontend shipped with `execOnly` columns + public `.in("workflow_status", ["waiting_marketing", "complete"])`.
5. Smoke: Waiting room/finance → email, not public; Waiting marketing → email + public; Complete → stays public; None → hidden; notes Save → no email.

---

## 11. Future extensions (non-goals of v1)

- Dynamic recipient resolution from `Members.teams`.
- Stronger secrecy for `internal_notes` (column grants / side table / RPC).
- Audit log of status transitions + who confirmed.
- Allow status update even if email fails (with retry queue) — currently fail-closed on notify.
- Slack webhook instead of / in addition to email.
