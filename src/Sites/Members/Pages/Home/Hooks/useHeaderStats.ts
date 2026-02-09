import { useEffect, useState } from "react";
import { supabase } from "src/Utils/supabase";
import { useAuthStore } from "../../../Hooks/useAuthStore";

export const tiers = {
  Rookie: "text-primary", // 0 - 1000 xp
  Bronze: "text-yellow-700", // 1000 - 2000 xp
  Silver: "text-gray-400", // 2000 - 4000 xp
  Gold: "text-yellow-300", // 4000 - 8000 xp
  Platinum: "text-secondary", // 8000 - 16000 xp
};

export function useHeaderStats() {
  const { user } = useAuthStore();
  const [xp, setXp] = useState(0);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      if (!user?.email) return;
      const { data, error } = await supabase
        .from("Members")
        .select("experience,points")
        .eq("email", user.email)
        .single();
      if (!isMounted) return;

      if (error) {
        console.error("Error fetching stats:", error);
        return;
      }

      if (data) {
        setXp((data.experience ?? 0) * 10);
        setPoints(data.points ?? 0);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const level = Math.max(Math.floor(Math.log2(xp / 1000)) + 1, 0);
  const offset = Number(xp >= 1000);
  const xpNeeded = 1000 * Math.pow(2, level - offset);
  const progress = xp / xpNeeded - offset;
  const [tier, color] = Object.entries(tiers)[level];

  return {
    xp,
    xpNeeded,
    progress,
    tier: {
      name: tier,
      color: color,
    },
    nextTier: {
      name: Object.keys(tiers)[level + 1],
      color: Object.values(tiers)[level + 1],
    },
    points,
  };
}
