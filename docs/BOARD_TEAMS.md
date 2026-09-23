/**
 * BoardTeams catalog — admin-managed committees for /board.
 *
 * Setup: run [`sql/board_teams.sql`](../sql/board_teams.sql) once in Supabase
 * (already applied on Membership if using the Cursor migration).
 *
 * - **Admin** → table `BoardTeams`: add / edit / soft-delete committees (label, description, sort order).
 * - **Members** edit card: team dropdown loads from active BoardTeams rows.
 * - **Public /board**: tabs = catalog order ∩ members who have that team assigned.
 *   Soft-deleted catalog rows never appear as tabs (no orphans).
 *
 * `teams.json` remains a fetch-failure fallback only.
 */
