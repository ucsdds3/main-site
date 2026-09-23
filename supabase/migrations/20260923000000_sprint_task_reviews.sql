-- Reviewer, optional URL, pending_review status, complete gated on approval.
-- Apply via supabase db push / local start. Revert: revert/20260923000000_sprint_task_reviews.sql

alter table public."SprintTasks"
  add column if not exists reviewer_id bigint references public."Members"(id),
  add column if not exists relevant_url text,
  add column if not exists review_approved boolean not null default false,
  add column if not exists review_comment text,
  add column if not exists reviewed_at timestamptz;

update public."SprintTasks"
  set reviewer_id = created_by
  where reviewer_id is null;

update public."SprintTasks"
  set review_approved = true,
      reviewed_at = coalesce(reviewed_at, now())
  where status = 'done'
    and review_approved = false;

alter table public."SprintTasks"
  drop constraint if exists sprint_tasks_status_check;

alter table public."SprintTasks"
  add constraint sprint_tasks_status_check
  check (status in ('todo', 'in_progress', 'pending_review', 'done', 'cancelled'));

create index if not exists sprint_tasks_reviewer_id_idx
  on public."SprintTasks" (reviewer_id);

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

drop trigger if exists sprint_tasks_guard_complete on public."SprintTasks";
create trigger sprint_tasks_guard_complete
  before insert or update on public."SprintTasks"
  for each row execute function public.sprint_tasks_guard_complete();

notify pgrst, 'reload schema';
