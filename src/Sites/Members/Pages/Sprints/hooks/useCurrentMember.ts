import { useEffect, useState } from "react";

import { supabase } from "src/Utils/supabase";
import { useAuthStore } from "src/Sites/Members/Hooks/useAuthStore";
import { parseTeamMemberEmbed, teamRolesFromMemberships } from "src/Utils/teamMembership";

import type { CurrentMember } from "../types";

export function useCurrentMember() {
  const { user } = useAuthStore();
  const [member, setMember] = useState<CurrentMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!user?.email) {
        setMember(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("Members")
        .select("id, email, full_name, admin_level, TeamMember(title, BoardTeams(team_key))")
        .eq("email", user.email)
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data || (data.admin_level !== "Board" && data.admin_level !== "Executive")) {
        setMember(null);
        setLoading(false);
        return;
      }

      setMember({
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        teamRoles: teamRolesFromMemberships(parseTeamMemberEmbed(data.TeamMember)),
        admin_level: data.admin_level,
      });
      setLoading(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  return { member, loading };
}
