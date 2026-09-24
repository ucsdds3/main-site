export type SprintStatus = "planning" | "active" | "closed";

export type SprintTaskStatus = "todo" | "in_progress" | "pending_review" | "done" | "cancelled";

export type RetroDecision = "done" | "roll" | "drop";

export type SprintRow = {
  id: number;
  name: string;
  starts_on: string;
  ends_on: string;
  status: SprintStatus;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type SprintAssignee = {
  id: number;
  full_name: string;
  email: string;
};

export type SprintTaskRow = {
  id: number;
  sprint_id: number;
  team_key: string;
  title: string;
  description: string | null;
  expected_hours: number;
  actual_hours: number | null;
  status: SprintTaskStatus;
  created_by: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  expected_completion_on: string | null;
  reviewer_id: number | null;
  relevant_url: string | null;
  review_approved: boolean;
  review_comment: string | null;
  reviewed_at: string | null;
  reviewer: SprintAssignee | null;
  assignees: SprintAssignee[];
  sprint_ids: number[];
};

export type BoardAssigneeOption = {
  id: number;
  full_name: string;
  email: string;
  teams: Record<string, string> | null;
};

export type CurrentMember = {
  id: number;
  email: string;
  full_name: string;
  teams: Record<string, string> | null;
  admin_level: "Board" | "Executive";
};

export type TaskWriteInput = {
  title: string;
  description: string;
  expected_hours: number;
  actual_hours: number | null;
  team_key: string;
  status: SprintTaskStatus;
  assignee_ids: number[];
  reviewer_id: number | null;
  create_per_assignee?: boolean;
  relevant_url: string | null;
  review_approved: boolean;
  review_comment: string | null;
  sprint_ids: number[];
  expected_completion_on: string | null;
};
