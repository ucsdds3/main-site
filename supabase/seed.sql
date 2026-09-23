-- Local only (`supabase start` / `db reset`). Never applied by `db push`.

grant select, insert, update on public."Members" to anon, authenticated;

do $$
begin
  execute 'grant usage, select on sequence public."Members_id_seq" to anon, authenticated';
exception
  when undefined_table then
    null;
end $$;

create unique index if not exists members_email_lower_idx
  on public."Members" (lower(email));

insert into public."Members" (
  email,
  full_name,
  major,
  graduation_year,
  gender,
  points,
  experience,
  admin_level,
  teams,
  deleted
)
values
  ('exec@ucsd.edu', 'Local Executive', 'Data Science', 2027, 'Prefer not to say', 120, 12, 'Executive', '{"Executive": "President", "Software": "Member"}'::jsonb, false),
  ('board@ucsd.edu', 'Sam Rivera', 'Computer Science', 2027, 'Prefer not to say', 80, 8, 'Board', '{"Professional Events": "Director"}'::jsonb, false),
  ('alex.kim@ucsd.edu', 'Alex Kim', 'Data Science', 2026, 'Prefer not to say', 60, 6, 'Board', '{"Software": "Director"}'::jsonb, false),
  ('priya.shah@ucsd.edu', 'Priya Shah', 'Math-CS', 2027, 'Prefer not to say', 40, 4, 'Board', '{"Software": "Member"}'::jsonb, false),
  ('jordan.patel@ucsd.edu', 'Jordan Patel', 'Communication', 2026, 'Prefer not to say', 55, 5, 'Board', '{"Marketing": "Director"}'::jsonb, false),
  ('nico.brandt@ucsd.edu', 'Nico Brandt', 'Data Science', 2028, 'Prefer not to say', 25, 3, 'Board', '{"Marketing": "Member"}'::jsonb, false),
  ('casey.nguyen@ucsd.edu', 'Casey Nguyen', 'Computer Science', 2026, 'Prefer not to say', 70, 7, 'Board', '{"Workshops": "Director"}'::jsonb, false),
  ('morgan.lee@ucsd.edu', 'Morgan Lee', 'Cognitive Science', 2027, 'Prefer not to say', 45, 4, 'Board', '{"Social Events": "Director"}'::jsonb, false),
  ('riley.chen@ucsd.edu', 'Riley Chen', 'Data Science', 2026, 'Prefer not to say', 50, 5, 'Board', '{"Projects": "Director"}'::jsonb, false),
  ('avery.singh@ucsd.edu', 'Avery Singh', 'Economics', 2026, 'Prefer not to say', 35, 3, 'Board', '{"Finance": "Director"}'::jsonb, false),
  ('quinn.park@ucsd.edu', 'Quinn Park', 'International Studies', 2027, 'Prefer not to say', 30, 3, 'Board', '{"External": "Director"}'::jsonb, false),
  ('taylor.brooks@ucsd.edu', 'Taylor Brooks', 'Political Science', 2026, 'Prefer not to say', 28, 3, 'Board', '{"Internal": "Director"}'::jsonb, false),
  ('jamie.ortiz@ucsd.edu', 'Jamie Ortiz', 'Data Science', 2027, 'Prefer not to say', 42, 4, 'Board', '{"Consulting": "Director"}'::jsonb, false),
  ('drew.wallace@ucsd.edu', 'Drew Wallace', 'ICAM', 2028, 'Prefer not to say', 22, 2, 'Board', '{"Online Content": "Director"}'::jsonb, false),
  ('skylar.adams@ucsd.edu', 'Skylar Adams', 'Computer Science', 2026, 'Prefer not to say', 38, 4, 'Board', '{"DataHacks": "Director"}'::jsonb, false),
  ('mina.cole@ucsd.edu', 'Mina Cole', 'Data Science', 2028, 'Prefer not to say', 15, 2, 'Member', null, false),
  ('luis.mendez@ucsd.edu', 'Luis Mendez', 'Math-CS', 2029, 'Prefer not to say', 10, 1, 'Member', null, false)
on conflict ((lower(email))) do update
  set
    full_name = excluded.full_name,
    admin_level = excluded.admin_level,
    teams = excluded.teams,
    points = excluded.points,
    experience = excluded.experience,
    deleted = false;

