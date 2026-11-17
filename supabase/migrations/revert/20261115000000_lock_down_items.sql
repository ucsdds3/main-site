-- Undo the Items lock-down. This restores the policies Membership had before it, which let ANY
-- signed-in member read, insert and update any item, and Supabase's default grants. RLS stays
-- on, as it was before.

do $$
begin
  if to_regclass('public."Items"') is null then
    return;
  end if;

  drop policy if exists items_select_member on public."Items";
  drop policy if exists items_insert_exec on public."Items";
  drop policy if exists items_update_exec on public."Items";

  drop policy if exists "Enable select for authenticated users only" on public."Items";
  drop policy if exists "Enable insert for authenticated users only" on public."Items";
  drop policy if exists "Enable update for authenticated users only" on public."Items";

  create policy "Enable select for authenticated users only" on public."Items"
    for select to authenticated
    using (true);

  create policy "Enable insert for authenticated users only" on public."Items"
    for insert to authenticated
    with check (true);

  create policy "Enable update for authenticated users only" on public."Items"
    for update to authenticated
    using (true)
    with check (true);

  grant all on public."Items" to anon, authenticated;
end $$;

notify pgrst, 'reload schema';
