import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

// Business rules mirror the /sprints UI. Keep these in sync with
// src/Sites/Members/Pages/Sprints/constants.ts and hooks/useSprintBoard.ts.
export const MIN_TASK_DESCRIPTION_LENGTH = 20;
export const MAX_EXPECTED_HOURS = 5;
export const MAX_PROGRESS_NOTES_WORDS = 100;

export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "pending_review",
  "done",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type SprintStatus = "planning" | "active" | "closed";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  pending_review: "Pending review",
  done: "Complete",
  cancelled: "Dropped",
};

/** A member, sprint, or team the caller names by id, email, or name. */
export type Ref = number | string;

export type Sprint = {
  id: number;
  name: string;
  starts_on: string;
  ends_on: string;
  status: SprintStatus;
};

export type Person = { id: number; full_name: string; email: string };

export type BoardMember = Person & {
  admin_level: "Board" | "Executive";
  team_keys: string[];
};

export type Team = { team_key: string; label: string };

export type Task = {
  id: number;
  sprint_id: number;
  team_key: string;
  title: string;
  description: string | null;
  progress_notes: string | null;
  expected_hours: number;
  actual_hours: number | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  expected_completion_on: string | null;
  reviewer_id: number | null;
  relevant_url: string | null;
  review_approved: boolean;
  review_comment: string | null;
  reviewed_at: string | null;
  reviewer: Person | null;
  creator: Person | null;
  assignees: Person[];
  sprint_ids: number[];
};

/** An error whose message is safe and useful to hand straight back to the model. */
export class BoardError extends Error {}

type MemberEmbed = { id: number; full_name: string | null; email: string | null };
type Embedded = MemberEmbed | MemberEmbed[] | null;
type TaskQueryRow = Omit<Task, "assignees" | "reviewer" | "creator" | "sprint_ids"> & {
  SprintTaskAssignees: { member_id: number; Members: Embedded }[] | null;
  reviewer: Embedded;
  creator: Embedded;
};

const TASK_SELECT =
  "id, sprint_id, team_key, title, description, progress_notes, expected_hours, actual_hours, status, created_at, updated_at, completed_at, expected_completion_on, reviewer_id, relevant_url, review_approved, review_comment, reviewed_at, reviewer:Members!reviewer_id(id, full_name, email), creator:Members!created_by(id, full_name, email), SprintTaskAssignees(member_id, Members(id, full_name, email))";

function check(error: PostgrestError | null): void {
  if (error) throw new BoardError(error.message);
}

function toPerson(raw: Embedded): Person | null {
  const row = Array.isArray(raw) ? (raw[0] ?? null) : raw;
  if (!row) return null;
  return { id: row.id, full_name: row.full_name ?? "Unknown", email: row.email ?? "" };
}

function mapTask(row: TaskQueryRow, sprintIds: number[]): Task {
  return {
    ...row,
    expected_hours: Number(row.expected_hours ?? 0),
    actual_hours: row.actual_hours == null ? null : Number(row.actual_hours),
    expected_completion_on: row.expected_completion_on
      ? String(row.expected_completion_on).slice(0, 10)
      : null,
    review_approved: Boolean(row.review_approved),
    reviewer: toPerson(row.reviewer),
    creator: toPerson(row.creator),
    assignees: (row.SprintTaskAssignees ?? [])
      .map(join => toPerson(join.Members))
      .filter((p): p is Person => p !== null),
    sprint_ids: sprintIds.length > 0 ? sprintIds : [row.sprint_id],
  };
}

/** Label → BoardTeams / Members.teams key: spaces → underscores, uppercased. */
export function labelToTeamKey(label: string): string {
  return label.trim().replace(/\s+/g, "_").toUpperCase();
}

function normalizeTeams(raw: unknown): string[] {
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.keys(value).map(labelToTeamKey);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function today(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

export function isOverdue(task: Pick<Task, "expected_completion_on" | "status">): boolean {
  if (!task.expected_completion_on) return false;
  if (task.status === "done" || task.status === "cancelled") return false;
  return task.expected_completion_on < today();
}

export function isOpen(status: TaskStatus): boolean {
  return status === "todo" || status === "in_progress" || status === "pending_review";
}

function validDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new BoardError(`"${value}" is not a date in YYYY-MM-DD form.`);
  }
  return value;
}

