/** One committee assignment from TeamMember ⨝ BoardTeams. */
export type TeamMembership = {
  team_key: string;
  title: string;
};

/** PostgREST embed: TeamMember(title, BoardTeams(team_key, id)). */
export type TeamMemberEmbedRow = {
  title: string | null;
  BoardTeams: { team_key: string; id?: number } | { team_key: string; id?: number }[] | null;
};

export function teamRolesFromMemberships(
  memberships: TeamMembership[] | null | undefined
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of memberships ?? []) {
    const key = m.team_key?.trim();
    const title = m.title?.trim();
    if (key && title) out[key] = title;
  }
  return out;
}

export function membershipsFromRoleMap(
  roleMap: Record<string, string> | null | undefined
): TeamMembership[] {
  if (!roleMap) return [];
  return Object.entries(roleMap)
    .map(([team_key, title]) => ({ team_key: team_key.trim(), title: title.trim() }))
    .filter(m => m.team_key && m.title);
}

function boardTeamKey(embed: TeamMemberEmbedRow["BoardTeams"]): string | null {
  if (!embed) return null;
  const row = Array.isArray(embed) ? embed[0] : embed;
  const key = row?.team_key?.trim();
  return key || null;
}

/** Parse nested TeamMember + BoardTeams rows into memberships. */
export function parseTeamMemberEmbed(
  rows: TeamMemberEmbedRow[] | null | undefined
): TeamMembership[] {
  const out: TeamMembership[] = [];
  for (const row of rows ?? []) {
    const team_key = boardTeamKey(row.BoardTeams);
    const title = row.title?.trim() ?? "";
    if (team_key && title) out.push({ team_key, title });
  }
  return out;
}

/** Prefer BoardMembers.team_roles jsonb, else nested TeamMember embed. */
export function teamRolesFromBoardRow(row: {
  team_roles?: unknown;
  TeamMember?: TeamMemberEmbedRow[] | null;
}): Record<string, string> {
  if (row.team_roles != null && typeof row.team_roles === "object" && !Array.isArray(row.team_roles)) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(row.team_roles as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim()) out[k] = v.trim();
    }
    if (Object.keys(out).length > 0) return out;
  }
  return teamRolesFromMemberships(parseTeamMemberEmbed(row.TeamMember));
}
