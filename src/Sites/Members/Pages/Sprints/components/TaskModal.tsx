import { useState } from "react";
import { TfiClose } from "react-icons/tfi";
import toast from "react-hot-toast";

import { Input, TextArea } from "src/Sites/Members/Components/Input";
import Select from "src/Sites/Members/Components/Select";
import Button from "src/Shared/Components/Button";
import { twMerge } from "src/Utils/cn";

import {
  BOARD_TEAM_OPTIONS,
  MAX_EXPECTED_HOURS,
  MAX_PROGRESS_NOTES_WORDS,
  MIN_TASK_DESCRIPTION_LENGTH,
  memberOnTeam,
  SPRINT_TASK_STATUS_LABELS,
  SPRINT_TASK_STATUS_VALUES,
  wordCount,
} from "../constants";
import type {
  BoardAssigneeOption,
  SprintRow,
  SprintTaskRow,
  SprintTaskStatus,
  TaskWriteInput,
} from "../types";
import AssigneeMultiSelect from "./AssigneeMultiSelect";
import PersonTypeahead from "./PersonTypeahead";
import SprintMultiSelect from "./SprintMultiSelect";

type TaskModalProps = {
  mode: "create" | "edit";
  task?: SprintTaskRow | null;
  defaultTeamKey: string;
  defaultAssigneeId?: number;
  currentMemberId: number;
  currentSprintId: number;
  sprints: SprintRow[];
  assignees: BoardAssigneeOption[];
  teamOptions?: { key: string; label: string }[];
  onClose: () => void;
  onSave: (input: TaskWriteInput) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function parseOptionalUrl(raw: string): string | null | "invalid" {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "invalid";
    return value;
  } catch {
    return "invalid";
  }
}

function parseHours(raw: string, required: boolean): number | null | "invalid" {
  const trimmed = raw.trim();
  if (!trimmed) return required ? "invalid" : null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return "invalid";
  return value;
}