-- Public calendar + check-in (local stub of prod tables; IF NOT EXISTS so this never
-- fights Membership if someone mistakenly runs seed there).
create table if not exists public."Events" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  description text,
  points integer not null default 0,
  image text,
  deleted boolean not null default false,
  password text not null default '',
  start timestamptz,
  "end" timestamptz,
  temp_end timestamptz,
  location text,
  tags text[],
  workflow_status text not null default 'complete',
  internal_notes text
);

create unique index if not exists events_name_uidx on public."Events" (name);

create table if not exists public."Attendance" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  check_in timestamptz not null default now(),
  member_id bigint not null references public."Members"(id) on delete cascade,
  event_id bigint not null references public."Events"(id) on delete cascade,
  points integer
);

create unique index if not exists attendance_member_event_uidx
  on public."Attendance" (member_id, event_id);

create table if not exists public."Items" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  description text,
  price numeric(8, 2) not null default 0,
  image text,
  deleted boolean not null default false
);

create unique index if not exists items_name_uidx on public."Items" (name);

grant select on public."Events" to anon, authenticated;
grant select, insert, update on public."Attendance" to authenticated;
grant select on public."Items" to anon, authenticated;
grant select, insert, update, delete on public."Events" to authenticated;
grant select, insert, update, delete on public."Items" to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

insert into public."Events" (
  name, description, points, image, password, start, "end", location, tags, workflow_status, deleted
)
values
  (
    'Fall Kickoff GBM',
    'Welcome back GBM: committee intros, fall calendar, and free pizza.',
    10,
    '/GetInvolved/pf-events-img.webp',
    'FALLGBM',
    date_trunc('hour', now()) - interval '14 days',
    date_trunc('hour', now()) - interval '14 days' + interval '2 hours',
    'PC Ballroom East',
    array['Social'],
    'complete',
    false
  ),
  (
    'Intro to pandas workshop',
    'Hands-on workshop covering DataFrames, groupby, and a small Kaggle-style exercise.',
    8,
    '/GetInvolved/workshop-img.webp',
    'PANDAS',
    date_trunc('hour', now()) - interval '8 days',
    date_trunc('hour', now()) - interval '8 days' + interval '90 minutes',
    'CSE 1202',
    array['Workshop'],
    'complete',
    false
  ),
  (
    'Amazon industry night',
    'Recruiters and DS3 alumni from Amazon. Bring a resume.',
    15,
    '/Events/professional-photo-amazon.png',
    'AMAZON',
    date_trunc('hour', now()) - interval '3 days',
    date_trunc('hour', now()) - interval '3 days' + interval '2 hours',
    'CSE 1242',
    array['Professional'],
    'complete',
    false
  ),
  (
    'LeetCode night',
    'Casual problem-solving hour. Check in with code LEETCODE while the event is open.',
    5,
    '/GetInvolved/projects-img.webp',
    'LEETCODE',
    date_trunc('hour', now()) - interval '1 hour',
    date_trunc('hour', now()) + interval '3 hours',
    'Geisel 2nd floor',
    array['Workshop'],
    'complete',
    false
  ),
  (
    'Palantir tech talk',
    'Upcoming: Foundry overview and intern Q&A.',
    12,
    '/Events/professional-photo-intern-panel.png',
    'PALANTIR',
    date_trunc('hour', now()) + interval '5 days',
    date_trunc('hour', now()) + interval '5 days' + interval '90 minutes',
    'Qualcomm Room, Jacobs Hall',
    array['Professional'],
    'complete',
    false
  ),
  (
    'Beach bonfire',
    'Social hang at La Jolla Shores. Transit details in the Discord.',
    6,
    '/GetInvolved/pf-events-img.webp',
    'BONFIRE',
    date_trunc('hour', now()) + interval '10 days',
    date_trunc('hour', now()) + interval '10 days' + interval '3 hours',
    'La Jolla Shores',
    array['Social'],
    'complete',
    false
  ),
  (
    'Consulting info session',
    'How the consulting program works this year and how to apply.',
    8,
    '/Consulting/consulting_pic_2.JPG',
    'CONSULT',
    date_trunc('hour', now()) - interval '10 days',
    date_trunc('hour', now()) - interval '10 days' + interval '1 hour',
    'Zoom (see Discord)',
    array['Professional'],
    'complete',
    false
  ),
  (
    'Budget sync (draft)',
    'Internal finance draft — should not appear on the public calendar.',
    0,
    null,
    'DRAFT',
    date_trunc('hour', now()) + interval '2 days',
    date_trunc('hour', now()) + interval '2 days' + interval '1 hour',
    'Board Slack huddle',
    array['Internal'],
    'none',
    false
  )
