-- Ordered members for the main site "Where We Are" slideshow.
-- Card content is read from Members via member_id (not stored here).

create table if not exists public."WhereWeAre" (
  member_id bigint primary key references public."Members" (id) on delete cascade,
  order_number integer not null unique check (order_number >= 0)
);

create index if not exists where_we_are_order_number_idx on public."WhereWeAre" (order_number);

alter table public."WhereWeAre" enable row level security;

-- Public read (anon + authenticated) for main site
create policy "WhereWeAre public read"
  on public."WhereWeAre"
  for select
  to anon, authenticated
  using (true);

-- Board / Executive can manage ordering
create policy "WhereWeAre board insert"
  on public."WhereWeAre"
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public."Members" m
      where lower(m.email) = lower(auth.jwt() ->> 'email')
        and m.admin_level in ('Board', 'Executive')
        and coalesce(m.deleted, false) = false
    )
  );

create policy "WhereWeAre board update"
  on public."WhereWeAre"
  for update
  to authenticated
  using (
    exists (
      select 1
      from public."Members" m
      where lower(m.email) = lower(auth.jwt() ->> 'email')
        and m.admin_level in ('Board', 'Executive')
        and coalesce(m.deleted, false) = false
    )
  );

create policy "WhereWeAre board delete"
  on public."WhereWeAre"
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public."Members" m
      where lower(m.email) = lower(auth.jwt() ->> 'email')
        and m.admin_level in ('Board', 'Executive')
        and coalesce(m.deleted, false) = false
    )
  );
