-- Revert 20261120120000_talentlens_schema.sql
-- Manual only on disposable DBs. Do not drop TalentLens tables on Membership prod.

drop trigger if exists talentlens_members_ingest_enqueue on public."Members";
drop function if exists public.talentlens_enqueue_on_member_change();

drop table if exists public."TalentLensFeedback";
drop table if exists public."TalentLensChunks";
drop table if exists public."TalentLensIngestJobs";
drop table if exists public."TalentLensProfiles";
drop table if exists public."TalentLensUsers";