export default function TaskModal({
  mode,
  task,
  defaultTeamKey,
  defaultAssigneeId,
  currentMemberId,
  currentSprintId,
  sprints,
  assignees,
  teamOptions = BOARD_TEAM_OPTIONS,
  onClose,
  onSave,
  onDelete,
}: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [hours, setHours] = useState(task ? String(task.expected_hours) : "");
  const [actualHours, setActualHours] = useState(
    task?.actual_hours != null ? String(task.actual_hours) : ""
  );
  const [teamKey, setTeamKey] = useState(task?.team_key ?? defaultTeamKey);
  const [status, setStatus] = useState<SprintTaskStatus>(
    task?.status && task.status !== "cancelled" ? task.status : "todo"
  );
  const [assigneeIds, setAssigneeIds] = useState<number[]>(
    task?.assignees.map(a => a.id) ?? (defaultAssigneeId ? [defaultAssigneeId] : [])
  );
  const [sprintIds, setSprintIds] = useState<number[]>(
    task?.sprint_ids?.length ? task.sprint_ids : [currentSprintId]
  );
  const [reviewerId, setReviewerId] = useState<number | null>(task?.reviewer_id ?? null);
  const [relevantUrl, setRelevantUrl] = useState(task?.relevant_url ?? "");
  const [approve, setApprove] = useState(Boolean(task?.review_approved));
  const [reviewComment, setReviewComment] = useState(task?.review_comment ?? "");
  const [assignMode, setAssignMode] = useState<"people" | "team">("people");
  const [dueOn, setDueOn] = useState(() => {
    if (task?.expected_completion_on) return task.expected_completion_on.slice(0, 10);
    const current = sprints.find(s => s.id === currentSprintId);
    return current?.ends_on ?? "";
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [progressNotes, setProgressNotes] = useState(task?.progress_notes ?? "");

  const isReviewer = reviewerId != null && reviewerId === currentMemberId;
  const alreadyApproved = Boolean(task?.review_approved) && approve;
  const teamMembers = assignees.filter(a => memberOnTeam(a, teamKey));
  const statusChoices =
    reviewerId == null
      ? SPRINT_TASK_STATUS_VALUES.filter(v => v !== "pending_review")
      : SPRINT_TASK_STATUS_VALUES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    const brief = description.trim();
    if (brief.length < MIN_TASK_DESCRIPTION_LENGTH) {
      toast.error(`Brief description must be at least ${MIN_TASK_DESCRIPTION_LENGTH} characters.`);
      return;
    }
    if (assignMode === "people" && assigneeIds.length === 0) {
      toast.error("Assign at least one task assignee.");
      return;
    }
    if (mode === "create" && assignMode === "team" && teamMembers.length === 0) {
      toast.error("That team has no board members to assign.");
      return;
    }
    if (sprintIds.length === 0) {
      toast.error("Select at least one sprint.");
      return;
    }
    const url = parseOptionalUrl(relevantUrl);
    if (url === "invalid") {
      toast.error("Relevant URL must be a valid http(s) link.");
      return;
    }
    const expectedHours = parseHours(hours, true);
    if (expectedHours === "invalid" || expectedHours == null) {
      toast.error("Expected hours must be a number 0 or greater.");
      return;
    }
    if (expectedHours > MAX_EXPECTED_HOURS) {
      toast.error(`No task should be above ${MAX_EXPECTED_HOURS} hours — split the work.`);
      return;
    }

    const nextStatus: SprintTaskStatus = mode === "create" ? "todo" : status;
    const reviewApproved =
      reviewerId == null
        ? nextStatus === "done"
        : isReviewer
          ? approve
          : Boolean(task?.review_approved);
    const statusToSave: SprintTaskStatus =
      isReviewer && approve && reviewerId != null ? "done" : nextStatus;
    if (statusToSave === "pending_review" && reviewerId == null) {
      toast.error("Add a reviewer, or move this task to Complete.");
      return;
    }
    const needsActual = statusToSave === "pending_review" || statusToSave === "done";
    const parsedActual = parseHours(actualHours, needsActual);
    if (needsActual && (parsedActual === "invalid" || parsedActual == null)) {
      toast.error("Actual hours are required before pending review.");
      return;
    }
    if (parsedActual === "invalid") {
      toast.error("Actual hours must be a number 0 or greater.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueOn)) {
      toast.error("Expected date of completion is required.");
      return;
    }
    const notes = progressNotes.trim();
    if (wordCount(notes) > MAX_PROGRESS_NOTES_WORDS) {
      toast.error(`Notes must be ${MAX_PROGRESS_NOTES_WORDS} words or fewer.`);
      return;
    }

    if (statusToSave === "done" && reviewerId != null && !reviewApproved) {
      toast.error(
        isReviewer
          ? "Check the approval box before moving this task to Complete."
          : "Only the assigned reviewer can approve this task for Complete."
      );
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: brief,
        expected_hours: expectedHours,
        actual_hours: parsedActual,
        team_key: teamKey,
        status: statusToSave,
        assignee_ids:
          mode === "create" && assignMode === "team" ? teamMembers.map(m => m.id) : assigneeIds,
        reviewer_id: reviewerId,
        relevant_url: url,
        review_approved: reviewApproved,
        review_comment: isReviewer ? reviewComment.trim() || null : (task?.review_comment ?? null),
        sprint_ids: sprintIds,
        expected_completion_on: dueOn,
        progress_notes: notes || null,
        create_per_assignee: mode === "create" && assignMode === "team",
      });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative my-8 w-full max-w-xl rounded-2xl border border-(--obs-border) bg-[#080e19] p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer border-0 bg-transparent text-(--obs-text-muted)"
          aria-label="Close"
        >
          <TfiClose />
        </button>

        <p className="text-eyebrow text-eyebrow-cyan">
          {mode === "create" ? "New task" : "Edit task"}
        </p>
        <h2 className="mt-2 font-heading text-2xl text-(--obs-text-primary)">
          {mode === "create" ? "Add sprint work" : task?.title}
        </h2>

        <div className="mt-6 flex flex-col gap-4">
          <Input
            label="Title"
            required
            className="w-full min-w-0"
            value={title}
            setValue={setTitle}
            placeholder="What needs to get done?"
          />
          <TextArea
            label="Brief description"
            required
            rows={3}
            minLength={MIN_TASK_DESCRIPTION_LENGTH}
            value={description}
            setValue={setDescription}
            placeholder={`At least ${MIN_TASK_DESCRIPTION_LENGTH} characters so another team can understand the work`}
          />
          <Input
            label="Relevant URL (include GitHub Issue URL if applicable)"
            type="url"
            className="w-full min-w-0"
            value={relevantUrl}
            setValue={setRelevantUrl}
            placeholder="https://"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Expected hours"
              required
              type="number"
              min="0"
              max={String(MAX_EXPECTED_HOURS)}
              step="0.5"
              className="w-full min-w-0"
              value={hours}
              setValue={setHours}
            />
            <Input
              label="Actual hours"
              required={status === "pending_review" || status === "done" || approve}
              type="number"
              min="0"
              step="0.5"
              className="w-full min-w-0"
              value={actualHours}
              setValue={setActualHours}
              placeholder={mode === "create" ? "Log when work is done" : "Required to complete"}
            />
          </div>
          <p className="m-0 -mt-2 text-xs text-(--obs-text-faint)">
            Keep expected hours at {MAX_EXPECTED_HOURS} or less. Actual hours are required before
            pending review or complete.
          </p>
          <Input
            label="Expected date of completion"
            required
            type="date"
            className="w-full min-w-0"
            value={dueOn}
            setValue={setDueOn}
          />
          <Select
            label="Team"
            required
            showPlaceholderOption={false}
            className="w-full min-w-0"
            options={teamOptions.map(o => o.label)}
            value={teamOptions.find(o => o.key === teamKey)?.label ?? ""}
            setValue={label => {
              const next = teamOptions.find(o => o.label === label);
              if (next) setTeamKey(next.key);
            }}
          />
          <SprintMultiSelect sprints={sprints} selectedIds={sprintIds} onChange={setSprintIds} />
          {mode === "edit" ? (
            <Select
              label="Status"
              showPlaceholderOption={false}
              className="w-full min-w-0"
              options={statusChoices.map(v => SPRINT_TASK_STATUS_LABELS[v])}
              value={SPRINT_TASK_STATUS_LABELS[status]}
              setValue={label => {
                const next = statusChoices.find(v => SPRINT_TASK_STATUS_LABELS[v] === label);
                if (next) setStatus(next);
              }}
            />
          ) : null}
          {mode === "create" ? (
            <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
              <legend className="mb-1 px-0 text-sm font-medium text-(--obs-text-muted)">
                Assign to
              </legend>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-(--obs-text-primary)">
                <input
                  type="radio"
                  name="assign-mode"
                  className="accent-[#19B5CA]"
                  checked={assignMode === "people"}
                  onChange={() => setAssignMode("people")}
                />
                Specific people
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-(--obs-text-primary)">
                <input
                  type="radio"
                  name="assign-mode"
                  className="mt-0.5 accent-[#19B5CA]"
                  checked={assignMode === "team"}
                  onChange={() => setAssignMode("team")}
                />
                <span>
                  Everyone on this team
                  <span className="mt-0.5 block text-xs text-(--obs-text-faint)">
                    Creates a separate card for each board member on{" "}
                    {teamOptions.find(o => o.key === teamKey)?.label ?? "this team"} (
                    {teamMembers.length}).
                  </span>
                </span>
              </label>
            </fieldset>
          ) : null}
          {mode === "edit" || assignMode === "people" ? (
            <AssigneeMultiSelect
              options={assignees}
              selectedIds={assigneeIds}
              onChange={setAssigneeIds}
            />
          ) : (
            <p className="m-0 rounded-xl border border-(--obs-border) bg-(--obs-surface) px-3 py-2 text-sm text-(--obs-text-muted)">
              {teamMembers.length === 0
                ? "No board members currently listed on this team."
                : teamMembers.map(m => m.full_name).join(", ")}
            </p>
          )}
          <PersonTypeahead
            label="Reviewer"
            hint="(optional — for board, your director)"
            options={assignees}
            valueId={reviewerId}
            onChange={id => {
              setReviewerId(id);
              if (id == null && status === "pending_review") setStatus("in_progress");
            }}
            noneLabel="No reviewer"
            placeholder="Search for a reviewer…"
          />

          {mode === "edit" && isReviewer ? (
            <div className="rounded-xl border border-(--obs-border) bg-(--obs-surface) p-4">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-(--obs-text-primary)">
                <input
                  type="checkbox"
                  className="mt-1 accent-[#19B5CA]"
                  checked={approve}
                  onChange={e => setApprove(e.target.checked)}
                />
                <span>
                  I approve this work as complete.
                  <span className="mt-1 block text-xs text-(--obs-text-faint)">
                    Required before the task can move to Complete. Comment is optional.
                  </span>
                </span>
              </label>
              <TextArea
                label="Review comment"
                rows={2}
                className="mt-3"
                value={reviewComment}
                setValue={setReviewComment}
                placeholder="Optional note for the assignees"
              />
            </div>
          ) : null}

          {mode === "edit" && reviewerId == null ? (
            <p className="m-0 text-sm text-(--obs-text-muted)">
              No reviewer — this task can move from In progress straight to Complete.
            </p>
          ) : null}

          {mode === "edit" && reviewerId != null && !isReviewer ? (
            <p className="m-0 text-sm text-(--obs-text-muted)">
              {alreadyApproved
                ? `Approved by ${task?.reviewer?.full_name ?? "the reviewer"}${
                    task?.review_comment ? ` — ${task.review_comment}` : ""
                  }`
                : `Waiting on ${task?.reviewer?.full_name ?? "the assigned reviewer"} to approve before Complete.`}
            </p>
          ) : null}

          {mode === "edit" && task?.creator ? (
            <p className="m-0 text-xs text-(--obs-text-faint)">Added by {task.creator.full_name}</p>
          ) : null}

          <div>
            <TextArea
              label="Notes"
              rows={3}
              value={progressNotes}
              setValue={setProgressNotes}
              placeholder="Optional progress notes while the work is underway"
            />
            <p
              className={twMerge(
                "mb-0 mt-1 text-xs",
                wordCount(progressNotes) > MAX_PROGRESS_NOTES_WORDS
                  ? "text-[#f87171]"
                  : "text-(--obs-text-faint)"
              )}
            >
              {wordCount(progressNotes)} / {MAX_PROGRESS_NOTES_WORDS} words. Separate from the
              description — use this for status as you go.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            {mode === "edit" && onDelete ? (
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleDelete()}
                className="cursor-pointer rounded-full border border-[rgba(248,113,113,0.45)] bg-transparent px-5 py-2 font-mono text-[0.7rem] uppercase tracking-widest text-[#f87171] disabled:opacity-50"
              >
                {saving && confirmDelete
                  ? "Deleting…"
                  : confirmDelete
                    ? "Confirm delete"
                    : "Delete task"}
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full border border-(--obs-border) bg-transparent px-5 py-2 font-mono text-[0.7rem] uppercase tracking-widest text-(--obs-text-muted)"
            >
              Cancel
            </button>
            <Button type="submit" disabled={saving} className="my-0">
              {saving && !confirmDelete ? "Saving…" : "Save task"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
