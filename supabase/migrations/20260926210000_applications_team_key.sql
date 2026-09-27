-- Add team catalog key so admin can assign each opening to a BoardTeams row.
-- Revert: revert/20260926210000_applications_team_key.sql

alter table public."Applications"
  add column if not exists team_key text;

update public."Applications"
set team_key = 'EXECUTIVE'
where team_key is null or btrim(team_key) = '';

alter table public."Applications"
  alter column team_key set not null;

alter table public."Applications"
  drop constraint if exists applications_team_key_check;

alter table public."Applications"
  add constraint applications_team_key_check check (length(btrim(team_key)) >= 1);

notify pgrst, 'reload schema';
