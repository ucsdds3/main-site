import { create } from "zustand";

import { ColumnDefinition, FilterOperator, SortDirection } from "../Utils/types";

export type SortOrderEntry = { columnKey: string; direction: "asc" | "desc" };

export interface ColumnSortFilter {
  sort: SortDirection;
  filter: FilterOperator;
  filterValue: string;
}

const getSortableColumns = (columns: ColumnDefinition[]) =>
  columns.filter(col => !col.hide && col.type !== "qr_code" && !col.join);

interface AdminStoreState {
  tableName: string;
  columns: ColumnDefinition[];
  sortableColumns: ColumnDefinition[];
  data: unknown[];
  loading: boolean;
  columnStates: Record<string, ColumnSortFilter>;
  sortOrder: SortOrderEntry[];
  sortDraft: SortOrderEntry[];
  sortDropdownOpen: boolean;
  reloadTrigger: number;
}

interface AdminStoreActions {
  setTable: (tableName: string, columns: ColumnDefinition[]) => void;
  reload: () => void;
}

export const useAdminStore = create<AdminStoreState & AdminStoreActions>(set => ({
  tableName: "",
  columns: [],
  sortableColumns: [],
  data: [],
  loading: false,
  columnStates: {},
  sortOrder: [],
  sortDraft: [],
  sortDropdownOpen: false,
  reloadTrigger: 0,

  setTable: (tableName, columns) =>
    set({
      tableName,
      columns,
      sortableColumns: getSortableColumns(columns),
      sortOrder: [],
      sortDraft: [],
      columnStates: {},
    }),

  reload: () =>
    set(state => ({
      reloadTrigger: state.reloadTrigger + 1,
      columnStates: {},
      sortOrder: [],
    })),
}));
