-- Back to the "Event Tags" enum. Fails if any event has a tag outside the enum; retag or
-- remove those first:
--   select id, tags from public."Events" where not tags <@ enum_range(null::"Event Tags")::text[];
do $$
declare
  default_tags text[];
  has_default boolean;
begin
  select column_default is not null into has_default
  from information_schema.columns
  where table_schema = 'public' and table_name = 'Events' and column_name = 'tags';

  if has_default then
    execute (
      select format('select (%s)::text[]', column_default)
      from information_schema.columns
      where table_schema = 'public' and table_name = 'Events' and column_name = 'tags'
    ) into default_tags;
    alter table public."Events" alter column tags drop default;
  end if;

  alter table public."Events"
    alter column tags type "Event Tags"[] using tags::"Event Tags"[];

  if has_default then
    execute format(
      'alter table public."Events" alter column tags set default %L::"Event Tags"[]',
      default_tags
    );
  end if;
end $$;

notify pgrst, 'reload schema';
