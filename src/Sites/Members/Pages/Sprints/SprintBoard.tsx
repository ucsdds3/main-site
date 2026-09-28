import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useBoardTeamsCatalog } from "src/Sites/Main/Pages/Board/useBoardTeamsCatalog";
import Button from "src/Shared/Components/Button";
import { twMerge } from "src/Utils/cn";

import CloseSprintDialog from "./components/CloseSprintDialog";
import PersonTypeahead from "./components/PersonTypeahead";
import SprintHowTo from "./components/SprintHowTo";
import SprintIdleMembers from "./components/SprintIdleMembers";
import SprintStats from "./components/SprintStats";
import TaskCard from "./components/TaskCard";
import TaskModal from "./components/TaskModal";
import {
  COLUMN_ACCENT,
  COLUMN_TASK_PREVIEW,
  defaultTeamKey,
  firstName,
  formatSprintDates,
  isOpenSprintTaskStatus,
  MINE_TAB,
  SPRINT_BOARD_COLUMNS,
  SPRINT_STATUS_LABELS,
  sprintTeamTabKeys,
  teamAccent,
  teamLabel,
} from "./constants";
import { useBoardAssignees } from "./hooks/useBoardAssignees";
import { nudgeOverdueTask, useSprintBoard } from "./hooks/useSprintBoard";
import type {
  CurrentMember,
  RetroDecision,
  SprintRow,
  SprintTaskRow,
  SprintTaskStatus,
} from "./types";

type SprintBoardProps = {
  sprint: SprintRow;
  planningSprint: SprintRow | null;
  sprints: SprintRow[];
  member: CurrentMember;
  allTime?: boolean;
  onSprintsChanged: () => Promise<void> | void;
  createSprint: (input: {
    name: string;
    starts_on: string;
    ends_on: string;
    created_by: number;
    status?: "planning" | "active";
  }) => Promise<SprintRow>;
  updateSprint: (id: number, patch: { name: string }) => Promise<SprintRow>;
};

