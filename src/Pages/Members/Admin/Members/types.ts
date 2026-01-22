export type SortColumn = "name" | "tier" | "status" | "points" | "experience" | null;
export type SortDirection = "asc" | "desc";
export type FilterColumn = "name" | "tier" | "status" | "points" | "experience" | "major" | "graduation_year" | null;
export type NameSearchMode = "contains" | "starts" | "ends";
export type NumericFilterMode = "eq" | "lt" | "gt";

export interface NameFilter {
  search: string;
  mode: NameSearchMode;
}

export interface TierFilter {
  selected: string[];
}

export interface StatusFilter {
  selected: string[];
}

export interface NumericFilter {
  mode: NumericFilterMode;
  value: string;
}
