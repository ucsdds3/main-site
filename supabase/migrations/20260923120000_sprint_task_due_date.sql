-- Expected completion date for sprint tasks.
-- Revert: revert/20260923120000_sprint_task_due_date.sql

alter table public."SprintTasks"
  add column if not exists expected_completion_on date;

update public."SprintTasks" t
set expected_completion_on = s.ends_on
from public."Sprints" s
where s.id = t.sprint_id
  and t.expected_completion_on is null;

notify pgrst, 'reload schema';
