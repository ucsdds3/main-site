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
  | null;

export type SortDirection = "asc" | "desc" | null;

export type ColumnType = "text" | "number" | "boolean" | "date" | "array" | "json";

export interface ColumnDefinition<T = any> {
  key: keyof T;
  label: string;
  type: ColumnType;
  editable?: boolean;
  optional?: boolean;
  hide?: boolean;
}

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
