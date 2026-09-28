import { useState } from "react";
import toast from "react-hot-toast";

import Page from "src/Shared/Page/Page";
import Button from "src/Shared/Components/Button";
import { Input } from "src/Sites/Members/Components/Input";
import Select from "src/Sites/Members/Components/Select";
import { useAuthStore } from "src/Sites/Members/Hooks/useAuthStore";

import FundraiserForm from "./Components/FundraiserForm";
import FundraiserList from "./Components/FundraiserList";
import FundraisingMeter from "./Components/FundraisingMeter";
import { useFundraising } from "./Hooks/useFundraising";
import { formatUsd, nearbyQuarterOptions, quarterLabel } from "./Utils/fundraising";

export default function Fundraising() {
  const { adminLevel } = useAuthStore();
  const isExec = adminLevel === "Executive";
  const {
    quarterKey,
    setQuarterKey,
    goal,
    fundraisers,
    raised,
    loading,
    saveGoal,
    addFundraiser,
    deleteFundraiser,
  } = useFundraising();
  const quarters = nearbyQuarterOptions();
  const [goalDraft, setGoalDraft] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(goalDraft);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Goal must be greater than 0.");
      return;
    }
    setSavingGoal(true);
    try {
      await saveGoal(value);
      setGoalDraft("");
      toast.success(goal ? "Goal updated." : "Goal set.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save goal");
    } finally {
      setSavingGoal(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFundraiser(id);
      toast.success("Fundraiser removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove fundraiser");
    }
  };

  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-6 py-8 font-body">
        <div>
          <div className="obs-eyebrow-row">
            <div className="obs-accent-bar-cyan" />
            <span className="text-eyebrow text-eyebrow-cyan">Admin</span>
          </div>
          <h1 className="mb-2 mt-3 text-fluid-page-hero">Fundraising</h1>
          <p className="m-0 max-w-xl text-sm leading-6 text-(--obs-text-muted)">
            Track the quarterly goal and each fundraiser that counts toward it. Board can view;
            Executives set the goal and log results.
          </p>
        </div>

        <Select
          label="Quarter"
          required
          showPlaceholderOption={false}
          className="w-full min-w-0 sm:w-72"
          options={quarters.map(q => q.label)}
          value={quarters.find(q => q.key === quarterKey)?.label ?? ""}
          setValue={label => {
            const next = quarters.find(q => q.label === label);
            if (next) {
              setQuarterKey(next.key);
              setGoalDraft("");
            }
          }}
        />

        {loading ? (
          <p className="text-(--obs-text-muted)">Loading fundraising…</p>
        ) : (
          <>
            {isExec ? (
              <form
                onSubmit={handleSaveGoal}
                className="obs-panel flex flex-wrap items-end gap-4 p-6"
              >
                <Input
                  label={goal ? "Update goal" : "Set goal"}
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="w-full min-w-0 sm:w-56"
                  value={goalDraft}
                  setValue={setGoalDraft}
                  placeholder={goal ? String(goal.goal_amount) : "e.g. 2500"}
                />
                <Button type="submit" disabled={savingGoal} className="my-0">
                  {savingGoal ? "Saving…" : goal ? "Update goal" : "Set goal"}
                </Button>
                {goal ? (
                  <p className="mb-2 text-sm text-(--obs-text-muted)">
                    Current {quarterLabel(quarterKey)} goal is {formatUsd(goal.goal_amount)}.
                  </p>
                ) : null}
              </form>
            ) : null}

            {goal ? (
              <>
                <FundraisingMeter
                  goalAmount={goal.goal_amount}
                  fundraisers={fundraisers}
                  raised={raised}
                />
                <FundraiserList
                  fundraisers={fundraisers}
                  canEdit={isExec}
                  onDelete={id => void handleDelete(id)}
                />
                {isExec ? <FundraiserForm onAdd={addFundraiser} /> : null}
              </>
            ) : (
              <p className="m-0 rounded-2xl border border-dashed border-(--obs-border) px-4 py-16 text-center text-sm text-(--obs-text-muted)">
                {isExec
                  ? `Set a ${quarterLabel(quarterKey)} goal to start logging fundraisers.`
                  : `No fundraising goal is set for ${quarterLabel(quarterKey)} yet.`}
              </p>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