function validHours(value: number, label: string, max?: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new BoardError(`${label} must be a number 0 or greater.`);
  }
  if (max != null && value > max) {
    throw new BoardError(`No task should be above ${max} hours — split the work.`);
  }
  return value;
}

function validUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") return trimmed;
  } catch {
    // fall through
  }
  throw new BoardError("Relevant URL must be a valid http(s) link.");
}

function validDescription(value: string): string {
  const brief = value.trim();
  if (brief.length < MIN_TASK_DESCRIPTION_LENGTH) {
    throw new BoardError(`Description must be at least ${MIN_TASK_DESCRIPTION_LENGTH} characters.`);
  }
  return brief;
}

function validNotes(value: string | null): string | null {
  const notes = value?.trim() ?? "";
  if (wordCount(notes) > MAX_PROGRESS_NOTES_WORDS) {
    throw new BoardError(`Notes must be ${MAX_PROGRESS_NOTES_WORDS} words or fewer.`);
  }
  return notes || null;
}

export type CreateTaskInput = {
  title: string;
  description: string;
  team?: string;
  assignees?: Ref[];
  assign_whole_team?: boolean;
  expected_hours: number;
  due_date?: string;
  reviewer?: Ref | null;
  relevant_url?: string | null;
  sprints?: Ref[];
  notify?: boolean;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  team?: string;
  expected_hours?: number;
  actual_hours?: number | null;
  due_date?: string;
  relevant_url?: string | null;
  progress_notes?: string | null;
  reviewer?: Ref | null;
  assignees?: Ref[];
  add_assignees?: Ref[];
  remove_assignees?: Ref[];
  sprints?: Ref[];
};

export type TaskFilter = {
  team?: string;
  statuses?: TaskStatus[];
  assignee?: Ref;
  reviewer?: Ref;
  mine?: boolean;
  overdue_only?: boolean;
  include_dropped?: boolean;
};

/**
 * Sprint board operations for one signed-in Board/Executive member. Every query
 * goes through the member's own Supabase session, so the sprints RLS policies
 * apply exactly as they do in the members portal.
 */
export class SprintBoard {
  private me: BoardMember | null = null;

  constructor(private readonly sb: SupabaseClient) {}

  // ---------------------------------------------------------------- people

  async whoami(): Promise<BoardMember> {
    if (this.me) return this.me;
    const { data: auth, error: authError } = await this.sb.auth.getUser();
    if (authError || !auth.user?.email) {
      throw new BoardError(authError?.message ?? "Not signed in.");
    }
    const { data, error } = await this.sb
      .from("Members")
      .select("id, full_name, email, teams, admin_level, deleted")
      .eq("email", auth.user.email.toLowerCase())
      .limit(1)
      .maybeSingle();
    check(error);
    if (!data || data.deleted) {
      throw new BoardError(`No Members row for ${auth.user.email}.`);
    }
    if (data.admin_level !== "Board" && data.admin_level !== "Executive") {
      throw new BoardError("The sprint board is only available to Board and Executive members.");
    }
    this.me = {
      id: data.id,
      full_name: data.full_name ?? "Unknown",
      email: data.email ?? auth.user.email,
      admin_level: data.admin_level,
      team_keys: normalizeTeams(data.teams),
    };
    return this.me;
  }

  async listMembers(): Promise<BoardMember[]> {
    const { data, error } = await this.sb
      .from("Members")
      .select("id, full_name, email, teams, admin_level")
      .in("admin_level", ["Board", "Executive"])
      .or("deleted.is.null,deleted.eq.false")
      .order("full_name", { ascending: true });
    check(error);
    return (data ?? []).map(row => ({
      id: row.id,
      full_name: row.full_name ?? "Unknown",
      email: row.email ?? "",
      admin_level: row.admin_level,
      team_keys: normalizeTeams(row.teams),
    }));
  }

  /** Resolve "me", a member id, an email, or a (partial) name to one Board/Exec member. */
  async resolveMember(ref: Ref, members?: BoardMember[]): Promise<BoardMember> {
    const pool = members ?? (await this.listMembers());
    const raw = String(ref).trim();
    const needle = raw.toLowerCase();
    if (needle === "me") return this.whoami();

    let hits: BoardMember[];
    if (/^\d+$/.test(raw)) {
      hits = pool.filter(m => m.id === Number(raw));
    } else if (needle.includes("@")) {
      hits = pool.filter(m => m.email.toLowerCase() === needle);
    } else {
      hits = pool.filter(m => m.full_name.toLowerCase() === needle);
      if (hits.length === 0) {
        hits = pool.filter(m => m.full_name.toLowerCase().includes(needle));
      }
    }

    if (hits.length === 1) return hits[0];
    if (hits.length === 0) {
      throw new BoardError(
        `No Board/Executive member matches "${raw}". Use list_members to see who can be assigned.`
      );
    }
    throw new BoardError(
      `"${raw}" matches more than one member: ${hits
        .map(m => `${m.full_name} <${m.email}> (id ${m.id})`)
        .join("; ")}. Use an email or id.`
    );
  }

