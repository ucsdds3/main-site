import { normalizeExternalHref } from "src/Utils/functions";
import { normalizeTeamsField } from "src/Sites/Members/Utils/functions";
import type { cardData } from "src/Utils/types";

export type MemberExperiences = Record<string, string>;

export type WhereWeAreMemberFields = {
  id: number;
  full_name: string | null;
  profile_picture: string | null;
  experiences: unknown;
  testimonial: string | null;
  graduation_year: number | null;
  teams: unknown;
};

export function normalizeExperiencesField(raw: unknown): MemberExperiences {
  if (raw === null || raw === undefined) return {};
  if (typeof raw === "string") {
    try {
      return normalizeExperiencesField(JSON.parse(raw) as unknown);
    } catch {
      return {};
    }
  }
  if (typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: MemberExperiences = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" && v.trim() && k.trim()) out[k.trim()] = v.trim();
  }
  return out;
}

/** Object key order = topmost experience first. */
export function experienceEntries(experiences: MemberExperiences): [company: string, role: string][] {
  return Object.entries(experiences);
}

export function formatExperienceLine(company: string, role: string): string {
  return `${role} | ${company}`;
}

function boardRoleTitleImportanceRank(role: string | undefined | null): number {
  if (!role?.trim()) return 3;
  const lower = role.trim().toLowerCase();
  if (lower.includes("vice president")) return 1;
  if (lower.includes("president")) return 0;
  if (lower.includes("director")) return 2;
  return 3;
}

/** Most important DS3 role from `teams` JSON (committee key → title). */
export function getPrimaryTeamRole(teams: unknown): string {
  const teamRoles = normalizeTeamsField(teams);
  const entries = Object.entries(teamRoles);
  if (entries.length === 0) return "";

  entries.sort((a, b) => {
    const ra = boardRoleTitleImportanceRank(a[1]);
    const rb = boardRoleTitleImportanceRank(b[1]);
    if (ra !== rb) return ra - rb;
    return a[1].localeCompare(b[1]);
  });
  return entries[0][1];
}

export function memberToWhereWeAreCard(member: WhereWeAreMemberFields): cardData {
  const experiences = normalizeExperiencesField(member.experiences);
  const entries = experienceEntries(experiences);
  const title = entries[0] ? formatExperienceLine(entries[0][0], entries[0][1]) : "Member";
  const subtitle = entries[1] ? formatExperienceLine(entries[1][0], entries[1][1]) : undefined;
  const gradYear = member.graduation_year;
  const description = gradYear ? `Class of ${gradYear}` : "";
  const name = member.full_name?.trim() || "Member";
  const role = getPrimaryTeamRole(member.teams);
  const author = role ? `${name} - ${role}` : name;
  const image = normalizeExternalHref(member.profile_picture) || "";

  return { image, title, subtitle, description, author };
}

export function mostRecentExperienceLine(experiences: unknown): string | null {
  const entries = experienceEntries(normalizeExperiencesField(experiences));
  if (!entries[0]) return null;
  return formatExperienceLine(entries[0][0], entries[0][1]);
}

export function testimonialPreview(text: string | null | undefined, maxChars = 180): string {
  if (!text?.trim()) return "";
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars).trimEnd()}…`;
}
