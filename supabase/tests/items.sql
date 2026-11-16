-- Items tests (lock-down + shop columns + ShopItems view).
-- Plain SQL: run with `psql -v ON_ERROR_STOP=1 -f supabase/tests/items.sql`.
--
-- How it works (for readers new to SQL tests):
--   * The whole file is one transaction that ends in ROLLBACK, so it leaves no data behind.
--   * `set local role authenticated` + a fake login email is what Supabase's API does for a
--     signed-in user; `set local role anon` is a signed-out visitor; `reset role` goes back to
--     the table owner (who ignores access rules) to set things up.
--   * A wrong behaviour raises 'FAIL <case>', which stops the run (ON_ERROR_STOP).
--   * "Permission denied" cases use begin ... exception when insufficient_privilege.

begin;

-- ======================================================================= helpers
create schema itemtest;
grant usage on schema itemtest to public;

-- Pretend to be a signed-in user (null email = signed out). Lasts until end of transaction.
create procedure itemtest.as_(p_email text)
language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    case when p_email is null then '' else json_build_object('email', p_email)::text end, true);
end $$;

create function itemtest.assert(p_label text, p_ok boolean) returns void
language plpgsql as $$
begin
  if p_ok is not true then raise exception 'FAIL %', p_label; end if;
end $$;

-- ======================================================================= fixtures
insert into public."Members" (email, full_name, admin_level, deleted) values
  ('itemtest-exec@ucsd.edu',   'IT Exec',   'Executive', false),
  ('itemtest-board@ucsd.edu',  'IT Board',  'Board',     false),
  ('itemtest-member@ucsd.edu', 'IT Member', 'Member',    false);

insert into public."Items" (name, price, points_cost, active, deleted) values
  ('Itemtest live',     12.50, 40, true,  false),
  ('Itemtest draft',    20.00, 60, false, false),
  ('Itemtest archived',  5.00, 10, true,  true);

