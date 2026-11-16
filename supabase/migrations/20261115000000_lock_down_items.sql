-- Lock down Items (row-level security).
--
-- Before this, Membership had three policies on Items, all `to authenticated` with the
-- condition `true`: any signed-in member could read, insert and update any item (for example
-- set a price to 0). There was no delete policy, so nobody could delete through the API; the
-- admin page soft-deletes by setting `deleted`.
--
-- After:
--   Items  signed-in members read every item (the store needs the catalogue);
--          Executives insert and update; nobody deletes through the API (soft delete only);
--          signed-out visitors get nothing.
--
-- Every existing policy on Items is dropped and replaced (their names are printed as NOTICEs).
-- Guarded: a no-op where the table is missing. Revert: supabase/migrations/revert/.

do $$
declare
  pol record;
begin
  if to_regclass('public."Items"') is null then
    raise notice 'Items lock-down skipped: table missing.';
    return;
  end if;

  if to_regprocedure('public.is_executive()') is null then
    raise exception 'public.is_executive() is missing; apply the sprints migration first.';
  end if;

  for pol in
    select policyname from pg_policies where schemaname = 'public' and tablename = 'Items'
  loop
    raise notice 'Dropping existing Items policy %', pol.policyname;
    execute format('drop policy %I on public."Items"', pol.policyname);
  end loop;

  alter table public."Items" enable row level security;

  create policy items_select_member on public."Items"
    for select to authenticated
    using (true);

  create policy items_insert_exec on public."Items"
    for insert to authenticated
    with check (public.is_executive());

  create policy items_update_exec on public."Items"
    for update to authenticated
    using (public.is_executive())
    with check (public.is_executive());

  -- Grants say which commands a role may run at all; the policies above say on which rows.
  -- Signed-out visitors never use Items. Nobody deletes (soft delete is an update). TRUNCATE
  -- empties a table without checking RLS; REFERENCES and TRIGGER are schema-building powers.
  revoke all on public."Items" from anon;
  revoke delete, truncate, references, trigger on public."Items" from authenticated;
  grant select, insert, update on public."Items" to authenticated;
end $$;

notify pgrst, 'reload schema';