on conflict (name) do update
  set
    description = excluded.description,
    points = excluded.points,
    image = excluded.image,
    password = excluded.password,
    start = excluded.start,
    "end" = excluded."end",
    location = excluded.location,
    tags = excluded.tags,
    workflow_status = excluded.workflow_status,
    deleted = false;

insert into public."Items" (name, description, price, deleted)
values
  ('DS3 Sticker pack', 'Laptop pack. Dummy merch for the local store table.', 3.00, false),
  ('DS3 Hoodie', 'Dummy merch. Not a real checkout.', 35.00, false)
on conflict (name) do update
  set description = excluded.description, price = excluded.price, deleted = false;

insert into public."Attendance" (member_id, event_id, check_in, points)
select m.id, e.id, e.start + interval '10 minutes', e.points
from public."Members" m
cross join public."Events" e
where e.workflow_status = 'complete'
  and e.start < now()
  and e.name <> 'LeetCode night'
  and m.email in (
    'exec@ucsd.edu',
    'board@ucsd.edu',
    'alex.kim@ucsd.edu',
    'mina.cole@ucsd.edu'
  )
on conflict (member_id, event_id) do nothing;

insert into public."Sprints" (name, starts_on, ends_on, status, created_by)
select
  'Local test sprint',
  current_date - 3,
  current_date + 11,
  'active',
  m.id
from public."Members" m
where m.email = 'exec@ucsd.edu'
  and not exists (select 1 from public."Sprints" s where s.status = 'active');

insert into public."Sprints" (name, starts_on, ends_on, status, created_by)
select
  'Next planning sprint',
  current_date + 12,
  current_date + 25,
  'planning',
  m.id
from public."Members" m
where m.email = 'exec@ucsd.edu'
  and not exists (select 1 from public."Sprints" s where s.status = 'planning');

insert into public."SprintTasks" (
  sprint_id,
  team_key,
  title,
  description,
  expected_hours,
  actual_hours,
  status,
  created_by,
  reviewer_id,
  relevant_url,
  review_approved,
  review_comment,
  reviewed_at,
  completed_at,
  expected_completion_on
)
select
  s.id,
  t.team_key,
  t.title,
  t.description,
  t.expected_hours,
  case when t.status in ('pending_review', 'done') then t.expected_hours else null end,
  t.status,
  creator.id,
  reviewer.id,
  t.relevant_url,
  t.review_approved,
  t.review_comment,
  case when t.review_approved then now() else null end,
  case when t.status = 'done' then now() - interval '2 days' else null end,
  case
    when t.status = 'done' then s.starts_on + 2
    when t.status = 'pending_review' then s.starts_on + 5
    else s.ends_on
  end