  private async resolveMembers(refs: Ref[], members: BoardMember[]): Promise<BoardMember[]> {
    const out = new Map<number, BoardMember>();
    for (const ref of refs) {
      const member = await this.resolveMember(ref, members);
      out.set(member.id, member);
    }
    return [...out.values()];
  }

  // ----------------------------------------------------------------- teams

  async listTeams(): Promise<Team[]> {
    const { data, error } = await this.sb
      .from("BoardTeams")
      .select("team_key, label, sort_order")
      .eq("deleted", false)
      .order("sort_order", { ascending: true });
    if (error) return [];
    return (data ?? []).map(row => ({ team_key: row.team_key, label: row.label }));
  }

  async resolveTeam(input: string): Promise<string> {
    const key = labelToTeamKey(input);
    const teams = await this.listTeams();
    if (teams.length === 0) return key;
    const hit = teams.find(t => t.team_key === key || labelToTeamKey(t.label) === key);
    if (!hit) {
      throw new BoardError(
        `Unknown team "${input}". Teams: ${teams.map(t => t.team_key).join(", ")}.`
      );
    }
    return hit.team_key;
  }

  // --------------------------------------------------------------- sprints

  async listSprints(): Promise<Sprint[]> {
    const { data, error } = await this.sb
      .from("Sprints")
      .select("id, name, starts_on, ends_on, status")
      .order("starts_on", { ascending: false });
    check(error);
    return (data ?? []) as Sprint[];
  }

  /** "active" (default), "planning" (the next one), an id, or a sprint name. */
  async resolveSprint(ref: Ref = "active", sprints?: Sprint[]): Promise<Sprint> {
    const pool = sprints ?? (await this.listSprints());
    const raw = String(ref).trim();
    const needle = raw.toLowerCase();

    let hit: Sprint | undefined;
    if (needle === "active" || needle === "current") {
      hit = pool.find(s => s.status === "active");
      if (!hit) {
        const next = pool.filter(s => s.status === "planning").map(s => `${s.name} (id ${s.id})`);
        throw new BoardError(
          `There is no active sprint.${next.length ? ` Planning: ${next.join(", ")}.` : ""}`
        );
      }
      return hit;
    }
    if (needle === "planning" || needle === "next") {
      hit = pool
        .filter(s => s.status === "planning")
        .sort((a, b) => a.starts_on.localeCompare(b.starts_on) || a.id - b.id)[0];
    } else if (/^\d+$/.test(raw)) {
      hit = pool.find(s => s.id === Number(raw));
    } else {
      hit =
        pool.find(s => s.name.toLowerCase() === needle) ??
        pool.find(s => s.name.toLowerCase().includes(needle));
    }
    if (!hit) throw new BoardError(`No sprint matches "${raw}". Use list_sprints.`);
    return hit;
  }

  private async resolveOpenSprints(refs: Ref[] | undefined): Promise<Sprint[]> {
    const pool = await this.listSprints();
    const wanted = refs && refs.length > 0 ? refs : ["active"];
    const out = new Map<number, Sprint>();
    for (const ref of wanted) {
      const sprint = await this.resolveSprint(ref, pool);
      if (sprint.status === "closed") {
        throw new BoardError(`Sprint "${sprint.name}" is closed; tasks can't be added to it.`);
      }
      out.set(sprint.id, sprint);
    }
    return [...out.values()];
  }

  // ----------------------------------------------------------------- tasks

