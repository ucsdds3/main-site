-- Undo 20261115000100_items_shop_columns.sql: drop the ShopItems view, the slug trigger and the
-- shop columns, and put back the lock-down's rule that every signed-in member reads Items.
-- Run the revert of any later shop migration first (they depend on these columns).
-- The Items table itself is kept, with its original name/description/price/image/deleted columns.

drop view if exists public."ShopItems";

drop trigger if exists items_fill_slug on public."Items";
drop function if exists public.items_fill_slug();

drop index if exists public.items_slug_key;
alter table public."Items"
  drop constraint if exists items_slug_format,
  drop constraint if exists items_points_cost_check,
  drop constraint if exists items_fulfillment_type_check,
  drop constraint if exists items_per_member_limit_check;
alter table public."Items"
  drop column if exists slug,
  drop column if exists image_path,
  drop column if exists points_cost,
  drop column if exists fulfillment_type,
  drop column if exists active,
  drop column if exists per_member_limit,
  drop column if exists sort_order;

-- Back to 20261115000000_lock_down_items.sql's rules.
drop policy if exists items_select_board on public."Items";
drop policy if exists items_select_member on public."Items";
create policy items_select_member on public."Items"
  for select to authenticated
  using (true);

drop policy if exists items_insert_exec on public."Items";
create policy items_insert_exec on public."Items"
  for insert to authenticated
  with check (public.is_executive());

drop policy if exists items_update_exec on public."Items";
create policy items_update_exec on public."Items"
  for update to authenticated
  using (public.is_executive())
  with check (public.is_executive());

notify pgrst, 'reload schema';
