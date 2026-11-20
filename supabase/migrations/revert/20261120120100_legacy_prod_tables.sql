-- Revert 20261120120100_legacy_prod_tables.sql
-- Manual only on disposable DBs. Do not drop these on Membership prod.

drop table if exists public."DispenseEvents";
drop table if exists public."CoffeeInventory";
drop table if exists public."Purchases";
drop table if exists public."TeamMember";
drop table if exists public."ApplicationSubmission";
drop table if exists public."ApplicationQuestion";
drop table if exists public."FormQuestion";

-- Enums left in place (may be referenced elsewhere); drop manually if unused.
