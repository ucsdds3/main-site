import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { isMissingRelation, supabase } from "src/Utils/supabase";
import { normalizeExternalHref } from "src/Utils/functions";
import { teamRolesFromBoardRow, type TeamMemberEmbedRow } from "src/Utils/teamMembership";
import type { BoardMember } from "src/Utils/types.ts";
import type { BoardTeamCatalogEntry } from "./boardTeamTypes";
import { roleForMemberOnTab } from "./boardTeamConfig";

type MemberRow = {
  full_name: string;
  email: string | null;
  github_link: string | null;
  resume_link: string | null;
  linkedin_link: string | null;
  other_link: string | null;
  profile_picture: string | null;
  team_roles?: unknown;
  TeamMember?: TeamMemberEmbedRow[] | null;
  deleted: boolean | null;
};

/** Lower rank = earlier. `Vice President` before `President` so substrings don’t collide. */
function boardRoleTitleImportanceRank(role: string | undefined | null): number {
  if (!role?.trim()) return 4;
  const lower = role.trim().toLowerCase();
  if (lower.includes("vice president")) return 1;
  if (lower.includes("president")) return 0;
  if (lower.includes("director")) return 2;
  if (lower.includes("mentor")) return 3;
  return 4;
}

function compareBoardMembersForTeam(
  a: BoardMember,
  b: BoardMember,
  teamKey: string,
  catalog: BoardTeamCatalogEntry[]
): number {
  const ra = boardRoleTitleImportanceRank(roleForMemberOnTab(a, teamKey, catalog));
  const rb = boardRoleTitleImportanceRank(roleForMemberOnTab(b, teamKey, catalog));
  if (ra !== rb) return ra - rb;
  return a.name.localeCompare(b.name);
}

function rowToBoardMember(row: MemberRow): BoardMember | null {
  const teamRoles = teamRolesFromBoardRow(row);
  if (Object.keys(teamRoles).length === 0) return null;

  return {
    name: row.full_name?.trim() || "Member",
    teams: Object.keys(teamRoles),
    teamRoles,
    email: row.email?.trim() || undefined,
    image: normalizeExternalHref(row.profile_picture) || undefined,
    linkedIn: normalizeExternalHref(row.linkedin_link) || undefined,
    resume: normalizeExternalHref(row.resume_link) || undefined,
    github: normalizeExternalHref(row.github_link) || undefined,
    other_link: normalizeExternalHref(row.other_link) || undefined,
  };
}

const BOARD_MEMBER_COLUMNS =
  "full_name,email,github_link,resume_link,linkedin_link,other_link,profile_picture,deleted";

/** `sortTeamKey` is the active committee tab; members are ordered by role importance for that key, then name. */
export function useBoardMembers(sortTeamKey: string, catalog: BoardTeamCatalogEntry[] = []) {
  const [rawMembers, setRawMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  const members = useMemo(
    () => [...rawMembers].sort((a, b) => compareBoardMembersForTeam(a, b, sortTeamKey, catalog)),
    [rawMembers, sortTeamKey, catalog]
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Prefer BoardMembers.team_roles (aggregated view). Fall back to Members + TeamMember embed.
      let data: MemberRow[] | null = null;
      let error: { message: string; code?: string } | null = null;

      ({ data, error } = await supabase
        .from("BoardMembers")
        .select(`${BOARD_MEMBER_COLUMNS},team_roles`)
        .or("deleted.is.null,deleted.eq.false"));

      if (isMissingRelation(error) || (error && /team_roles/i.test(error.message))) {
        ({ data, error } = await supabase
          .from("Members")
          .select(
            `${BOARD_MEMBER_COLUMNS},TeamMember!inner(title, BoardTeams!inner(team_key))`
          )
          .or("deleted.is.null,deleted.eq.false"));
      }

      if (cancelled) return;

      if (error) {
        toast.error(error.message);
        setRawMembers([]);
        setLoading(false);
        return;
      }

      const list = (data as MemberRow[] | null)
        ?.map(rowToBoardMember)
        .filter((m): m is BoardMember => m !== null);

      setRawMembers(list ?? []);
      setLoading(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { members, loading };
}
