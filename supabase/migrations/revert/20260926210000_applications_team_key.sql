alter table public."Applications"
  drop constraint if exists applications_team_key_check;

alter table public."Applications"
  drop column if exists team_key;

notify pgrst, 'reload schema';
