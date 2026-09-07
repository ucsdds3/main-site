-- Events workflow status + internal notes (Executive ops)
-- Run once in Supabase SQL Editor before deploying the Edge Function / frontend.
--
-- Public /events shows only workflow_status = 'complete'.
-- Existing rows (NULL at add time) are backfilled to 'complete' so the live calendar stays unchanged.
-- Re-running is safe: only NULL statuses are backfilled.

alter table public."Events"
  add column if not exists workflow_status text;

alter table public."Events"
  add column if not exists internal_notes text;

-- Existing events: keep them public
update public."Events"
set workflow_status = 'complete'
where workflow_status is null;

-- Future inserts start as none until Exec marks Complete
alter table public."Events"
  alter column workflow_status set default 'none';

alter table public."Events"
  alter column workflow_status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'events_workflow_status_check'
  ) then
    alter table public."Events"
      add constraint events_workflow_status_check
      check (
        workflow_status in (
          'none',
          'waiting_room',
          'waiting_finance',
          'waiting_marketing',
          'complete'
        )
      );
  end if;
end $$;

comment on column public."Events".workflow_status is
  'Ops pipeline: none | waiting_room | waiting_finance | waiting_marketing | complete. Public site only lists complete.';

comment on column public."Events".internal_notes is
  'Executive-only operational notes. Hide in UI for non-Executives; tighten RLS if needed.';
