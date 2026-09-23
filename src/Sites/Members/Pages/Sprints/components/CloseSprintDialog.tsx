import { useMemo, useState } from "react";
import { TfiClose } from "react-icons/tfi";
import toast from "react-hot-toast";

import { Input } from "src/Sites/Members/Components/Input";
import Select from "src/Sites/Members/Components/Select";
import Button from "src/Shared/Components/Button";
import { boardTeamTabKeys } from "src/Sites/Main/Pages/Board/boardTeamConfig";

import { teamLabel } from "../constants";
import type { RetroDecision, SprintRow, SprintTaskRow } from "../types";

const DECISION_LABELS: Record<RetroDecision, string> = {
  done: "Done — close it",
  roll: "Roll to next sprint",
  drop: "Drop — will not do",
};

type CloseSprintDialogProps = {
  currentSprint: SprintRow;
  planningSprint: SprintRow | null;
  openTasks: SprintTaskRow[];
  onClose: () => void;
  onConfirm: (input: {
    nextSprintId: number | null;
    createNext: { name: string; starts_on: string; ends_on: string } | null;
    decisions: Record<number, RetroDecision>;
  }) => Promise<void>;
};

export default function CloseSprintDialog({
  currentSprint,
  planningSprint,
  openTasks,
  onClose,
  onConfirm,
}: CloseSprintDialogProps) {
  const grouped = useMemo(() => {
    const keys = boardTeamTabKeys(openTasks.map(t => t.team_key));
    return keys.map(key => ({
      key,
      label: teamLabel(key),
      tasks: openTasks.filter(t => t.team_key === key),
    }));
  }, [openTasks]);

  const [decisions, setDecisions] = useState<Record<number, RetroDecision>>(() =>
    Object.fromEntries(openTasks.map(t => [t.id, "roll" as RetroDecision]))
  );
  const [nextMode, setNextMode] = useState<"existing" | "create">(
    planningSprint ? "existing" : "create"
  );
  const [nextName, setNextName] = useState("");
  const [nextStart, setNextStart] = useState("");
  const [nextEnd, setNextEnd] = useState("");
  const [saving, setSaving] = useState(false);

  const needsNext = Object.values(decisions).some(d => d === "roll") || nextMode === "create";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rolling = Object.values(decisions).some(d => d === "roll");
    let createNext: { name: string; starts_on: string; ends_on: string } | null = null;
    let nextSprintId: number | null = planningSprint?.id ?? null;

    if (nextMode === "create" && (rolling || nextName || nextStart || nextEnd)) {
      if (!nextName.trim() || !nextStart || !nextEnd) {
        toast.error("Name and dates are required for the next sprint.");
        return;
      }
      if (nextEnd < nextStart) {
        toast.error("Next sprint end date must be on or after the start date.");
        return;
      }
      createNext = { name: nextName.trim(), starts_on: nextStart, ends_on: nextEnd };
      nextSprintId = null;
    } else if (rolling && !planningSprint && !createNext) {
      toast.error("Create the next sprint to roll unfinished tasks.");
      return;
    } else if (nextMode === "existing") {
      nextSprintId = planningSprint?.id ?? null;
      if (rolling && !nextSprintId) {
        toast.error("No planning sprint exists. Create the next one.");
        return;
      }
    }

    setSaving(true);
    try {
      await onConfirm({ nextSprintId, createNext, decisions });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to close sprint");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative my-8 w-full max-w-3xl rounded-2xl border border-(--obs-border) bg-[#080e19] p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer border-0 bg-transparent text-(--obs-text-muted)"
          aria-label="Close"
        >
          <TfiClose />
        </button>

        <p className="text-eyebrow text-eyebrow-orange">Retro</p>
        <h2 className="mt-2 font-heading text-3xl text-(--obs-text-primary)">
          Close {currentSprint.name}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-(--obs-text-muted)">
          Walk each team. Mark leftover work done, roll it into the next sprint, or drop it.
          Already-done tasks stay on this sprint.
        </p>

        <div className="mt-6 rounded-xl border border-(--obs-border) p-4">
          <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-widest text-(--obs-text-faint)">
            Next sprint
          </p>
          {planningSprint ? (
            <Select
              label="Destination"
              showPlaceholderOption={false}
              className="w-full min-w-0"
              options={[`Use planning: ${planningSprint.name}`, "Create a new sprint"]}
              value={
                nextMode === "existing"
                  ? `Use planning: ${planningSprint.name}`
                  : "Create a new sprint"
              }
              setValue={v => setNextMode(v.startsWith("Use") ? "existing" : "create")}
            />
          ) : (
            <p className="mb-3 text-sm text-(--obs-text-muted)">
              No planning sprint yet. Fill this in if you are rolling work or starting the next
              cycle.
            </p>
          )}
          {nextMode === "create" || !planningSprint ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Input
                label="Name"
                className="w-full min-w-0"
                value={nextName}
                setValue={setNextName}
                placeholder="Week 3"
              />
              <Input
                label="Starts"
                type="date"
                className="w-full min-w-0"
                value={nextStart}
                setValue={setNextStart}
              />
              <Input
                label="Ends"
                type="date"
                className="w-full min-w-0"
                value={nextEnd}
                setValue={setNextEnd}
              />
            </div>
          ) : null}
          {!needsNext ? (
            <p className="mt-3 text-xs text-(--obs-text-faint)">
              Nothing is set to roll. You can close without opening a next sprint.
            </p>
          ) : null}
        </div>

        {openTasks.length === 0 ? (
          <p className="mt-6 text-sm text-(--obs-text-muted)">
            Every task is already done. Closing will archive this sprint.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            {grouped.map(group => (
              <section key={group.key}>
                <h3 className="mb-3 mt-0 text-lg text-(--obs-text-primary)">{group.label}</h3>
                <ul className="m-0 flex list-none flex-col gap-3 p-0">
                  {group.tasks.map(task => (
                    <li
                      key={task.id}
                      className="flex flex-col gap-2 rounded-xl border border-(--obs-border) p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="m-0 font-medium text-(--obs-text-primary)">{task.title}</p>
                        <p className="m-0 mt-1 font-mono text-[0.65rem] uppercase tracking-widest text-(--obs-text-faint)">
                          {task.expected_hours}h ·{" "}
                          {task.assignees.map(a => a.full_name).join(", ") || "Unassigned"}
                        </p>
                      </div>
                      <Select
                        label="Decision"
                        hideLabel
                        showPlaceholderOption={false}
                        className="w-full min-w-0 sm:w-56"
                        options={Object.values(DECISION_LABELS)}
                        value={DECISION_LABELS[decisions[task.id] ?? "roll"]}
                        setValue={label => {
                          const entry = (
                            Object.entries(DECISION_LABELS) as [RetroDecision, string][]
                          ).find(([, l]) => l === label);
                          if (entry) {
                            setDecisions(prev => ({ ...prev, [task.id]: entry[0] }));
                          }
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-(--obs-border) bg-transparent px-5 py-2 font-mono text-[0.7rem] uppercase tracking-widest text-(--obs-text-muted)"
          >
            Cancel
          </button>
          <Button type="submit" disabled={saving} className="my-0">
            {saving ? "Closing…" : "Close sprint"}
          </Button>
        </div>
      </form>
    </div>
  );
}
