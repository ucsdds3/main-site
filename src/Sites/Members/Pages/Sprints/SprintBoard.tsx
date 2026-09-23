import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { boardTeamTabKeys } from "src/Sites/Main/Pages/Board/boardTeamConfig";
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
  formatSprintDates,
  isOpenSprintTaskStatus,
  SPRINT_BOARD_COLUMNS,
  SPRINT_STATUS_LABELS,
  teamAccent,
  teamLabel,
} from "./constants";
import { useBoardAssignees } from "./hooks/useBoardAssignees";
import { useSprintBoard } from "./hooks/useSprintBoard";
import type { CurrentMember, RetroDecision, SprintRow, SprintTaskStatus } from "./types";

type SprintBoardProps = {
  sprint: SprintRow;
  planningSprint: SprintRow | null;
  sprints: SprintRow[];
  member: CurrentMember;
  onSprintsChanged: () => Promise<void> | void;
  createSprint: (input: {
    name: string;
    starts_on: string;
    ends_on: string;
    created_by: number;
    status?: "planning" | "active";
  }) => Promise<SprintRow>;
};

export default function SprintBoard({
  sprint,
  planningSprint,
  sprints,
  member,
  onSprintsChanged,
  createSprint,
}: SprintBoardProps) {
  const { assignees } = useBoardAssignees();
  const { tasks, loading, createTask, updateTask, moveTask, closeSprint } = useSprintBoard(
    sprint.id
  );
  const [teamTab, setTeamTab] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<number | null>(null);
  const [taskModal, setTaskModal] = useState<"create" | number | null>(null);
  const [closeOpen, setCloseOpen] = useState(false);
  const [expandedColumns, setExpandedColumns] = useState<
    Partial<Record<SprintTaskStatus, boolean>>
  >({});
  const draggingId = useRef<number | null>(null);

  const isExec = member.admin_level === "Executive";
  const canEdit = sprint.status !== "closed";
  const editingTask = typeof taskModal === "number" ? tasks.find(t => t.id === taskModal) : null;

  const teamKeys = useMemo(() => boardTeamTabKeys(tasks.map(t => t.team_key)), [tasks]);

  const visibleTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.status === "cancelled") return false;
      if (teamTab !== "ALL" && task.team_key !== teamTab) return false;
      if (assigneeFilter != null && !task.assignees.some(a => a.id === assigneeFilter)) {
        return false;
      }
      return true;
    });
  }, [tasks, teamTab, assigneeFilter]);

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
    if (id == null || !canEdit) return;
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === status) return;
    if ((status === "pending_review" || status === "done") && task.actual_hours == null) {
      toast.error("Log actual hours before pending review.");
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

  const pickerSprints = useMemo(() => {
    const rank = { active: 0, planning: 1, closed: 2 } as const;
    return [...sprints].sort((a, b) => rank[a.status] - rank[b.status] || b.id - a.id);
  }, [sprints]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="obs-eyebrow-row">
            <div className="obs-accent-bar-cyan" />
            <span className="text-eyebrow text-eyebrow-cyan">
              {SPRINT_STATUS_LABELS[sprint.status]}
            </span>
          </div>
          <h1 className="mt-3 mb-0 text-fluid-page-hero">{sprint.name}</h1>
          <p className="mt-2 mb-0 font-mono text-[0.72rem] uppercase tracking-widest text-(--obs-text-faint)">
            {formatSprintDates(sprint.starts_on, sprint.ends_on)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
        <div className="flex flex-wrap gap-2">
          {["ALL", ...teamKeys].map(key => {
            const active = teamTab === key;
            const hours = key === "ALL" ? null : hoursByTeam.get(key);
            const accent = key === "ALL" ? "#19B5CA" : teamAccent(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTeamTab(key)}
                className={twMerge(
                  "cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest",
                  active ? "text-(--obs-text-primary)" : "bg-transparent text-(--obs-text-muted)"
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
                {key === "ALL" ? "All teams" : teamLabel(key)}
                {hours != null ? ` · ${hours}h` : ""}
              </button>
            );
          })}
        </div>
        <div className="w-full min-w-0 sm:w-72">
          <PersonTypeahead
            label="Person"
            options={assignees}
            valueId={assigneeFilter}
            onChange={setAssigneeFilter}
            noneLabel="Everyone"
            placeholder="Search people…"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-(--obs-text-muted)">Loading tasks…</p>
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
                  if (!canEdit) return;
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
                      {column.status === "todo" && canEdit
                        ? "New tasks land here."
                        : "Drop a card here"}
                    </p>
                  ) : (
                    shown.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        compact
                        showTeam={teamTab === "ALL"}
                        canEdit={canEdit}
                        onEdit={() => setTaskModal(task.id)}
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

      {loading ? null : (
        <SprintIdleMembers members={assignees} tasks={tasks} teamTab={teamTab} />
      )}

      <SprintStats tasks={tasks} sprint={sprint} teamTab={teamTab} />

      {taskModal !== null ? (
        <TaskModal
          mode={taskModal === "create" ? "create" : "edit"}
          task={editingTask}
          defaultTeamKey={defaultTeamKey(member.teams)}
          defaultAssigneeId={member.id}
          currentMemberId={member.id}
          currentSprintId={sprint.id}
          sprints={pickerSprints}
          assignees={assignees}
          onClose={() => setTaskModal(null)}
          onSave={async input => {
            if (taskModal === "create") {
              await createTask({
                ...input,
                created_by: member.id,
              });
              toast.success("Task added.");
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
