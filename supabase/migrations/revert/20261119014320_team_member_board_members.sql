-- Undo TeamMember catch-up / BoardMembers rewrite.
-- Restores BoardMembers to the jsonb-based definition from lock_down_members_events.
-- Does not drop TeamMember rows or the table (safe if live already had them).

drop policy if exists "TeamMember: board select" on public."TeamMember";
drop policy if exists "TeamMember: exec insert" on public."TeamMember";
drop policy if exists "TeamMember: exec update" on public."TeamMember";
drop policy if exists "TeamMember: exec delete" on public."TeamMember";

drop index if exists public.teammember_member_id_team_id_key;
drop index if exists public.teammember_team_id_idx;
drop index if exists public.teammember_member_id_idx;

comment on column public."BoardTeams".team_key is
  'Stable storage key used in Members.teams JSON (e.g. OPEN_SOURCE).';

create or replace view public."BoardMembers" as
  select full_name, email, github_link, resume_link, linkedin_link, other_link,
         profile_picture, teams, deleted
  from public."Members"
  where teams is not null and coalesce(deleted, false) = false;

revoke all on public."BoardMembers" from public, anon, authenticated;
grant select on public."BoardMembers" to anon, authenticated;

notify pgrst, 'reload schema';
