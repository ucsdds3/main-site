-- Shop tables tests (sizes, variants, orders, settings, points log, leaderboard).
-- Plain SQL: run with `psql -v ON_ERROR_STOP=1 -f supabase/tests/shop_tables.sql`.
--
-- Same approach as items.sql: one transaction ending in ROLLBACK; `set local role` + a fake
-- login email to act as someone; 'FAIL <case>' on the first wrong behaviour. Rows are set up
-- directly as the table owner, because the functions that normally write them come in the
-- next migration.

begin;

-- ======================================================================= helpers
create schema tabletest;
grant usage on schema tabletest to public;

create table tabletest.ids (name text primary key, id bigint);
grant all on tabletest.ids to public;

create function tabletest.id(p_name text) returns bigint
language sql stable as $$ select id from tabletest.ids where name = p_name $$;

create procedure tabletest.as_(p_email text)
language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    case when p_email is null then '' else json_build_object('email', p_email)::text end, true);
end $$;

create function tabletest.assert(p_label text, p_ok boolean) returns void
language plpgsql as $$
begin
  if p_ok is not true then raise exception 'FAIL %', p_label; end if;
end $$;

-- ======================================================================= fixtures
insert into public."Members" (email, full_name, admin_level, points, experience, deleted) values
  ('tabletest-exec@ucsd.edu',   'TT Exec',   'Executive', 0,   0,  false),
  ('tabletest-board@ucsd.edu',  'TT Board',  'Board',     0,   0,  false),
  ('tabletest-member@ucsd.edu', 'TT Member', 'Member',    500, 50, false),
  ('tabletest-other@ucsd.edu',  'TT Other',  'Member',    500, 10, false);

do $$
declare
  chart bigint;
  other_chart bigint;
  live bigint;
  draft bigint;
begin
  insert into public."SizeCharts" (name, measurements) values ('Tabletest tee', '{Chest}')
    returning id into chart;
  insert into public."SizeCharts" (name, measurements) values ('Tabletest other', '{Chest}')
    returning id into other_chart;
  insert into public."Sizes" (chart_id, label, sort_order, measurement_values) values
    (chart, 'S', 1, '{"Chest": 18}'), (chart, 'M', 2, '{"Chest": 20}'), (other_chart, 'S', 1, '{}');

  insert into public."Items" (name, points_cost, active, size_chart_id)
    values ('Tabletest tee', 50, true, chart) returning id into live;
  insert into public."Items" (name, points_cost, active)
    values ('Tabletest draft', 50, false) returning id into draft;

  insert into tabletest.ids values ('chart', chart), ('otherChart', other_chart), ('live', live),
    ('draft', draft);
  with x as (
    insert into public."ItemVariants" (item_id, size_id, color_name, stock)
    select live, s.id, 'Navy', 5 from public."Sizes" s where s.chart_id = chart and s.label = 'S'
    returning id)
  insert into tabletest.ids select 'teeS', id from x;
  with x as (
    insert into public."ItemVariants" (item_id, size_id, color_name, stock, active)
    select live, s.id, 'Navy', 5, false from public."Sizes" s where s.chart_id = chart and s.label = 'M'
    returning id)
  insert into tabletest.ids select 'teeM_off', id from x;
  with x as (insert into public."ItemVariants" (item_id, stock) values (draft, 3) returning id)
  insert into tabletest.ids select 'draftV', id from x;

  -- Archived: switched on but deleted. Its variants must stay hidden too.
  with x as (
    insert into public."Items" (name, points_cost, active, deleted)
    values ('Tabletest archived', 50, true, true) returning id)
  insert into tabletest.ids select 'archived', id from x;
  with x as (insert into public."ItemVariants" (item_id, stock) values (tabletest.id('archived'), 3) returning id)
  insert into tabletest.ids select 'archivedV', id from x;
end $$;

-- Two orders, written directly (as purchase_item will later), one per member.
with x as (
  insert into public."ShopOrders" (member_id, item_id, variant_id, item_name, variant_label,
    fulfillment_type, quantity, unit_cost, points_spent, stock_reserved, status)
  select m.id, tabletest.id('live'), tabletest.id('teeS'), 'Tabletest tee', 'Navy / S',
    'pickup', 1, 50, 50, true, 'pending'
  from public."Members" m where m.email = 'tabletest-member@ucsd.edu'
  returning id)
insert into tabletest.ids select 'ordMember', id from x;
with x as (
  insert into public."ShopOrders" (member_id, item_id, variant_id, item_name, variant_label,
    fulfillment_type, quantity, unit_cost, points_spent, status)
  select m.id, tabletest.id('live'), tabletest.id('teeS'), 'Tabletest tee', 'Navy / S',
    'pickup', 2, 50, 100, 'pending'
  from public."Members" m where m.email = 'tabletest-other@ucsd.edu'
  returning id)
insert into tabletest.ids select 'ordOther', id from x;

