-- Lock down Members and Events (row-level security).
--
-- Before this, the public anon key (shipped in the website) could read every Members row
-- (email, date_of_birth, resume_link, …) and every Events row including check-in codes
-- (`password`) and Exec `internal_notes`, without signing in.
--
-- After:
--   Members  signed-in members read/update their own row; Board + Executive read all;
--            Executive inserts/updates/deletes any. Signup may insert its own row (also as
--            anon, for projects that require email confirmation) but not with privileges.
--            Only Executives (or SECURITY DEFINER functions such as check-in) may change
--            admin_level, points, experience, teams or deleted.
--   Events   Board + Executive read all; Executive writes. Everyone else reads published
--            events through the "PublicEvents" view, which has no password / internal_notes.
--   Views    "BoardMembers" (public /board page) and "MemberLeaderboard" (signed-in
--            leaderboard) expose only the columns those pages show.
--   RPC      lookup_event_by_code(event_code) → id, name for the check-in feedback prompt.
--
-- Every existing policy on Members and Events is dropped and replaced (their names are
-- printed as NOTICEs). Guarded: each part is a no-op where its table or columns are missing
-- (CI applies migrations to stub tables). Refuses to run if a function the site calls as a
-- signed-out or regular member reads these tables without SECURITY DEFINER, or if this role
-- can't bypass RLS for the views. Revert: supabase/migrations/revert/.

-- ------------------------------------------------------------------ preflight

do $$
declare
  can_bypass boolean;
  bad text;
begin
  if to_regclass('public."Members"') is null and to_regclass('public."Events"') is null then
    return;
  end if;

  -- The views and definer helpers read the tables as their owner: that role must bypass RLS
  -- (or own the tables), or every view would come back empty once RLS is on.
  select rolsuper or rolbypassrls into can_bypass from pg_roles where rolname = current_user;
  if not can_bypass and exists (
    select 1 from pg_class c
    where c.oid in (to_regclass('public."Members"'), to_regclass('public."Events"'))
      and c.relowner <> (select oid from pg_roles where rolname = current_user)
  ) then
    raise exception 'Role % neither bypasses RLS nor owns Members/Events; run as postgres.',
      current_user;
  end if;

  -- Called by signed-out visitors or regular members: must keep working once those callers
  -- can no longer read the tables directly.
  select string_agg(p.oid::regprocedure::text, ', ') into bad
  from pg_proc p
  where p.pronamespace = 'public'::regnamespace
    and p.proname in ('check_member_email_exists', 'validate_event_code', 'get_my_attendance',
                      'submit_attendance_feedback')
    and not p.prosecdef;
  if bad is not null then
    raise exception 'Make these SECURITY DEFINER before locking down Members/Events: %', bad;
  end if;
end $$;

-- ------------------------------------------------------------------ Members

do $$
declare
  pol record;
begin
  if to_regclass('public."Members"') is null or (
    select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'Members'
      and column_name in ('email', 'full_name', 'admin_level', 'points', 'experience', 'teams',
                          'deleted', 'profile_picture', 'github_link', 'linkedin_link',
                          'other_link', 'resume_link')
  ) < 12 then
    raise notice 'Members lock-down skipped: table or columns missing.';
    return;
  end if;

  for pol in
    select policyname from pg_policies where schemaname = 'public' and tablename = 'Members'
  loop
    raise notice 'Dropping existing Members policy %', pol.policyname;
    execute format('drop policy %I on public."Members"', pol.policyname);
  end loop;

  alter table public."Members" enable row level security;

  create policy members_select_own on public."Members"
    for select to authenticated
    using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

  create policy members_select_board on public."Members"
    for select to authenticated
    using (public.is_board_or_exec());

  -- Signup inserts the new member's own row, possibly before a session exists.
  create policy members_insert_signup on public."Members"
    for insert to anon, authenticated
    with check (
      (auth.jwt() ->> 'email' is null or lower(email) = lower(auth.jwt() ->> 'email'))
      and admin_level is null
      and coalesce(points, 0) = 0
      and coalesce(experience, 0) = 0
      and teams is null
      and coalesce(deleted, false) = false
    );

  create policy members_insert_exec on public."Members"
    for insert to authenticated
    with check (public.is_executive());

  -- Own row: the profile page may also change the row's email. Privileged columns are
  -- guarded by members_guard_privileged below.
  create policy members_update_own on public."Members"
    for update to authenticated
    using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    with check (true);

  create policy members_update_exec on public."Members"
    for update to authenticated
    using (public.is_executive())
    with check (public.is_executive());

  create policy members_delete_exec on public."Members"
    for delete to authenticated
    using (public.is_executive());
