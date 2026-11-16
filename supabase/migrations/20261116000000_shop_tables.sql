-- Points shop: the tables (the functions that write to them come in the next migration).
--
-- Before: Items has its shop columns (20261115000100) but there is nowhere to keep sizes,
-- stock, orders or the shop's on/off switch.
--
-- After:
--   SizeCharts, Sizes  One chart per garment cut (e.g. "Unisex hoodie") and its sizes.
--   Items              Gains size_chart_id; "ShopItems" view gains it too.
--   ItemVariants       One row per size/colour of an item, holding its stock. Existing items get
--                      one default variant with stock 0, so nothing can be bought by accident.
--   ShopOrders         One row per purchase.
--   ShopSettings       One row; the shop starts PAUSED.
--   PointsAdjustments  Audit log of points/XP edited by hand through the API (Exec /admin edits).
--   Leaderboard        "MemberLeaderboard" gains an `experience` column (appended last).
--   Storage            Public bucket "Shop Images" (anyone reads via URL, Executives write).
--
-- Access: nobody can insert, update or delete in these tables through the API; every write
-- goes through the SECURITY DEFINER functions in the next migration. Reads: the catalog
-- (variants of live items, size charts, the on/off switch) is readable signed in and signed
-- out, like "ShopItems"; members read their own orders; Board/Executive read everything; only
-- Executives read the points log.
--
-- Re-runnable (CI applies, reverts, re-applies).
-- Revert: supabase/migrations/revert/20261116000000_shop_tables.sql (after the functions revert).

-- ------------------------------------------------------------------ preflight

do $$
begin
  if to_regprocedure('public.is_executive()') is null
     or to_regprocedure('public.is_board_or_exec()') is null then
    raise exception 'public.is_executive() / is_board_or_exec() are missing; apply the sprints migration first.';
  end if;

  if to_regclass('public."ShopItems"') is null then
    raise exception 'Apply 20261115000100_items_shop_columns.sql first (ShopItems view missing).';
  end if;

  if (select data_type from information_schema.columns
      where table_schema = 'public' and table_name = 'Members' and column_name = 'id') is distinct from 'bigint' then
    raise exception 'public."Members".id must be bigint.';
  end if;
end $$;

-- ------------------------------------------------------------------ SizeCharts

