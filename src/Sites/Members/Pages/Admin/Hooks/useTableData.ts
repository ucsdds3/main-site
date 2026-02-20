import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { supabase } from "src/Utils/supabase";

import { ColumnDefinition, FilterOperator, SortDirection } from "../Utils/types";
import { convertFilterValue } from "../../../Utils/functions";

export interface ColumnSortFilter {
  sort: SortDirection;
  filter: FilterOperator;
  filterValue: string;
}

export function useTableData<T extends Record<string, any>>(
  tableName: string,
  columns: ColumnDefinition<T>[],
  initialData?: T[],
  columnStates?: Record<string, ColumnSortFilter>,
  reloadTrigger?: number
) {
  const [data, setData] = useState<T[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let query = supabase.from(tableName).select("*");

        // Apply filters (skip display-only columns like qr_code)
        columns.forEach(col => {
          if (col.type === "qr_code") return;
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

        // Apply sorting (skip display-only columns like qr_code)
        const sortedColumns = columns.filter(
          col => col.type !== "qr_code" && columnStates?.[col.key as string]?.sort
        );
        if (sortedColumns.length > 0) {
          const primarySort = sortedColumns[0];
          const sortDir = columnStates?.[primarySort.key as string]?.sort === "asc";
          query = query.order(primarySort.key as string, { ascending: sortDir });
        } else {
          // Default sort by id if available
          query = query.order("id", { ascending: false });
        }

        const { data: fetchedData, error } = await query;

        if (error) {
          toast.error(error.message);
          console.error("Error fetching data:", error);
        } else {
          setData(fetchedData || []);
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
  }, [tableName, reloadTrigger, columnStates]);

  return { data, loading };
}
