-- Brownfield baseline: core tables and RPCs that existed on Membership before versioned
-- migrations. Safe on prod (IF NOT EXISTS / CREATE OR REPLACE). Greenfield dev/staging can
-- `supabase db push` from empty without manual SQL Editor stubs.
--
-- Revert: supabase/migrations/revert/20260907215800_brownfield_core_schema.sql (manual only).

-- ------------------------------------------------------------------ Members
-- Superseded by 20260907215900_ensure_members.sql on paper; kept here so greenfield has
-- Members before Events/Attendance FKs. ensure_members remains a no-op on prod.

create table if not exists public."Members" (
  id bigint generated always as identity primary key,
  email text,
  full_name text,
  major text,
  date_of_birth date,
  graduation_year integer,
  gender text,
  points integer not null default 0,
  experience integer not null default 0,
  is_grad_student boolean not null default false,
  in_talent_pool boolean not null default false,
  on_mailing_list boolean not null default false,
  resume_link text,
  github_link text,
  linkedin_link text,
  other_link text,
  teams jsonb,
  admin_level text,
  profile_picture text,
  deleted boolean not null default false
);

create unique index if not exists members_email_lower_idx
  on public."Members" (lower(email));

-- ------------------------------------------------------------------ Events

create table if not exists public."Events" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  description text,
  points integer not null default 0,
  image text,
  deleted boolean not null default false,
  password text not null default '',
  start timestamptz,
  "end" timestamptz,
  temp_end timestamptz,
  location text,
  tags text[] default '{}'::text[],
  workflow_status text not null default 'complete',
  internal_notes text
);

create unique index if not exists events_name_uidx on public."Events" (name);

-- ------------------------------------------------------------------ Attendance

create table if not exists public."Attendance" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check_in timestamptz not null default now(),
  member_id bigint not null references public."Members"(id) on delete cascade,
  event_id bigint not null references public."Events"(id) on delete cascade,
  points integer
);

create unique index if not exists attendance_member_event_uidx
  on public."Attendance" (member_id, event_id);

-- ------------------------------------------------------------------ Items (pre-shop)

create table if not exists public."Items" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  description text,
  price numeric(8, 2) not null default 0,
  image text,
  deleted boolean not null default false
);

-- ------------------------------------------------------------------ Legacy RPCs (SECURITY DEFINER — required before Members/Events lock-down)

create or replace function public.check_member_email_exists(check_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public."Members" m
    where lower(m.email) = lower(check_email)
      and coalesce(m.deleted, false) = false
  );
$$;

create or replace function public.get_my_attendance()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select json_agg(row_to_json(x))
      from (
        select
          e.name,
          e.description,
          e.points::text as points,
          e.image,
          e.start,
          e."end",
          e.location,
          e.tags,
          a.check_in as attended_at
        from public."Attendance" a
        join public."Events" e on e.id = a.event_id
        join public."Members" m on m.id = a.member_id
        where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        order by a.check_in desc
      ) x
    ),
    '[]'::json
  );
$$;

create or replace function public.validate_event_code(event_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  ev public."Events"%rowtype;
  mid bigint;
  viewer text;
begin
  viewer := lower(coalesce(auth.jwt() ->> 'email', ''));
  if viewer = '' then
    return 'not_authenticated';
  end if;

  select m.id into mid
  from public."Members" m
  where lower(m.email) = viewer
    and coalesce(m.deleted, false) = false
  limit 1;
  if mid is null then
    return 'member_not_found';
  end if;

  select * into ev
  from public."Events" e
  where e.password = event_code
    and coalesce(e.deleted, false) = false
  limit 1;
  if ev.id is null then
    return 'invalid_event';
  end if;

  if ev.start is not null and ev.start > now() then
    return 'event_not_started';
  end if;
  if ev."end" is not null and ev."end" < now() then
    return 'event_expired';
  end if;

  if exists (
    select 1 from public."Attendance" a
    where a.member_id = mid and a.event_id = ev.id
  ) then
    return 'already_registered';
  end if;

  insert into public."Attendance" (member_id, event_id, check_in, points)
  values (mid, ev.id, now(), ev.points);

  update public."Members"
    set points = points + coalesce(ev.points, 0),
        experience = experience + coalesce(ev.points, 0)
    where id = mid;

  return 'registered';
end;
$$;

grant execute on function public.check_member_email_exists(text) to anon, authenticated;
grant execute on function public.get_my_attendance() to anon, authenticated;
grant execute on function public.validate_event_code(text) to anon, authenticated;

notify pgrst, 'reload schema';