create table if not exists public."SizeCharts" (
  id bigint generated always as identity primary key,
  name text not null unique check (length(btrim(name)) between 1 and 80),
  unit text not null default 'in' check (unit in ('in', 'cm')),
  -- Ordered measurement names, e.g. {Chest,Length,Sleeve}.
  measurements text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public."SizeCharts";
create trigger set_updated_at before update on public."SizeCharts"
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------ Sizes

create table if not exists public."Sizes" (
  id bigint generated always as identity primary key,
  chart_id bigint not null references public."SizeCharts"(id) on delete cascade,
  label text not null check (length(btrim(label)) between 1 and 20),
  sort_order integer not null default 0,
  -- e.g. {"Chest": 22, "Length": 28}
  measurement_values jsonb not null default '{}' check (jsonb_typeof(measurement_values) = 'object'),
  unique (chart_id, label)
);

create index if not exists sizes_chart_id_idx on public."Sizes" (chart_id);

-- ------------------------------------------------------------------ Items: size chart link

alter table public."Items"
  add column if not exists size_chart_id bigint references public."SizeCharts"(id) on delete restrict;

-- Same view as before with size_chart_id appended (a view can only gain columns at the end).
-- Read the warning above the view in 20261115000100 before editing: no `price`, read-only,
-- no security_invoker, keep security_barrier.
create or replace view public."ShopItems" with (security_barrier) as
  select id, slug, name, description, image, image_path, points_cost, fulfillment_type,
         per_member_limit, sort_order, size_chart_id
  from public."Items"
  where active and not deleted;

revoke all on public."ShopItems" from public, anon, authenticated;
grant select on public."ShopItems" to anon, authenticated;

-- True when an item is on sale. SECURITY DEFINER so the ItemVariants rule below can ask about
-- an item even though members and visitors can't read the Items table itself.
create or replace function public.shop_item_is_live(p_item_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public."Items" i
    where i.id = p_item_id and i.active and not i.deleted
  );
$$;

revoke all on function public.shop_item_is_live(bigint) from public;
grant execute on function public.shop_item_is_live(bigint) to anon, authenticated;

-- ------------------------------------------------------------------ ItemVariants

create table if not exists public."ItemVariants" (
  id bigint generated always as identity primary key,
  item_id bigint not null references public."Items"(id) on delete restrict,
  size_id bigint references public."Sizes"(id) on delete restrict,
  color_name text check (color_name is null or length(btrim(color_name)) between 1 and 40),
  color_hex text check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  image_path text,
  stock integer default 0 check (stock is null or stock >= 0),  -- null = unlimited
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint item_variants_hex_needs_name check (color_hex is null or color_name is not null),
  -- "nulls not distinct": two variants with no size and no colour count as the same combination.
  constraint item_variants_unique_combo unique nulls not distinct (item_id, size_id, color_name)
);

create index if not exists item_variants_item_id_idx on public."ItemVariants" (item_id);

drop trigger if exists set_updated_at on public."ItemVariants";
create trigger set_updated_at before update on public."ItemVariants"
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------ size must belong to the item's chart

create or replace function public.item_variants_check_size()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.size_id is not null and not exists (
    select 1
    from public."Sizes" s
    join public."Items" i on i.id = new.item_id
    where s.id = new.size_id and s.chart_id = i.size_chart_id
  ) then
    raise exception 'size_not_in_chart' using errcode = '23514';
  end if;
  return new;
end $$;

drop trigger if exists item_variants_check_size on public."ItemVariants";
create trigger item_variants_check_size
  before insert or update on public."ItemVariants"
  for each row execute function public.item_variants_check_size();

-- The other direction: changing an item's chart must not strand variants on sizes of the old one.
create or replace function public.items_check_size_chart()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if exists (
    select 1
    from public."ItemVariants" v
    join public."Sizes" s on s.id = v.size_id
    where v.item_id = new.id and s.chart_id is distinct from new.size_chart_id
  ) then
    raise exception 'size_not_in_chart' using errcode = '23514';
  end if;
  return new;
end $$;

drop trigger if exists items_check_size_chart on public."Items";
create trigger items_check_size_chart
  before update of size_chart_id on public."Items"
  for each row execute function public.items_check_size_chart();

-- ------------------------------------------------------------------ backfill default variants

insert into public."ItemVariants" (item_id, stock, active)
select i.id, 0, true
from public."Items" i
where not exists (select 1 from public."ItemVariants" v where v.item_id = i.id);

-- ------------------------------------------------------------------ ShopOrders

create table if not exists public."ShopOrders" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  member_id bigint not null references public."Members"(id) on delete restrict,
  item_id bigint not null references public."Items"(id) on delete restrict,
  variant_id bigint not null references public."ItemVariants"(id) on delete restrict,
  -- Copied at purchase time so old orders still read correctly after an item is renamed.
  item_name text not null,
  variant_label text not null default '',
  fulfillment_type text not null check (fulfillment_type in ('pickup', 'instant')),
  quantity integer not null check (quantity > 0),
  unit_cost integer not null check (unit_cost >= 0),
  points_spent integer not null check (points_spent = unit_cost * quantity),
  -- True when the purchase took units off a limited stock, so a cancel knows to put them back
  -- (even if an Exec has since switched the variant between limited and unlimited).
  stock_reserved boolean not null default false,
  status text not null check (status in ('pending', 'fulfilled', 'cancelled', 'completed')),
  handled_by bigint references public."Members"(id) on delete set null,
  handled_at timestamptz,
  cancel_reason text,
  -- Written later by the notify-shop-order Edge Function (service role).
  receipt_emailed_at timestamptz,
  fulfilled_emailed_at timestamptz,
  cancelled_emailed_at timestamptz,
  constraint shop_orders_status_by_type check (
    (fulfillment_type = 'pickup' and status in ('pending', 'fulfilled', 'cancelled'))
    or (fulfillment_type = 'instant' and status = 'completed')
  ),
  constraint shop_orders_handled_check check (status in ('pending', 'completed') or handled_at is not null),
  constraint shop_orders_cancel_reason_check check ((status = 'cancelled') = (cancel_reason is not null))
);