from public."Sprints" s
join public."Members" creator on creator.email = 'exec@ucsd.edu'
cross join (
  values
    (
      'SOFTWARE',
      'Wire local sprint board',
      'Confirm columns, filters, and task modal against a fake sprint.',
      3::numeric,
      'in_progress',
      'https://github.com/ucsdds3/main-site/issues/1',
      false,
      null::text,
      'alex.kim@ucsd.edu'
    ),
    (
      'PROFESSIONAL_EVENTS',
      'Draft speaker outreach list',
      'Sample task so the Professional Events tab is not empty.',
      2::numeric,
      'pending_review',
      null::text,
      false,
      null::text,
      'board@ucsd.edu'
    ),
    (
      'MARKETING',
      'Post board-sprint recap graphic',
      'Sample done card after reviewer approval.',
      1::numeric,
      'done',
      null::text,
      true,
      'Looks good — posting this week.',
      'jordan.patel@ucsd.edu'
    ),
    (
      'INTERNAL',
      'Book GBM classroom for week 3',
      'Reserve PC East and send the confirmation screenshot to Internal.',
      1::numeric,
      'todo',
      null::text,
      false,
      null::text,
      'taylor.brooks@ucsd.edu'
    ),
    (
      'WORKSHOPS',
      'Finish Git cheat sheet slides',
      'Short deck for the Sunday workshop; include the clone/commit/push loop.',
      4::numeric,
      'pending_review',
      'https://github.com/ucsdds3/main-site/issues/2',
      false,
      null::text,
      'casey.nguyen@ucsd.edu'
    ),
    (
      'SOCIAL_EVENTS',
      'Confirm bonfire permits',
      'Check fire rules for La Jolla Shores and post the packing list in Discord.',
      2::numeric,
      'todo',
      null::text,
      false,
      null::text,
      'morgan.lee@ucsd.edu'
    ),
    (
      'PROJECTS',
      'Match mentees to project leads',
      'Pair the waitlist with the three active quarterly projects.',
      3::numeric,
      'in_progress',
      null::text,
      false,
      null::text,
      'riley.chen@ucsd.edu'
    ),
    (
      'FINANCE',
      'Submit pizza reimbursement',
      'GBM1 receipts plus the Venmo export. Flag if anything is missing a tax line.',
      1::numeric,
      'in_progress',
      null::text,
      false,
      null::text,
      'avery.singh@ucsd.edu'
    ),
    (
      'EXTERNAL',
      'Send Palantir one-pager',
      'One page: audience size, past events, and what we need from their recruiter.',
      2::numeric,
      'todo',
      null::text,
      false,
      null::text,
      'quinn.park@ucsd.edu'
    ),
    (
      'CONSULTING',
      'Revise client kickoff deck',
      'Trim the timeline slide and add the data-access checklist for the new client.',
      3::numeric,
      'pending_review',
      null::text,
      false,
      null::text,
      'jamie.ortiz@ucsd.edu'
    ),
    (
      'ONLINE_CONTENT',
      'Draft October newsletter',
      'GBM recap, workshop clip, and a call for DataHacks mentors. Keep it under 400 words.',
      2::numeric,
      'todo',
      null::text,
      false,
      null::text,
      'drew.wallace@ucsd.edu'
    ),
    (
      'DATAHACKS',
      'Hold Price Center rooms',
      'Weekend block for opening ceremony plus judging. Screenshot the reservation.',
      2::numeric,
      'todo',
      null::text,
      false,
      null::text,
      'skylar.adams@ucsd.edu'
    ),
    (
      'EXECUTIVE',
      'Write week-3 board agenda',
      'Sprint check-in, DataHacks date lock, and a 10-minute finance buffer.',
      1::numeric,
      'todo',
      null::text,
      false,
      null::text,
      'exec@ucsd.edu'
    )
) as t(
  team_key,
  title,
  description,
  expected_hours,
  status,
  relevant_url,
  review_approved,
  review_comment,
  reviewer_email
)
join public."Members" reviewer on reviewer.email = t.reviewer_email
where s.name = 'Local test sprint'
  and not exists (
    select 1 from public."SprintTasks" x where x.sprint_id = s.id and x.title = t.title
  );

insert into public."SprintTaskAssignees" (task_id, member_id)
select t.id, m.id
from public."SprintTasks" t
join public."Sprints" s on s.id = t.sprint_id
join (
  values
    ('Wire local sprint board', 'priya.shah@ucsd.edu'),
    ('Wire local sprint board', 'alex.kim@ucsd.edu'),
    ('Draft speaker outreach list', 'board@ucsd.edu'),
    ('Post board-sprint recap graphic', 'nico.brandt@ucsd.edu'),
    ('Book GBM classroom for week 3', 'taylor.brooks@ucsd.edu'),
    ('Finish Git cheat sheet slides', 'casey.nguyen@ucsd.edu'),
    ('Confirm bonfire permits', 'morgan.lee@ucsd.edu'),
    ('Match mentees to project leads', 'riley.chen@ucsd.edu'),
    ('Submit pizza reimbursement', 'avery.singh@ucsd.edu'),
    ('Send Palantir one-pager', 'quinn.park@ucsd.edu'),
    ('Revise client kickoff deck', 'jamie.ortiz@ucsd.edu'),
    ('Draft October newsletter', 'drew.wallace@ucsd.edu'),
    ('Hold Price Center rooms', 'skylar.adams@ucsd.edu'),
    ('Write week-3 board agenda', 'exec@ucsd.edu')
) as a(title, email) on a.title = t.title
join public."Members" m on m.email = a.email
where s.name = 'Local test sprint'
on conflict do nothing;

