-- Revert 20260923000000_sprint_task_reviews.sql
-- Manual only. Do not put this in supabase/migrations/.

drop trigger if exists sprint_tasks_guard_complete on public."SprintTasks";
drop function if exists public.sprint_tasks_guard_complete();

update public."SprintTasks"
  set status = 'in_progress'
  where status = 'pending_review';

alter table public."SprintTasks"
  drop constraint if exists sprint_tasks_status_check;

alter table public."SprintTasks"
  add constraint sprint_tasks_status_check
  check (status in ('todo', 'in_progress', 'done', 'cancelled'));

drop index if exists public.sprint_tasks_reviewer_id_idx;

alter table public."SprintTasks"
  drop column if exists reviewed_at,
  drop column if exists review_comment,
  drop column if exists review_approved,
  drop column if exists relevant_url,
  drop column if exists reviewer_id;

notify pgrst, 'reload schema';
