drop policy if exists applications_delete on public."Applications";
drop policy if exists applications_update on public."Applications";
drop policy if exists applications_insert on public."Applications";
drop policy if exists applications_select on public."Applications";

drop trigger if exists applications_set_updated_at on public."Applications";

drop table if exists public."Applications";

notify pgrst, 'reload schema';