-- ======================================================================= backfill + settings
-- Proves: items that existed before this migration got exactly one default variant (no size,
-- no colour, stock 0), and the shop switch is a single row.
do $$
declare
  n int;
begin
  select count(*) into n from public."Items" where description = 'Old merch row' or name = 'DS3 hoodie!';
  if n = 0 then
    raise notice 'backfill: CI stub items not present (local db), skipping';
  else
    select count(*) into n from public."Items" i
      where (i.description = 'Old merch row' or i.name = 'DS3 hoodie!')
        and (select count(*) from public."ItemVariants" v
             where v.item_id = i.id and v.size_id is null and v.color_name is null
               and v.stock = 0 and v.active) = 1;
    perform tabletest.assert('backfill: one default variant with stock 0', n = 2);
  end if;
  select count(*) into n from public."ShopSettings";
  perform tabletest.assert('settings: exactly one row', n = 1);
end $$;

-- ======================================================================= table rules
-- Proves: a size must come from the item's own chart, an item can't switch charts under its
-- sized variants, and the same size/colour can't be listed twice.
do $$ begin
  begin
    insert into public."ItemVariants" (item_id, size_id, color_name)
    select tabletest.id('live'), s.id, 'Red' from public."Sizes" s where s.chart_id = tabletest.id('otherChart');
    raise exception 'FAIL rules: variant accepted a size from another chart';
  exception when check_violation then null; end;
  begin
    update public."Items" set size_chart_id = tabletest.id('otherChart') where id = tabletest.id('live');
    raise exception 'FAIL rules: item switched charts under its sized variants';
  exception when check_violation then null; end;
  begin
    insert into public."ItemVariants" (item_id) values (tabletest.id('draft'));
    raise exception 'FAIL rules: second default variant accepted';
  exception when unique_violation then null; end;
  begin
    insert into public."ShopOrders" (member_id, item_id, variant_id, item_name, fulfillment_type,
      quantity, unit_cost, points_spent, status)
    select m.id, tabletest.id('live'), tabletest.id('teeS'), 'x', 'pickup', 2, 50, 50, 'pending'
    from public."Members" m where m.email = 'tabletest-member@ucsd.edu';
    raise exception 'FAIL rules: order accepted points_spent <> unit_cost x quantity';
  exception when check_violation then null; end;
end $$;

-- ======================================================================= catalog: signed out
-- Proves: signed-out visitors can browse the catalog (active variants of live items, size
-- charts, the on/off switch) but see no orders or log, and ShopItems now has size_chart_id.
set local role anon;
call tabletest.as_(null);
do $$
declare
  n int;
begin
  select count(*) into n from public."ItemVariants"
    where id in (tabletest.id('teeS'), tabletest.id('teeM_off'), tabletest.id('draftV'),
                 tabletest.id('archivedV'));
  perform tabletest.assert('anon: only the active variant of the live item', n = 1
    and exists (select 1 from public."ItemVariants" where id = tabletest.id('teeS')));
  select count(*) into n from public."Sizes" where chart_id = tabletest.id('chart');
  perform tabletest.assert('anon: reads sizes', n = 2);
  select count(*) into n from public."SizeCharts" where id = tabletest.id('chart');
  perform tabletest.assert('anon: reads size charts', n = 1);
  select count(paused) into n from public."ShopSettings";
  perform tabletest.assert('anon: reads the shop switch', n = 1);
  begin
    perform updated_by from public."ShopSettings";
    raise exception 'FAIL anon: can see who last paused the shop';
  exception when insufficient_privilege then null; end;
  select count(*) into n from public."ShopItems" where size_chart_id = tabletest.id('chart');
  perform tabletest.assert('anon: ShopItems has size_chart_id', n = 1);
  begin
    perform count(*) from public."ShopOrders";
    raise exception 'FAIL anon: can read ShopOrders';
  exception when insufficient_privilege then null; end;
  begin
    perform count(*) from public."PointsAdjustments";
    raise exception 'FAIL anon: can read PointsAdjustments';
  exception when insufficient_privilege then null; end;
  begin
    perform public.current_member_id();
    raise exception 'FAIL anon: can call current_member_id';
  exception when insufficient_privilege then null; end;
  begin
    perform public.record_points_adjustment(1, 'x@ucsd.edu', 0, 1, 0, 1);
    raise exception 'FAIL anon: can call record_points_adjustment';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- ======================================================================= member
-- Proves: a member sees the same catalog, only their own orders, no points log, and cannot
-- write to any shop table.
set local role authenticated;
call tabletest.as_('tabletest-member@ucsd.edu');
do $$
declare
  n int;
