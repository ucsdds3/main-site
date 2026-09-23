-- Revert 20260923120000_sprint_task_due_date.sql

alter table public."SprintTasks"
  drop column if exists expected_completion_on;

notify pgrst, 'reload schema';
