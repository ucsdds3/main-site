-- Public job applications (open roles). Exec write; anyone can read non-deleted rows.
-- Revert: revert/20260926200000_applications.sql

create table if not exists public."Applications" (
  id bigint generated always as identity primary key,
  title text not null,
  team_key text not null,
  description text not null,
  preferred_experience text,
  application_url text not null,
  poster_emails text not null,
  opens_at timestamptz not null,
  due_at timestamptz not null,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_title_check check (length(btrim(title)) between 1 and 120),
  constraint applications_team_key_check check (length(btrim(team_key)) >= 1),
  constraint applications_description_check check (length(btrim(description)) >= 1),
  constraint applications_url_check check (application_url ~* '^https?://'),
  constraint applications_poster_emails_check check (length(btrim(poster_emails)) >= 3),
  constraint applications_dates_check check (due_at >= opens_at)
);

create index if not exists applications_open_window_idx
  on public."Applications" (opens_at, due_at)
  where deleted = false;

comment on table public."Applications" is
  'Open DS3 roles shown on the public /apply page. Executives manage rows in admin.';

drop trigger if exists applications_set_updated_at on public."Applications";
create trigger applications_set_updated_at
  before update on public."Applications"
  for each row execute function public.set_updated_at();

alter table public."Applications" enable row level security;

drop policy if exists applications_select on public."Applications";
create policy applications_select on public."Applications"
  for select to anon, authenticated
  using (deleted = false or public.is_board_or_exec());

drop policy if exists applications_insert on public."Applications";
create policy applications_insert on public."Applications"
  for insert to authenticated
  with check (public.is_executive());

drop policy if exists applications_update on public."Applications";
create policy applications_update on public."Applications"
  for update to authenticated
  using (public.is_executive())
  with check (public.is_executive());

drop policy if exists applications_delete on public."Applications";
create policy applications_delete on public."Applications"
  for delete to authenticated
  using (public.is_executive());

grant select on public."Applications" to anon, authenticated;
grant insert, update, delete on public."Applications" to authenticated;

do $$
declare
  seq text;
begin
  seq := pg_get_serial_sequence('public."Applications"', 'id');
  if seq is not null then
    execute format('grant usage, select on sequence %s to authenticated', seq);
  end if;
end $$;

notify pgrst, 'reload schema';
