-- Undo the Members / Events lock-down. This REOPENS both tables to anyone with the anon key
-- (RLS off), which is how they were before. Policies that existed before the lock-down were
-- dropped by it and are not restored; the NOTICEs from the up migration name them.
-- Revert the frontend (PublicEvents / BoardMembers / MemberLeaderboard fall back to the base
-- tables automatically) before or after; either order works.

drop view if exists public."PublicEvents";
drop view if exists public."BoardMembers";
drop view if exists public."MemberLeaderboard";
drop function if exists public.lookup_event_by_code(text);

do $$
begin
  if to_regclass('public."Members"') is not null then
    drop trigger if exists members_guard_privileged on public."Members";
    drop policy if exists members_select_own on public."Members";
    drop policy if exists members_select_board on public."Members";
    drop policy if exists members_insert_signup on public."Members";
    drop policy if exists members_insert_exec on public."Members";
    drop policy if exists members_update_own on public."Members";
    drop policy if exists members_update_exec on public."Members";
    drop policy if exists members_delete_exec on public."Members";
    alter table public."Members" disable row level security;
  end if;

  if to_regclass('public."Events"') is not null then
    drop policy if exists events_select_board on public."Events";
    drop policy if exists events_insert_exec on public."Events";
    drop policy if exists events_update_exec on public."Events";
    drop policy if exists events_delete_exec on public."Events";
    alter table public."Events" disable row level security;
  end if;
end $$;

drop function if exists public.members_guard_privileged();

notify pgrst, 'reload schema';
