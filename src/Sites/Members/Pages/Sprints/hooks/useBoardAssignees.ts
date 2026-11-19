import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { supabase } from "src/Utils/supabase";
import { parseTeamMemberEmbed, teamRolesFromMemberships } from "src/Utils/teamMembership";

import type { BoardAssigneeOption } from "../types";

export function useBoardAssignees() {
  const [assignees, setAssignees] = useState<BoardAssigneeOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const { data, error } = await supabase
        .from("Members")
        .select("id, full_name, email, TeamMember(title, BoardTeams(team_key))")
        .in("admin_level", ["Board", "Executive"])
        .or("deleted.is.null,deleted.eq.false")
        .order("full_name", { ascending: true });

      if (cancelled) return;

      if (error) {
        toast.error(error.message);
        setAssignees([]);
        setLoading(false);
        return;
      }

      setAssignees(
        (data ?? []).map(row => ({
          id: row.id,
          full_name: row.full_name ?? "Unknown",
          email: row.email ?? "",
          teamRoles: teamRolesFromMemberships(parseTeamMemberEmbed(row.TeamMember)),
        }))
      );
      setLoading(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { assignees, loading };
}
