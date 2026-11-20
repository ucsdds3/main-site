-- Hackathon teammate matching: event roster enrollment (skills, prefs, contacts, resume ticket).
-- Independent of recruiter in_talent_pool / TalentLensUsers.
-- Chunks remain in TalentLensProfiles / TalentLensChunks after ingest (later issue).
-- Revert: revert/20261111200000_hackathon_matching_enrollment.sql

create table if not exists public.matching_events (
  id text primary key,
  status text not null default 'open',
  questionnaire_version text,
  scoring_policy_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matching_events_status_check check (status in ('open', 'closed'))
);

comment on table public.matching_events is
  'Teammate-matching cohort (e.g. DataHacks). Separate from club Events until D06 is settled.';

insert into public.matching_events (id, status)
values ('datahacks-2026', 'open')
on conflict (id) do nothing;

create table if not exists public.matching_resume_artifacts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  source text not null,
  storage_key text,
  external_url text,
  content_hash text,
  status text not null default 'pending',
  talentlens_candidate_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matching_resume_artifacts_source_check
    check (source in ('upload', 'link', 'existing')),
  constraint matching_resume_artifacts_status_check
    check (status in ('pending', 'ready', 'failed'))
);

create index if not exists matching_resume_artifacts_owner_idx
  on public.matching_resume_artifacts (owner_user_id);

comment on table public.matching_resume_artifacts is
  'Resume version ticket for matching ingest. Not a duplicate of TalentLens chunks; points at parsed profile after worker runs.';

create table if not exists public.matching_participations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.matching_events (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete cascade,
  opted_in boolean not null default true,
  requested_skills jsonb not null default '[]'::jsonb,
  skills_revision integer not null default 1,
  preferences jsonb not null default '{}'::jsonb,
  prefs_revision integer not null default 1,
  contacts jsonb not null default '{}'::jsonb,
  resume_version_id uuid references public.matching_resume_artifacts (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matching_participations_event_user_unique unique (event_id, user_id),
  constraint matching_participations_skills_revision_check check (skills_revision >= 1),
  constraint matching_participations_prefs_revision_check check (prefs_revision >= 1)
);

create index if not exists matching_participations_event_opted_in_idx
  on public.matching_participations (event_id)
  where opted_in = true;

create index if not exists matching_participations_user_idx
  on public.matching_participations (user_id);

comment on table public.matching_participations is
  'Per-user event opt-in: teammate skill list, working prefs, shared contacts, selected resume artifact.';

comment on column public.matching_participations.skills_revision is
  'Increment when requested_skills change so directional scores can invalidate safely.';
comment on column public.matching_participations.prefs_revision is
  'Increment when preferences change so compatibility scores can invalidate safely.';

drop trigger if exists matching_events_set_updated_at on public.matching_events;
create trigger matching_events_set_updated_at
  before update on public.matching_events
  for each row execute function public.set_updated_at();

drop trigger if exists matching_resume_artifacts_set_updated_at on public.matching_resume_artifacts;
create trigger matching_resume_artifacts_set_updated_at
  before update on public.matching_resume_artifacts
  for each row execute function public.set_updated_at();

drop trigger if exists matching_participations_set_updated_at on public.matching_participations;
create trigger matching_participations_set_updated_at
  before update on public.matching_participations
  for each row execute function public.set_updated_at();

-- RLS
alter table public.matching_events enable row level security;
alter table public.matching_resume_artifacts enable row level security;
alter table public.matching_participations enable row level security;

drop policy if exists matching_events_select on public.matching_events;
create policy matching_events_select on public.matching_events
  for select to authenticated
  using (status = 'open');

drop policy if exists matching_resume_artifacts_select on public.matching_resume_artifacts;
create policy matching_resume_artifacts_select on public.matching_resume_artifacts
  for select to authenticated
  using (owner_user_id = auth.uid());

drop policy if exists matching_resume_artifacts_insert on public.matching_resume_artifacts;
create policy matching_resume_artifacts_insert on public.matching_resume_artifacts
  for insert to authenticated
  with check (owner_user_id = auth.uid());

drop policy if exists matching_resume_artifacts_update on public.matching_resume_artifacts;
create policy matching_resume_artifacts_update on public.matching_resume_artifacts
  for update to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists matching_resume_artifacts_delete on public.matching_resume_artifacts;
create policy matching_resume_artifacts_delete on public.matching_resume_artifacts
  for delete to authenticated
  using (owner_user_id = auth.uid());

drop policy if exists matching_participations_select on public.matching_participations;
create policy matching_participations_select on public.matching_participations
  for select to authenticated
  using (
    user_id = auth.uid()
    or (
      opted_in = true
      and exists (
        select 1
        from public.matching_participations viewer
        where viewer.user_id = auth.uid()
          and viewer.event_id = matching_participations.event_id
          and viewer.opted_in = true
      )
    )
  );

drop policy if exists matching_participations_insert on public.matching_participations;
create policy matching_participations_insert on public.matching_participations
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists matching_participations_update on public.matching_participations;
create policy matching_participations_update on public.matching_participations
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists matching_participations_delete on public.matching_participations;
create policy matching_participations_delete on public.matching_participations
  for delete to authenticated
  using (user_id = auth.uid());

grant select on public.matching_events to authenticated;
grant select, insert, update, delete on public.matching_resume_artifacts to authenticated;
grant select, insert, update, delete on public.matching_participations to authenticated;

notify pgrst, 'reload schema';