begin
  select count(*) into n from public."ItemVariants"
    where id in (tabletest.id('teeS'), tabletest.id('teeM_off'), tabletest.id('draftV'),
                 tabletest.id('archivedV'));
  perform tabletest.assert('member: only the active variant of the live item', n = 1);
  select count(*) into n from public."ShopOrders" where id in (tabletest.id('ordMember'), tabletest.id('ordOther'));
  perform tabletest.assert('member: sees only own order', n = 1
    and exists (select 1 from public."ShopOrders" where id = tabletest.id('ordMember')));
  perform tabletest.assert('member: current_member_id is self',
    public.current_member_id() = (select member_id from public."ShopOrders" where id = tabletest.id('ordMember')));

  begin
    insert into public."ShopOrders" (member_id, item_id, variant_id, item_name, fulfillment_type,
      quantity, unit_cost, points_spent, status)
    values (public.current_member_id(), tabletest.id('live'), tabletest.id('teeS'), 'free', 'pickup', 1, 0, 0, 'pending');
    raise exception 'FAIL member: can insert ShopOrders';
  exception when insufficient_privilege then null; end;
  begin
    update public."ItemVariants" set stock = 999 where id = tabletest.id('teeS');
    raise exception 'FAIL member: can update ItemVariants';
  exception when insufficient_privilege then null; end;
  begin
    update public."ShopSettings" set paused = false;
    raise exception 'FAIL member: can update ShopSettings';
  exception when insufficient_privilege then null; end;
  begin
    insert into public."PointsAdjustments" (member_email) values ('forged');
    raise exception 'FAIL member: can insert PointsAdjustments';
  exception when insufficient_privilege then null; end;
  begin
    perform public.record_points_adjustment(1, 'x@ucsd.edu', 0, 1, 0, 1);
    raise exception 'FAIL member: can call record_points_adjustment directly';
  exception when insufficient_privilege then null; end;
  begin
    update public."Members" set points = 99999 where email = 'tabletest-member@ucsd.edu';
    raise exception 'FAIL member: can change own points';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- ======================================================================= Board
-- Proves: Board sees every variant and order (to run the pickup table) but not the points
-- log, and cannot write either.
set local role authenticated;
call tabletest.as_('tabletest-board@ucsd.edu');
do $$
declare
  n int;
begin
  select count(*) into n from public."ItemVariants"
    where id in (tabletest.id('teeS'), tabletest.id('teeM_off'), tabletest.id('draftV'));
  perform tabletest.assert('board: sees all variants', n = 3);
  select count(*) into n from public."ShopOrders" where id in (tabletest.id('ordMember'), tabletest.id('ordOther'));
  perform tabletest.assert('board: sees all orders', n = 2);
  begin
    update public."ShopOrders" set status = 'fulfilled' where id = tabletest.id('ordMember');
    raise exception 'FAIL board: can update ShopOrders directly';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- ======================================================================= points log
-- Proves: an Executive editing someone's points through the API writes exactly one log row
-- (who, old and new values); a change made as the owner (like check-in's SECURITY DEFINER
-- function) writes none; only Executives can read the log.
update public."Members" set points = points + 5 where email = 'tabletest-other@ucsd.edu';  -- as owner

set local role authenticated;
call tabletest.as_('tabletest-exec@ucsd.edu');
do $$
declare
  n int;
  r public."PointsAdjustments";
begin
  update public."Members" set points = 777 where email = 'tabletest-member@ucsd.edu';
  select count(*) into n from public."PointsAdjustments" where member_email like 'tabletest-%';
  perform tabletest.assert('log: exactly one row (owner change not logged)', n = 1);
  select * into r from public."PointsAdjustments" where member_email = 'tabletest-member@ucsd.edu';
  perform tabletest.assert('log: old/new points and who', r.old_points = 500 and r.new_points = 777
    and r.old_experience = 50 and r.new_experience = 50
    and r.changed_by_email = 'tabletest-exec@ucsd.edu');
  begin
    update public."ShopOrders" set status = 'cancelled' where id = tabletest.id('ordMember');
    raise exception 'FAIL exec: can update ShopOrders directly';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Now that the log has a row, prove members and Board can't read it.
set local role authenticated;
call tabletest.as_('tabletest-member@ucsd.edu');
do $$ begin
  perform tabletest.assert('member: reads no points log',
    not exists (select 1 from public."PointsAdjustments"));
end $$;
call tabletest.as_('tabletest-board@ucsd.edu');
do $$ begin
  perform tabletest.assert('board: reads no points log',
    not exists (select 1 from public."PointsAdjustments"));
end $$;
reset role;

-- ======================================================================= leaderboard
-- Proves: the leaderboard view gained `experience` and still has `points`.
do $$ begin
  if to_regclass('public."MemberLeaderboard"') is null then
    raise notice 'MemberLeaderboard not present, skipping';
  else
    perform tabletest.assert('leaderboard has experience and points', (
      select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'MemberLeaderboard'
        and column_name in ('experience', 'points')) = 2);
  end if;
end $$;

do $$ begin raise notice 'shop_tables.sql: all checks passed'; end $$;

rollback;