-- ======================================================================= backfill
-- Proves: rows that existed before the migration got a valid unique slug and stay switched
-- off (CI's stub rows 'DS3 Hoodie' / 'DS3 hoodie!' both derive "ds3-hoodie").
do $$
declare
  n int;
begin
  select count(*) into n from public."Items" where slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$';
  perform itemtest.assert('backfill: every slug is well formed', n = 0);

  select count(*) into n from public."Items" where description = 'Old merch row' or name = 'DS3 hoodie!';
  if n = 0 then
    raise notice 'backfill: CI stub items not present (local db), skipping old-row checks';
  else
    select count(distinct slug) into n from public."Items"
      where (description = 'Old merch row' or name = 'DS3 hoodie!') and slug like 'ds3-hoodie%';
    perform itemtest.assert('backfill: colliding names got distinct slugs from the name', n = 2);
    select count(*) into n from public."Items"
      where (description = 'Old merch row' or name = 'DS3 hoodie!') and active;
    perform itemtest.assert('backfill: old items stay switched off', n = 0);
  end if;
end $$;

-- ======================================================================= slug
-- Proves: a blank slug is filled from the name, and the trigger keeps counting when
-- "<slug>-<id>" is itself taken (e.g. items named "Hoodie", "Hoodie 3", "Hoodie").
do $$
declare
  v bigint;
  s text;
begin
  select slug into s from public."Items" where name = 'Itemtest live';
  perform itemtest.assert('slug: filled from the name', s = 'itemtest-live');

  -- Peek at the id sequence: the next three inserts get ids v+1, v+2, v+3.
  v := nextval(pg_get_serial_sequence('public."Items"', 'id'));
  insert into public."Items" (name, slug) values ('Itemtest coll blocker', 'itemtest-coll-' || (v + 3));
  insert into public."Items" (name) values ('Itemtest Coll');
  insert into public."Items" (name) values ('Itemtest coll!') returning slug into s;
  perform itemtest.assert('slug: second collision gets a counter', s = 'itemtest-coll-' || (v + 3) || '-2');

  begin
    insert into public."Items" (name, slug) values ('Itemtest bad slug', 'Not A Slug');
    raise exception 'FAIL slug: malformed slug accepted';
  exception when check_violation then null; end;
end $$;

-- ======================================================================= Items table: signed out
-- Proves: signed-out visitors cannot touch the Items table at all.
set local role anon;
call itemtest.as_(null);
do $$ begin
  begin
    perform count(*) from public."Items";
    raise exception 'FAIL anon: can read Items';
  exception when insufficient_privilege then null; end;
  begin
    insert into public."Items" (name) values ('Itemtest anon');
    raise exception 'FAIL anon: can insert Items';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- ======================================================================= Items table: member
-- Proves: a regular member reads no Items rows directly (they use ShopItems) and cannot write.
set local role authenticated;
call itemtest.as_('itemtest-member@ucsd.edu');
do $$
declare
  n int;
begin
  select count(*) into n from public."Items";
  perform itemtest.assert('member: reads no Items rows', n = 0);
  begin
    insert into public."Items" (name) values ('Itemtest by member');
    raise exception 'FAIL member: can insert Items';
  exception when insufficient_privilege then null; end;
  update public."Items" set points_cost = 0 where name = 'Itemtest live';
  get diagnostics n = row_count;
  perform itemtest.assert('member: update changes nothing', n = 0);
  begin
    delete from public."Items" where name = 'Itemtest live';
    raise exception 'FAIL member: can delete Items';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- ======================================================================= Items table: Board
-- Proves: Board reads every row (including drafts, archived rows and the dollar price) but
-- cannot write.
set local role authenticated;
call itemtest.as_('itemtest-board@ucsd.edu');
do $$
declare
  n int;
  p numeric;
begin
  select count(*) into n from public."Items" where name like 'Itemtest %';
  perform itemtest.assert('board: reads all test items', n >= 3);
  select price into p from public."Items" where name = 'Itemtest draft';
  perform itemtest.assert('board: reads the dollar price', p = 20.00);
  begin
    insert into public."Items" (name) values ('Itemtest by board');
    raise exception 'FAIL board: can insert Items';
  exception when insufficient_privilege then null; end;
  update public."Items" set points_cost = 0 where name = 'Itemtest live';
  get diagnostics n = row_count;
  perform itemtest.assert('board: update changes nothing', n = 0);
end $$;
reset role;

-- ======================================================================= Items table: Executive
-- Proves: Executives read, insert (slug filled in) and update, but cannot hard-delete.
set local role authenticated;
call itemtest.as_('itemtest-exec@ucsd.edu');
do $$
declare
  n int;
  s text;
begin
  insert into public."Items" (name, price) values ('Itemtest by exec', 9.99) returning slug into s;
  perform itemtest.assert('exec: insert gets a slug', s = 'itemtest-by-exec');
  update public."Items" set points_cost = 45, price = 13.00 where name = 'Itemtest live';
  get diagnostics n = row_count;
  perform itemtest.assert('exec: update works', n = 1);
  begin
    delete from public."Items" where name = 'Itemtest by exec';
    raise exception 'FAIL exec: can hard-delete Items';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- ======================================================================= ShopItems view
-- Proves: the view lists only live items (switched on, not archived), has no dollar price,
-- is readable signed in or out, and cannot be written through.
do $$ begin
  perform itemtest.assert('view: no price column', not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ShopItems' and column_name in ('price', 'deleted')));
  perform itemtest.assert('view: security_barrier on, security_invoker off', exists (
    select 1 from pg_class
    where oid = 'public."ShopItems"'::regclass
      and 'security_barrier=true' = any (reloptions)
      and not ('security_invoker=true' = any (coalesce(reloptions, '{}')))));
end $$;

set local role anon;
call itemtest.as_(null);
do $$
declare
  names text;
begin
  select string_agg(name, ',' order by name) into names
  from public."ShopItems" where name like 'Itemtest %';
  perform itemtest.assert('view as anon: only the live item', names = 'Itemtest live');
  begin
    update public."ShopItems" set points_cost = 0 where name = 'Itemtest live';
    raise exception 'FAIL view: anon can update through ShopItems';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

set local role authenticated;
call itemtest.as_('itemtest-member@ucsd.edu');
do $$
declare
  names text;
  cost int;
begin
  select string_agg(name, ',' order by name), max(points_cost) into names, cost
  from public."ShopItems" where name like 'Itemtest %';
  perform itemtest.assert('view as member: only the live item', names = 'Itemtest live');
  perform itemtest.assert('view as member: sees the Exec''s new points cost', cost = 45);
  begin
    insert into public."ShopItems" (name) values ('Itemtest via view');
    raise exception 'FAIL view: member can insert through ShopItems';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

do $$ begin raise notice 'items.sql: all checks passed'; end $$;

rollback;
