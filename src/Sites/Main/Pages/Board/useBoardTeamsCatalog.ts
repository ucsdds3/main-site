import { useCallback, useEffect, useState } from "react";

import { supabase } from "src/Utils/supabase";

import { fallbackBoardTeamCatalog } from "./boardTeamConfig";
import type { BoardTeamCatalogEntry } from "./boardTeamTypes";

type BoardTeamRow = {
  team_key: string;
  label: string;
  description: string | null;
  sort_order: number | null;
  deleted: boolean | null;
};

function rowsToCatalog(rows: BoardTeamRow[]): BoardTeamCatalogEntry[] {
  return rows.map(row => ({
    team_key: row.team_key,
    label: row.label,
    description: row.description ?? "",
    sort_order: row.sort_order ?? 100,
  }));
}

/**
 * Active BoardTeams catalog for /board tabs and admin member team pickers.
 * Falls back to teams.json only if the Supabase fetch fails (not if the table is empty).
 */
export function useBoardTeamsCatalog() {
  const [catalog, setCatalog] = useState<BoardTeamCatalogEntry[]>(() => fallbackBoardTeamCatalog());
  const [loading, setLoading] = useState(true);
  const [fromDatabase, setFromDatabase] = useState(false);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("BoardTeams")
      .select("team_key,label,description,sort_order,deleted")
      .or("deleted.is.null,deleted.eq.false")
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("[useBoardTeamsCatalog] falling back to teams.json:", error.message);
      setCatalog(fallbackBoardTeamCatalog());
      setFromDatabase(false);
      setLoading(false);
      return;
    }

    setCatalog(rowsToCatalog((data as BoardTeamRow[] | null) ?? []));
    setFromDatabase(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await refetch();
      if (cancelled) return;
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [refetch]);

  return { catalog, loading, fromDatabase, refetch };
}
