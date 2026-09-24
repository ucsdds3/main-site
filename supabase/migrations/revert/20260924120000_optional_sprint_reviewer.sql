-- Restore reviewer-required complete gate from 20260923013000_sprint_hours_and_membership.sql

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

notify pgrst, 'reload schema';
