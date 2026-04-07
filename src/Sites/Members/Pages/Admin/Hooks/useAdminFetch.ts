import { toast } from "react-hot-toast";
import { useEffect } from "react";
import { supabase } from "src/Utils/supabase";

import { convertFilterValue } from "../../../Utils/functions";
import { useAdminStore } from "./useAdminStore";

type JsonTextFilter = { colKey: string; mode: "like" | "ilike"; pattern: string };

/** PostgREST default max rows per request; paginate past this to load full tables. */
const PAGE_SIZE = 1000;

/** String form of a json/jsonb cell for text search (matches table display). */
function jsonColumnValueAsSearchText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value : JSON.stringify(value);
}

/** Client-side LIKE/ILIKE on json columns (PostgREST cannot ilike jsonb directly). */
function rowMatchesJsonTextFilter(row: Record<string, unknown>, f: JsonTextFilter): boolean {
  const raw = f.pattern.trim();
  if (!raw) return true;
  const needle = raw.replace(/^%+/, "").replace(/%+$/g, "").trim();
  if (!needle) return true;
  const haystack = jsonColumnValueAsSearchText(row[f.colKey]);
  const h = f.mode === "ilike" ? haystack.toLowerCase() : haystack;
  const n = f.mode === "ilike" ? needle.toLowerCase() : needle;
  return h.includes(n);
}

export function useAdminFetch() {
  const tableName = useAdminStore(state => state.tableName);
  const columns = useAdminStore(state => state.columns);
  const columnStates = useAdminStore(state => state.columnStates);
  const sortOrder = useAdminStore(state => state.sortOrder);
  const reloadTrigger = useAdminStore(state => state.reloadTrigger);

  useEffect(() => {
    if (!tableName || columns.length === 0) return;

    const fetchData = async () => {
      useAdminStore.setState({ loading: true });
      try {
        const isAttendance = tableName === "Attendance";
        const selectStr = isAttendance
          ? "id, created_at, updated_at, member_id, event_id, points, Members(full_name, email), Events(name, start)"
          : "*";

        const buildQuery = () => {
          let query = supabase.from(tableName).select(selectStr);
          const jsonTextFilters: JsonTextFilter[] = [];

          columns.forEach(col => {
            if (col.type === "qr_code" || col.join) return;
            const state = columnStates?.[col.key as string];
            const colKey = col.key as string;

            if (state?.filter === "empty" || state?.filter === "non_empty") {
              if (col.type === "text") {
                if (state.filter === "empty") {
                  query = query.or(`${colKey}.is.null,${colKey}.eq.`);
                } else {
                  query = query.not(colKey, "is", null).neq(colKey, "");
                }
              } else {
                if (state.filter === "empty") {
                  query = query.is(colKey, null);
                } else {
                  query = query.not(colKey, "is", null);
                }
              }
              return;
            }

            if (state?.filter && state.filterValue) {
              if (
                col.type === "json" &&
                (state.filter === "like" || state.filter === "ilike")
              ) {
                jsonTextFilters.push({
                  colKey,
                  mode: state.filter,
                  pattern: state.filterValue,
                });
                return;
              }

              const value = convertFilterValue(state.filterValue, col.type);
              if (value !== null && value !== undefined) {
                if (state.filter == "eq") query = query.eq(colKey, value);
                else if (state.filter == "neq") query = query.neq(colKey, value);
                else if (state.filter == "gt") query = query.gt(colKey, value);
                else if (state.filter == "gte") query = query.gte(colKey, value);
                else if (state.filter == "lt") query = query.lt(colKey, value);
                else if (state.filter == "lte") query = query.lte(colKey, value);
                else if (state.filter == "like") query = query.like(colKey, value);
                else if (state.filter == "ilike") query = query.ilike(colKey, value);
                else if (state.filter == "in" && Array.isArray(value))
                  query = query.in(colKey, value);
              }
            }
          });

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

          return { query, jsonTextFilters };
        };

        let resultData: Record<string, unknown>[] = [];
        let jsonTextFilters: JsonTextFilter[] = [];

        for (let from = 0; ; from += PAGE_SIZE) {
          const { query, jsonTextFilters: jf } = buildQuery();
          if (from === 0) jsonTextFilters = jf;

          const { data: fetchedData, error } = await query.range(from, from + PAGE_SIZE - 1);

          if (error) {
            toast.error(error.message);
            console.error("Error fetching data:", error);
            useAdminStore.setState({ data: [] });
            return;
          }

          const batch = (fetchedData || []) as unknown as Record<string, unknown>[];
          resultData = resultData.concat(batch);
          if (batch.length < PAGE_SIZE) break;
        }

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
        if (jsonTextFilters.length > 0) {
          resultData = resultData.filter(row =>
            jsonTextFilters.every(f => rowMatchesJsonTextFilter(row, f))
          );
        }
        useAdminStore.setState({ data: resultData });
      } catch (error) {
        toast.error("Failed to fetch data");
        console.error("Error:", error);
      } finally {
        useAdminStore.setState({ loading: false });
      }
    };

    fetchData();
  }, [tableName, reloadTrigger, columnStates, sortOrder, columns]);
}
