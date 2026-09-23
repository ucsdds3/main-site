import { formatColumnLabel, formatCellValue } from "../../../Utils/functions";

import type { ColumnDefinition } from "./types";
import { formatEventWorkflowStatus } from "./eventWorkflow";

/** Prefer extended end, then end, then start — same notion of "event is over". */
export function eventEffectiveEndIso(row: Record<string, unknown>): string | null {
  const tempEnd = row.temp_end;
  const end = row.end;
  const start = row.start;
  if (typeof tempEnd === "string" && tempEnd) return tempEnd;
  if (typeof end === "string" && end) return end;
  if (typeof start === "string" && start) return start;
  return null;
}

export function isUpcomingEventRow(row: Record<string, unknown>, now = new Date()): boolean {
  const iso = eventEffectiveEndIso(row);
  if (!iso) return true;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return true;
  return t >= now.getTime();
}

export function filterAdminTableRows<T extends Record<string, any>>(
  tableName: string,
  columns: ColumnDefinition<T>[],
  data: T[],
  search: string,
  options?: { showUpcomingEventsOnly?: boolean }
): T[] {
  const visibleColumns = columns.filter(col => !col.hide);
  let baseData =
    tableName === "Attendance" ? data : data.filter(row => row.deleted !== true);

  if (tableName === "Events" && options?.showUpcomingEventsOnly) {
    const now = new Date();
    baseData = baseData.filter(row => isUpcomingEventRow(row, now));
  }

  const q = search.trim().toLowerCase();
  if (!q) return baseData;

  return baseData.filter(row =>
    visibleColumns.some(col => {
      const value = row[col.key];
      const formatted =
        col.key === "workflow_status"
          ? formatEventWorkflowStatus(value)
          : formatCellValue(value, col.type);
      return String(formatted ?? "").toLowerCase().includes(q);
    })
  );
}

export function downloadAdminTableCsv<T extends Record<string, any>>(
  tableName: string,
  columns: ColumnDefinition<T>[],
  filteredRows: T[]
): void {
  const visibleColumns = columns.filter(col => !col.hide);

  const headers = visibleColumns.map(col => col.label ?? formatColumnLabel(col.key));
  const rows = filteredRows.map(row =>
    visibleColumns.map(col => {
      const value = row[col.key];
      const formatted =
        col.key === "workflow_status"
          ? formatEventWorkflowStatus(value)
          : formatCellValue(value, col.type);
      return `"${String(formatted).replace(/"/g, '""')}"`;
    })
  );

  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
    ...rows.map(row => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${tableName}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
