-- Revert 20260923013000_sprint_hours_and_membership.sql

drop trigger if exists sprint_tasks_guard_complete on public."SprintTasks";

create or replace function public.sprint_tasks_guard_complete()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'done' and coalesce(new.review_approved, false) = false then
    raise exception 'Reviewer approval is required before a task can be marked complete';
  end if;
  if new.status in ('todo', 'in_progress', 'cancelled') then
    new.review_approved := false;
    new.review_comment := null;
    new.reviewed_at := null;
  end if;
  return new;
end;
$$;

create trigger sprint_tasks_guard_complete
  before insert or update on public."SprintTasks"
  for each row execute function public.sprint_tasks_guard_complete();

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

drop function if exists public.sprint_task_on_open_sprint(bigint);

drop table if exists public."SprintTaskSprints";

alter table public."SprintTasks"
  drop constraint if exists sprint_tasks_actual_hours_check;

alter table public."SprintTasks"
  drop column if exists completed_at,
  drop column if exists actual_hours;

notify pgrst, 'reload schema';