  private async fetchTasks(ids: number[] | "all"): Promise<Task[]> {
    if (ids !== "all" && ids.length === 0) return [];
    let query = this.sb.from("SprintTasks").select(TASK_SELECT);
    if (ids !== "all") query = query.in("id", ids);
    const { data, error } = await query.order("created_at", { ascending: true });
    check(error);
    const rows = (data ?? []) as unknown as TaskQueryRow[];
    if (rows.length === 0) return [];

    const { data: links, error: linkError } = await this.sb
      .from("SprintTaskSprints")
      .select("task_id, sprint_id")
      .in(
        "task_id",
        rows.map(r => r.id)
      );
    check(linkError);
    const sprintIds = new Map<number, number[]>();
    for (const link of links ?? []) {
      sprintIds.set(link.task_id, [...(sprintIds.get(link.task_id) ?? []), link.sprint_id]);
    }
    return rows.map(row => mapTask(row, sprintIds.get(row.id) ?? []));
  }

  async getTask(id: number): Promise<Task> {
    const [task] = await this.fetchTasks([id]);
    if (!task) throw new BoardError(`Task ${id} not found.`);
    return task;
  }

  /** A sprint's cards: SprintTaskSprints links plus legacy SprintTasks.sprint_id. */
  async sprintTasks(sprintId: number): Promise<Task[]> {
    const [{ data: links, error: linkError }, { data: legacy, error: legacyError }] =
      await Promise.all([
        this.sb.from("SprintTaskSprints").select("task_id").eq("sprint_id", sprintId),
        this.sb.from("SprintTasks").select("id").eq("sprint_id", sprintId),
      ]);
    check(linkError && legacyError);
    const ids = new Set<number>([
      ...(links ?? []).map(l => l.task_id as number),
      ...(legacy ?? []).map(l => l.id as number),
    ]);
    return this.fetchTasks([...ids]);
  }

  async listTasks(
    sprintRef: Ref | undefined,
    filter: TaskFilter
  ): Promise<{ sprint: Sprint | null; tasks: Task[] }> {
    const allSprints = String(sprintRef ?? "").toLowerCase() === "all";
    const sprint = allSprints ? null : await this.resolveSprint(sprintRef);
    let tasks = sprint ? await this.sprintTasks(sprint.id) : await this.fetchTasks("all");

    if (!filter.include_dropped && !filter.statuses?.includes("cancelled")) {
      tasks = tasks.filter(t => t.status !== "cancelled");
    }
    if (filter.statuses?.length) {
      tasks = tasks.filter(t => filter.statuses!.includes(t.status));
    }
    if (filter.team) {
      const key = await this.resolveTeam(filter.team);
      tasks = tasks.filter(t => t.team_key === key);
    }
    if (filter.assignee != null) {
      const member = await this.resolveMember(filter.assignee);
      tasks = tasks.filter(t => t.assignees.some(a => a.id === member.id));
    }
    if (filter.reviewer != null) {
      const member = await this.resolveMember(filter.reviewer);
      tasks = tasks.filter(t => t.reviewer_id === member.id);
    }
    if (filter.mine) {
      const me = await this.whoami();
      tasks = tasks.filter(
        t =>
          t.assignees.some(a => a.id === me.id) ||
          (t.status === "pending_review" && t.reviewer_id === me.id)
      );
    }
    if (filter.overdue_only) {
      tasks = tasks.filter(isOverdue);
    }
    return { sprint, tasks };
  }

  private async notify(
    kind: "assigned" | "pending_review",
    taskId: number
  ): Promise<string | null> {
    try {
      const { data, error } = await this.sb.functions.invoke("notify-sprint-task", {
        body: { kind, task_id: taskId },
      });
      if (error) return `Task ${taskId} saved, but the email notification failed: ${error.message}`;
      if (data && typeof data === "object" && "error" in data && data.error) {
        return `Task ${taskId} saved, but the email notification failed: ${String(data.error)}`;
      }
      return null;
    } catch (err) {
      return `Task ${taskId} saved, but the email notification failed: ${String(err)}`;
    }
  }

  private async setAssignees(taskId: number, from: number[], to: number[]): Promise<void> {
    const removed = from.filter(id => !to.includes(id));
    const added = to.filter(id => !from.includes(id));
    if (added.length > 0) {
      const { error } = await this.sb
        .from("SprintTaskAssignees")
        .insert(added.map(member_id => ({ task_id: taskId, member_id })));
      check(error);
    }
    if (removed.length > 0) {
      const { error } = await this.sb
        .from("SprintTaskAssignees")
        .delete()
        .eq("task_id", taskId)
        .in("member_id", removed);
      check(error);
    }
  }

