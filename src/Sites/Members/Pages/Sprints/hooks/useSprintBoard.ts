import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { supabase } from "src/Utils/supabase";

import { isOpenSprintTaskStatus } from "../constants";
import type {
  RetroDecision,
  SprintAssignee,
  SprintTaskRow,
  SprintTaskStatus,
  TaskWriteInput,
} from "../types";

type MemberEmbed = { id: number; full_name: string | null; email: string | null };

type AssigneeJoin = {
  member_id: number;
  Members: MemberEmbed | MemberEmbed[] | null;
};

type TaskQueryRow = Omit<SprintTaskRow, "assignees" | "reviewer" | "sprint_ids"> & {
  SprintTaskAssignees: AssigneeJoin[] | null;
  reviewer: MemberEmbed | MemberEmbed[] | null;
};

function embedMember(raw: MemberEmbed | MemberEmbed[] | null): MemberEmbed | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

function toAssignee(raw: MemberEmbed | null): SprintAssignee | null {
  if (!raw) return null;
  return {
    id: raw.id,
    full_name: raw.full_name ?? "Unknown",
    email: raw.email ?? "",
  };
}

function mapTask(row: TaskQueryRow, sprintIds: number[]): SprintTaskRow {
  const assignees: SprintAssignee[] = (row.SprintTaskAssignees ?? [])
    .map(join => toAssignee(embedMember(join.Members)))
    .filter((a): a is SprintAssignee => a !== null);

  const ids = sprintIds.length > 0 ? sprintIds : row.sprint_id ? [row.sprint_id] : [];

  return {
    id: row.id,
    sprint_id: row.sprint_id,
    team_key: row.team_key,
    title: row.title,
    description: row.description,
    expected_hours: Number(row.expected_hours ?? 0),
    actual_hours: row.actual_hours == null ? null : Number(row.actual_hours),
    status: row.status,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at,
    expected_completion_on: row.expected_completion_on
      ? String(row.expected_completion_on).slice(0, 10)
      : null,
    reviewer_id: row.reviewer_id,
    relevant_url: row.relevant_url,
    review_approved: Boolean(row.review_approved),
    review_comment: row.review_comment,
    reviewed_at: row.reviewed_at,
    reviewer: toAssignee(embedMember(row.reviewer)),
    assignees,
    sprint_ids: ids,
  };
}

const TASK_SELECT =
  "id, sprint_id, team_key, title, description, expected_hours, actual_hours, status, created_by, created_at, updated_at, completed_at, expected_completion_on, reviewer_id, relevant_url, review_approved, review_comment, reviewed_at, reviewer:Members!reviewer_id(id, full_name, email), SprintTaskAssignees(member_id, Members(id, full_name, email))";

async function notifySprintTask(kind: "assigned" | "pending_review", taskId: number) {
  try {
    const { data, error } = await supabase.functions.invoke("notify-sprint-task", {
      body: { kind, task_id: taskId },
    });
    if (error) {
      toast.error("Task saved. Email notification could not be sent.");
      return;
    }
    if (data && typeof data === "object" && "error" in data && data.error) {
      toast.error("Task saved. Email notification could not be sent.");
    }
  } catch {
    toast.error("Task saved. Email notification could not be sent.");
  }
}

export async function nudgeIdleMembers(sprintId: number, memberIds: number[]) {
  const { data, error } = await supabase.functions.invoke("notify-sprint-task", {
    body: { kind: "nudge", sprint_id: sprintId, member_ids: memberIds },
  });
  if (error) {
    throw new Error(error.message || "Could not send nudge");
  }
  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String(data.error));
  }
  const emailed = data && typeof data === "object" && "emailed" in data ? Number(data.emailed) : 0;
  if (!Number.isFinite(emailed) || emailed <= 0) {
    throw new Error("No nudge emails were sent.");
  }
  return emailed;
}

