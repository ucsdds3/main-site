-- Attendance rating + optional feedback (event check-in)
-- Run once in Supabase (or via migration). Safe to re-run.

alter table public."Attendance"
  add column if not exists rating smallint;

alter table public."Attendance"
  add column if not exists feedback text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'attendance_rating_check'
  ) then
    alter table public."Attendance"
      add constraint attendance_rating_check
      check (rating is null or (rating >= 1 and rating <= 10));
  end if;
end $$;

comment on column public."Attendance".rating is
  'Member event rating 1–10 collected after check-in; null if not yet submitted.';

comment on column public."Attendance".feedback is
  'Optional free-text feedback collected after check-in.';

-- Member submits / updates feedback for their own attendance row.
create or replace function public.submit_attendance_feedback(
  p_event_id bigint,
  p_rating integer,
  p_feedback text default null
)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  mem_id bigint;
  updated_count integer;
begin
  if auth.uid() is null then
    return 'not_authenticated';
  end if;

  if p_rating is null or p_rating < 1 or p_rating > 10 then
    return 'invalid_rating';
  end if;

  select m.id into mem_id
  from public."Members" m
  where lower(m.email) = lower(auth.email());

  if not found then
    return 'member_not_found';
  end if;

  update public."Attendance" a
  set
    rating = p_rating,
    feedback = nullif(btrim(coalesce(p_feedback, '')), ''),
    updated_at = now()
  where a.event_id = p_event_id
    and a.member_id = mem_id;

  get diagnostics updated_count = row_count;
  if updated_count = 0 then
    return 'not_checked_in';
  end if;

  return 'ok';
end;
$$;

grant execute on function public.submit_attendance_feedback(bigint, integer, text)
  to authenticated, anon;
