-- Quarterly fundraising goals + individual fundraiser results.
-- Board/Exec read; Executive write.
-- Revert: revert/20260926013000_fundraising_meter.sql

do $$
declare
  member_id_type text;
begin
  select format_type(a.atttypid, a.atttypmod)
    into member_id_type
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'Members'
    and a.attname = 'id'
    and a.attnum > 0
    and not a.attisdropped;

  if member_id_type is null then
    raise exception 'public."Members".id not found';
  end if;

  execute format($f$
    create table if not exists public."FundraisingGoals" (
      id %1$s generated always as identity primary key,
      quarter_key text not null,
      goal_amount numeric(12, 2) not null,
      created_by %1$s not null references public."Members"(id),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      constraint fundraising_goals_quarter_key_check
        check (quarter_key ~ '^(FA|WI|SP|SU)[0-9]{2}$'),
      constraint fundraising_goals_amount_check check (goal_amount > 0),
      constraint fundraising_goals_quarter_key_unique unique (quarter_key)
    )
  $f$, member_id_type);

  execute format($f$
    create table if not exists public."Fundraisers" (
      id %1$s generated always as identity primary key,
      goal_id %1$s not null references public."FundraisingGoals"(id) on delete cascade,
      held_on date not null,
      place text not null,
      amount numeric(12, 2) not null,
      color text not null,
      created_by %1$s not null references public."Members"(id),
      created_at timestamptz not null default now(),
      constraint fundraisers_place_check check (length(btrim(place)) between 1 and 80),
      constraint fundraisers_amount_check check (amount > 0),
      constraint fundraisers_color_check check (color ~ '^#[0-9A-Fa-f]{6}$')
    )
  $f$, member_id_type);
end $$;

create index if not exists fundraisers_goal_id_idx
  on public."Fundraisers" (goal_id);

create index if not exists fundraisers_held_on_idx
  on public."Fundraisers" (held_on);

comment on table public."FundraisingGoals" is
  'One fundraising dollar goal per academic quarter (FA26, WI27, …).';
comment on table public."Fundraisers" is
  'Individual fundraiser results counted toward a quarterly goal.';

drop trigger if exists fundraising_goals_set_updated_at on public."FundraisingGoals";
create trigger fundraising_goals_set_updated_at
  before update on public."FundraisingGoals"
  for each row execute function public.set_updated_at();

alter table public."FundraisingGoals" enable row level security;
alter table public."Fundraisers" enable row level security;

drop policy if exists fundraising_goals_select on public."FundraisingGoals";
create policy fundraising_goals_select on public."FundraisingGoals"
  for select to authenticated
  using (public.is_board_or_exec());

drop policy if exists fundraising_goals_insert on public."FundraisingGoals";
create policy fundraising_goals_insert on public."FundraisingGoals"
  for insert to authenticated
  with check (public.is_executive());

drop policy if exists fundraising_goals_update on public."FundraisingGoals";
create policy fundraising_goals_update on public."FundraisingGoals"
  for update to authenticated
  using (public.is_executive())
  with check (public.is_executive());

drop policy if exists fundraising_goals_delete on public."FundraisingGoals";
create policy fundraising_goals_delete on public."FundraisingGoals"
  for delete to authenticated
  using (public.is_executive());

drop policy if exists fundraisers_select on public."Fundraisers";
create policy fundraisers_select on public."Fundraisers"
  for select to authenticated
  using (public.is_board_or_exec());

drop policy if exists fundraisers_insert on public."Fundraisers";
create policy fundraisers_insert on public."Fundraisers"
  for insert to authenticated
  with check (public.is_executive());

drop policy if exists fundraisers_update on public."Fundraisers";
create policy fundraisers_update on public."Fundraisers"
  for update to authenticated
  using (public.is_executive())
  with check (public.is_executive());

drop policy if exists fundraisers_delete on public."Fundraisers";
create policy fundraisers_delete on public."Fundraisers"
  for delete to authenticated
  using (public.is_executive());

grant select, insert, update, delete on public."FundraisingGoals" to authenticated;
grant select, insert, update, delete on public."Fundraisers" to authenticated;

do $$
declare
  seq text;
begin
  seq := pg_get_serial_sequence('public."FundraisingGoals"', 'id');
  if seq is not null then
    execute format('grant usage, select on sequence %s to authenticated', seq);
  end if;
  seq := pg_get_serial_sequence('public."Fundraisers"', 'id');
  if seq is not null then
    execute format('grant usage, select on sequence %s to authenticated', seq);
  end if;
end $$;

notify pgrst, 'reload schema';
