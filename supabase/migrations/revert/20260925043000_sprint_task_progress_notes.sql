alter table public."SprintTasks"
  drop constraint if exists sprint_tasks_progress_notes_words_check;

alter table public."SprintTasks"
  drop column if exists progress_notes;

notify pgrst, 'reload schema';