insert into public."SprintTasks" (
  sprint_id,
  team_key,
  title,
  description,
  expected_hours,
  actual_hours,
  status,
  created_by,
  reviewer_id,
  relevant_url,
  review_approved,
  completed_at,
  expected_completion_on
)
select
  s.id,
  'EXECUTIVE',
  'Follow up on open item ' || g,
  'Placeholder card so the To do column exercises Show more on a full board.',
  1,
  null,
  'todo',
  creator.id,
  creator.id,
  null,
  false,
  null,
  s.ends_on
from public."Sprints" s
join public."Members" creator on creator.email = 'exec@ucsd.edu'
cross join generate_series(1, 8) as g
where s.name = 'Local test sprint'
  and not exists (
    select 1 from public."SprintTasks" x
    where x.sprint_id = s.id and x.title = 'Follow up on open item ' || g
  );

insert into public."SprintTaskAssignees" (task_id, member_id)
select t.id, m.id
from public."SprintTasks" t
join public."Sprints" s on s.id = t.sprint_id
join public."Members" m on m.email = 'exec@ucsd.edu'
where s.name = 'Local test sprint'
  and t.title like 'Follow up on open item %'
on conflict do nothing;

insert into public."SprintTasks" (
  sprint_id,
  team_key,
  title,
  description,
  expected_hours,
  actual_hours,
  status,
  created_by,
  reviewer_id,
  relevant_url,
  review_approved,
  reviewed_at,
  completed_at,
  expected_completion_on
)
select
  s.id,
  'SOFTWARE',
  'Ship retro note ' || g,
  'Completed sample work so the sprint pulse chart has a trend.',
  1,
  1,
  'done',
  creator.id,
  creator.id,
  null,
  true,
  now() - (g::text || ' days')::interval,
  now() - (g::text || ' days')::interval,
  s.starts_on + g
from public."Sprints" s
join public."Members" creator on creator.email = 'exec@ucsd.edu'
cross join generate_series(1, 3) as g
where s.name = 'Local test sprint'
  and not exists (
    select 1 from public."SprintTasks" x
    where x.sprint_id = s.id and x.title = 'Ship retro note ' || g
  );

insert into public."SprintTaskAssignees" (task_id, member_id)
select t.id, m.id
from public."SprintTasks" t
join public."Sprints" s on s.id = t.sprint_id
join public."Members" m on m.email = 'alex.kim@ucsd.edu'
where s.name = 'Local test sprint'
  and t.title like 'Ship retro note %'
on conflict do nothing;

insert into public."SprintTaskSprints" (task_id, sprint_id)
select t.id, t.sprint_id
from public."SprintTasks" t
on conflict do nothing;

create or replace function public.get_my_attendance()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select json_agg(row_to_json(x))
      from (
        select
          e.name,
          e.description,
          e.points::text as points,
          e.image,
          e.start,
          e."end",
          e.location,
          e.tags,
          a.check_in as attended_at
        from public."Attendance" a
        join public."Events" e on e.id = a.event_id
        join public."Members" m on m.id = a.member_id
        where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        order by a.check_in desc
      ) x
    ),
    '[]'::json
  );
$$;

create or replace function public.validate_event_code(event_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  ev public."Events"%rowtype;
  mid bigint;
  viewer text;
begin
  viewer := lower(coalesce(auth.jwt() ->> 'email', ''));
  if viewer = '' then
    return 'not_authenticated';
  end if;

  select m.id into mid
  from public."Members" m
  where lower(m.email) = viewer
    and coalesce(m.deleted, false) = false
  limit 1;
  if mid is null then
    return 'member_not_found';
  end if;

  select * into ev
  from public."Events" e
  where e.password = event_code
    and coalesce(e.deleted, false) = false
  limit 1;
  if ev.id is null then
    return 'invalid_event';
  end if;

  if ev.start is not null and ev.start > now() then
    return 'event_not_started';
  end if;
  if ev."end" is not null and ev."end" < now() then
    return 'event_expired';
  end if;

  if exists (
    select 1 from public."Attendance" a
    where a.member_id = mid and a.event_id = ev.id
  ) then
    return 'already_registered';
  end if;

  insert into public."Attendance" (member_id, event_id, check_in, points)
  values (mid, ev.id, now(), ev.points);

  update public."Members"
    set points = points + coalesce(ev.points, 0),
        experience = experience + coalesce(ev.points, 0)
    where id = mid;

  return 'registered';
end;
$$;

grant execute on function public.get_my_attendance() to authenticated, anon;
grant execute on function public.validate_event_code(text) to authenticated, anon;

notify pgrst, 'reload schema';
