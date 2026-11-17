-- Items: shop columns, and a read-only "ShopItems" view for the store.
--
-- Before (after 20261115000000_lock_down_items.sql): every signed-in member reads every Items
-- row and column, including the dollar `price` (what the club paid) and archived rows;
-- signed-out visitors read nothing.
--
-- After:
--   Columns   slug, image_path, points_cost, fulfillment_type, active, per_member_limit,
--             sort_order. Existing items get a unique slug and stay INACTIVE (`active` defaults
--             to false), so nothing is for sale until an Executive sets a price and switches it on.
--   Items     Only Board + Executive read the table itself (all rows, all columns, as /admin
--             needs). Executives still insert/update; nobody deletes (soft delete via `deleted`).
--   ShopItems Read-only view of the items that are on sale (active, not deleted), without
--             `price` or `deleted`. Signed-out visitors and members browse the store through it.
--
-- Why a view: row-level security picks which ROWS someone sees, not which columns, and members,
-- Board and Executives all use the same database role. The view runs with its owner's rights,
-- so it can read Items for everyone while exposing only the safe columns of live items (the
-- same pattern as "PublicEvents").
--
-- Also creates Items if it is missing: production and CI have it, but a fresh local database
-- does not (seed.sql used to create it after migrations ran). Re-runnable, because CI applies
-- every migration, runs the revert scripts, then applies them again.
-- Revert: supabase/migrations/revert/20261115000100_items_shop_columns.sql

-- ------------------------------------------------------------------ preflight

do $$
begin
  if to_regprocedure('public.is_executive()') is null
     or to_regprocedure('public.is_board_or_exec()') is null then
    raise exception 'public.is_executive() / is_board_or_exec() are missing; apply the sprints migration first.';
  end if;
end $$;

-- ------------------------------------------------------------------ Items (create if missing)

-- Same columns as production's table. A no-op wherever Items already exists.
create table if not exists public."Items" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  description text,
  price numeric(8,2) not null default 0,
  image text,
  deleted boolean not null default false
);

do $$
begin
  if (select data_type from information_schema.columns
      where table_schema = 'public' and table_name = 'Items' and column_name = 'id') is distinct from 'bigint' then
    raise exception 'public."Items".id must be bigint.';
  end if;
end $$;

-- ------------------------------------------------------------------ deleted: never empty

-- The store hides archived items with "not deleted", which treats an empty (null) value as
-- "unknown" rather than "not archived". Make sure every row has true or false. (No-op where the
-- column is already not null; the revert leaves this in place, it is harmless.)
update public."Items" set deleted = false where deleted is null;
alter table public."Items" alter column deleted set default false;
alter table public."Items" alter column deleted set not null;

-- ------------------------------------------------------------------ new columns

alter table public."Items"
  add column if not exists slug text,
  add column if not exists image_path text,  -- path inside the "Shop Images" bucket; old `image` URL is untouched
  add column if not exists points_cost integer not null default 0,
  add column if not exists fulfillment_type text not null default 'pickup',
  add column if not exists active boolean not null default false,
  add column if not exists per_member_limit integer,  -- null = no limit
  add column if not exists sort_order integer not null default 0;

-- Constraints are dropped then added so re-applying after the revert works.
alter table public."Items" drop constraint if exists items_points_cost_check;
alter table public."Items" add constraint items_points_cost_check check (points_cost >= 0);
alter table public."Items" drop constraint if exists items_fulfillment_type_check;
alter table public."Items" add constraint items_fulfillment_type_check
  check (fulfillment_type in ('pickup', 'instant'));
alter table public."Items" drop constraint if exists items_per_member_limit_check;
alter table public."Items" add constraint items_per_member_limit_check
  check (per_member_limit is null or per_member_limit > 0);

-- ------------------------------------------------------------------ slug

-- Fills a blank slug from the name ("DS3 Hoodie!" -> "ds3-hoodie"). If another item already has
-- that slug, the item id is appended ("ds3-hoodie-7"), then a counter if even that is taken
-- ("ds3-hoodie-7-2"). The generic /admin page inserts items without a slug, so this keeps it
-- working.
create or replace function public.items_fill_slug()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  base text;
  candidate text;
  n integer := 1;
begin
  if new.slug is null or btrim(new.slug) = '' then
    base := lower(coalesce(new.name, ''));
    base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
    base := btrim(base, '-');
    base := btrim(left(base, 60), '-');
    if base = '' then
      base := 'item';
    end if;
    candidate := base;
    while exists (select 1 from public."Items" i where i.slug = candidate and i.id <> new.id) loop
      candidate := base || '-' || new.id || case when n > 1 then '-' || n else '' end;
      n := n + 1;
    end loop;
    new.slug := candidate;
  end if;
  return new;
end $$;

drop trigger if exists items_fill_slug on public."Items";
create trigger items_fill_slug
  before insert or update of slug, name on public."Items"
  for each row execute function public.items_fill_slug();

-- Backfill existing rows in id order, one at a time, so two names with the same slug get
-- different slugs. Setting slug to '' fires the trigger above, which derives the real value.
do $$
declare
  r record;
begin
  for r in select id from public."Items" where slug is null or btrim(slug) = '' order by id loop
    update public."Items" set slug = '' where id = r.id;
  end loop;
end $$;

alter table public."Items" alter column slug set not null;
create unique index if not exists items_slug_key on public."Items" (slug);
alter table public."Items" drop constraint if exists items_slug_format;
alter table public."Items" add constraint items_slug_format
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80);

-- ------------------------------------------------------------------ Items access

-- Re-states the whole rule set (not just the change), because on a fresh local database the
-- lock-down migration ran before Items existed and skipped.
alter table public."Items" enable row level security;

drop policy if exists items_select_member on public."Items";  -- members now read ShopItems

drop policy if exists items_select_board on public."Items";
create policy items_select_board on public."Items"
  for select to authenticated
  using (public.is_board_or_exec());

drop policy if exists items_insert_exec on public."Items";
create policy items_insert_exec on public."Items"
  for insert to authenticated
  with check (public.is_executive());

drop policy if exists items_update_exec on public."Items";
create policy items_update_exec on public."Items"
  for update to authenticated
  using (public.is_executive())
  with check (public.is_executive());

revoke all on public."Items" from anon;
revoke delete, truncate, references, trigger on public."Items" from authenticated;
grant select, insert, update on public."Items" to authenticated;

-- ------------------------------------------------------------------ ShopItems view

-- Items on sale, without the dollar price. Later migrations may add columns at the end
-- ("create or replace view" can only append).
--
-- READ BEFORE EDITING. This view reads Items with its owner's rights (on purpose: members and
-- signed-out visitors cannot read Items), so its column list and WHERE clause are the only
-- thing keeping data private:
--   * never add `price` (or `select *`), and keep the "active and not deleted" filter;
--   * keep it read-only (select grant only): writes through it would also run as the owner;
--   * do NOT set security_invoker = true. Supabase's Security Advisor flags this view as a
--     "security definer view"; that is expected (PublicEvents is the same). With
--     security_invoker the store would come back empty for members and visitors.
-- security_barrier stops Postgres from running a caller's filters on rows the view hides.
-- supabase/tests/items.sql checks all of this.
create or replace view public."ShopItems" with (security_barrier) as
  select id, slug, name, description, image, image_path, points_cost, fulfillment_type,
         per_member_limit, sort_order
  from public."Items"
  where active and not deleted;

-- Simple views are auto-updatable: grant read only.
revoke all on public."ShopItems" from public, anon, authenticated;
grant select on public."ShopItems" to anon, authenticated;

notify pgrst, 'reload schema';