export function useSprintBoard(sprintId: number | null) {
  const [tasks, setTasks] = useState<SprintTaskRow[]>([]);
  const [loading, setLoading] = useState(Boolean(sprintId));

  const reload = useCallback(async () => {
    if (!sprintId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: links, error: linkError } = await supabase
      .from("SprintTaskSprints")
      .select("task_id")
      .eq("sprint_id", sprintId);

    const { data: legacy, error: legacyError } = await supabase
      .from("SprintTasks")
      .select("id")
      .eq("sprint_id", sprintId);

    if (linkError && legacyError) {
      toast.error(linkError.message);
      setTasks([]);
      setLoading(false);
      return;
    }

    const ids = [
      ...new Set([
        ...(links ?? []).map(l => l.task_id as number),
        ...(legacy ?? []).map(l => l.id as number),
      ]),
    ];
    if (ids.length === 0) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("SprintTasks")
      .select(TASK_SELECT)
      .in("id", ids)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error(error.message);
      setTasks([]);
      setLoading(false);
      return;
    }

    const { data: memberships } = await supabase
      .from("SprintTaskSprints")
      .select("task_id, sprint_id")
      .in("task_id", ids);

    const sprintIdsByTask = new Map<number, number[]>();
    for (const row of memberships ?? []) {
      const list = sprintIdsByTask.get(row.task_id) ?? [];
      list.push(row.sprint_id);
      sprintIdsByTask.set(row.task_id, list);
    }

    setTasks(
      ((data ?? []) as unknown as TaskQueryRow[]).map(row =>
        mapTask(row, sprintIdsByTask.get(row.id) ?? [])
      )
    );
    setLoading(false);
  }, [sprintId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const replaceAssignees = async (taskId: number, memberIds: number[]) => {
    const { error: delError } = await supabase
      .from("SprintTaskAssignees")
      .delete()
      .eq("task_id", taskId);
    if (delError) throw delError;
    if (memberIds.length === 0) return;
    const { error: insError } = await supabase
      .from("SprintTaskAssignees")
      .insert(memberIds.map(member_id => ({ task_id: taskId, member_id })));
    if (insError) throw insError;
  };

  const replaceSprints = async (taskId: number, sprintIds: number[]) => {
    const unique = [...new Set(sprintIds)];
    const { error: delError } = await supabase
      .from("SprintTaskSprints")
      .delete()
      .eq("task_id", taskId);
    if (delError) throw delError;
    if (unique.length === 0) return;
    const { error: insError } = await supabase
      .from("SprintTaskSprints")
      .insert(unique.map(sid => ({ task_id: taskId, sprint_id: sid })));
    if (insError) throw insError;
  };

  const writePayload = (input: TaskWriteInput) => ({
    team_key: input.team_key,
    title: input.title.trim(),
    description: input.description.trim(),
    expected_hours: input.expected_hours,
    actual_hours: input.actual_hours,
    status: input.status,
    reviewer_id: input.reviewer_id,
    relevant_url: input.relevant_url,
    review_approved:
      input.status === "done" && input.reviewer_id == null ? true : input.review_approved,
    review_comment: input.review_comment,
    reviewed_at:
      input.reviewer_id != null && input.review_approved ? new Date().toISOString() : null,
    sprint_id: input.sprint_ids[0],
    expected_completion_on: input.expected_completion_on,
  });

  const createTask = async (input: TaskWriteInput & { created_by: number }) => {
    const sprintIds = input.sprint_ids.length > 0 ? input.sprint_ids : [];
    if (sprintIds.length === 0) throw new Error("Select at least one sprint.");

    const assigneeGroups =
      input.create_per_assignee && input.assignee_ids.length > 0
        ? [...new Set(input.assignee_ids)].map(id => [id])
        : [input.assignee_ids];

    const createdIds: number[] = [];
    for (const assignee_ids of assigneeGroups) {
      const { data, error } = await supabase
        .from("SprintTasks")
        .insert({
          ...writePayload({
            ...input,
            status: "todo",
            review_approved: false,
            review_comment: null,
          }),
          created_by: input.created_by,
          actual_hours: null,
        })
        .select("id")
        .single();

      if (error) throw error;
      await replaceAssignees(data.id, assignee_ids);
      await replaceSprints(data.id, sprintIds);
      await notifySprintTask("assigned", data.id);
      createdIds.push(data.id);
    }

    await reload();
    return createdIds;
  };

  const updateTask = async (input: TaskWriteInput & { id: number }) => {
    if (input.sprint_ids.length === 0) throw new Error("Select at least one sprint.");
    const previous = tasks.find(t => t.id === input.id);
    const { error } = await supabase
      .from("SprintTasks")
      .update(writePayload(input))
      .eq("id", input.id);
    if (error) throw error;
    await replaceAssignees(input.id, input.assignee_ids);
    await replaceSprints(input.id, input.sprint_ids);
    if (input.status === "pending_review" && previous?.status !== "pending_review") {
      await notifySprintTask("pending_review", input.id);
    }
    await reload();
  };

  const moveTask = async (task: SprintTaskRow, status: SprintTaskStatus) => {
    if ((status === "pending_review" || status === "done") && task.actual_hours == null) {
      throw new Error("Log actual hours before moving this task to pending review or complete.");
    }
    if (status === "pending_review" && task.reviewer_id == null) {
      throw new Error("This task has no reviewer. Move it to Complete instead.");
    }
    if (status === "done" && task.reviewer_id != null && !task.review_approved) {
      throw new Error(
        `Waiting on ${task.reviewer?.full_name ?? "the reviewer"} to approve this task.`
      );
    }
    const patch: { status: SprintTaskStatus; review_approved?: boolean } = { status };
    if (status === "done" && task.reviewer_id == null) {
      patch.review_approved = true;
    }
    const { error } = await supabase.from("SprintTasks").update(patch).eq("id", task.id);
    if (error) throw error;
    if (status === "pending_review" && task.status !== "pending_review") {
      await notifySprintTask("pending_review", task.id);
    }
    await reload();
  };

  const closeSprint = async (input: {
    currentSprintId: number;
    nextSprintId: number | null;
    decisions: Record<number, RetroDecision>;
  }) => {
    const openTasks = tasks.filter(t => isOpenSprintTaskStatus(t.status));

    for (const task of openTasks) {
      const decision = input.decisions[task.id] ?? "drop";
      if (decision === "done") {
        const { error } = await supabase
          .from("SprintTasks")
          .update({
            status: "done",
            review_approved: true,
            reviewed_at: new Date().toISOString(),
            actual_hours: task.actual_hours ?? task.expected_hours,
          })
          .eq("id", task.id);
        if (error) throw error;
      } else if (decision === "drop") {
        const { error } = await supabase
          .from("SprintTasks")
          .update({ status: "cancelled" })
          .eq("id", task.id);
        if (error) throw error;
      } else if (decision === "roll") {
        if (!input.nextSprintId) {
          throw new Error("Create or select the next sprint before rolling tasks.");
        }
        await replaceSprints(task.id, [
          ...task.sprint_ids.filter(id => id !== input.currentSprintId),
          input.nextSprintId,
        ]);
        const { error } = await supabase
          .from("SprintTasks")
          .update({ sprint_id: input.nextSprintId })
          .eq("id", task.id);
        if (error) throw error;
      }
    }

    const { error: closeError } = await supabase
      .from("Sprints")
      .update({ status: "closed" })
      .eq("id", input.currentSprintId);
    if (closeError) throw closeError;

    if (input.nextSprintId) {
      const { error: activateError } = await supabase
        .from("Sprints")
        .update({ status: "active" })
        .eq("id", input.nextSprintId);
      if (activateError) throw activateError;
    }

    await reload();
  };

  return { tasks, loading, reload, createTask, updateTask, moveTask, closeSprint };
}
