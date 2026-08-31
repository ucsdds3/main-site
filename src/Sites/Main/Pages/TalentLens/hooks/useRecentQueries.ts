import { useCallback, useState } from "react";

import type { RecentQuery, TalentLensInputMode } from "../types";
import { loadRecentQueries, saveRecentQuery } from "../storage";

export const useRecentQueries = () => {
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>(() => loadRecentQueries());

  const addRecentQuery = useCallback((query: string, inputMode: TalentLensInputMode) => {
    saveRecentQuery({ query, inputMode });
    setRecentQueries(loadRecentQueries());
  }, []);

  const refreshRecentQueries = useCallback(() => {
    setRecentQueries(loadRecentQueries());
  }, []);

  return { recentQueries, addRecentQuery, refreshRecentQueries };
};
