-- Club-wide sprint tracker (Board + Executive).
-- Apply via `supabase db push` / GitHub Actions, not the SQL Editor.
-- Revert: supabase/migrations/revert/20260907220000_create_sprints.sql

create or replace function public.is_board_or_exec()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public."Members" m
    where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and m.admin_level in ('Board', 'Executive')
      and coalesce(m.deleted, false) = false
  );
$$;

create or replace function public.is_executive()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public."Members" m
    where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and m.admin_level = 'Executive'
      and coalesce(m.deleted, false) = false
  );
$$;

revoke all on function public.is_board_or_exec() from public;
revoke all on function public.is_executive() from public;
grant execute on function public.is_board_or_exec() to authenticated;
grant execute on function public.is_executive() to authenticated;

do $$
declare
  member_id_type text;
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

  execute format($f$
    create table if not exists public."Sprints" (
      id %1$s generated always as identity primary key,
      name text not null,
      starts_on date not null,
      ends_on date not null,
      status text not null default 'planning',
      created_by %1$s not null references public."Members"(id),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      constraint sprints_status_check check (status in ('planning', 'active', 'closed')),
      constraint sprints_dates_check check (ends_on >= starts_on)
    )
  $f$, member_id_type);

  execute format($f$
    create table if not exists public."SprintTasks" (
      id %1$s generated always as identity primary key,
      sprint_id %1$s not null references public."Sprints"(id) on delete cascade,
      team_key text not null,
      title text not null,
      description text,
      expected_hours numeric(6, 2) not null default 0,
      status text not null default 'todo',
      created_by %1$s not null references public."Members"(id),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      constraint sprint_tasks_status_check
        check (status in ('todo', 'in_progress', 'done', 'cancelled')),
      constraint sprint_tasks_hours_check check (expected_hours >= 0)
    )
  $f$, member_id_type);

  execute format($f$
    create table if not exists public."SprintTaskAssignees" (
      task_id %1$s not null references public."SprintTasks"(id) on delete cascade,
      member_id %1$s not null references public."Members"(id) on delete cascade,
      created_at timestamptz not null default now(),
      primary key (task_id, member_id)
    )
  $f$, member_id_type);
end $$;

create unique index if not exists sprints_one_active
  on public."Sprints" (status)
  where status = 'active';

create index if not exists sprint_tasks_sprint_id_idx
  on public."SprintTasks" (sprint_id);

create index if not exists sprint_tasks_team_key_idx
  on public."SprintTasks" (team_key);

create index if not exists sprint_task_assignees_member_id_idx
  on public."SprintTaskAssignees" (member_id);

comment on table public."Sprints" is
  'Club-wide sprints. At most one row may be status=active.';
comment on table public."SprintTasks" is
  'Tasks for a sprint, grouped by committee team_key (e.g. PROFESSIONAL_EVENTS).';
comment on table public."SprintTaskAssignees" is
  'Many-to-many assignees for SprintTasks.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sprints_set_updated_at on public."Sprints";
create trigger sprints_set_updated_at
  before update on public."Sprints"
  for each row execute function public.set_updated_at();

drop trigger if exists sprint_tasks_set_updated_at on public."SprintTasks";
create trigger sprint_tasks_set_updated_at
  before update on public."SprintTasks"
  for each row execute function public.set_updated_at();

alter table public."Sprints" enable row level security;
alter table public."SprintTasks" enable row level security;
alter table public."SprintTaskAssignees" enable row level security;

drop policy if exists sprints_select on public."Sprints";
create policy sprints_select on public."Sprints"
  for select to authenticated
  using (public.is_board_or_exec());

drop policy if exists sprints_insert on public."Sprints";
create policy sprints_insert on public."Sprints"
  for insert to authenticated
  with check (public.is_executive());

drop policy if exists sprints_update on public."Sprints";
create policy sprints_update on public."Sprints"
  for update to authenticated
  using (public.is_executive())
  with check (public.is_executive());

drop policy if exists sprints_delete on public."Sprints";
create policy sprints_delete on public."Sprints"
  for delete to authenticated
  using (public.is_executive());

drop policy if exists sprint_tasks_select on public."SprintTasks";
create policy sprint_tasks_select on public."SprintTasks"
  for select to authenticated
  using (public.is_board_or_exec());

drop policy if exists sprint_tasks_insert on public."SprintTasks";
create policy sprint_tasks_insert on public."SprintTasks"
  for insert to authenticated
  with check (
    public.is_board_or_exec()
    and exists (
      select 1 from public."Sprints" s
      where s.id = sprint_id and s.status in ('planning', 'active')
    )
  );

drop policy if exists sprint_tasks_update on public."SprintTasks";
create policy sprint_tasks_update on public."SprintTasks"
  for update to authenticated
  using (public.is_board_or_exec())
  with check (
    public.is_board_or_exec()
    and exists (
      select 1 from public."Sprints" s
      where s.id = sprint_id and s.status in ('planning', 'active')
    )
  );

drop policy if exists sprint_tasks_delete on public."SprintTasks";
create policy sprint_tasks_delete on public."SprintTasks"
  for delete to authenticated
  using (
    public.is_board_or_exec()
    and exists (
      select 1 from public."Sprints" s
      where s.id = "SprintTasks".sprint_id and s.status in ('planning', 'active')
    )
  );

drop policy if exists sprint_task_assignees_select on public."SprintTaskAssignees";
create policy sprint_task_assignees_select on public."SprintTaskAssignees"
  for select to authenticated
  using (public.is_board_or_exec());

drop policy if exists sprint_task_assignees_insert on public."SprintTaskAssignees";
create policy sprint_task_assignees_insert on public."SprintTaskAssignees"
  for insert to authenticated
  with check (
    public.is_board_or_exec()
    and exists (
      select 1
      from public."SprintTasks" t
      join public."Sprints" s on s.id = t.sprint_id
      where t.id = task_id and s.status in ('planning', 'active')
    )
  );

drop policy if exists sprint_task_assignees_update on public."SprintTaskAssignees";
create policy sprint_task_assignees_update on public."SprintTaskAssignees"
  for update to authenticated
  using (public.is_board_or_exec())
  with check (
    public.is_board_or_exec()
    and exists (
      select 1
      from public."SprintTasks" t
      join public."Sprints" s on s.id = t.sprint_id
      where t.id = task_id and s.status in ('planning', 'active')
    )
  );

drop policy if exists sprint_task_assignees_delete on public."SprintTaskAssignees";
create policy sprint_task_assignees_delete on public."SprintTaskAssignees"
  for delete to authenticated
  using (
    public.is_board_or_exec()
    and exists (
      select 1
      from public."SprintTasks" t
      join public."Sprints" s on s.id = t.sprint_id
      where t.id = "SprintTaskAssignees".task_id and s.status in ('planning', 'active')
    )
  );

grant select, insert, update, delete on public."Sprints" to authenticated;
grant select, insert, update, delete on public."SprintTasks" to authenticated;
grant select, insert, update, delete on public."SprintTaskAssignees" to authenticated;

notify pgrst, 'reload schema';
