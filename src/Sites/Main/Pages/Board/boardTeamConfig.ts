import teamsJson from "./Data/teams.json";

/** Label → Supabase `teams` key: spaces → underscores, uppercased. */
export function labelToTeamKey(label: string): string {
  return label.trim().replace(/\s+/g, "_").toUpperCase();
}

function labelForTeamKey(key: string): string | undefined {
  return Object.keys(teamsJson).find(label => labelToTeamKey(label) === key);
}

export function teamKeyToLabel(key: string): string {
  const label = labelForTeamKey(key);
  if (label) return label;
  return key
    .split("_")
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function teamDescriptionForKey(key: string): string {
  const label = labelForTeamKey(key);
  return label ? teamsJson[label as keyof typeof teamsJson] : "";
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
  // 2026-08-05 archived: return member.teamRoles[tabKey];
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

/** Ordered tab keys: committees from `teams.json` key order first, then any extra keys in member data. */
export function boardTeamTabKeys(memberTeamKeys: Iterable<string>): string[] {
  const fromMembers = new Set(memberTeamKeys);
  const configured = Object.keys(teamsJson).map(label =>
    labelToTeamKey(label)
  ) as readonly string[];
  const ordered: string[] = [];
  for (const k of configured) {
    if (fromMembers.has(k)) ordered.push(k);
  }
  const extra = [...fromMembers].filter(k => !configured.includes(k)).sort();
  return [...ordered, ...extra];
}
