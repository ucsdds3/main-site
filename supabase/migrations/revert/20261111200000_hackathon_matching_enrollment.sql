drop policy if exists matching_participations_delete on public.matching_participations;
drop policy if exists matching_participations_update on public.matching_participations;
drop policy if exists matching_participations_insert on public.matching_participations;
drop policy if exists matching_participations_select on public.matching_participations;

drop policy if exists matching_resume_artifacts_delete on public.matching_resume_artifacts;
drop policy if exists matching_resume_artifacts_update on public.matching_resume_artifacts;
drop policy if exists matching_resume_artifacts_insert on public.matching_resume_artifacts;
drop policy if exists matching_resume_artifacts_select on public.matching_resume_artifacts;

drop policy if exists matching_events_select on public.matching_events;

drop trigger if exists matching_participations_set_updated_at on public.matching_participations;
drop trigger if exists matching_resume_artifacts_set_updated_at on public.matching_resume_artifacts;
drop trigger if exists matching_events_set_updated_at on public.matching_events;

drop table if exists public.matching_participations;
drop table if exists public.matching_resume_artifacts;
drop table if exists public.matching_events;

notify pgrst, 'reload schema';
