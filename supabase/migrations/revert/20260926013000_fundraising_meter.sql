drop policy if exists fundraisers_delete on public."Fundraisers";
drop policy if exists fundraisers_update on public."Fundraisers";
drop policy if exists fundraisers_insert on public."Fundraisers";
drop policy if exists fundraisers_select on public."Fundraisers";
drop policy if exists fundraising_goals_delete on public."FundraisingGoals";
drop policy if exists fundraising_goals_update on public."FundraisingGoals";
drop policy if exists fundraising_goals_insert on public."FundraisingGoals";
drop policy if exists fundraising_goals_select on public."FundraisingGoals";

drop trigger if exists fundraising_goals_set_updated_at on public."FundraisingGoals";

drop table if exists public."Fundraisers";
drop table if exists public."FundraisingGoals";

notify pgrst, 'reload schema';
