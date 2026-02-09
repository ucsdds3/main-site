import { ColumnDefinition } from "../Utils/types";
import { formatCellValue } from "../../../Utils/functions";
import EventQRCode from "./EventQRCode";

interface TableBodyProps<T = any> {
  columns: ColumnDefinition<T>[];
  data: T[];
  loading: boolean;
  selectedRow: T | null;
  onRowSelect?: (row: T | null) => void;
}

export default function TableBody<T extends Record<string, any>>({
  columns,
  data,
  loading,
  selectedRow,
  onRowSelect,
}: TableBodyProps<T>) {
  return (
    <tbody>
      {loading ? (
        <tr>
          <td colSpan={columns.filter(col => !col.hide).length} className="text-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </td>
        </tr>
      ) : data.length === 0 ? (
        <tr>
          <td
            colSpan={columns.filter(col => !col.hide).length}
            className="text-center py-8 text-gray-400"
          >
            No data found
          </td>
        </tr>
      ) : (
        data
          .filter(row => row.deleted !== true)
          .map((row, index) => (
            <tr
              key={row.id || index}
              className={`cursor-pointer hover:opacity-90 ${
                selectedRow?.id === row.id ? "!bg-primary/50" : ""
              }`}
              onClick={() => onRowSelect?.(row)}
            >
              {columns
                .filter(col => !col.hide)
                .map(col => {
                  const isDescription = col.key === "description" && col.type === "text";
                  const isQRCode = col.key === "qr_code" && col.type === "qr_code";
                  return (
                    <td
                      key={String(col.key)}
                      className={
                        isDescription
                          ? "w-48 max-w-[150px] truncate"
                          : isQRCode
                            ? "p-1 flex items-center justify-center"
                            : ""
                      }
                      title={isDescription ? formatCellValue(row[col.key], col.type) : undefined}
                    >
                      {isQRCode ? (
                        <div onClick={e => e.stopPropagation()}>
                          <EventQRCode password={String(row.password ?? "")} eventName={row.name} size={48} />
                        </div>
                      ) : (
                        formatCellValue(row[col.key], col.type)
                      )}
                    </td>
                  );
                })}
            </tr>
          ))
      )}
    </tbody>
  );
}