end $$;

create or replace function public.members_guard_privileged()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Only direct API calls are checked; SECURITY DEFINER functions (check-in points) and the
  -- service role run as other roles.
  if current_user in ('anon', 'authenticated') and not public.is_executive() and (
    new.admin_level is distinct from old.admin_level
    or new.points is distinct from old.points
    or new.experience is distinct from old.experience
    or new.teams is distinct from old.teams
    or new.deleted is distinct from old.deleted
  ) then
    raise exception 'Only Executives can change admin_level, points, experience, teams or deleted'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

do $$
begin
  if to_regclass('public."Members"') is null or not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'Members' and policyname = 'members_update_own'
  ) then
    return;
  end if;

  drop trigger if exists members_guard_privileged on public."Members";
  create trigger members_guard_privileged
    before update on public."Members"
    for each row execute function public.members_guard_privileged();

  -- Public /board page: board members only, only the columns it shows.
  create or replace view public."BoardMembers" as
    select full_name, email, github_link, resume_link, linkedin_link, other_link,
           profile_picture, teams, deleted
    from public."Members"
    where teams is not null and coalesce(deleted, false) = false;

  -- Signed-in leaderboard: name, points, picture.
  create or replace view public."MemberLeaderboard" as
    select full_name, points, profile_picture, deleted
    from public."Members"
    where coalesce(deleted, false) = false;

  -- Simple views are auto-updatable: grant read only.
  revoke all on public."BoardMembers", public."MemberLeaderboard" from public, anon, authenticated;
  grant select on public."BoardMembers" to anon, authenticated;
  grant select on public."MemberLeaderboard" to authenticated;
end $$;

-- ------------------------------------------------------------------ Events

do $$
declare
  pol record;
begin
  if to_regclass('public."Events"') is null or (
    select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'Events'
      and column_name in ('id', 'name', 'description', 'image', 'points', 'deleted', 'start',
                          'end', 'location', 'tags', 'workflow_status', 'updated_at',
                          'password', 'internal_notes')
  ) < 14 then
    raise notice 'Events lock-down skipped: table or columns missing.';
    return;
  end if;

  for pol in
    select policyname from pg_policies where schemaname = 'public' and tablename = 'Events'
  loop
    raise notice 'Dropping existing Events policy %', pol.policyname;
    execute format('drop policy %I on public."Events"', pol.policyname);
  end loop;

  alter table public."Events" enable row level security;

  create policy events_select_board on public."Events"
    for select to authenticated
    using (public.is_board_or_exec());

  create policy events_insert_exec on public."Events"
    for insert to authenticated
    with check (public.is_executive());

  create policy events_update_exec on public."Events"
    for update to authenticated
    using (public.is_executive())
    with check (public.is_executive());

  create policy events_delete_exec on public."Events"
    for delete to authenticated
    using (public.is_executive());

  -- Public calendar, members calendar and the ICS feed: published events, no secrets.
  create or replace view public."PublicEvents" as
    select id, name, description, image, points, deleted, start, "end", location, tags,
           workflow_status, updated_at
    from public."Events"
    where coalesce(deleted, false) = false
      and workflow_status in ('waiting_marketing', 'complete');

  revoke all on public."PublicEvents" from public, anon, authenticated;
  grant select on public."PublicEvents" to anon, authenticated;

  -- After check-in the portal offers feedback for the event the code belongs to.
  create or replace function public.lookup_event_by_code(event_code text)
  returns table (id bigint, name text)
  language sql
  stable
  security definer
  set search_path = public
  as $fn$
    select e.id::bigint, e.name::text
    from public."Events" e
    where coalesce(auth.jwt() ->> 'email', '') <> ''
      and e.password = event_code
      and coalesce(e.deleted, false) = false
    limit 1;
  $fn$;

  revoke all on function public.lookup_event_by_code(text) from public, anon;
  grant execute on function public.lookup_event_by_code(text) to authenticated;
end $$;

notify pgrst, 'reload schema';
