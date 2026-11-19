-- TeamMember join table (Members ↔ BoardTeams) + BoardMembers view rewrite.
-- Live Membership already has TeamMember; this is catch-up for local/CI and hardens
-- unique/RLS, backfills from legacy Members.teams jsonb, and stops BoardMembers
-- depending on that jsonb. Members.teams column is left unused (not dropped).
-- Revert: supabase/migrations/revert/20261119014320_team_member_board_members.sql

do $$
declare
  member_id_type text;
  board_team_id_type text;
begin
  select format_type(a.atttypid, a.atttypmod)
    into member_id_type
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'Members'
    and a.attname = 'id'
    and a.attnum > 0
    and not a.attisdropped;

  if member_id_type is null then
    raise exception 'public."Members".id not found';
  end if;

  if to_regclass('public."BoardTeams"') is null then
    raise exception 'public."BoardTeams" not found; apply board_teams_catalog first';
  end if;

  select format_type(a.atttypid, a.atttypmod)
    into board_team_id_type
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'BoardTeams'
    and a.attname = 'id'
    and a.attnum > 0
    and not a.attisdropped;

  if board_team_id_type is null then
    raise exception 'public."BoardTeams".id not found';
  end if;

  execute format($f$
    create table if not exists public."TeamMember" (
      id bigint generated always as identity primary key,
      created_at timestamptz not null default now(),
      member_id %1$s references public."Members"(id),
      team_id %2$s references public."BoardTeams"(id),
      title text
    )
  $f$, member_id_type, board_team_id_type);
end $$;

-- Unique pair for upsert / ON CONFLICT.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'teammember_member_id_team_id_key'
      and conrelid = 'public."TeamMember"'::regclass
  ) then
    -- Drop duplicate (member_id, team_id) rows keeping the lowest id.
    delete from public."TeamMember" a
    using public."TeamMember" b
    where a.member_id is not null
      and a.team_id is not null
      and a.member_id = b.member_id
      and a.team_id = b.team_id
      and a.id > b.id;

    alter table public."TeamMember"
      add constraint teammember_member_id_team_id_key unique (member_id, team_id);
  end if;
end $$;

create index if not exists teammember_team_id_idx on public."TeamMember" (team_id);
create index if not exists teammember_member_id_idx on public."TeamMember" (member_id);

alter table public."TeamMember" enable row level security;

drop policy if exists "TeamMember: board select" on public."TeamMember";
create policy "TeamMember: board select"
  on public."TeamMember"
  for select
  to authenticated
  using (public.is_board_or_exec());

drop policy if exists "TeamMember: exec insert" on public."TeamMember";
create policy "TeamMember: exec insert"
  on public."TeamMember"
  for insert
  to authenticated
  with check (public.is_executive());

drop policy if exists "TeamMember: exec update" on public."TeamMember";
create policy "TeamMember: exec update"
  on public."TeamMember"
  for update
  to authenticated
  using (public.is_executive())
  with check (public.is_executive());

drop policy if exists "TeamMember: exec delete" on public."TeamMember";
create policy "TeamMember: exec delete"
  on public."TeamMember"
  for delete
  to authenticated
  using (public.is_executive());

comment on table public."TeamMember" is
  'Board committee membership: Members ↔ BoardTeams with a role title.';

comment on column public."BoardTeams".team_key is
  'Stable storage key for committee identity (e.g. OPEN_SOURCE); referenced by TeamMember via BoardTeams.id.';

grant select, insert, update, delete on public."TeamMember" to authenticated;
do $$
begin
  execute 'grant usage, select on sequence public."TeamMember_id_seq" to authenticated';
exception
  when undefined_table then
    null;
  when undefined_object then
    null;
end $$;

-- Idempotent backfill from legacy Members.teams jsonb → TeamMember.
-- Keys may be labels ("Professional Events") or team_key ("PROFESSIONAL_EVENTS").
insert into public."TeamMember" (member_id, team_id, title)
select
  m.id as member_id,
  bt.id as team_id,
  nullif(btrim(kv.value), '') as title
from public."Members" m
cross join lateral jsonb_each_text(coalesce(m.teams, '{}'::jsonb)) as kv(key, value)
join public."BoardTeams" bt
  on bt.team_key = upper(replace(btrim(kv.key), ' ', '_'))
  or bt.team_key = btrim(kv.key)
where coalesce(m.deleted, false) = false
  and nullif(btrim(kv.value), '') is not null
  and coalesce(bt.deleted, false) = false
on conflict (member_id, team_id) do nothing;

-- Public /board: one row per member with aggregated team_roles from TeamMember.
-- Views owned by the migration role remain readable by anon (same pattern as before).
create or replace view public."BoardMembers" as
select
  m.full_name,
  m.email,
  m.github_link,
  m.resume_link,
  m.linkedin_link,
  m.other_link,
  m.profile_picture,
  m.deleted,
  jsonb_object_agg(bt.team_key, tm.title) as team_roles
from public."Members" m
join public."TeamMember" tm on tm.member_id = m.id
join public."BoardTeams" bt
  on bt.id = tm.team_id
 and coalesce(bt.deleted, false) = false
where coalesce(m.deleted, false) = false
  and tm.title is not null
  and btrim(tm.title) <> ''
group by
  m.id,
  m.full_name,
  m.email,
  m.github_link,
  m.resume_link,
  m.linkedin_link,
  m.other_link,
  m.profile_picture,
  m.deleted
having count(*) > 0;

revoke all on public."BoardMembers" from public, anon, authenticated;
grant select on public."BoardMembers" to anon, authenticated;

notify pgrst, 'reload schema';
