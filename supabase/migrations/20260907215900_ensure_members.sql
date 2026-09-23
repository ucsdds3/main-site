-- Brownfield bootstrap so local `supabase start` (and CI) have public."Members"
-- before the sprints migration adds FKs.
--
-- No-op on Membership: that table already exists.
-- Local grants, indexes, and demo rows live in supabase/seed.sql (not pushed).

create table if not exists public."Members" (
  id bigint generated always as identity primary key,
  email text,
  full_name text,
  major text,
  date_of_birth date,
  graduation_year integer,
  gender text,
  points integer not null default 0,
  experience integer not null default 0,
  is_grad_student boolean not null default false,
  in_talent_pool boolean not null default false,
  on_mailing_list boolean not null default false,
  resume_link text,
  github_link text,
  linkedin_link text,
  other_link text,
  teams jsonb,
  admin_level text,
  profile_picture text,
  deleted boolean not null default false
);