export default function SprintBoard({
  sprint,
  planningSprint,
  sprints,
  member,
  allTime = false,
  onSprintsChanged,
  createSprint,
  updateSprint,
}: SprintBoardProps) {
  const { catalog } = useBoardTeamsCatalog();
  const { assignees } = useBoardAssignees();
  const [teamTab, setTeamTab] = useState(MINE_TAB);
  const [assigneeFilter, setAssigneeFilter] = useState<number | null>(null);
  const { tasks, loading, createTask, updateTask, moveTask, deleteTask, closeSprint } =
    useSprintBoard(sprint.id, {
      allTime,
      historyMemberId: allTime ? assigneeFilter : null,
    });
  const [nudgingTaskId, setNudgingTaskId] = useState<number | null>(null);
  const [taskModal, setTaskModal] = useState<"create" | number | null>(null);
  const [closeOpen, setCloseOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(sprint.name);
  const [renamingSaving, setRenamingSaving] = useState(false);
  const [expandedColumns, setExpandedColumns] = useState<
    Partial<Record<SprintTaskStatus, boolean>>
  >({});
  const draggingId = useRef<number | null>(null);

  useEffect(() => {
    setDraftName(sprint.name);
    setRenaming(false);
  }, [sprint.id, sprint.name]);

  const isExec = member.admin_level === "Executive";
  const canEdit = sprint.status !== "closed";
  const canMove = canEdit && !allTime;
  const sprintNameById = useMemo(() => new Map(sprints.map(row => [row.id, row.name])), [sprints]);
  const editingTask = typeof taskModal === "number" ? tasks.find(t => t.id === taskModal) : null;

  const teamKeys = useMemo(
    () =>
      sprintTeamTabKeys(
        catalog,
        tasks.map(t => t.team_key)
      ),
    [catalog, tasks]
  );
  const teamOptions = useMemo(
    () => teamKeys.map(key => ({ key, label: teamLabel(key, catalog) })),
    [catalog, teamKeys]
  );

  const visibleTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.status === "cancelled") return false;
      if (allTime) return true;
      if (teamTab === MINE_TAB) {
        if (!task.assignees.some(a => a.id === member.id)) return false;
      } else if (teamTab !== "ALL" && task.team_key !== teamTab) {
        return false;
      }
      if (assigneeFilter != null && !task.assignees.some(a => a.id === assigneeFilter)) {
        return false;
      }
      return true;
    });
  }, [tasks, teamTab, assigneeFilter, member.id, allTime]);

  const hoursByTeam = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of tasks) {
      if (task.status === "cancelled") continue;
      map.set(task.team_key, (map.get(task.team_key) ?? 0) + task.expected_hours);
    }
    return map;
  }, [tasks]);

  const openTasks = tasks.filter(t => isOpenSprintTaskStatus(t.status));

  const handleDrop = async (status: SprintTaskStatus) => {
    const id = draggingId.current;
    draggingId.current = null;
    if (id == null || !canMove) return;
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === status) return;
    if (status === "pending_review" && task.reviewer_id == null) {
      toast.error("This task has no reviewer. Move it to Complete instead.");
      return;
    }
    if ((status === "pending_review" || status === "done") && task.actual_hours == null) {
      toast.error("Log actual hours before pending review or complete.");
      setTaskModal(task.id);
      return;
    }
    try {
      await moveTask(task, status);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not move task");
      if (status === "done" || status === "pending_review") setTaskModal(task.id);
    }
  };

  const handleCloseConfirm = async (input: {
    nextSprintId: number | null;
    createNext: { name: string; starts_on: string; ends_on: string } | null;
    decisions: Record<number, RetroDecision>;
  }) => {
    let nextId = input.nextSprintId;
    if (input.createNext) {
      const created = await createSprint({
        ...input.createNext,
        created_by: member.id,
        status: "planning",
      });
      nextId = created.id;
    }

    const rolling = Object.values(input.decisions).some(d => d === "roll");
    await closeSprint({
      currentSprintId: sprint.id,
      nextSprintId: rolling || input.createNext ? nextId : input.nextSprintId,
      decisions: input.decisions,
    });
    toast.success("Sprint closed.");
    await onSprintsChanged();
  };

  const cancelRename = () => {
    setDraftName(sprint.name);
    setRenaming(false);
  };

  const handleNudgeOverdue = async (task: SprintTaskRow) => {
    setNudgingTaskId(task.id);
    try {
      const emailed = await nudgeOverdueTask(task.id);
      toast.success(emailed === 1 ? "Nudged the assignee." : `Nudged ${emailed} assignees.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send nudge");
    } finally {
      setNudgingTaskId(null);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = draftName.trim();
    if (!name) {
      toast.error("Name is required.");
      return;
    }
    if (name === sprint.name) {
      setRenaming(false);
      return;
    }
    setRenamingSaving(true);
    try {
      await updateSprint(sprint.id, { name });
      toast.success("Sprint renamed.");
      setRenaming(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rename sprint");
    } finally {
      setRenamingSaving(false);
    }
  };

  const pickerSprints = useMemo(() => {
    const rank = { active: 0, planning: 1, closed: 2 } as const;
    return [...sprints].sort((a, b) => rank[a.status] - rank[b.status] || b.id - a.id);
  }, [sprints]);

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
        <div className="min-w-0 max-w-3xl">
          <div className="obs-eyebrow-row">
            <div className="obs-accent-bar-cyan" />
            <span className="text-eyebrow text-eyebrow-cyan">
              {SPRINT_STATUS_LABELS[sprint.status]}
            </span>
          </div>
          {renaming ? (
            <form
              className="mt-1 flex max-w-xl flex-wrap items-center gap-3"
              onSubmit={handleRename}
            >
              <label className="obs-input-row min-h-11 min-w-0 flex-1">
                <input
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      cancelRename();
                    }
                  }}
                  aria-label="Sprint name"
                  autoFocus
                />
              </label>
              <Button type="submit" disabled={renamingSaving} className="my-0">
                {renamingSaving ? "Saving…" : "Save"}
              </Button>
              <button
                type="button"
                onClick={cancelRename}
                className="cursor-pointer rounded-full border border-(--obs-border) bg-transparent px-5 py-3 font-mono text-[0.7rem] uppercase tracking-widest text-(--obs-text-muted)"
              >
                Cancel
              </button>
            </form>
          ) : (
            <h1 className="mb-0 text-fluid-page-hero">{sprint.name}</h1>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="m-0 font-mono text-[0.72rem] uppercase tracking-widest text-(--obs-text-faint)">
              {formatSprintDates(sprint.starts_on, sprint.ends_on)}
            </p>
            {isExec && !renaming ? (
              <button
                type="button"
                onClick={() => setRenaming(true)}
                className="cursor-pointer rounded-full border border-(--obs-border) bg-transparent px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-[#19B5CA]"
              >
                Rename
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {canEdit ? (
            <Button className="my-0" onClick={() => setTaskModal("create")}>
              Add task
            </Button>
          ) : null}
          {isExec && sprint.status === "active" ? (
            <button
              type="button"
              onClick={() => setCloseOpen(true)}
              className="cursor-pointer rounded-full border border-[rgba(245,129,52,0.45)] bg-[rgba(245,129,52,0.1)] px-5 py-3 font-mono text-[0.7rem] uppercase tracking-widest text-[#F58134]"
            >
              Close sprint
            </button>
          ) : null}
        </div>
      </div>

      <SprintHowTo />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {allTime
            ? null
            : [MINE_TAB, "ALL", ...teamKeys].map(key => {
                const active = teamTab === key;
                const hours = key === "ALL" || key === MINE_TAB ? null : hoursByTeam.get(key);
                const accent =
                  key === MINE_TAB ? "#F58134" : key === "ALL" ? "#19B5CA" : teamAccent(key);
                const label =
                  key === MINE_TAB
                    ? firstName(member.full_name) || "You"
                    : key === "ALL"
                      ? "All teams"
                      : teamLabel(key, catalog);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTeamTab(key)}
                    className={twMerge(
                      "cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest",
                      active
                        ? "text-(--obs-text-primary)"
                        : "bg-transparent text-(--obs-text-muted)"
                    )}
                    style={
                      active
                        ? {
                            borderColor: `${accent}80`,
                            background: `${accent}22`,
                            color: accent,
                          }
                        : { borderColor: "var(--obs-border)" }
                    }
                  >
                    {label}
                    {hours != null ? ` · ${hours}h` : ""}
                  </button>
                );
              })}
        </div>
        <div className="w-full min-w-0 sm:w-72">
          <PersonTypeahead
            label="Person"
            required={allTime}
            options={assignees}
            valueId={assigneeFilter}
            onChange={setAssigneeFilter}
            noneLabel={allTime ? undefined : "Everyone"}
            placeholder={allTime ? "Search a person across every sprint…" : "Search people…"}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-(--obs-text-muted)">Loading tasks…</p>
      ) : allTime && assigneeFilter == null ? (
        <p className="m-0 rounded-2xl border border-dashed border-(--obs-border) px-4 py-16 text-center text-sm text-(--obs-text-muted)">
          Search a person to see every task they have been assigned, across all sprints.
        </p>
      ) : (
        <div className="grid min-h-[28rem] grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {SPRINT_BOARD_COLUMNS.map(column => {
            const columnTasks = visibleTasks.filter(t => t.status === column.status);
            const expanded = Boolean(expandedColumns[column.status]);
            const shown = expanded ? columnTasks : columnTasks.slice(0, COLUMN_TASK_PREVIEW);
            const hidden = Math.max(0, columnTasks.length - shown.length);
            const accent = COLUMN_ACCENT[column.status];
            return (
              <section
                key={column.status}
                onDragOver={e => {
                  if (!canMove) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={e => {
                  e.preventDefault();
                  void handleDrop(column.status);
                }}
                className="flex min-h-[24rem] min-w-0 flex-col rounded-2xl border bg-[rgba(8,14,25,0.72)] p-4"
                style={{
                  borderColor: `${accent}55`,
                  boxShadow: `inset 0 1px 0 ${accent}22, 0 12px 32px ${accent}0d`,
                }}
              >
                <h2 className="m-0 mb-4 flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
                    />
                    <span
                      className="font-mono text-[0.82rem] font-semibold uppercase tracking-[0.16em]"
                      style={{ color: accent }}
                    >
                      {column.label}
                    </span>
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.5 font-mono text-[0.68rem] tabular-nums"
                    style={{ background: `${accent}22`, color: accent }}
                  >
                    {columnTasks.length}
                  </span>
                </h2>
                <div className="flex flex-1 flex-col gap-3">
                  {columnTasks.length === 0 ? (
                    <p className="m-0 rounded-xl border border-dashed border-(--obs-border) px-3 py-8 text-center text-xs text-(--obs-text-faint)">
                      {column.status === "todo" && canMove
                        ? "New tasks land here."
                        : allTime
                          ? "None"
                          : "Drop a card here"}
                    </p>
                  ) : (
                    shown.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        compact
                        showTeam
                        sprintNames={
                          allTime
                            ? task.sprint_ids
                                .map(id => sprintNameById.get(id))
                                .filter((name): name is string => Boolean(name))
                            : undefined
                        }
                        canEdit={canMove}
                        nudging={nudgingTaskId === task.id}
                        onEdit={() => setTaskModal(task.id)}
                        onNudge={canMove ? handleNudgeOverdue : undefined}
                        onDragStart={() => {
                          draggingId.current = task.id;
                        }}
                      />
                    ))
                  )}
                  {hidden > 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedColumns(prev => ({ ...prev, [column.status]: true }))
                      }
                      className="cursor-pointer rounded-xl border border-(--obs-border) bg-transparent py-2 font-mono text-[0.65rem] uppercase tracking-widest text-(--obs-text-muted)"
                    >
                      Show more · {hidden}
                    </button>
                  ) : null}
                  {expanded && columnTasks.length > COLUMN_TASK_PREVIEW ? (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedColumns(prev => ({ ...prev, [column.status]: false }))
                      }
                      className="cursor-pointer border-0 bg-transparent py-1 font-mono text-[0.65rem] uppercase tracking-widest text-(--obs-text-faint)"
                    >
                      Show less
                    </button>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {loading || allTime ? null : (
        <SprintIdleMembers
          members={assignees}
          tasks={tasks}
          teamTab={teamTab === MINE_TAB ? "ALL" : teamTab}
          sprintId={sprint.id}
          canNudge={canEdit}
        />
      )}

      {allTime ? null : (
        <SprintStats
          tasks={visibleTasks}
          sprint={sprint}
          teamTab={teamTab === MINE_TAB ? "ALL" : teamTab}
        />
      )}

      {taskModal !== null ? (
        <TaskModal
          mode={taskModal === "create" ? "create" : "edit"}
          task={editingTask}
          defaultTeamKey={
            teamTab !== "ALL" && teamTab !== MINE_TAB ? teamTab : defaultTeamKey(member.teams)
          }
          teamOptions={teamOptions}
          defaultAssigneeId={member.id}
          currentMemberId={member.id}
          currentSprintId={sprint.id}
          sprints={pickerSprints}
          assignees={assignees}
          onClose={() => setTaskModal(null)}
          onDelete={
            canEdit && editingTask
              ? async () => {
                  await deleteTask(editingTask.id);
                  toast.success("Task deleted.");
                }
              : undefined
          }
          onSave={async input => {
            if (taskModal === "create") {
              const created = await createTask({
                ...input,
                created_by: member.id,
              });
              toast.success(created.length > 1 ? `Added ${created.length} tasks.` : "Task added.");
            } else if (editingTask) {
              await updateTask({ ...input, id: editingTask.id });
              toast.success("Task updated.");
            }
          }}
        />
      ) : null}

      {closeOpen ? (
        <CloseSprintDialog
          currentSprint={sprint}
          planningSprint={planningSprint}
          openTasks={openTasks}
          onClose={() => setCloseOpen(false)}
          onConfirm={handleCloseConfirm}
        />
      ) : null}
    </div>
  );
}
