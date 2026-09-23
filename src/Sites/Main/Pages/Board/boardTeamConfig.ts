import teamsJson from "./Data/teams.json";
import type { BoardTeamCatalogEntry } from "./boardTeamTypes";

/** Label → Supabase `teams` / BoardTeams key: spaces → underscores, uppercased. */
export function labelToTeamKey(label: string): string {
  return label.trim().replace(/\s+/g, "_").toUpperCase();
}

/** Static fallback when BoardTeams fetch fails (matches historical teams.json). */
export function fallbackBoardTeamCatalog(): BoardTeamCatalogEntry[] {
  return Object.entries(teamsJson).map(([label, description], index) => ({
    team_key: labelToTeamKey(label),
    label,
    description: String(description),
    sort_order: (index + 1) * 10,
  }));
}

export function teamKeyToLabel(key: string, catalog: BoardTeamCatalogEntry[]): string {
  const hit = catalog.find(t => t.team_key === key);
  if (hit) return hit.label;
  return key
    .split("_")
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function teamDescriptionForKey(key: string, catalog: BoardTeamCatalogEntry[]): string {
  return catalog.find(t => t.team_key === key)?.description ?? "";
}

export function memberMatchesTab(
  member: { teamRoles: Record<string, string> },
  tabKey: string
): boolean {
  return Object.keys(member.teamRoles).map(labelToTeamKey).includes(tabKey);
}

export function roleForMemberOnTab(
  member: { teamRoles: Record<string, string> },
  tabKey: string
): string | undefined {
  // Resolve by normalized key so legacy labels ("Social Events") and
  // storage keys ("SOCIAL_EVENTS") both work for display + director sort.
  if (Object.prototype.hasOwnProperty.call(member.teamRoles, tabKey)) {
    return member.teamRoles[tabKey];
  }
  for (const [k, v] of Object.entries(member.teamRoles)) {
    if (labelToTeamKey(k) === tabKey) return v;
  }
  return undefined;
}

/**
 * Ordered tab keys for /board: catalog order, only teams that still exist in the
 * catalog and have at least one published member. Archived (deleted) catalog
 * rows never appear — even if Members.teams still has the old key.
 */
export function boardTeamTabKeys(
  memberTeamKeys: Iterable<string>,
  catalog: BoardTeamCatalogEntry[]
): string[] {
  const fromMembers = new Set(memberTeamKeys);
  const ordered = [...catalog]
    .sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label))
    .map(t => t.team_key);
  return ordered.filter(k => fromMembers.has(k));
}

export function catalogLabels(catalog: BoardTeamCatalogEntry[]): string[] {
  return [...catalog]
    .sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label))
    .map(t => t.label);
}