create index if not exists shop_orders_member_idx on public."ShopOrders" (member_id, created_at desc);
create index if not exists shop_orders_item_member_idx on public."ShopOrders" (item_id, member_id);
create index if not exists shop_orders_variant_idx on public."ShopOrders" (variant_id);
create index if not exists shop_orders_pending_idx on public."ShopOrders" (created_at) where status = 'pending';

-- ------------------------------------------------------------------ ShopSettings (single row)

create table if not exists public."ShopSettings" (
  id boolean primary key default true check (id),
  paused boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by bigint references public."Members"(id) on delete set null
);

-- The shop starts paused.
insert into public."ShopSettings" (id, paused) values (true, true) on conflict do nothing;

-- ------------------------------------------------------------------ PointsAdjustments (audit log)

create table if not exists public."PointsAdjustments" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  member_id bigint references public."Members"(id) on delete set null,
  member_email text,
  changed_by_id bigint references public."Members"(id) on delete set null,
  changed_by_email text,
  old_points integer,
  new_points integer,
  old_experience integer,
  new_experience integer
);

create index if not exists points_adjustments_member_idx
  on public."PointsAdjustments" (member_id, created_at desc);

-- ------------------------------------------------------------------ points log trigger

-- Does the insert. SECURITY DEFINER so it can write to the log (nobody else can). The
-- pg_trigger_depth() check means it only works when called from inside a trigger, so a member
-- cannot call it through the API to forge log rows.
create or replace function public.record_points_adjustment(
  p_member_id bigint,
  p_member_email text,
  p_old_points integer,
  p_new_points integer,
  p_old_experience integer,
  p_new_experience integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id bigint;
  actor_email text;
begin
  if pg_trigger_depth() < 1 then
    raise exception 'record_points_adjustment only runs from the Members trigger' using errcode = '42501';
  end if;

  select m.id, m.email into actor_id, actor_email
  from public."Members" m
  where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and coalesce(m.deleted, false) = false
  limit 1;

  insert into public."PointsAdjustments"
    (member_id, member_email, changed_by_id, changed_by_email,
     old_points, new_points, old_experience, new_experience)
  values
    (p_member_id, p_member_email, actor_id, actor_email,
     p_old_points, p_new_points, p_old_experience, p_new_experience);
end $$;

revoke all on function public.record_points_adjustment(bigint, text, integer, integer, integer, integer)
  from public, anon;
grant execute on function public.record_points_adjustment(bigint, text, integer, integer, integer, integer)
  to authenticated;

-- SECURITY INVOKER on purpose: current_user stays the role the API request runs as ('anon' or
-- 'authenticated'). Changes made by our own SECURITY DEFINER functions (check-in, purchase,
-- cancel) run as the owner, and so do the service role and the SQL editor, so none of those are
-- logged: only points edited by hand through the API (Executives in /admin).
create or replace function public.members_log_points_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return null;
  end if;

  if tg_op = 'UPDATE' then
    if new.points is not distinct from old.points
       and new.experience is not distinct from old.experience then
      return null;
    end if;
    perform public.record_points_adjustment(
      new.id, new.email, old.points, new.points, old.experience, new.experience);
  else
    if coalesce(new.points, 0) = 0 and coalesce(new.experience, 0) = 0 then
      return null;
    end if;
    perform public.record_points_adjustment(
      new.id, new.email, null, new.points, null, new.experience);
  end if;

  return null;
end $$;

drop trigger if exists members_log_points_change on public."Members";
create trigger members_log_points_change
  after insert or update of points, experience on public."Members"
  for each row execute function public.members_log_points_change();

-- ------------------------------------------------------------------ helper

-- Id of the signed-in member (matched by JWT email), or null. Used by the ShopOrders policy.
-- SECURITY DEFINER so it can read Members regardless of the caller's own access.
create or replace function public.current_member_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select m.id
  from public."Members" m
  where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and coalesce(m.deleted, false) = false
  limit 1
$$;

revoke all on function public.current_member_id() from public, anon;
grant execute on function public.current_member_id() to authenticated;

-- ------------------------------------------------------------------ access rules + grants

-- Supabase grants every new table to anon and authenticated by default, so take it all back,
-- then give read-only access. There are deliberately no write grants or policies.
do $$
declare
  t text;
begin
  foreach t in array array['SizeCharts', 'Sizes', 'ItemVariants', 'ShopOrders', 'ShopSettings', 'PointsAdjustments']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    execute format('grant select on public.%I to authenticated', t);
  end loop;
end $$;

-- The catalog is also readable signed out (to browse before signing in). For ShopSettings only
-- the switch itself: updated_by would show visitors which member last paused the shop.
grant select on public."ItemVariants", public."SizeCharts", public."Sizes" to anon;
grant select (id, paused, updated_at) on public."ShopSettings" to anon;

-- Two policies, not one combined: is_board_or_exec() is only callable by signed-in users.
drop policy if exists item_variants_select on public."ItemVariants";
drop policy if exists item_variants_select_live on public."ItemVariants";
create policy item_variants_select_live on public."ItemVariants"
  for select to anon, authenticated
  using (active and public.shop_item_is_live(item_id));

drop policy if exists item_variants_select_board on public."ItemVariants";
create policy item_variants_select_board on public."ItemVariants"
  for select to authenticated
  using (public.is_board_or_exec());

drop policy if exists size_charts_select on public."SizeCharts";
create policy size_charts_select on public."SizeCharts"
  for select to anon, authenticated using (true);

drop policy if exists sizes_select on public."Sizes";
create policy sizes_select on public."Sizes"
  for select to anon, authenticated using (true);

drop policy if exists shop_settings_select on public."ShopSettings";
create policy shop_settings_select on public."ShopSettings"
  for select to anon, authenticated using (true);

drop policy if exists shop_orders_select_own on public."ShopOrders";
create policy shop_orders_select_own on public."ShopOrders"
  for select to authenticated
  -- "(select ...)" makes Postgres look up the caller's id once per query, not once per row.
  using (member_id = (select public.current_member_id()));

drop policy if exists shop_orders_select_board on public."ShopOrders";
create policy shop_orders_select_board on public."ShopOrders"
  for select to authenticated
  using (public.is_board_or_exec());

drop policy if exists points_adjustments_select_exec on public."PointsAdjustments";
create policy points_adjustments_select_exec on public."PointsAdjustments"
  for select to authenticated
  using (public.is_executive());

-- ------------------------------------------------------------------ leaderboard view

-- `experience` is appended last (create or replace view can only add columns at the end).
do $$
begin
  if to_regclass('public."MemberLeaderboard"') is not null then
    create or replace view public."MemberLeaderboard" as
      select full_name, points, profile_picture, deleted, experience
      from public."Members"
      where coalesce(deleted, false) = false;

    revoke all on public."MemberLeaderboard" from public, anon, authenticated;
    grant select on public."MemberLeaderboard" to authenticated;
  end if;
end $$;

-- ------------------------------------------------------------------ storage bucket

-- Only where Supabase Storage exists (not in CI). Dynamic SQL so CI can still parse this file.
do $$
begin
  if to_regclass('storage.buckets') is null then
    raise notice 'Shop Images bucket skipped: storage schema missing.';
    return;
  end if;

  execute $sql$
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('Shop Images', 'Shop Images', true, 5242880, '{image/webp,image/png,image/jpeg}')
    on conflict (id) do nothing
  $sql$;

  -- Public read works through the bucket's public URL, so no policy for anon.
  execute 'drop policy if exists shop_images_select_board on storage.objects';
  execute $sql$
    create policy shop_images_select_board on storage.objects
      for select to authenticated
      using (bucket_id = 'Shop Images' and public.is_board_or_exec())
  $sql$;

  execute 'drop policy if exists shop_images_insert_exec on storage.objects';
  execute $sql$
    create policy shop_images_insert_exec on storage.objects
      for insert to authenticated
      with check (bucket_id = 'Shop Images' and public.is_executive())
  $sql$;

  execute 'drop policy if exists shop_images_update_exec on storage.objects';
  execute $sql$
    create policy shop_images_update_exec on storage.objects
      for update to authenticated
      using (bucket_id = 'Shop Images' and public.is_executive())
      with check (bucket_id = 'Shop Images' and public.is_executive())
  $sql$;

  execute 'drop policy if exists shop_images_delete_exec on storage.objects';
  execute $sql$
    create policy shop_images_delete_exec on storage.objects
      for delete to authenticated
      using (bucket_id = 'Shop Images' and public.is_executive())
  $sql$;
end $$;

notify pgrst, 'reload schema';
