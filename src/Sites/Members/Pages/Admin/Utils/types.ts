export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "like"
  | "ilike"
  | "in"
  | "empty"
  | "non_empty"
  | null;

export type SortDirection = "asc" | "desc" | null;

export type ColumnType = "text" | "number" | "boolean" | "date" | "array" | "json" | "qr_code";

export interface ColumnDefinition<T = any> {
  key: keyof T;
  type: ColumnType;
  locked?: boolean;
  optional?: boolean;
  hide?: boolean;
  join?: string;
  label?: string;
}

export type AttendanceRow = {
  id: number;
  check_in: string;
  updated_at: string;
  member_id: number;
  event_id: number;
  points: number | null;
  member: string;
  email: string;
  event: string;
  start: string;
};

export type EventRow = {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  points: number;
  image: string | null;
  deleted: boolean;
  password: string;
  start: string;
  tags: string[] | null;
  end: string | null;
  location: string | null;
};

export type AdminLevel = "Member" | "Board" | "Executive";

export type MemberRow = {
  id: number;
  created_at: string;
  updated_at: string;
  email: string;
  full_name: string;
  graduation_year: number;
  major: string;
  points: number;
  experience: number;
  gender: string | null;
  date_of_birth: string;
  admin_level: AdminLevel;
  deleted: boolean;
  is_grad_student: boolean;
  in_talent_pool: boolean;
  github_link: string | null;
  resume_link: string | null;
  linkedin_link: string | null;
  other_link: string | null;
  on_mailing_list: boolean;
  teams: Record<string, string> | null;
};

export type ItemRow = {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  deleted: boolean;
};
