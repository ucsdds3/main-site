import { create } from "zustand";

import { ColumnDefinition } from "../Utils/types";

export type SortOrderEntry = { columnKey: string; direction: "asc" | "desc" };

interface SortState {
  columns: ColumnDefinition[];
  sortableColumns: ColumnDefinition[];
  sortOrder: SortOrderEntry[];
  sortDropdownOpen: boolean;
  sortDraft: SortOrderEntry[];
}

interface SortActions {
  setColumns: (columns: ColumnDefinition[]) => void;
  openSortDropdown: () => void;
  applySorts: () => void;
  addSortRow: () => void;
  updateSortRow: (index: number, columnKey?: string, direction?: "asc" | "desc") => void;
  removeSortRow: (index: number) => void;
  clearSorts: () => void;
  setSortDropdownOpen: (open: boolean) => void;
}

const getSortableColumns = (columns: ColumnDefinition[]) =>
  columns.filter(col => !col.hide && col.type !== "qr_code" && !col.join);

export const useSortStore = create<SortState & SortActions>((set, get) => ({
  columns: [],
  sortableColumns: [],
  sortOrder: [],
  sortDropdownOpen: false,
  sortDraft: [],

  setColumns: columns =>
    set({
      columns,
      sortableColumns: getSortableColumns(columns),
      sortOrder: [],
      sortDraft: [],
    }),

  openSortDropdown: () =>
    set(state => ({
      sortDraft: [...state.sortOrder],
      sortDropdownOpen: true,
    })),

  applySorts: () =>
    set(state => ({
      sortOrder: state.sortDraft.filter(row => row.columnKey),
      sortDropdownOpen: false,
    })),

  addSortRow: () => {
    const { sortDraft, sortableColumns } = get();
    const usedKeys = new Set(sortDraft.map(r => r.columnKey));
    const firstUnused = sortableColumns.find(c => !usedKeys.has(String(c.key)));
    if (firstUnused) {
      set({
        sortDraft: [
          ...sortDraft,
          { columnKey: String(firstUnused.key), direction: "asc" as const },
        ],
      });
    }
  },

  updateSortRow: (index, columnKey, direction) =>
    set(state => ({
      sortDraft: state.sortDraft.map((row, i) =>
        i === index
          ? {
              columnKey: columnKey ?? row.columnKey,
              direction: direction ?? row.direction,
            }
          : row
      ),
    })),

  removeSortRow: index =>
    set(state => ({
      sortDraft: state.sortDraft.filter((_, i) => i !== index),
    })),

  clearSorts: () => set({ sortOrder: [] }),

  setSortDropdownOpen: sortDropdownOpen => set({ sortDropdownOpen }),
}));

export const useSortableColumns = () => useSortStore(state => state.sortableColumns);
