-- Let events carry custom tags (e.g. "Hackathon").
--
-- On Membership, Events.tags is an array of the "Event Tags" enum (Workshop, Professional,
-- Social, Fundraiser, Other), so saving any tag the admin form's "Add custom tag" creates
-- fails with `invalid input value for enum "Event Tags"`. Store plain text instead.
--
-- Guarded: no-op where Events is missing (CI / local, created later by seed.sql) or tags is
-- already text[]. The "Event Tags" type itself is left in place.

do $$
declare
  old_default text;
  default_tags text[];
begin
  select column_default into old_default
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'Events'
    and column_name = 'tags'
    and udt_name <> '_text';

  if found then
    -- Keep any default as a plain text literal (e.g. '{Other}'::"Event Tags"[] → '{Other}').
    if old_default is not null then
      execute format('select (%s)::text[]', old_default) into default_tags;
      alter table public."Events" alter column tags drop default;
    end if;

    alter table public."Events" alter column tags type text[] using tags::text[];

    if old_default is not null then
      execute format(
        'alter table public."Events" alter column tags set default %L::text[]',
        default_tags
      );
    end if;

    -- Insights reads tags through this RPC; fail (and roll back) here rather than on the page.
    if to_regprocedure('public.get_event_tag_percents()') is not null then
      perform * from public.get_event_tag_percents();
    end if;
  end if;
end $$;

notify pgrst, 'reload schema';
