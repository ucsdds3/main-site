import { useEffect, useState } from "react";
import { isMissingRelation, supabase } from "src/Utils/supabase";

export type LeaderboardEntry = {
  full_name: string;
  points: number;
  rank: number;
  profile_picture: string | null;
};

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      // Members only see their own row once Members is locked down; the view lists everyone.
      const query = (table: "MemberLeaderboard" | "Members") =>
        supabase
          .from(table)
          .select("full_name, points, profile_picture")
          .eq("deleted", false)
          .order("points", { ascending: false })
          .limit(10);
      let { data, error } = await query("MemberLeaderboard");
      if (isMissingRelation(error)) ({ data, error } = await query("Members"));

      if (!isMounted) return;

      if (error) {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
        return;
      }

      const entries: LeaderboardEntry[] = (data ?? []).map((row, idx) => ({
        full_name: row.full_name ?? "Anonymous",
        points: row.points ?? 0,
        rank: idx + 1,
        profile_picture: row.profile_picture ?? null,
      }));

      setLeaderboard(entries);
      setLoading(false);
    };

    fetchLeaderboard();
    return () => {
      isMounted = false;
    };
  }, []);

  return { leaderboard, loading };
}
