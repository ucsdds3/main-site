-- Optional progress notes on sprint tasks (max 100 words).
-- Revert: revert/20260925043000_sprint_task_progress_notes.sql

alter table public."SprintTasks"
  add column if not exists progress_notes text;

alter table public."SprintTasks"
  drop constraint if exists sprint_tasks_progress_notes_words_check;

alter table public."SprintTasks"
  add constraint sprint_tasks_progress_notes_words_check
  check (
    progress_notes is null
    or btrim(progress_notes) = ''
    or cardinality(regexp_split_to_array(btrim(progress_notes), '\s+')) <= 100
  );

comment on column public."SprintTasks".progress_notes is
  'Optional in-progress notes (max 100 words). Separate from the task description.';

notify pgrst, 'reload schema';
