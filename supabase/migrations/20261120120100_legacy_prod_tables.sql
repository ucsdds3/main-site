-- Legacy Membership tables that predated versioned migrations (not used by most
-- TalentLens/matching paths, but present on prod). Idempotent CREATE for greenfield.
-- Revert: supabase/migrations/revert/20261120120100_legacy_prod_tables.sql

-- ------------------------------------------------------------------ enums (prod names)

do $$
begin
  if not exists (select 1 from pg_type where typname = 'QuestionType') then
    create type public."QuestionType" as enum (
      'short_text', 'long_text', 'single_select', 'multi_select', 'url', 'yes_no'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'SubmissionStatus') then
    create type public."SubmissionStatus" as enum ('draft', 'submitted', 'withdrawn');
  end if;
  if not exists (select 1 from pg_type where typname = 'ReviewStatus') then
    create type public."ReviewStatus" as enum (
      'pending', 'interview', 'accepted', 'rejected'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'Purchase Status') then
    create type public."Purchase Status" as enum (
      'Ordered', 'Shipped', 'Cancelled', 'Delivered'
    );
  end if;
end $$;

-- ------------------------------------------------------------------ applications (form builder)

create table if not exists public."FormQuestion" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  question_type public."QuestionType",
  text_prompt text,
  help_text text,
  options json,
  max_length integer,
  created_by bigint references public."Members"(id)
);

create table if not exists public."ApplicationQuestion" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  "application id" bigint references public."Applications"(id),
  "question id" bigint references public."FormQuestion"(id),
  sort_order integer,
  required boolean
);

create table if not exists public."ApplicationSubmission" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  application_id bigint references public."Applications"(id),
  member_id bigint references public."Members"(id),
  resume_link text,
  status public."SubmissionStatus",
  review_status public."ReviewStatus",
  review_notes text,
  submitted_at timestamptz,
  updated_at timestamptz
);

-- ------------------------------------------------------------------ board roster join

create table if not exists public."TeamMember" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  member_id bigint references public."Members"(id),
  team_id bigint references public."BoardTeams"(id),
  title text
);

-- ------------------------------------------------------------------ shop / coffee vend (prod)

create table if not exists public."Purchases" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  member_id bigint not null references public."Members"(id),
  item_id bigint not null references public."Items"(id),
  price integer not null,
  status public."Purchase Status" default 'Ordered'
);

create table if not exists public."CoffeeInventory" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  machine_id text not null unique,
  cups_remaining integer not null default 0,
  pods_remaining integer not null default 0
);

create table if not exists public."DispenseEvents" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  purchase_id bigint not null references public."Purchases"(id),
  machine_id text not null default 'coffeevend_01',
  dispense_status text not null default 'Pending',
  cup_status text,
  pod_status text,
  cup_attempts integer not null default 0,
  pod_attempts integer not null default 0,
  error_type text,
  authorized_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  dispense_latency_ms integer,
  cup_job_status text not null default 'Authorized',
  pod_job_status text not null default 'Authorized',
  cup_started_at timestamptz,
  pod_started_at timestamptz
);

notify pgrst, 'reload schema';
