import { FaFilter } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

import { ColumnDefinition, FilterOperator, SortDirection } from "../Utils/types";
import { ColumnSortFilter } from "../Hooks/useTableData";
import { formatColumnLabel } from "../../../Utils/functions";

interface TableHeaderProps<T = any> {
  columns: ColumnDefinition<T>[];
  columnStates: Record<string, ColumnSortFilter>;
  setColumnStates: React.Dispatch<React.SetStateAction<Record<string, ColumnSortFilter>>>;
}

export default function TableHeader<T extends Record<string, any>>({
  columns,
  columnStates,
  setColumnStates,
}: TableHeaderProps<T>) {
  const handleSort = (columnKey: string) => {
    setColumnStates(prev => {
      const current = prev[columnKey];
      let newSort: SortDirection = "asc";
      if (current?.sort === "asc") {
        newSort = "desc";
      } else if (current?.sort === "desc") {
        newSort = null;
      }

      return {
        ...prev,
        [columnKey]: {
          ...current,
          sort: newSort,
          filter: current?.filter || null,
          filterValue: current?.filterValue || "",
        },
      };
    });
  };

  const handleFilterChange = (columnKey: string, operator: FilterOperator, value: string) => {
    setColumnStates(prev => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        filter: operator,
        filterValue: value,
        sort: prev[columnKey]?.sort || null,
      },
    }));
  };

  return (
    <thead>
      <tr>
        {columns
          .filter(col => !col.hide)
          .map((col, index) => {
            const colState = columnStates[col.key as string];
            const hasFilter = colState?.filter && colState?.filterValue;
            const isDescription = col.key === "description" && col.type === "text";
            const isQRCode = col.key === "qr_code" && col.type === "qr_code";

            return (
              <th
                key={String(col.key)}
                className={`relative ${isDescription ? "w-48 max-w-[150px]" : ""}`}
              >
                <div className="flex gap-2 items-center">
                  {isQRCode ? (
                    <span className="text-lg">{formatColumnLabel(col.key)}</span>
                  ) : (
                    <>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleSort(String(col.key));
                        }}
                        className="flex items-center gap-2 hover:text-primary transition-colors text-lg"
                      >
                        <span>{formatColumnLabel(col.key)}</span>{" "}
                        {columnStates[col.key as string]?.sort === "asc" ? (
                          <IoIosArrowUp className="mt-1" />
                        ) : (
                          <IoIosArrowDown className="mt-1" />
                        )}
                      </button>
                      <div className={`dropdown ${index <= 1 ? "dropdown-start" : "dropdown-end"}`}>
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-ghost p-0"
                          onClick={e => e.stopPropagation()}
                        >
                          {hasFilter ? (
                            <FaFilter className="mt-1" />
                          ) : (
                            <CiFilter className="mt-1 text-lg" />
                          )}
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-200 rounded-box z-1 p-2 shadow-lg"
                        >
                          <div className="flex gap-2 items-center w-full">
                            <select
                              className="select select-ghost min-w-[150px]"
                              value={colState?.filter || ""}
                              onChange={e =>
                                handleFilterChange(
                                  String(col.key),
                                  e.target.value as FilterOperator,
                                  colState?.filterValue || ""
                                )
                              }
                            >
                              <option value="">None</option>
                              {col.type === "text" && (
                                <>
                                  <option value="eq">Equals</option>
                                  <option value="neq">Not Equals</option>
                                  <option value="like">Like</option>
                                  <option value="ilike">ILike</option>
                                </>
                              )}
                              {(col.type === "number" || col.type === "date") && (
                                <>
                                  <option value="eq">Equals</option>
                                  <option value="neq">Not Equals</option>
                                  <option value="gt">Greater</option>
                                  <option value="gte">Greater/Equal</option>
                                  <option value="lt">Less</option>
                                  <option value="lte">Less/Equal</option>
                                </>
                              )}
                              {col.type === "boolean" && (
                                <>
                                  <option value="eq">Equals</option>
                                  <option value="neq">Not Equals</option>
                                </>
                              )}
                            </select>
                            {colState?.filter && (
                              <input
                                type={
                                  col.type === "number"
                                    ? "number"
                                    : col.type === "date"
                                      ? "datetime-local"
                                      : "text"
                                }
                                className="input input-bordered min-w-[150px]"
                                value={colState?.filterValue || ""}
                                onChange={e =>
                                  handleFilterChange(
                                    String(col.key),
                                    colState?.filter || null,
                                    e.target.value
                                  )
                                }
                                placeholder="Filter value"
                              />
                            )}
                          </div>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </th>
            );
          })}
      </tr>
    </thead>
  );
}