  private async setSprints(taskId: number, from: number[], to: number[]): Promise<void> {
    const removed = from.filter(id => !to.includes(id));
    const added = to.filter(id => !from.includes(id));
    if (added.length > 0) {
      const { error } = await this.sb
        .from("SprintTaskSprints")
        .insert(added.map(sprint_id => ({ task_id: taskId, sprint_id })));
      check(error);
    }
    if (removed.length > 0) {
      const { error } = await this.sb
        .from("SprintTaskSprints")
        .delete()
        .eq("task_id", taskId)
        .in("sprint_id", removed);
      check(error);
    }
  }

  /** Update one SprintTasks row, failing loudly when RLS silently matches nothing. */
  private async patchTask(id: number, patch: Record<string, unknown>): Promise<void> {
    const { data, error } = await this.sb
      .from("SprintTasks")
      .update(patch)
      .eq("id", id)
      .select("id");
    if (error?.message.includes("row-level security")) {
      throw new BoardError(`Task ${id} can't be edited: none of its sprints is still open.`);
    }
    check(error);
    if (!data || data.length === 0) {
      throw new BoardError(
        `Task ${id} was not updated. It may not exist, or every sprint it belongs to is closed.`
      );
    }
  }

  async createTask(input: CreateTaskInput): Promise<{ tasks: Task[]; warnings: string[] }> {
    const me = await this.whoami();
    const title = input.title.trim();
    if (!title) throw new BoardError("Title is required.");
    const description = validDescription(input.description);
    const expectedHours = validHours(input.expected_hours, "Expected hours", MAX_EXPECTED_HOURS);
    const relevantUrl = validUrl(input.relevant_url);
    const sprints = await this.resolveOpenSprints(input.sprints);
    const teamKey = input.team
      ? await this.resolveTeam(input.team)
      : (me.team_keys[0] ?? "EXECUTIVE");
    const dueOn = validDate(input.due_date ?? sprints[0].ends_on);
    const members = await this.listMembers();
    const reviewer =
      input.reviewer != null ? await this.resolveMember(input.reviewer, members) : null;

    let groups: number[][];
    if (input.assign_whole_team) {
      if (input.assignees?.length) {
        throw new BoardError("Pass either assignees or assign_whole_team, not both.");
      }
      const team = members.filter(m => m.team_keys.includes(teamKey));
      if (team.length === 0) throw new BoardError(`${teamKey} has no Board members to assign.`);
      groups = team.map(m => [m.id]);
    } else {
      const assignees = await this.resolveMembers(input.assignees ?? [], members);
      if (assignees.length === 0) throw new BoardError("Assign at least one person.");
      groups = [assignees.map(a => a.id)];
    }

    const warnings: string[] = [];
    const createdIds: number[] = [];
    for (const assigneeIds of groups) {
      const { data, error } = await this.sb
        .from("SprintTasks")
        .insert({
          sprint_id: sprints[0].id,
          team_key: teamKey,
          title,
          description,
          progress_notes: null,
          expected_hours: expectedHours,
          actual_hours: null,
          status: "todo",
          reviewer_id: reviewer?.id ?? null,
          relevant_url: relevantUrl,
          review_approved: false,
          review_comment: null,
          reviewed_at: null,
          expected_completion_on: dueOn,
          created_by: me.id,
        })
        .select("id")
        .single();
      check(error);
      const taskId = data!.id as number;
      try {
        await this.setAssignees(taskId, [], assigneeIds);
        await this.setSprints(
          taskId,
          [],
          sprints.map(s => s.id)
        );
      } catch (err) {
        // Don't leave a card with no assignee or sprint behind.
        await this.sb.from("SprintTasks").delete().eq("id", taskId);
        throw err;
      }
      createdIds.push(taskId);
      if (input.notify !== false) {
        const warning = await this.notify("assigned", taskId);
        if (warning) warnings.push(warning);
      }
    }
    return { tasks: await this.fetchTasks(createdIds), warnings };
  }

