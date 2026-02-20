import { FaFilter } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";

import { ColumnDefinition, FilterOperator } from "../Utils/types";
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
            const isValueFilter =
              colState?.filter && colState?.filter !== "empty" && colState?.filter !== "non_empty";
            const hasFilter =
              colState?.filter &&
              (colState.filter === "empty" ||
                colState.filter === "non_empty" ||
                !!colState?.filterValue);
            const isQRCode = col.key === "qr_code" && col.type === "qr_code";

            return (
              <th key={String(col.key)} className="relative max-w-[200px]">
                <div className="flex gap-2 items-center">
                  {isQRCode ? (
                    <span className="text-lg">{col.label ?? formatColumnLabel(col.key)}</span>
                  ) : (
                    <>
                      <span className="text-lg">{col.label ?? formatColumnLabel(col.key)}</span>
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
                                  <option value="empty">Empty</option>
                                  <option value="non_empty">Non-empty</option>
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
                                  <option value="empty">Empty</option>
                                  <option value="non_empty">Non-empty</option>
                                </>
                              )}
                              {col.type === "boolean" && (
                                <>
                                  <option value="eq">Equals</option>
                                  <option value="neq">Not Equals</option>
                                  <option value="empty">Empty</option>
                                  <option value="non_empty">Non-empty</option>
                                </>
                              )}
                            </select>
                            {isValueFilter && (
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
