-- Revert 20260907220000_create_sprints.sql
-- Manual only. Do not put this in supabase/migrations/ (the CLI would apply it as an up).
--
-- After a backup, apply with:
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/revert/20260907220000_create_sprints.sql
-- Then mark the up as reverted:
--   npx supabase migration repair --status reverted 20260907220000

drop trigger if exists sprint_tasks_set_updated_at on public."SprintTasks";
drop trigger if exists sprints_set_updated_at on public."Sprints";

drop table if exists public."SprintTaskAssignees";
drop table if exists public."SprintTasks";
drop table if exists public."Sprints";

drop function if exists public.is_executive();
drop function if exists public.is_board_or_exec();

-- Leave public.set_updated_at() — it may be shared later.

notify pgrst, 'reload schema';
