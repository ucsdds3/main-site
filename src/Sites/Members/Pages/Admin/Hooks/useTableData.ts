import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { supabase } from "src/Utils/supabase";

import { ColumnDefinition, FilterOperator, SortDirection } from "../Utils/types";
import { convertFilterValue } from "../../../Utils/functions";
import type { SortOrderEntry } from "./useSortStore";

export interface ColumnSortFilter {
  sort: SortDirection;
  filter: FilterOperator;
  filterValue: string;
}

export type { SortOrderEntry };

export function useTableData<T extends Record<string, any>>(
  tableName: string,
  columns: ColumnDefinition<T>[],
  initialData?: T[],
  columnStates?: Record<string, ColumnSortFilter>,
  reloadTrigger?: number,
  sortOrder?: SortOrderEntry[]
) {
  const [data, setData] = useState<T[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const isAttendance = tableName === "Attendance";
        const selectStr = isAttendance
          ? "id, created_at, updated_at, member_id, event_id, points, Members(full_name, email), Events(name, start)"
          : "*";
        let query = supabase.from(tableName).select(selectStr);

        // Apply filters (skip display-only columns like qr_code, skip join columns)
        columns.forEach(col => {
          if (col.type === "qr_code" || col.join) return;
          const state = columnStates?.[col.key as string];
          const colKey = col.key as string;

          // empty/non_empty don't need filterValue
          if (state?.filter === "empty" || state?.filter === "non_empty") {
            if (col.type === "text") {
              if (state.filter === "empty") {
                query = query.or(`${colKey}.is.null,${colKey}.eq.`);
              } else {
                query = query.not(colKey, "is", null).neq(colKey, "");
              }
            } else {
              // number, date, boolean, etc. - empty = null
              if (state.filter === "empty") {
                query = query.is(colKey, null);
              } else {
                query = query.not(colKey, "is", null);
              }
            }
            return;
          }

          if (state?.filter && state.filterValue) {
            const value = convertFilterValue(state.filterValue, col.type);
            if (value !== null && value !== undefined) {
              switch (state.filter) {
                case "eq":
                  query = query.eq(colKey, value);
                  break;
                case "neq":
                  query = query.neq(colKey, value);
                  break;
                case "gt":
                  query = query.gt(colKey, value);
                  break;
                case "gte":
                  query = query.gte(colKey, value);
                  break;
                case "lt":
                  query = query.lt(colKey, value);
                  break;
                case "lte":
                  query = query.lte(colKey, value);
                  break;
                case "like":
                  query = query.like(colKey, value);
                  break;
                case "ilike":
                  query = query.ilike(colKey, value);
                  break;
                case "in":
                  if (Array.isArray(value)) {
                    query = query.in(colKey, value);
                  }
                  break;
              }
            }
          }
        });

        // Apply sorting
        const sortableColumns = columns.filter(col => col.type !== "qr_code" && !col.join);
        const sortableKeys = new Set(sortableColumns.map(c => String(c.key)));

        if (sortOrder && sortOrder.length > 0) {
          sortOrder.forEach(({ columnKey, direction }) => {
            if (sortableKeys.has(columnKey)) {
              query = query.order(columnKey, { ascending: direction === "asc" });
            }
          });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data: fetchedData, error } = await query;

        if (error) {
          toast.error(error.message);
          console.error("Error fetching data:", error);
        } else {
          let resultData = (fetchedData || []) as unknown as Record<string, unknown>[];
          if (isAttendance && resultData.length > 0) {
            resultData = resultData.map(row => {
              const members = row.Members as Record<string, unknown> | undefined;
              const events = row.Events as Record<string, unknown> | undefined;
              return {
                ...row,
                check_in: row.created_at ?? "",
                member: members?.full_name ?? "",
                email: members?.email ?? "",
                event: events?.name ?? "",
                start: events?.start ?? "",
              };
            });
          }
          setData(resultData as T[]);
        }
      } catch (error) {
        toast.error("Failed to fetch data");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName, reloadTrigger, columnStates, sortOrder]);

  return { data, loading };
}
