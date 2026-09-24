import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { supabase } from "src/Utils/supabase";

import type { SprintRow, SprintStatus } from "../types";

export function useSprints() {
  const [sprints, setSprints] = useState<SprintRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Sprints")
      .select("*")
      .order("starts_on", { ascending: false });

    if (error) {
      toast.error(error.message);
      setSprints([]);
      setLoading(false);
      return;
    }

    setSprints((data ?? []) as SprintRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const activeSprint = sprints.find(s => s.status === "active") ?? null;
  const planningSprints = sprints
    .filter(s => s.status === "planning")
    .sort((a, b) => a.starts_on.localeCompare(b.starts_on) || a.id - b.id);
  const planningSprint = planningSprints[0] ?? null;
  const closedSprints = sprints.filter(s => s.status === "closed");

  const createSprint = useCallback(
    async (input: {
      name: string;
      starts_on: string;
      ends_on: string;
      created_by: number;
      status?: SprintStatus;
    }) => {
      const status = input.status ?? (activeSprint ? "planning" : "active");
      const { data, error } = await supabase
        .from("Sprints")
        .insert({
          name: input.name.trim(),
          starts_on: input.starts_on,
          ends_on: input.ends_on,
          created_by: input.created_by,
          status,
        })
        .select("*")
        .single();

      if (error) throw error;
      await reload();
      return data as SprintRow;
    },
    [activeSprint, reload]
  );

  const updateSprint = useCallback(async (id: number, patch: { name: string }) => {
    const name = patch.name.trim();
    if (!name) throw new Error("Name is required.");
    const { data, error } = await supabase
      .from("Sprints")
      .update({ name })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    const row = data as SprintRow;
    setSprints(prev => prev.map(s => (s.id === id ? row : s)));
    return row;
  }, []);

  return {
    sprints,
    activeSprint,
    planningSprint,
    planningSprints,
    closedSprints,
    loading,
    reload,
    createSprint,
    updateSprint,
  };
}