  async updateTask(id: number, input: UpdateTaskInput): Promise<{ task: Task; notes: string[] }> {
    const task = await this.getTask(id);
    const notes: string[] = [];
    const patch: Record<string, unknown> = {};

    if (input.title !== undefined) {
      const title = input.title.trim();
      if (!title) throw new BoardError("Title can't be empty.");
      patch.title = title;
    }
    if (input.description !== undefined) patch.description = validDescription(input.description);
    if (input.team !== undefined) patch.team_key = await this.resolveTeam(input.team);
    if (input.expected_hours !== undefined) {
      patch.expected_hours = validHours(input.expected_hours, "Expected hours", MAX_EXPECTED_HOURS);
    }
    if (input.actual_hours !== undefined) {
      patch.actual_hours =
        input.actual_hours === null ? null : validHours(input.actual_hours, "Actual hours");
    }
    if (input.due_date !== undefined) patch.expected_completion_on = validDate(input.due_date);
    if (input.relevant_url !== undefined) patch.relevant_url = validUrl(input.relevant_url);
    if (input.progress_notes !== undefined) patch.progress_notes = validNotes(input.progress_notes);

    const members = await this.listMembers();
    if (input.reviewer !== undefined) {
      const reviewer =
        input.reviewer === null ? null : await this.resolveMember(input.reviewer, members);
      patch.reviewer_id = reviewer?.id ?? null;
      if (!reviewer && task.status === "pending_review") {
        // Same as the task modal: no reviewer means it can't sit in Pending review.
        patch.status = "in_progress";
        notes.push("Removed the reviewer, so the task moved back to In progress.");
      }
    }

    const currentAssignees = task.assignees.map(a => a.id);
    let nextAssignees = currentAssignees;
    if (input.assignees !== undefined) {
      nextAssignees = (await this.resolveMembers(input.assignees, members)).map(m => m.id);
    }
    if (input.add_assignees?.length) {
      const add = await this.resolveMembers(input.add_assignees, members);
      nextAssignees = [...new Set([...nextAssignees, ...add.map(m => m.id)])];
    }
    if (input.remove_assignees?.length) {
      const remove = await this.resolveMembers(input.remove_assignees, members);
      nextAssignees = nextAssignees.filter(id => !remove.some(m => m.id === id));
    }
    if (nextAssignees.length === 0) throw new BoardError("A task needs at least one assignee.");

    let nextSprints = task.sprint_ids;
    if (input.sprints !== undefined) {
      const pool = await this.listSprints();
      const resolved = new Map<number, Sprint>();
      for (const ref of input.sprints) {
        const sprint = await this.resolveSprint(ref, pool);
        if (sprint.status === "closed" && !task.sprint_ids.includes(sprint.id)) {
          throw new BoardError(`Sprint "${sprint.name}" is closed; tasks can't be added to it.`);
        }
        resolved.set(sprint.id, sprint);
      }
      nextSprints = [...resolved.keys()];
      if (nextSprints.length === 0) throw new BoardError("A task needs at least one sprint.");
      if (!nextSprints.includes(task.sprint_id)) patch.sprint_id = nextSprints[0];
    }

    // Link new sprints before the row update so RLS sees an open sprint on the card.
    await this.setSprints(id, task.sprint_ids, nextSprints);
    if (Object.keys(patch).length > 0) await this.patchTask(id, patch);
    await this.setAssignees(id, currentAssignees, nextAssignees);
    return { task: await this.getTask(id), notes };
  }

  async moveTask(
    id: number,
    status: TaskStatus,
    actualHours?: number
  ): Promise<{ task: Task; warnings: string[] }> {
    const task = await this.getTask(id);
    const actual =
      actualHours !== undefined ? validHours(actualHours, "Actual hours") : task.actual_hours;

    if ((status === "pending_review" || status === "done") && actual == null) {
      throw new BoardError(
        "Log actual hours (actual_hours) before moving this task to pending review or complete."
      );
    }
    if (status === "pending_review" && task.reviewer_id == null) {
      throw new BoardError(
        "This task has no reviewer. Move it to done instead, or add a reviewer."
      );
    }
    if (status === "done" && task.reviewer_id != null && !task.review_approved) {
      throw new BoardError(
        `Waiting on ${task.reviewer?.full_name ?? "the reviewer"} to approve this task. ` +
          "Move it to pending_review; the reviewer approves it with review_task."
      );
    }

    const patch: Record<string, unknown> = { status };
    if (actualHours !== undefined) patch.actual_hours = actual;
    if (status === "done" && task.reviewer_id == null) patch.review_approved = true;
    await this.patchTask(id, patch);

    const warnings: string[] = [];
    if (status === "pending_review" && task.status !== "pending_review") {
      const warning = await this.notify("pending_review", id);
      if (warning) warnings.push(warning);
    }
    return { task: await this.getTask(id), warnings };
  }

