-- Undo 20261116000000_shop_tables.sql.
--
-- WARNING: this drops every shop order, variant, size chart and the points-change log. Never run
-- it after the shop has launched (pause the shop instead). Run the functions revert
-- (revert/20261116000100_shop_functions.sql) first.
--
-- Leaves Items with its shop columns (20261115000100) and puts "ShopItems" and
-- "MemberLeaderboard" back to their earlier columns.

-- storage: policies, then the bucket, but only if it holds no files.
do $$
declare
  n bigint;
begin
  if to_regclass('storage.buckets') is null then
    return;
  end if;

  execute 'drop policy if exists shop_images_select_board on storage.objects';
  execute 'drop policy if exists shop_images_insert_exec on storage.objects';
  execute 'drop policy if exists shop_images_update_exec on storage.objects';
  execute 'drop policy if exists shop_images_delete_exec on storage.objects';

  execute $sql$ select count(*) from storage.objects where bucket_id = 'Shop Images' $sql$ into n;
  if n = 0 then
    -- Newer Supabase Storage versions refuse direct SQL deletes on buckets; don't let that
    -- abort the rest of the revert.
    begin
      execute $sql$ delete from storage.buckets where id = 'Shop Images' $sql$;
    exception when others then
      raise notice 'Shop Images bucket kept: Storage refused the delete (%). Delete it in the dashboard.', sqlerrm;
    end;
  else
    raise notice 'Shop Images bucket kept: it still holds % file(s).', n;
  end if;
end $$;

-- leaderboard back to four columns (a view cannot drop a column with "create or replace").
do $$
begin
  if to_regclass('public."MemberLeaderboard"') is not null then
    drop view public."MemberLeaderboard";
    create view public."MemberLeaderboard" as
      select full_name, points, profile_picture, deleted
      from public."Members"
      where coalesce(deleted, false) = false;

    revoke all on public."MemberLeaderboard" from public, anon, authenticated;
    grant select on public."MemberLeaderboard" to authenticated;
  end if;
end $$;

drop trigger if exists members_log_points_change on public."Members";
drop function if exists public.members_log_points_change();
drop function if exists public.record_points_adjustment(bigint, text, integer, integer, integer, integer);
drop function if exists public.current_member_id() cascade;

-- Dropping a table also drops its policies and triggers.
drop table if exists public."PointsAdjustments";
drop table if exists public."ShopSettings";
drop table if exists public."ShopOrders";
drop table if exists public."ItemVariants";
drop table if exists public."Sizes";

drop function if exists public.item_variants_check_size();
drop function if exists public.shop_item_is_live(bigint);
drop trigger if exists items_check_size_chart on public."Items";
drop function if exists public.items_check_size_chart();

-- ShopItems without size_chart_id (drop first: the view uses the column).
drop view if exists public."ShopItems";
drop table if exists public."SizeCharts" cascade;  -- cascade drops Items.size_chart_id's foreign key
alter table public."Items" drop column if exists size_chart_id;

create view public."ShopItems" with (security_barrier) as
  select id, slug, name, description, image, image_path, points_cost, fulfillment_type,
         per_member_limit, sort_order
  from public."Items"
  where active and not deleted;

revoke all on public."ShopItems" from public, anon, authenticated;
grant select on public."ShopItems" to anon, authenticated;

notify pgrst, 'reload schema';
