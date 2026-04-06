import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { supabase } from "src/Utils/supabase";
import { normalizeExternalHref } from "src/Utils/functions";
import { normalizeTeamsField } from "src/Sites/Members/Utils/functions";
import type { BoardMember } from "src/Utils/types.ts";

type MemberRow = {
  full_name: string;
  email: string | null;
  github_link: string | null;
  resume_link: string | null;
  linkedin_link: string | null;
  other_link: string | null;
  profile_picture: string | null;
  teams: Record<string, string> | null;
  deleted: boolean | null;
};

/** Lower rank = earlier. `Vice President` before `President` so substrings don’t collide. */
function boardRoleTitleImportanceRank(role: string | undefined | null): number {
  if (!role?.trim()) return 3;
  const lower = role.trim().toLowerCase();
  if (lower.includes("vice president")) return 1;
  if (lower.includes("president")) return 0;
  if (lower.includes("director")) return 2;
  return 3;
}

function compareBoardMembersForTeam(a: BoardMember, b: BoardMember, teamKey: string): number {
  const ra = boardRoleTitleImportanceRank(a.teamRoles[teamKey]);
  const rb = boardRoleTitleImportanceRank(b.teamRoles[teamKey]);
  if (ra !== rb) return ra - rb;
  return b.teamRoles[teamKey]?.localeCompare(a.teamRoles[teamKey]) ?? 0;
}

function rowToBoardMember(row: MemberRow): BoardMember | null {
  const teamRoles = normalizeTeamsField(row.teams);
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

/** `sortTeamKey` is the active committee tab; members are ordered by role importance for that key, then name. */
export function useBoardMembers(sortTeamKey: string) {
  const [rawMembers, setRawMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  const members = useMemo(
    () => [...rawMembers].sort((a, b) => compareBoardMembersForTeam(a, b, sortTeamKey)),
    [rawMembers, sortTeamKey]
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const { data, error } = await supabase
        .from("Members")
        .select(
          "full_name,email,github_link,resume_link,linkedin_link,other_link,profile_picture,teams,deleted"
        )
        .neq("teams", null)
        .or("deleted.is.null,deleted.eq.false");

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
