import { useEffect, useState } from "react";

import { supabase } from "src/Utils/supabase";
import { useAuthStore } from "src/Sites/Members/Hooks/useAuthStore";

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
        .select("id, email, full_name, admin_level, MemberTeam(team_key, role)")
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
        teams: Object.fromEntries(
          (data.MemberTeam ?? []).map(mt => [mt.team_key, mt.role])
        ),
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
