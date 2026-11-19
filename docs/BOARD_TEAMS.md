/**
 * BoardTeams catalog — admin-managed committees for /board.
 *
 * Setup: `BoardTeams` is created by migration `20260923200141_board_teams_catalog`.
 * Memberships live in `TeamMember` (member_id → Members, team_id → BoardTeams, title).
 * `BoardMembers` aggregates `team_roles` from that join for the public /board page.
 *
 * - **Admin** → table `BoardTeams`: add / edit / soft-delete committees (label, description, sort order).
 * - **Members** edit card: team dropdown loads from active BoardTeams; saves to `TeamMember`.
 * - **Public /board**: tabs = catalog order ∩ members who have that team assigned.
 *   Soft-deleted catalog rows never appear as tabs (no orphans).
 *
 * `teams.json` remains a fetch-failure fallback only. Do not read or write `Members.teams` jsonb.
 */
