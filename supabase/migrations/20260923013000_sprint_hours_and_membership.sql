-- Actual hours gate, completion timestamps, tasks in multiple sprints.
-- Revert: revert/20260923013000_sprint_hours_and_membership.sql

alter table public."SprintTasks"
  add column if not exists actual_hours numeric(6, 2),
  add column if not exists completed_at timestamptz;

alter table public."SprintTasks"
  drop constraint if exists sprint_tasks_actual_hours_check;

alter table public."SprintTasks"
  add constraint sprint_tasks_actual_hours_check
  check (actual_hours is null or actual_hours >= 0);

update public."SprintTasks"
  set actual_hours = expected_hours
  where status in ('pending_review', 'done')
    and actual_hours is null;

update public."SprintTasks"
  set completed_at = coalesce(completed_at, reviewed_at, updated_at, now())
  where status = 'done'
    and completed_at is null;

create table if not exists public."SprintTaskSprints" (
  task_id bigint not null references public."SprintTasks"(id) on delete cascade,
  sprint_id bigint not null references public."Sprints"(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, sprint_id)
);

create index if not exists sprint_task_sprints_sprint_id_idx
  on public."SprintTaskSprints" (sprint_id);

insert into public."SprintTaskSprints" (task_id, sprint_id)
select id, sprint_id
from public."SprintTasks"
on conflict do nothing;

alter table public."SprintTaskSprints" enable row level security;

drop policy if exists sprint_task_sprints_select on public."SprintTaskSprints";
create policy sprint_task_sprints_select on public."SprintTaskSprints"
  for select to authenticated
  using (public.is_board_or_exec());

drop policy if exists sprint_task_sprints_insert on public."SprintTaskSprints";
create policy sprint_task_sprints_insert on public."SprintTaskSprints"
  for insert to authenticated
  with check (public.is_board_or_exec());

drop policy if exists sprint_task_sprints_update on public."SprintTaskSprints";
create policy sprint_task_sprints_update on public."SprintTaskSprints"
  for update to authenticated
  using (public.is_board_or_exec())
  with check (public.is_board_or_exec());

drop policy if exists sprint_task_sprints_delete on public."SprintTaskSprints";
create policy sprint_task_sprints_delete on public."SprintTaskSprints"
  for delete to authenticated
  using (public.is_board_or_exec());

grant select, insert, update, delete on public."SprintTaskSprints" to authenticated;

create or replace function public.sprint_task_on_open_sprint(p_sprint_id bigint)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public."Sprints" s
    where s.id = p_sprint_id and s.status in ('planning', 'active')
  );
$$;

drop policy if exists sprint_tasks_update on public."SprintTasks";
create policy sprint_tasks_update on public."SprintTasks"
  for update to authenticated
  using (public.is_board_or_exec())
  with check (
    public.is_board_or_exec()
    and (
      public.sprint_task_on_open_sprint(sprint_id)
      or exists (
        select 1
        from public."SprintTaskSprints" j
        join public."Sprints" s on s.id = j.sprint_id
        where j.task_id = "SprintTasks".id
          and s.status in ('planning', 'active')
      )
    )
  );

create or replace function public.sprint_tasks_guard_complete()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('pending_review', 'done')
     and (new.actual_hours is null or new.actual_hours < 0) then
    raise exception 'Actual hours are required before a task can move to pending review or complete';
  end if;
  if new.status = 'done' and coalesce(new.review_approved, false) = false then
    raise exception 'Reviewer approval is required before a task can be marked complete';
  end if;
  if new.status = 'done' then
    new.completed_at := coalesce(new.completed_at, now());
  else
    new.completed_at := null;
  end if;
  if new.status in ('todo', 'in_progress', 'cancelled') then
    new.review_approved := false;
    new.review_comment := null;
    new.reviewed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists sprint_tasks_guard_complete on public."SprintTasks";
create trigger sprint_tasks_guard_complete
  before insert or update on public."SprintTasks"
  for each row execute function public.sprint_tasks_guard_complete();

notify pgrst, 'reload schema';
