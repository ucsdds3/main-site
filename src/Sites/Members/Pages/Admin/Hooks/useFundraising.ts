import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { supabase } from "src/Utils/supabase";
import { useAuthStore } from "src/Sites/Members/Hooks/useAuthStore";

import {
  currentQuarterKey,
  nextFundraiserColor,
  type FundraiserRow,
  type FundraisingGoalRow,
} from "../Utils/fundraising";

async function memberIdForEmail(email: string): Promise<number> {
  const { data, error } = await supabase
    .from("Members")
    .select("id")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();
  if (error || data?.id == null) throw new Error("Could not load your member profile.");
  return data.id as number;
}

export function useFundraising() {
  const { user } = useAuthStore();
  const [quarterKey, setQuarterKey] = useState(currentQuarterKey);
  const [goal, setGoal] = useState<FundraisingGoalRow | null>(null);
  const [fundraisers, setFundraisers] = useState<FundraiserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data: goalRow, error: goalError } = await supabase
      .from("FundraisingGoals")
      .select("id, quarter_key, goal_amount, created_by, created_at, updated_at")
      .eq("quarter_key", quarterKey)
      .maybeSingle();

    if (goalError) {
      toast.error(goalError.message);
      setGoal(null);
      setFundraisers([]);
      setLoading(false);
      return;
    }

    if (!goalRow) {
      setGoal(null);
      setFundraisers([]);
      setLoading(false);
      return;
    }

    const mappedGoal: FundraisingGoalRow = {
      ...goalRow,
      goal_amount: Number(goalRow.goal_amount),
    };
    setGoal(mappedGoal);

    const { data: rows, error: rowsError } = await supabase
      .from("Fundraisers")
      .select("id, goal_id, held_on, place, amount, color, created_by, created_at")
      .eq("goal_id", mappedGoal.id)
      .order("held_on", { ascending: true })
      .order("id", { ascending: true });

    if (rowsError) {
      toast.error(rowsError.message);
      setFundraisers([]);
      setLoading(false);
      return;
    }

    setFundraisers(
      (rows ?? []).map(row => ({
        ...row,
        held_on: String(row.held_on).slice(0, 10),
        amount: Number(row.amount),
      }))
    );
    setLoading(false);
  }, [quarterKey]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveGoal = async (amount: number) => {
    if (!user?.email) throw new Error("You need to be signed in.");
    const created_by = await memberIdForEmail(user.email);
    if (goal) {
      const { error } = await supabase
        .from("FundraisingGoals")
        .update({ goal_amount: amount })
        .eq("id", goal.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("FundraisingGoals").insert({
        quarter_key: quarterKey,
        goal_amount: amount,
        created_by,
      });
      if (error) throw error;
    }
    await reload();
  };

  const addFundraiser = async (input: { held_on: string; place: string; amount: number }) => {
    if (!user?.email) throw new Error("You need to be signed in.");
    if (!goal) throw new Error("Set a quarterly goal before adding a fundraiser.");
    const created_by = await memberIdForEmail(user.email);
    const { error } = await supabase.from("Fundraisers").insert({
      goal_id: goal.id,
      held_on: input.held_on,
      place: input.place.trim(),
      amount: input.amount,
      color: nextFundraiserColor(fundraisers.map(row => row.color)),
      created_by,
    });
    if (error) throw error;
    await reload();
  };

  const deleteFundraiser = async (id: number) => {
    const { error } = await supabase.from("Fundraisers").delete().eq("id", id);
    if (error) throw error;
    await reload();
  };

  const raised = fundraisers.reduce((sum, row) => sum + row.amount, 0);

  return {
    quarterKey,
    setQuarterKey,
    goal,
    fundraisers,
    raised,
    loading,
    saveGoal,
    addFundraiser,
    deleteFundraiser,
  };
}
