-- TalentLens schema (was one-off SQL in Talentlens_V2/sql/; now versioned for greenfield).
-- Idempotent on Membership prod. Requires pgvector for TalentLensChunks.embedding.
-- Revert: supabase/migrations/revert/20261120120000_talentlens_schema.sql

create extension if not exists vector;

-- ------------------------------------------------------------------ allowlist

create table if not exists public."TalentLensUsers" (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'recruiter'
    check (role in ('recruiter', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------ corpus

create table if not exists public."TalentLensProfiles" (
  id uuid primary key default gen_random_uuid(),
  member_id bigint references public."Members"(id) on delete set null,
  candidate_id text not null unique,
  email text not null,
  full_name text,
  graduation_year int,
  major text,
  resume_link text,
  in_talent_pool boolean not null default false,
  parse_status text not null default 'pending'
    check (parse_status in ('pending', 'processing', 'ready', 'failed', 'inactive')),
  parse_error text,
  profile jsonb,
  embedding_model text default 'sentence-transformers/all-MiniLM-L6-v2',
  indexed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists talentlens_profiles_email_idx
  on public."TalentLensProfiles" (email);
create index if not exists talentlens_profiles_status_idx
  on public."TalentLensProfiles" (parse_status);
create index if not exists talentlens_profiles_talent_pool_idx
  on public."TalentLensProfiles" (in_talent_pool)
  where in_talent_pool = true;

create table if not exists public."TalentLensChunks" (
  id uuid primary key default gen_random_uuid(),
  candidate_id text not null
    references public."TalentLensProfiles"(candidate_id) on delete cascade,
  chunk_id text not null,
  section_type text not null,
  content text not null,
  entry_id text,
  evidence_strength text not null default 'skills_list',
  metadata jsonb not null default '{}'::jsonb,
  full_name text,
  graduation_year int,
  major text,
  embedding vector(384) not null,
  created_at timestamptz not null default now(),
  unique (candidate_id, chunk_id)
);

create index if not exists talentlens_chunks_candidate_idx
  on public."TalentLensChunks" (candidate_id);

-- IVFFlat needs enough rows; create when possible, skip on empty greenfield.
do $$
begin
  create index if not exists talentlens_chunks_embedding_idx
    on public."TalentLensChunks"
    using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);
exception
  when others then
    raise notice 'Skipping talentlens_chunks_embedding_idx (%). Add after corpus has rows.',
      sqlerrm;
end $$;

-- ------------------------------------------------------------------ ingest queue

create table if not exists public."TalentLensIngestJobs" (
  id uuid primary key default gen_random_uuid(),
  member_id bigint references public."Members"(id) on delete set null,
  candidate_id text,
  trigger text not null
    check (trigger in (
      'signup',
      'resume_update',
      'talent_pool_join',
      'talent_pool_leave',
      'manual_reindex'
    )),
  status text not null default 'queued'
    check (status in ('queued', 'running', 'done', 'failed')),
  error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index if not exists talentlens_jobs_status_idx
  on public."TalentLensIngestJobs" (status, created_at);

-- ------------------------------------------------------------------ feedback

create table if not exists public."TalentLensFeedback" (
  id uuid primary key default gen_random_uuid(),
  reporter_email text not null,
  reporter_role text,
  category text not null
    check (category in (
      'wrong_rank',
      'missing_candidate',
      'verification_wrong',
      'explanation_wrong',
      'hard_filter_wrong',
      'profile_data_wrong',
      'ui_bug',
      'other'
    )),
  confidence text not null
    check (confidence in ('high', 'medium', 'low')),
  impact text not null
    check (impact in ('high', 'medium', 'low')),
  query_text text not null,
  input_mode text not null
    check (input_mode in ('Skills', 'Job Description')),
  no_good_results boolean not null default false,
  expected_candidate_id text,
  expected_candidate_name text,
  expected_rank text,
  ranked_too_high_candidate_id text,
  ranked_too_high_candidate_name text,
  expected_evidence text,
  why_wrong text,
  notes text,
  reporting_about_self boolean not null default false,
  search_request jsonb not null default '{}'::jsonb,
  debug_bundle jsonb not null default '{}'::jsonb,
  triage_status text not null default 'new'
    check (triage_status in ('new', 'investigating', 'fix', 'allow', 'wontfix')),
  failure_class text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists talentlens_feedback_created_idx
  on public."TalentLensFeedback" (created_at desc);
create index if not exists talentlens_feedback_triage_idx
  on public."TalentLensFeedback" (triage_status, created_at desc);
create index if not exists talentlens_feedback_reporter_idx
  on public."TalentLensFeedback" (reporter_email, created_at desc);

-- ------------------------------------------------------------------ RLS

alter table public."TalentLensUsers" enable row level security;
alter table public."TalentLensProfiles" enable row level security;
alter table public."TalentLensChunks" enable row level security;
alter table public."TalentLensIngestJobs" enable row level security;
alter table public."TalentLensFeedback" enable row level security;

drop policy if exists "talentlens_users_read_self" on public."TalentLensUsers";
create policy "talentlens_users_read_self"
  on public."TalentLensUsers"
  for select
  to authenticated
  using (
    active = true
    and lower(email) = lower(auth.jwt() ->> 'email')
  );

drop policy if exists "talentlens_jobs_read_own" on public."TalentLensIngestJobs";
create policy "talentlens_jobs_read_own"
  on public."TalentLensIngestJobs"
  for select
  to authenticated
  using (
    member_id in (
      select id
      from public."Members"
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

drop policy if exists "talentlens_feedback_insert_allowlist" on public."TalentLensFeedback";
drop policy if exists "talentlens_feedback_read_own" on public."TalentLensFeedback";
drop policy if exists "talentlens_feedback_read_admin" on public."TalentLensFeedback";
drop policy if exists "talentlens_feedback_update_admin" on public."TalentLensFeedback";

create policy "talentlens_feedback_insert_allowlist"
  on public."TalentLensFeedback"
  for insert
  to authenticated
  with check (
    lower(reporter_email) = lower(auth.jwt() ->> 'email')
    and exists (
      select 1
      from public."TalentLensUsers" u
      where lower(u.email) = lower(auth.jwt() ->> 'email')
        and u.active = true
    )
  );

create policy "talentlens_feedback_read_own"
  on public."TalentLensFeedback"
  for select
  to authenticated
  using (lower(reporter_email) = lower(auth.jwt() ->> 'email'));

create policy "talentlens_feedback_read_admin"
  on public."TalentLensFeedback"
  for select
  to authenticated
  using (
    exists (
      select 1
      from public."TalentLensUsers" u
      where lower(u.email) = lower(auth.jwt() ->> 'email')
        and u.active = true
        and u.role = 'admin'
    )
  );

create policy "talentlens_feedback_update_admin"
  on public."TalentLensFeedback"
  for update
  to authenticated
  using (
    exists (
      select 1
      from public."TalentLensUsers" u
      where lower(u.email) = lower(auth.jwt() ->> 'email')
        and u.active = true
        and u.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public."TalentLensUsers" u
      where lower(u.email) = lower(auth.jwt() ->> 'email')
        and u.active = true
        and u.role = 'admin'
    )
  );

-- ------------------------------------------------------------------ Members → ingest trigger

create or replace function public.talentlens_enqueue_on_member_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trigger text;
  v_email text;
  v_old_resume text;
  v_new_resume text;
begin
  if tg_op = 'UPDATE'
     and coalesce(new.deleted, false) = true
     and coalesce(old.deleted, false) = false then
    insert into public."TalentLensIngestJobs" (member_id, candidate_id, trigger, status)
    values (new.id, lower(coalesce(new.email, '')), 'talent_pool_leave', 'queued');
    return new;
  end if;

  if coalesce(new.deleted, false) = true then
    return new;
  end if;

  v_email := lower(coalesce(new.email, ''));
  v_old_resume := trim(coalesce(old.resume_link, ''));
  v_new_resume := trim(coalesce(new.resume_link, ''));

  if tg_op = 'INSERT' then
    if coalesce(new.in_talent_pool, false) and v_new_resume <> '' then
      v_trigger := 'signup';
    else
      return new;
    end if;
  elsif tg_op = 'UPDATE' then
    if coalesce(old.in_talent_pool, false)
       and not coalesce(new.in_talent_pool, false) then
      v_trigger := 'talent_pool_leave';
    elsif not coalesce(old.in_talent_pool, false)
          and coalesce(new.in_talent_pool, false)
          and v_new_resume <> '' then
      v_trigger := 'talent_pool_join';
    elsif coalesce(new.in_talent_pool, false)
          and v_new_resume <> ''
          and v_old_resume is distinct from v_new_resume then
      v_trigger := 'resume_update';
    else
      return new;
    end if;
  else
    return new;
  end if;

  insert into public."TalentLensIngestJobs" (member_id, candidate_id, trigger, status)
  values (new.id, nullif(v_email, ''), v_trigger, 'queued');

  return new;
end;
$$;

drop trigger if exists talentlens_members_ingest_enqueue on public."Members";

create trigger talentlens_members_ingest_enqueue
  after insert or update of resume_link, in_talent_pool, deleted
  on public."Members"
  for each row
  execute function public.talentlens_enqueue_on_member_change();

comment on function public.talentlens_enqueue_on_member_change() is
  'Enqueues TalentLensIngestJobs when Members resume/talent-pool/deleted changes.';

grant select on public."TalentLensUsers" to authenticated;
grant select, insert on public."TalentLensFeedback" to authenticated;
grant update on public."TalentLensFeedback" to authenticated;
grant select on public."TalentLensIngestJobs" to authenticated;

notify pgrst, 'reload schema';