  async reviewTask(id: number, decision: "approve" | "send_back", comment?: string): Promise<Task> {
    const me = await this.whoami();
    const task = await this.getTask(id);
    if (task.reviewer_id !== me.id) {
      throw new BoardError(
        task.reviewer
          ? `Only the reviewer, ${task.reviewer.full_name}, can review this task.`
          : "This task has no reviewer."
      );
    }
    if (task.status !== "pending_review") {
      throw new BoardError(
        `Task ${id} is ${STATUS_LABELS[task.status]}, not Pending review. Nothing to review yet.`
      );
    }

    if (decision === "approve") {
      await this.patchTask(id, {
        status: "done",
        review_approved: true,
        review_comment: comment?.trim() || null,
        reviewed_at: new Date().toISOString(),
      });
    } else {
      // The board stores no "changes requested" state: going back to In progress clears
      // the review fields (sprint_tasks_guard_complete).
      await this.patchTask(id, { status: "in_progress" });
    }
    return this.getTask(id);
  }

  async deleteTask(id: number): Promise<Task> {
    const task = await this.getTask(id);
    // Assignee and sprint links cascade. Deleting the card first means a refused delete
    // (closed sprint) leaves the card intact instead of stripped of its links.
    const { data, error } = await this.sb.from("SprintTasks").delete().eq("id", id).select("id");
    check(error);
    if (!data || data.length === 0) {
      throw new BoardError(`Task ${id} was not deleted; its sprint may be closed.`);
    }
    return task;
  }

  async summary(sprintRef?: Ref) {
    const sprint = await this.resolveSprint(sprintRef);
    const [tasks, members, me] = await Promise.all([
      this.sprintTasks(sprint.id),
      this.listMembers(),
      this.whoami(),
    ]);
    const live = tasks.filter(t => t.status !== "cancelled");

    const byStatus = Object.fromEntries(
      TASK_STATUSES.map(s => [s, tasks.filter(t => t.status === s).length])
    );
    const people = members.map(m => {
      const mine = live.filter(t => t.assignees.some(a => a.id === m.id));
      const open = mine.filter(t => isOpen(t.status));
      return {
        id: m.id,
        name: m.full_name,
        teams: m.team_keys,
        open_tasks: open.length,
        open_expected_hours: open.reduce((sum, t) => sum + t.expected_hours, 0),
        done_tasks: mine.filter(t => t.status === "done").length,
        actual_hours_logged: mine.reduce((sum, t) => sum + (t.actual_hours ?? 0), 0),
        reviews_waiting_on_them: live.filter(
          t => t.status === "pending_review" && t.reviewer_id === m.id
        ).length,
      };
    });

    return {
      sprint,
      totals: {
        tasks: live.length,
        by_status: byStatus,
        expected_hours: live.reduce((sum, t) => sum + t.expected_hours, 0),
        actual_hours: live.reduce((sum, t) => sum + (t.actual_hours ?? 0), 0),
      },
      waiting_on_my_review: live
        .filter(t => t.status === "pending_review" && t.reviewer_id === me.id)
        .map(t => brief(t)),
      overdue: live.filter(isOverdue).map(t => brief(t)),
      pending_review: live.filter(t => t.status === "pending_review").map(t => brief(t)),
      idle_members: people.filter(p => !live.some(t => t.assignees.some(a => a.id === p.id))),
      people: people.filter(p => live.some(t => t.assignees.some(a => a.id === p.id))),
    };
  }
}

/** One-line-per-field view of a card for list output. */
export function brief(task: Task) {
  return {
    id: task.id,
    title: task.title,
    team: task.team_key,
    status: task.status,
    assignees: task.assignees.map(a => a.full_name),
    reviewer: task.reviewer?.full_name ?? null,
    expected_hours: task.expected_hours,
    actual_hours: task.actual_hours,
    due: task.expected_completion_on,
    overdue: isOverdue(task),
    sprint_ids: task.sprint_ids,
  };
}

/** Everything about a card, for get_task and write results. */
export function detail(task: Task) {
  return {
    ...brief(task),
    status_label: STATUS_LABELS[task.status],
    description: task.description,
    progress_notes: task.progress_notes,
    relevant_url: task.relevant_url,
    assignees: task.assignees,
    reviewer: task.reviewer,
    review_approved: task.review_approved,
    review_comment: task.review_comment,
    reviewed_at: task.reviewed_at,
    completed_at: task.completed_at,
    created_by: task.creator,
    created_at: task.created_at,
    updated_at: task.updated_at,
  };
}
